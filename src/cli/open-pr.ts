import { $ } from 'zx'
import { Command } from 'commander'
import {
  getCurrentBranch,
  checkGitHubCLI,
  getDefaultBranch,
} from '../git-helpers.js'
import { extractJiraTicket, getJiraTicketTitle } from '../jira.js'

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
    .option('-j, --jira <ticket>', 'specify JIRA ticket ID manually')
    .addHelpText(
      'after',
      `
Examples:
  $ git open-pr
    Create a new PR for current branch or open existing PR

  $ git open-pr --jira PROJ-123
    Create a PR with specific JIRA ticket ID

Features:
  - Automatically detects JIRA tickets from branch names (optional)
  - Fetches JIRA ticket title for enhanced PR titles when configured
  - Creates PR title with format: [JIRA-123] ticket-title or [JIRA-123] branch-name
  - Falls back to branch name if no JIRA ticket found
  - Opens existing PR if one already exists for the current branch

Prerequisites:
  - GitHub CLI (gh) must be installed and authenticated
  - For JIRA integration: Configure JIRA credentials in ~/.git-pr-ai/.git-pr-ai.json
    `,
    )

  return program
}

async function main() {
  const program = setupCommander()

  program.action(async (options) => {
    try {
      await checkGitHubCLI()

      const currentBranch = await getCurrentBranch()
      let jiraTicket = options.jira || extractJiraTicket(currentBranch)

      let jiraTitle: string | null = null
      if (jiraTicket) {
        if (options.jira) {
          console.log(
            `Branch: ${currentBranch} | JIRA: ${jiraTicket} (manually specified)`,
          )
        } else {
          console.log(`Branch: ${currentBranch} | JIRA: ${jiraTicket}`)
        }
        console.log('🔍 Fetching JIRA ticket title...')
        jiraTitle = await getJiraTicketTitle(jiraTicket)
        if (jiraTitle) {
          console.log(`📋 JIRA Title: ${jiraTitle}`)
        }
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
      let prTitle = currentBranch

      if (jiraTicket) {
        if (jiraTitle) {
          prTitle = `[${jiraTicket}] ${jiraTitle}`
        } else {
          prTitle = `[${jiraTicket}] ${currentBranch}`
        }
      }

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
