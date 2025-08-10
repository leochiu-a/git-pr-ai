import { Command } from 'commander'
import { confirm } from '@inquirer/prompts'
import ora from 'ora'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

import { getCurrentProvider } from '../../providers/factory'
import { parseMarkdownPlan, executePlanStep } from './plan-executor'
import { PlanStep, ExecutionResult } from './types'
import { IssueDetails } from '../../providers/types'
import { executeAIWithJsonOutput } from '../../ai-executor'

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

async function loadPlanFile(planFilePath: string): Promise<PlanStep[]> {
  const spinner = ora('Loading plan file...').start()

  try {
    const resolvedPath = resolve(planFilePath)

    if (!existsSync(resolvedPath)) {
      throw new Error(`Plan file not found: ${resolvedPath}`)
    }

    const content = readFileSync(resolvedPath, 'utf8')
    const steps = parseMarkdownPlan(content)

    if (steps.length === 0) {
      throw new Error('No executable steps found in plan file')
    }

    spinner.succeed(`Loaded plan with ${steps.length} steps`)
    return steps
  } catch (error) {
    spinner.fail('Failed to load plan file')
    throw error
  }
}

async function generatePlanFromIssue(issue: IssueDetails): Promise<PlanStep[]> {
  const spinner = ora('Generating implementation plan from issue...').start()

  try {
    const prompt = `You are an expert software developer. Generate a detailed, executable implementation plan for the following GitHub issue.

Issue Details:
- Title: ${issue.title}
- Description: ${issue.body || 'No description provided'}
- Number: #${issue.number}

Create a step-by-step plan to implement this feature/fix. Return a JSON array of steps where each step has:
{
  "title": "Brief step title",
  "description": "Detailed description of what this step does",
  "type": "command|file|manual",
  "content": "Command to run or file operation details",
  "path": "file path (for file operations, optional)"
}

Types explanation:
- "command": Shell command to execute
- "file": File creation/modification operation
- "manual": Manual task that requires user intervention

Generate practical, executable steps that implement the requested functionality. Focus on common development tasks like creating files, running tests, building, etc.`

    const response = await executeAIWithJsonOutput(prompt)
    const steps = JSON.parse(response) as PlanStep[]

    if (!Array.isArray(steps) || steps.length === 0) {
      throw new Error('Generated plan has no executable steps')
    }

    spinner.succeed(`Generated plan with ${steps.length} steps`)
    return steps
  } catch (error) {
    spinner.fail('Failed to generate plan from issue')
    throw new Error(
      `Could not generate plan: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

async function executePlan(steps: PlanStep[]): Promise<void> {
  console.log(`\n🚀 Starting execution of ${steps.length} steps`)

  const results: ExecutionResult[] = []
  let successCount = 0
  let failureCount = 0

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]
    const stepNumber = i + 1

    console.log(`\n📋 Step ${stepNumber}/${steps.length}: ${step.title}`)
    if (step.description) {
      console.log(`   ${step.description}`)
    }

    try {
      const result = await executePlanStep(step, stepNumber)
      results.push(result)

      if (result.success) {
        console.log(`✅ Step ${stepNumber} completed successfully`)
        successCount++
      } else {
        console.log(`❌ Step ${stepNumber} failed: ${result.error}`)
        failureCount++

        const shouldContinue = await confirm({
          message: `Step ${stepNumber} failed. Continue with remaining steps?`,
          default: false,
        })

        if (!shouldContinue) {
          console.log('Execution stopped by user')
          break
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      console.log(`❌ Step ${stepNumber} failed with error: ${errorMessage}`)
      failureCount++

      const shouldContinue = await confirm({
        message: `Step ${stepNumber} failed. Continue with remaining steps?`,
        default: false,
      })

      if (!shouldContinue) {
        console.log('Execution stopped by user')
        break
      }
    }
  }

  // Summary
  console.log(`\n📊 Execution Summary:`)
  console.log(`   ✅ Successful steps: ${successCount}`)
  console.log(`   ❌ Failed steps: ${failureCount}`)
  console.log(`   📋 Total steps: ${steps.length}`)

  if (failureCount === 0) {
    console.log(
      `\n🎉 All steps completed successfully! Implementation is ready.`,
    )
  } else {
    console.log(
      `\n⚠️  Some steps failed. Please review the output and address any issues.`,
    )
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

  $ git take-issue -i 42
    Generate and execute a plan for issue #42

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

      let steps: PlanStep[]
      let issueNumber: number | undefined

      if (options.planFile) {
        // Plan file mode: Load steps directly from file
        steps = await loadPlanFile(options.planFile)
        console.log(`\n📋 Loaded plan from file: ${options.planFile}`)
      } else if (options.issue) {
        // Issue mode: Generate plan from issue
        issueNumber = parseInt(options.issue, 10)
        if (isNaN(issueNumber)) {
          console.error('Error: Issue number must be a valid number')
          process.exit(1)
        }

        const issue = await fetchIssueDetails(issueNumber)
        console.log(`\n🎯 Target Issue: #${issue.number} - ${issue.title}`)

        // TODO: Generate plan from issue (this needs to be implemented)
        steps = await generatePlanFromIssue(issue)
      } else {
        throw new Error('No valid input provided')
      }

      // Confirm execution
      const message = issueNumber
        ? `Execute plan with ${steps.length} steps for issue #${issueNumber}?`
        : `Execute plan with ${steps.length} steps?`

      const shouldExecute = await confirm({
        message,
        default: true,
      })

      if (!shouldExecute) {
        console.log('Execution cancelled by user')
        process.exit(0)
      }

      // Execute the plan
      await executePlan(steps)
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
