import { $ } from 'zx'
import { Command } from 'commander'
import {
  getCurrentBranch,
  extractJiraTicket,
  checkGitHubCLI,
  getDefaultBranch,
} from '../utils.js'

async function checkExistingPR(): Promise<string | null> {
  try {
    const result = await $`gh pr view --json url`
    const { url } = JSON.parse(result.stdout)
    return url
  } catch {
    return null
  }
}

async function openPR(url: string) {
  console.log('📖 Opening existing Pull Request...')
  await $`gh pr view --web`
  console.log(`✅ Opened PR: ${url}`)
}

async function createPullRequest(
  title: string,
  branch: string,
  baseBranch: string,
) {
  console.log('🚀 Creating Pull Request...')
  await $`gh pr create --title ${title} --base ${baseBranch} --head ${branch} --web`
  console.log('✅ Pull Request created successfully!')
}

function setupCommander() {
  const program = new Command()

  program
    .name('git-open-pr')
    .description(
      'Smart Pull Request Creator - Creates new PR or opens existing one',
    )
    .addHelpText(
      'after',
      `
Examples:
  $ git open-pr
    Create a new PR for current branch or open existing PR

Features:
  - Automatically detects JIRA tickets from branch names (optional)
  - Creates PR title with format: [JIRA-123] branch-name
  - Falls back to branch name if no JIRA ticket found
  - Opens existing PR if one already exists for the current branch

Prerequisites:
  - GitHub CLI (gh) must be installed and authenticated
    `,
    )

  return program
}

async function main() {
  const program = setupCommander()

  program.action(async () => {
    try {
      await checkGitHubCLI()

      const currentBranch = await getCurrentBranch()
      const jiraTicket = extractJiraTicket(currentBranch)

      if (jiraTicket) {
        console.log(`Branch: ${currentBranch} | JIRA: ${jiraTicket}`)
      } else {
        console.log(`Branch: ${currentBranch}`)
      }

      // Check if PR already exists for current branch
      const existingPrUrl = await checkExistingPR()

      if (existingPrUrl) {
        await openPR(existingPrUrl)
        return
      }

      // Create new PR if none exists
      const baseBranch = await getDefaultBranch()
      const prTitle = jiraTicket
        ? `[${jiraTicket}] ${currentBranch}`
        : currentBranch

      await createPullRequest(prTitle, currentBranch, baseBranch)
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      console.error('❌ Error:', errorMessage)
      process.exit(1)
    }
  })

  program.parse()
}

main()
