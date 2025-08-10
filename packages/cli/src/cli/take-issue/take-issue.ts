import { Command } from 'commander'
import ora from 'ora'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

import { executeAICommand } from '../../ai-executor'
import { getCurrentProvider } from '../../providers/factory'
import { createIssuePrompt, createPlanPrompt } from './prompts'

async function fetchIssueDetails(issueNumber: number) {
  const provider = await getCurrentProvider()
  const spinner = ora('Fetching issue details...').start()

  try {
    const issue = await provider.getIssue(issueNumber)
    spinner.succeed(`Fetched issue #${issue.number}: ${issue.title}`)
    return issue
  } catch (error) {
    spinner.fail('Failed to fetch issue details')
    throw error
  }
}

async function loadPlanFile(planFilePath: string): Promise<string> {
  const spinner = ora('Loading plan file...').start()

  try {
    const resolvedPath = resolve(planFilePath)

    if (!existsSync(resolvedPath)) {
      throw new Error(`Plan file not found: ${resolvedPath}`)
    }

    const content = readFileSync(resolvedPath, 'utf8')
    spinner.succeed(`Loaded plan from file`)
    return content
  } catch (error) {
    spinner.fail('Failed to load plan file')
    throw error
  }
}

function setupCommander() {
  const program = new Command()

  program
    .name('git-take-issue')
    .description('Execute a development plan for a specific issue')
    .option('-i, --issue <number>', 'GitHub issue number to implement')
    .option('-p, --plan-file <path>', 'Path to the markdown plan file')
    .addHelpText(
      'after',
      `
Examples:
  $ git take-issue --plan-file plan.md
    Execute the steps defined in plan.md

  $ git take-issue --issue 123
    Generate and execute a plan for issue #123

Usage Modes:
  1. Plan File Mode: Use --plan-file to execute a predefined plan
     - Loads steps from a markdown file
     - No issue context required
     
  2. Issue Mode: Use --issue to generate and execute a plan
     - Analyzes the GitHub issue
     - Generates an implementation plan using AI
     - Executes the generated plan

Workflow (Plan File Mode):
  1. Create or obtain a markdown plan file with executable steps
  2. Run 'git take-issue --plan-file plan.md'

Workflow (Issue Mode):
  1. Run 'git take-issue --issue <issue-number>'
  2. Review the generated plan and confirm execution

Features:
  - Two execution modes: plan file or issue-based
  - AI-powered plan generation from GitHub issues
  - Parse markdown plan files with executable steps
  - Execute steps with real-time progress feedback
  - Handle failures gracefully with user confirmation
  - Provide detailed execution summary

Prerequisites:
  - GitHub CLI (gh) or GitLab CLI (glab) must be installed and authenticated
  - AI agent must be configured for issue mode (run 'git pr-ai config')
    `,
    )

  return program
}

interface TakeIssueOptions {
  /** GitHub issue number to implement */
  issue?: string
  /** Path to the markdown plan file */
  planFile?: string
}

async function main() {
  const program = setupCommander()

  program.action(async (options: TakeIssueOptions) => {
    try {
      const provider = await getCurrentProvider()
      await provider.checkCLI()

      // Validate that one of the required options is provided
      if (!options.planFile && !options.issue) {
        console.error(
          'Error: Either --plan-file <path> or --issue <number> is required',
        )
        console.error(
          'Usage: git take-issue [--plan-file plan.md | --issue 42]',
        )
        process.exit(1)
      }

      if (options.planFile && options.issue) {
        console.error(
          'Error: Cannot use both --plan-file and --issue options. Choose one.',
        )
        console.error(
          'Usage: git take-issue [--plan-file plan.md | --issue 42]',
        )
        process.exit(1)
      }

      if (options.issue) {
        const issueNumber = parseInt(options.issue, 10)
        if (isNaN(issueNumber)) {
          console.error('Error: Issue number must be a valid number')
          process.exit(1)
        }

        const issue = await fetchIssueDetails(issueNumber)
        console.log(`\n🎯 Target Issue: #${issue.number} - ${issue.title}`)

        await executeAICommand(createIssuePrompt(issue))
      } else if (options.planFile) {
        const planContent = await loadPlanFile(options.planFile)
        console.log(`\n📋 Loaded plan from file: ${options.planFile}`)

        // Execute using AI
        await executeAICommand(createPlanPrompt(planContent))
      } else {
        throw new Error('No valid input provided')
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
