import { Command } from 'commander'
import ora from 'ora'
import {
  getCurrentBranch,
  checkGitCLI,
  getDefaultBranch,
} from '../../git-helpers'
import { getCurrentProvider } from '../../providers/factory'
import { extractJiraTicket, getJiraTicketTitle } from '../../jira'
import { convertBranchNameToPRTitle } from './branch-utils'
import { checkAndUpgrade } from '../../utils/version-checker'

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
  - Creates PR title with format: [JIRA-123] ticket-title or [JIRA-123] commitlint-formatted-title
  - Converts commitlint branch names to proper PR titles (e.g., feat/add-auth -> feat: add auth)
  - Falls back to original branch name if not commitlint format
  - Opens existing PR if one already exists for the current branch

Prerequisites:
  - Git provider CLI (gh for GitHub, glab for GitLab) must be installed and authenticated
  - For JIRA integration: Configure JIRA credentials in ~/.git-pr-ai/.git-pr-ai.json
    `,
    )

  return program
}

async function main() {
  const program = setupCommander()

  program.action(async (options: { jira?: string }) => {
    try {
      // Check for version updates
      await checkAndUpgrade()

      await checkGitCLI()
      const provider = await getCurrentProvider()

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

        const jiraSpinner = ora('Fetching JIRA ticket title...').start()
        jiraTitle = await getJiraTicketTitle(jiraTicket)

        if (jiraTitle) {
          jiraSpinner.succeed(`JIRA Title: ${jiraTitle}`)
        } else {
          jiraSpinner.warn('Could not fetch JIRA title')
        }
      } else {
        console.log(`Branch: ${currentBranch}`)
      }

      // Check if PR already exists for current branch
      const existingPrUrl = await provider.checkExistingPR()

      if (existingPrUrl) {
        await provider.openPR()
        return
      }

      // Create new PR if none exists
      const baseBranch = await getDefaultBranch()
      let prTitle = convertBranchNameToPRTitle(currentBranch)

      if (jiraTicket) {
        if (jiraTitle) {
          prTitle = `[${jiraTicket}] ${jiraTitle}`
        } else {
          prTitle = `[${jiraTicket}] ${convertBranchNameToPRTitle(currentBranch)}`
        }
      }

      await provider.createPR(prTitle, currentBranch, baseBranch)
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      console.error('Error:', errorMessage)
      process.exit(1)
    }
  })

  program.parse()
}

main()
