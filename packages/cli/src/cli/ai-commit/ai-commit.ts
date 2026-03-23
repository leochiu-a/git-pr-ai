import { $ } from 'zx'
import { Command } from 'commander'
import { select } from '@inquirer/prompts'
import ora from 'ora'
import { checkGitCLI } from '../../git-helpers'
import { loadConfig } from '../../config'
import { executeAIWithOutput } from '../../ai/executor'
import { CommitJiraContext, createCommitMessagePrompt } from './prompts'
import { checkAndUpgrade } from '../../utils/version-checker'
import { parseNumberedOutput } from '../../utils/ai-output-parser'
import { buildJiraCommitMessage, resolveJiraContext } from './utils'
import {
  assertJiraRequiresType,
  pickPreferredCommitMessage,
  resolveCommitType,
} from './non-interactive'
import { resolveNonInteractiveMode } from '../shared/non-interactive'

const COMMIT_TYPE_CHOICES = [
  { name: 'feat: New features', value: 'feat' },
  { name: 'fix: Bug fixes', value: 'fix' },
  { name: 'docs: Documentation changes', value: 'docs' },
  { name: 'style: Formatting changes', value: 'style' },
  { name: 'refactor: Code refactoring', value: 'refactor' },
  { name: 'perf: Performance improvements', value: 'perf' },
  { name: 'test: Adding/updating tests', value: 'test' },
  { name: 'chore: Maintenance tasks', value: 'chore' },
  { name: 'ci: CI/CD changes', value: 'ci' },
  { name: 'build: Build system changes', value: 'build' },
]

async function getGitDiff(): Promise<string> {
  try {
    // Get staged changes
    const result = await $`git diff --cached`
    const gitDiff = result.stdout.trim()

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

async function generateCommitMessages(
  gitDiff: string,
  commitType: string,
  userPrompt?: string,
  jira?: CommitJiraContext | null,
): Promise<string[]> {
  const config = await loadConfig()

  const spinner = ora(
    `Generating commit messages with ${config.agent.toUpperCase()}`,
  ).start()

  try {
    const prompt = createCommitMessagePrompt(
      gitDiff,
      commitType,
      userPrompt,
      jira ?? null,
    )
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
    return parseResult.values
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

/**
 * Run the JIRA commit flow without AI
 */
async function runJiraCommitFlow(
  commitType: string,
  jiraOption: string | boolean,
): Promise<void> {
  const jiraContext = await resolveJiraContext(jiraOption)
  if (!jiraContext) {
    throw new Error(
      'Unable to resolve JIRA ticket. Provide a valid key/URL or ensure your branch includes one.',
    )
  }

  const commitMessage = buildJiraCommitMessage(commitType, jiraContext)
  await createCommit(commitMessage)
}

async function runAiCommitFlow(
  commitType: string,
  prompt?: string,
  nonInteractive = false,
): Promise<void> {
  const gitDiff = await getGitDiff()
  const commitMessages = await generateCommitMessages(
    gitDiff,
    commitType,
    prompt,
    null,
  )

  const selectedMessage = nonInteractive
    ? pickPreferredCommitMessage(commitMessages)
    : await select({
        message: 'Select a commit message:',
        choices: commitMessages.map((msg) => ({
          name: msg,
          value: msg,
        })),
      })

  if (nonInteractive) {
    console.log(
      `Non-interactive mode: auto-selected commit message: ${selectedMessage}`,
    )
  }

  await createCommit(selectedMessage)
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
    .option(
      '-j, --jira [ticket]',
      'use JIRA ticket context (from branch name or ticket/URL)',
    )
    .option(
      '-t, --type <type>',
      'commit type (feat|fix|docs|style|refactor|perf|test|chore|ci|build)',
    )
    .option('--non-interactive', 'run without local interactive prompts')
    .option('--ci', 'alias of --non-interactive')
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

  $ git ai-commit --jira
    Use the JIRA ticket from the current branch name to create a commit

  $ git ai-commit --jira PROJ-123
    Fetch JIRA ticket details and commit without AI

  $ git ai-commit --non-interactive
    Auto-select commit type/message without local prompts
    (Commit type is chosen by AI when --type is not provided)

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
    async (
      prompt: string | undefined,
      options: {
        jira?: string | boolean
        type?: string
        nonInteractive?: boolean
        ci?: boolean
      },
    ) => {
      try {
        // Check for version updates
        await checkAndUpgrade()

        await checkGitCLI()

        const nonInteractive = resolveNonInteractiveMode(options, {
          includeLegacyYolo: false,
        })

        assertJiraRequiresType({
          jira: options.jira,
          nonInteractive,
          type: options.type,
        })

        const commitTypeFromOptions = resolveCommitType(
          options.type,
          nonInteractive,
        )
        const commitType =
          commitTypeFromOptions ||
          (await select({
            message: 'Select a commit type:',
            choices: COMMIT_TYPE_CHOICES,
          }))

        if (nonInteractive && !options.type) {
          console.log(`Non-interactive mode: commit type will be chosen by AI`)
        }

        if (options.jira) {
          await runJiraCommitFlow(commitType, options.jira)
          return
        }

        await runAiCommitFlow(commitType, prompt, nonInteractive)
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
