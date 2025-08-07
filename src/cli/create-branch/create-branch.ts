import { $ } from 'zx'
import { Command } from 'commander'
import { confirm } from '@inquirer/prompts'
import {
  checkGitHubCLI,
  getCurrentBranch,
  getDefaultBranch,
} from '../../git-helpers.js'
import { getJiraTicketTitle } from '../../jira.js'
import { loadConfig } from '../../config.js'
import { executeAIWithOutput } from '../../ai-executor.js'
import {
  createJiraBranchPrompt,
  createCustomBranchPrompt,
  createDiffBranchPrompt,
} from './prompts.js'

async function createBranch(branchName: string, baseBranch: string) {
  console.log(`🌿 Creating branch: ${branchName}`)
  console.log(`📋 Base branch: ${baseBranch}`)

  // Check if branch already exists
  try {
    await $`git show-ref --verify --quiet refs/heads/${branchName}`
    console.log(`⚠️ Branch '${branchName}' already exists`)
    const switchToExisting = await confirm({
      message: `Do you want to switch to the existing branch '${branchName}'?`,
      default: true,
    })

    if (switchToExisting) {
      await $`git checkout ${branchName}`
      console.log(`✅ Switched to existing branch: ${branchName}`)
      return
    } else {
      console.log('❌ Branch creation cancelled')
      process.exit(0)
    }
  } catch {
    // Branch doesn't exist, create it
  }

  // Create and switch to new branch
  await $`git checkout -b ${branchName} ${baseBranch}`
  console.log(`✅ Created and switched to branch: ${branchName}`)
}

async function moveBranch(currentBranch: string, newBranchName: string) {
  // Check if target branch already exists
  try {
    await $`git show-ref --verify --quiet refs/heads/${newBranchName}`
    console.error(`⚠️ Branch '${newBranchName}' already exists`)
    const overwrite = await confirm({
      message: `Branch '${newBranchName}' already exists. Overwrite it?`,
      default: false,
    })

    if (!overwrite) {
      console.log('🚫 Branch rename cancelled')
      process.exit(0)
    } else {
      // Force rename, which will overwrite the existing branch
      await $`git branch -M ${newBranchName}`
      console.log(`✅ Force renamed branch to: ${newBranchName}`)
    }
  } catch {
    // Target branch doesn't exist, proceed with normal rename
    await $`git branch -m ${newBranchName}`
    console.log(`✅ Renamed branch to: ${newBranchName}`)
  }
}

async function generateBranchNameWithAI(
  prompt: string,
): Promise<string | never> {
  const config = await loadConfig()

  try {
    console.log(
      `🤖 Using ${config.agent.toUpperCase()} to generate branch name...`,
    )

    // Execute AI command and get output
    const aiOutput = await executeAIWithOutput(prompt)

    // Parse AI output
    const branchMatch = aiOutput.match(/BRANCH_NAME:\s*(.+)/i)

    if (branchMatch) {
      const aiBranchName = branchMatch[1].trim()

      // Confirm the AI suggestion
      const confirmAI = await confirm({
        message: `Use AI suggestion: ${aiBranchName}?`,
        default: true,
      })

      if (confirmAI) {
        return aiBranchName
      } else {
        console.log('🚫 Branch creation cancelled')
        process.exit(0)
      }
    } else {
      console.error('⚠️ Could not parse AI output')
      process.exit(1)
    }
  } catch {
    console.error('⚠️ AI generation failed')
    process.exit(1)
  }
}

async function generateBranchName(
  jiraTicket: string,
  jiraTitle: string | null,
): Promise<string | never> {
  const prompt = createJiraBranchPrompt(jiraTicket, jiraTitle)
  return generateBranchNameWithAI(prompt)
}

async function generateBranchNameFromPrompt(
  customPrompt: string,
): Promise<string | never> {
  const prompt = createCustomBranchPrompt(customPrompt)
  return generateBranchNameWithAI(prompt)
}

async function generateBranchNameFromDiff(): Promise<string | never> {
  // Get git diff
  let gitDiff: string
  try {
    const result = await $`git diff HEAD`
    gitDiff = result.stdout.trim()

    if (!gitDiff) {
      console.log('⚠️ No changes detected in git diff against HEAD')

      // Fallback to comparing with default branch
      const defaultBranch = await getDefaultBranch()
      const currentBranch = await getCurrentBranch()

      if (currentBranch === defaultBranch) {
        console.error('⚠️ No changes detected and already on default branch')
        process.exit(1)
      }

      console.log(`🔄 Comparing with default branch: ${defaultBranch}`)
      const fallbackResult = await $`git diff ${defaultBranch}...HEAD`
      gitDiff = fallbackResult.stdout.trim()

      if (!gitDiff) {
        console.error(
          '⚠️ No changes detected even when comparing with default branch',
        )
        process.exit(1)
      }

      console.log('✅ Found changes when comparing with default branch')
    }
  } catch {
    console.error('⚠️ Failed to get git diff')
    process.exit(1)
  }

  const prompt = createDiffBranchPrompt(gitDiff)
  return generateBranchNameWithAI(prompt)
}

function setupCommander() {
  const program = new Command()

  program
    .name('git-create-branch')
    .description(
      'Create a new git branch based on JIRA ticket information, git diff, or custom prompt',
    )
    .option('-j, --jira <ticket>', 'specify JIRA ticket ID')
    .option('-g, --git-diff', 'generate branch name based on current git diff')
    .option(
      '-p, --prompt <prompt>',
      'generate branch name based on custom prompt',
    )
    .option('-m, --move', 'rename current branch instead of creating a new one')
    .addHelpText(
      'after',
      `
Examples:
  $ git create-branch --jira PROJ-123
    Create a branch named: feat/PROJ-123-add-login-page

  $ git create-branch --git-diff
    Create a branch named: fix/update-user-validation
    (Based on current git diff changes)

  $ git create-branch --prompt "Add user authentication system"
    Create a branch named: feat/add-user-auth-system
    (Based on custom prompt)

  $ git create-branch --jira PROJ-123 --move
    Rename current branch to: feat/PROJ-123-add-login-page

  $ git create-branch --git-diff --move
    Rename current branch to: fix/update-user-validation
    (Based on current git diff changes)

  $ git create-branch --prompt "Fix memory leak in cache" --move
    Rename current branch to: fix/memory-leak-cache
    (Based on custom prompt)

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
  - GitHub CLI (gh) must be installed and authenticated
  - For JIRA integration: Configure JIRA credentials in ~/.git-pr-ai/.git-pr-ai.json
    `,
    )

  return program
}

interface CreateBranchOptions {
  /** provide a JIRA ticket ID to create a branch from the ticket */
  jira?: string
  /** provide a git diff to create a branch from the diff */
  gitDiff?: boolean
  /** provide a custom prompt to create a branch from the prompt */
  prompt?: string
  /** move the current branch instead of creating a new one */
  move?: boolean
}

async function main() {
  const program = setupCommander()

  program.action(async (options: CreateBranchOptions) => {
    try {
      await checkGitHubCLI()

      // Check if user provided one of the required options
      const optionCount = [
        options.jira,
        options.gitDiff,
        options.prompt,
      ].filter(Boolean).length

      if (optionCount === 0) {
        console.error(
          '🔴 One of the following options is required: --jira, --git-diff, or --prompt',
        )
        console.error('Usage: git create-branch --jira PROJ-123')
        console.error('   or: git create-branch --git-diff')
        console.error('   or: git create-branch --prompt "description"')
        process.exit(1)
      }

      if (optionCount > 1) {
        console.error(
          '🔴 Only one option can be used at a time: --jira, --git-diff, or --prompt',
        )
        process.exit(1)
      }

      // Get current branch as base branch
      const currentBranch = await getCurrentBranch()
      console.log(`📍 Current branch: ${currentBranch}`)

      let branchName: string

      if (options.gitDiff) {
        // Generate branch name from git diff
        console.log('🔍 Analyzing git diff...')
        branchName = await generateBranchNameFromDiff()
      } else if (options.prompt) {
        // Generate branch name from custom prompt
        console.log(`💭 Custom prompt: ${options.prompt}`)
        branchName = await generateBranchNameFromPrompt(options.prompt)
      } else if (options.jira) {
        // Generate branch name from JIRA ticket
        const jiraTicket = options.jira
        console.log(`🎯 JIRA Ticket: ${jiraTicket}`)

        // Fetch JIRA ticket title
        console.log('🔍 Fetching JIRA ticket title...')
        const jiraTitle = await getJiraTicketTitle(jiraTicket)

        if (jiraTitle) {
          console.log(`📋 JIRA Title: ${jiraTitle}`)
        } else {
          console.log('⚠️ Could not fetch JIRA title, using ticket ID only')
        }

        // Generate branch name using AI
        branchName = await generateBranchName(jiraTicket, jiraTitle)
      } else {
        // This should not happen due to earlier checks
        throw new Error('No valid option provided')
      }

      if (options.move) {
        // Rename current branch
        await moveBranch(currentBranch, branchName)
      } else {
        // Create the branch from current branch
        await createBranch(branchName, currentBranch)
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      console.error('⚠️ Error:', errorMessage)
      process.exit(1)
    }
  })

  program.parse()
}

main()
