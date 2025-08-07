import { $ } from 'zx'
import { Command } from 'commander'
import { confirm } from '@inquirer/prompts'
import {
  checkGitHubCLI,
  getCurrentBranch,
  getDefaultBranch,
} from '../git-helpers.js'
import { getJiraTicketTitle } from '../jira.js'
import { loadConfig } from '../config.js'
import { executeAIWithOutput } from '../ai-executor.js'

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

async function generateBranchName(
  jiraTicket: string,
  jiraTitle: string | null,
): Promise<string | never> {
  const config = await loadConfig()

  const prompt = `Based on the following JIRA ticket information, generate a git branch name:

JIRA Ticket: ${jiraTicket}
JIRA Title: ${jiraTitle || 'Not available'}

Please analyze the ticket and provide:
1. An appropriate branch type prefix following commitlint conventional types:
   - feat: new features
   - fix: bug fixes  
   - docs: documentation changes
   - style: formatting changes
   - refactor: code refactoring
   - perf: performance improvements
   - test: adding/updating tests
   - chore: maintenance tasks
   - ci: CI/CD changes
   - build: build system changes
2. A descriptive branch name following the format: {prefix}/{ticket-id}-{description}

Requirements:
- Use kebab-case for the description
- Keep the description concise but meaningful (max 30 characters)
- Use only lowercase letters, numbers, and hyphens
- Choose the branch type based on the ticket content
- Prefer 'feat' over 'feature' and 'fix' over 'bugfix' to align with commitlint

Please respond with exactly this format:
BRANCH_NAME: {your_generated_branch_name}

Example:
BRANCH_NAME: feat/PROJ-123-add-user-auth`

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

async function generateBranchNameFromDiff(): Promise<string | never> {
  const config = await loadConfig()

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

  const prompt = `Based on the following git diff, generate a git branch name:

${gitDiff}

Please analyze the changes and provide:
1. An appropriate branch type prefix following commitlint conventional types:
   - feat: new features
   - fix: bug fixes  
   - docs: documentation changes
   - style: formatting changes
   - refactor: code refactoring
   - perf: performance improvements
   - test: adding/updating tests
   - chore: maintenance tasks
   - ci: CI/CD changes
   - build: build system changes
2. A descriptive branch name following the format: {prefix}/{description}

Requirements:
- Use kebab-case for the description
- Keep the description concise but meaningful (max 40 characters)
- Use only lowercase letters, numbers, and hyphens
- Choose the branch type based on the changes shown in the diff
- Generate a description that captures the essence of the changes

Please respond with exactly this format:
BRANCH_NAME: {your_generated_branch_name}

Example:
BRANCH_NAME: feat/add-user-authentication`

  try {
    console.log(
      `🤖 Using ${config.agent.toUpperCase()} to generate branch name from git diff...`,
    )

    // Execute AI command and get output
    const aiOutput = await executeAIWithOutput(prompt)

    // Parse AI output
    const branchMatch = aiOutput.match(/BRANCH_NAME:\s*(.+)/i)

    if (branchMatch) {
      const aiBranchName = branchMatch[1].trim()

      console.log(`🤖 AI-generated branch name: ${aiBranchName}`)

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

function setupCommander() {
  const program = new Command()

  program
    .name('git-create-branch')
    .description(
      'Create a new git branch based on JIRA ticket information or git diff',
    )
    .option('-j, --jira <ticket>', 'specify JIRA ticket ID')
    .option('-g, --git-diff', 'generate branch name based on current git diff')
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

  $ git create-branch --jira PROJ-123 --move
    Rename current branch to: feat/PROJ-123-add-login-page

  $ git create-branch --git-diff --move
    Rename current branch to: fix/update-user-validation
    (Based on current git diff changes)

Features:
  - Two modes: JIRA ticket-based or git diff-based branch naming
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

async function main() {
  const program = setupCommander()

  program.action(async (options) => {
    try {
      await checkGitHubCLI()

      // Check if user provided either --jira or --git-diff
      if (!options.jira && !options.gitDiff) {
        console.error(
          '🔴 Either JIRA ticket ID (--jira) or git diff mode (--git-diff) is required',
        )
        console.error('Usage: git create-branch --jira PROJ-123')
        console.error('   or: git create-branch --git-diff')
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
      } else {
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
