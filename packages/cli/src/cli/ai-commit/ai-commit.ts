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

async function getGitDiff(): Promise<string> {
  try {
    // Get staged changes
    let result = await $`git diff --cached`
    let gitDiff = result.stdout.trim()

    // If no staged changes, check unstaged changes
    if (!gitDiff) {
      result = await $`git diff`
      gitDiff = result.stdout.trim()
    }

    if (!gitDiff) {
      console.error('No changes detected')
      console.error(
        'Please stage your changes with "git add" or make some changes first',
      )
      process.exit(1)
    }

    return gitDiff
  } catch (error) {
    console.error('Failed to get git diff')
    throw error
  }
}

async function generateCommitMessages(gitDiff: string): Promise<string[]> {
  const config = await loadConfig()

  const spinner = ora(
    `Generating commit messages with ${config.agent.toUpperCase()}`,
  ).start()

  try {
    const prompt = createCommitMessagePrompt(gitDiff)
    const aiOutput = await executeAIWithOutput(prompt)

    const parseResult = parseNumberedOutput(aiOutput)

    if (
      !parseResult.success ||
      !parseResult.values ||
      parseResult.values.length === 0
    ) {
      spinner.fail(parseResult.error || 'Could not parse AI output')
      console.error('AI output:', aiOutput)
      process.exit(1)
    }

    spinner.stop()
    return parseResult.values
  } catch (error) {
    spinner.fail(`Failed: ${error}`)
    process.exit(1)
  }
}

async function createCommit(commitMessage: string): Promise<void> {
  try {
    // Check if there are staged changes
    const stagedResult = await $`git diff --cached --quiet`.exitCode
    const hasStaged = stagedResult !== 0

    // If no staged changes, stage all changes
    if (!hasStaged) {
      await $`git add -A`
    }

    // Create the commit
    // Use stdio: 'inherit' to preserve TTY for hooks
    await $({ stdio: 'inherit' })`git commit -m ${commitMessage}`

    console.log(`\nCommit created: ${commitMessage}`)
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

Features:
  - AI-powered commit message generation based on actual code changes
  - Follows commitlint conventional commit format
  - Provides 3 different commit message options to choose from
  - Automatically stages changes if nothing is staged
  - Uses git diff to understand what changed

Prerequisites:
  - Git provider CLI must be installed and authenticated: GitHub CLI (gh) or GitLab CLI (glab)
  - AI provider must be configured in ~/.git-pr-ai/.git-pr-ai.json
    `,
    )

  return program
}

async function main() {
  const program = setupCommander()

  program.action(async () => {
    try {
      // Check for version updates
      await checkAndUpgrade()

      await checkGitCLI()

      // Get git diff
      const gitDiff = await getGitDiff()

      // Generate commit messages using AI
      const commitMessages = await generateCommitMessages(gitDiff)

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
  })

  program.parse()
}

main()
