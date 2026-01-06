import { $ } from 'zx'
import { Command } from 'commander'
import { select } from '@inquirer/prompts'
import ora from 'ora'
import { checkGitCLI } from '../../git-helpers'
import { loadConfig } from '../../config'
import { executeAIWithOutput } from '../../ai/executor'
import { createCommitMessagePrompt } from './prompts'
import { checkAndUpgrade } from '../../utils/version-checker'
import { parseNumberedOutput } from '../../utils/ai-output-parser'
import { getJiraTicketTitle, normalizeJiraTicketInput } from '../../jira'

async function getGitDiff(): Promise<string> {
  try {
    // Get staged changes
    let result = await $`git diff --cached`
    let gitDiff = result.stdout.trim()

    if (!gitDiff) {
      throw new Error(
        'No staged changes detected. Please stage your files before committing.',
      )
    }

    return gitDiff
  } catch (error) {
    console.error('Failed to get git diff')
    throw error
  }
}

type JiraContext = {
  ticketKey: string
  title?: string | null
}

function extractCommitType(message: string): string | null {
  const match = message.trim().match(/^([a-z]+(?:\([^)]+\))?)(!?)\s*:/i)
  if (!match) return null
  return `${match[1]}${match[2] || ''}`
}

function extractCommitDescription(message: string): string {
  const parts = message.split(':')
  if (parts.length <= 1) return message.trim()
  return parts.slice(1).join(':').trim()
}

function applyJiraFormat(messages: string[], jira: JiraContext): string[] {
  const ticketTag = `[${jira.ticketKey}]`
  const jiraTitle = jira.title?.replace(/\s+/g, ' ').trim()

  return messages.map((message) => {
    const type = extractCommitType(message) || 'chore'
    const description =
      jiraTitle || extractCommitDescription(message) || ticketTag
    return `${type}: ${ticketTag} ${description}`.trim()
  })
}

async function generateCommitMessages(
  gitDiff: string,
  userPrompt?: string,
  jira?: JiraContext,
): Promise<string[]> {
  const config = await loadConfig()

  const spinner = ora(
    `Generating commit messages with ${config.agent.toUpperCase()}`,
  ).start()

  try {
    const prompt = createCommitMessagePrompt(gitDiff, userPrompt, jira)
    const aiOutput = await executeAIWithOutput(prompt, {
      commandName: 'aiCommit',
    })

    const parseResult = parseNumberedOutput(aiOutput)

    if (
      !parseResult.success ||
      !parseResult.values ||
      parseResult.values.length === 0
    ) {
      spinner.fail('Parsing AI output failed; see details below')
      console.error('AI output:', aiOutput)
      throw new Error(parseResult.error || 'Failed to parse AI output')
    }

    spinner.stop()
    const values = parseResult.values
    if (jira) {
      return applyJiraFormat(values, jira)
    }
    return values
  } catch (error) {
    spinner.fail(`Failed: ${error}`)
    throw error
  }
}

async function createCommit(commitMessage: string): Promise<void> {
  try {
    // Check if there are staged changes
    const stagedResult = await $`git diff --cached --quiet`.exitCode
    const hasStaged = stagedResult !== 0

    if (!hasStaged) {
      const message =
        'No staged changes detected. Please stage your files before committing.'
      console.error(message)
      throw new Error(message)
    }

    // Create the commit
    // Use stdio: 'inherit' to preserve TTY for hooks
    await $({ stdio: 'inherit' })`git commit -m ${commitMessage}`
  } catch (error) {
    console.error('Failed to create commit')
    throw error
  }
}

function setupCommander() {
  const program = new Command()

  program
    .name('git-ai-commit')
    .description('Generate AI-powered commit messages based on your changes')
    .argument(
      '[prompt]',
      'Additional context to refine the commit message suggestions',
    )
    .option('-j, --jira <ticket>', 'specify JIRA ticket ID or URL')
    .addHelpText(
      'after',
      `
Examples:
  $ git add .
  $ git ai-commit
    AI will analyze your staged changes and suggest 3 commit messages

  $ git ai-commit
    If no changes are staged, AI will analyze all unstaged changes
    and automatically stage them before committing
  
  $ git ai-commit "explain why the change was needed"
    AI will incorporate your context when generating commit messages

  $ git ai-commit --jira PROJ-123
    AI will include the JIRA ticket in commit messages

Features:
  - AI-powered commit message generation based on actual code changes
  - Follows commitlint conventional commit format
  - Provides 3 different commit message options to choose from
  - Automatically stages changes if nothing is staged
  - Uses git diff to understand what changed
  - Optionally includes JIRA ticket keys in commit messages

Prerequisites:
  - Git provider CLI must be installed and authenticated: GitHub CLI (gh) or GitLab CLI (glab)
  - AI provider must be configured in ~/.git-pr-ai/.git-pr-ai.json
    `,
    )

  return program
}

async function main() {
  const program = setupCommander()

  program.action(
    async (prompt: string | undefined, options: { jira?: string }) => {
      try {
        // Check for version updates
        await checkAndUpgrade()

        await checkGitCLI()

        // Get git diff
        const gitDiff = await getGitDiff()

        let jiraContext: JiraContext | undefined
        if (options.jira) {
          const jiraTicket = normalizeJiraTicketInput(options.jira)
          if (!jiraTicket) {
            throw new Error(
              'Invalid JIRA ticket provided. Use a ticket key like PROJ-123 or a valid JIRA URL.',
            )
          }

          console.log(`JIRA Ticket: ${jiraTicket}`)
          const jiraSpinner = ora('Fetching JIRA ticket title...').start()
          const jiraTitle = await getJiraTicketTitle(jiraTicket)
          if (jiraTitle) {
            jiraSpinner.succeed(`JIRA Title: ${jiraTitle}`)
          } else {
            jiraSpinner.warn('Could not fetch JIRA title, using ticket ID only')
          }

          jiraContext = { ticketKey: jiraTicket, title: jiraTitle }
        }

        // Generate commit messages using AI
        const commitMessages = await generateCommitMessages(
          gitDiff,
          prompt,
          jiraContext,
        )

        // Let user select a commit message
        const selectedMessage = await select({
          message: 'Select a commit message:',
          choices: commitMessages.map((msg) => ({
            name: msg,
            value: msg,
          })),
        })

        // Create the commit
        await createCommit(selectedMessage)
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error)
        console.error('Error:', errorMessage)
        process.exit(1)
      }
    },
  )

  program.parse()
}

main()
