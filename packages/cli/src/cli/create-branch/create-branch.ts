import { $ } from 'zx'
import { Command } from 'commander'
import { confirm, select } from '@inquirer/prompts'
import ora from 'ora'
import {
  checkGitCLI,
  getCurrentBranch,
  getDefaultBranch,
} from '../../git-helpers'
import { getJiraTicketTitle, normalizeJiraTicketInput } from '../../jira'
import { loadConfig } from '../../config'
import { executeAIWithOutput } from '../../ai/executor'
import {
  createJiraBranchPrompt,
  createCustomBranchPrompt,
  createDiffBranchPrompt,
} from './prompts'
import { checkAndUpgrade } from '../../utils/version-checker'
import { parseNumberedOutput } from '../../utils/ai-output-parser'
import { pickPreferredBranchName } from './non-interactive'
import { resolveNonInteractiveMode } from '../shared/non-interactive'

async function createBranch(
  branchName: string,
  baseBranch: string,
  nonInteractive = false,
) {
  console.log(`Creating branch: ${branchName}`)
  console.log(`Base branch: ${baseBranch}`)

  // Check if branch already exists
  try {
    await $`git show-ref --verify --quiet refs/heads/${branchName}`
    console.log(`Branch '${branchName}' already exists`)
    if (nonInteractive) {
      await $`git checkout ${branchName}`
      console.log(
        `Non-interactive mode: switched to existing branch: ${branchName}`,
      )
      return
    }

    const switchToExisting = await confirm({
      message: `Do you want to switch to the existing branch '${branchName}'?`,
      default: true,
    })

    if (switchToExisting) {
      await $`git checkout ${branchName}`
      console.log(`Switched to existing branch: ${branchName}`)
      return
    } else {
      console.log('Branch creation cancelled')
      process.exit(0)
    }
  } catch {
    // Branch doesn't exist, create it
  }

  // Create and switch to new branch
  await $`git checkout -b ${branchName} ${baseBranch}`
  console.log(`Created and switched to branch: ${branchName}`)
}

async function moveBranch(
  currentBranch: string,
  newBranchName: string,
  nonInteractive = false,
) {
  // Check if target branch already exists
  try {
    await $`git show-ref --verify --quiet refs/heads/${newBranchName}`
    console.error(`Branch '${newBranchName}' already exists`)
    if (nonInteractive) {
      console.log(
        `Non-interactive mode: keeping current branch '${currentBranch}' unchanged (target '${newBranchName}' already exists)`,
      )
      return
    }

    const overwrite = await confirm({
      message: `Branch '${newBranchName}' already exists. Overwrite it?`,
      default: false,
    })

    if (!overwrite) {
      console.log('Branch rename cancelled')
      process.exit(0)
    } else {
      // Force rename, which will overwrite the existing branch
      await $`git branch -M ${newBranchName}`
      console.log(`Force renamed branch to: ${newBranchName}`)
    }
  } catch {
    // Target branch doesn't exist, proceed with normal rename
    await $`git branch -m ${newBranchName}`
    console.log(`Renamed branch to: ${newBranchName}`)
  }
}

async function generateBranchNameWithAI(
  prompt: string,
  nonInteractive = false,
): Promise<string | never> {
  const config = await loadConfig()

  const spinner = ora(
    `Using ${config.agent.toUpperCase()} to generate branch name options...`,
  ).start()

  try {
    // Execute AI command and get output
    const aiOutput = await executeAIWithOutput(prompt, {
      commandName: 'createBranch',
    })

    // Parse AI output
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

    const branchNames = parseResult.values
    spinner.succeed(`Generated ${branchNames.length} branch name option(s)!`)

    // If only one option, return it directly
    if (branchNames.length === 1) {
      if (nonInteractive) {
        return branchNames[0]
      }

      const confirmAI = await confirm({
        message: `Use suggestion: ${branchNames[0]}?`,
        default: true,
      })

      if (confirmAI) {
        return branchNames[0]
      } else {
        console.log('Branch creation cancelled')
        process.exit(0)
      }
    }

    if (nonInteractive) {
      const selectedBranchName = pickPreferredBranchName(branchNames)
      console.log(
        `Non-interactive mode: auto-selected branch name: ${selectedBranchName}`,
      )
      return selectedBranchName
    }

    // Multiple options: let user choose
    const selectedBranchName = await select({
      message: 'Select a branch name:',
      choices: branchNames.map((name) => ({
        name,
        value: name,
      })),
    })

    return selectedBranchName
  } catch (error) {
    spinner.fail(`AI generation failed: ${error}`)
    process.exit(1)
  }
}

async function generateBranchName(
  jiraTicket: string,
  jiraTitle: string | null,
  nonInteractive = false,
): Promise<string | never> {
  const prompt = createJiraBranchPrompt(jiraTicket, jiraTitle)
  return generateBranchNameWithAI(prompt, nonInteractive)
}

async function generateBranchNameFromPrompt(
  customPrompt: string,
  nonInteractive = false,
): Promise<string | never> {
  const prompt = createCustomBranchPrompt(customPrompt)
  return generateBranchNameWithAI(prompt, nonInteractive)
}

async function generateBranchNameFromDiff(
  nonInteractive = false,
): Promise<string | never> {
  const diffSpinner = ora('Analyzing git diff...').start()

  // Get git diff
  let gitDiff: string
  try {
    const result = await $`git diff HEAD`
    gitDiff = result.stdout.trim()

    if (!gitDiff) {
      diffSpinner.warn('No changes detected in git diff against HEAD')

      // Fallback to comparing with default branch
      const defaultBranch = await getDefaultBranch()
      const currentBranch = await getCurrentBranch()

      if (currentBranch === defaultBranch) {
        diffSpinner.fail('No changes detected and already on default branch')
        process.exit(1)
      }

      diffSpinner.text = `Comparing with default branch: ${defaultBranch}`
      const fallbackResult = await $`git diff ${defaultBranch}...HEAD`
      gitDiff = fallbackResult.stdout.trim()

      if (!gitDiff) {
        diffSpinner.fail(
          'No changes detected even when comparing with default branch',
        )
        process.exit(1)
      }

      diffSpinner.succeed('Found changes when comparing with default branch')
    } else {
      diffSpinner.succeed('Git diff analysis completed')
    }
  } catch {
    diffSpinner.fail('Failed to get git diff')
    process.exit(1)
  }

  const prompt = createDiffBranchPrompt(gitDiff)
  return generateBranchNameWithAI(prompt, nonInteractive)
}

function setupCommander() {
  const program = new Command()

  program
    .name('git-create-branch')
    .description(
      'Create a new git branch based on JIRA ticket information, git diff, or custom prompt',
    )
    .option('-j, --jira <ticket>', 'specify JIRA ticket ID or URL')
    .option('-g, --diff', 'generate branch name based on current git diff')
    .option('--git-diff', 'alias of --diff')
    .option(
      '-p, --prompt <prompt>',
      'generate branch name based on custom prompt',
    )
    .option('-m, --move', 'rename current branch instead of creating a new one')
    .option('--non-interactive', 'run without local interactive prompts')
    .option('--ci', 'alias of --non-interactive')
    .addHelpText(
      'after',
      `
Examples:
  $ git create-branch --jira PROJ-123
    Create a branch named: feat/PROJ-123-add-login-page

  $ git create-branch --jira https://xxxx.atlassian.net/browse/KB2CW-2684
    Create a branch named: feat/KB2CW-2684-description-from-ticket
    (Also accepts full JIRA URL)

  $ git create-branch --diff
    Create a branch named: fix/update-user-validation
    (Based on current git diff changes)

  $ git create-branch --prompt "Add user authentication system"
    Create a branch named: feat/add-user-auth-system
    (Based on custom prompt)

  $ git create-branch --jira PROJ-123 --move
    Rename current branch to: feat/PROJ-123-add-login-page

  $ git create-branch --diff --move
    Rename current branch to: fix/update-user-validation
    (Based on current git diff changes)

  $ git create-branch --prompt "Fix memory leak in cache" --move
    Rename current branch to: fix/memory-leak-cache
    (Based on custom prompt)

  $ git create-branch --jira PROJ-123 --non-interactive
    Generate and apply branch name without local prompts

Features:
  - Three modes: JIRA ticket-based, git diff-based, or custom prompt-based branch naming
  - Create new branches or rename existing ones (--move)
  - Automatically fetches JIRA ticket title (JIRA mode)
  - AI-powered branch type detection (feat, fix, docs, etc.) following commitlint conventions
  - Uses current branch as base branch (simple and intuitive)
  - Creates descriptive branch names based on ticket title or code changes
  - Handles existing branches gracefully
  - No manual configuration needed

Prerequisites:
  - Git provider CLI must be installed and authenticated: GitHub CLI (gh) or GitLab CLI (glab)
  - For JIRA integration: Configure JIRA credentials in ~/.git-pr-ai/.git-pr-ai.json
    `,
    )

  return program
}

interface CreateBranchOptions {
  /** provide a JIRA ticket ID to create a branch from the ticket */
  jira?: string
  /** provide a git diff to create a branch from the diff */
  diff?: boolean
  /** legacy alias of diff */
  gitDiff?: boolean
  /** provide a custom prompt to create a branch from the prompt */
  prompt?: string
  /** move the current branch instead of creating a new one */
  move?: boolean
  /** run without local interactive prompts */
  nonInteractive?: boolean
  /** alias of nonInteractive */
  ci?: boolean
}

async function main() {
  const program = setupCommander()

  program.action(async (options: CreateBranchOptions) => {
    try {
      // Check for version updates
      await checkAndUpgrade()

      await checkGitCLI()

      const useGitDiff = options.diff || options.gitDiff

      // Check if user provided one of the required options
      const optionCount = [options.jira, useGitDiff, options.prompt].filter(
        Boolean,
      ).length

      if (optionCount === 0) {
        console.error(
          'One of the following options is required: --jira, --diff, or --prompt',
        )
        console.error('Usage: git create-branch --jira PROJ-123')
        console.error('   or: git create-branch --diff')
        console.error('   or: git create-branch --prompt "description"')
        process.exit(1)
      }

      if (optionCount > 1) {
        console.error(
          'Only one option can be used at a time: --jira, --diff, or --prompt',
        )
        process.exit(1)
      }

      // Get current branch as base branch
      const currentBranch = await getCurrentBranch()
      console.log(`Current branch: ${currentBranch}`)
      const nonInteractive = resolveNonInteractiveMode(options, {
        includeLegacyYolo: false,
      })

      let branchName: string

      if (useGitDiff) {
        // Generate branch name from git diff
        branchName = await generateBranchNameFromDiff(nonInteractive)
      } else if (options.prompt) {
        // Generate branch name from custom prompt
        console.log(`💭 Custom prompt: ${options.prompt}`)
        branchName = await generateBranchNameFromPrompt(
          options.prompt,
          nonInteractive,
        )
      } else if (options.jira) {
        // Generate branch name from JIRA ticket
        const jiraTicket = normalizeJiraTicketInput(options.jira)

        if (!jiraTicket) {
          console.error(
            'Invalid JIRA ticket provided. Use a ticket key like PROJ-123 or a valid JIRA URL.',
          )
          process.exit(1)
        }
        console.log(`JIRA Ticket: ${jiraTicket}`)

        // Fetch JIRA ticket title
        const jiraSpinner = ora('Fetching JIRA ticket title...').start()
        const jiraTitle = await getJiraTicketTitle(jiraTicket)

        if (jiraTitle) {
          jiraSpinner.succeed(`JIRA Title: ${jiraTitle}`)
        } else {
          jiraSpinner.warn('Could not fetch JIRA title, using ticket ID only')
        }

        // Generate branch name using AI
        branchName = await generateBranchName(
          jiraTicket,
          jiraTitle,
          nonInteractive,
        )
      } else {
        // This should not happen due to earlier checks
        throw new Error('No valid option provided')
      }

      if (options.move) {
        // Rename current branch
        await moveBranch(currentBranch, branchName, nonInteractive)
      } else {
        // Create the branch from current branch
        await createBranch(branchName, currentBranch, nonInteractive)
      }
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
