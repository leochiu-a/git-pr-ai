import { Command } from 'commander'
import { confirm } from '@inquirer/prompts'
import ora from 'ora'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

import { getCurrentProvider } from '../../providers/factory'
import { parseMarkdownPlan, executePlanStep } from './plan-executor'
import { PlanStep, ExecutionResult } from './types'

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

async function executePlan(
  steps: PlanStep[],
  issueNumber: number,
): Promise<void> {
  console.log(
    `\n🚀 Starting execution of ${steps.length} steps for issue #${issueNumber}`,
  )

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
      `\n🎉 All steps completed successfully! Issue #${issueNumber} implementation is ready.`,
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
  $ git take-issue -i 42 -p plan.md
    Execute the plan in plan.md for issue #42

  $ git take-issue --issue 123 --plan-file ./docs/implementation-plan.md
    Execute the implementation plan for issue #123

Workflow:
  1. Run 'git plan-issue -i <issue-number>' to generate a plan
  2. Review and finalize the generated plan.md file
  3. Run 'git take-issue -i <issue-number> -p plan.md' to execute

Features:
  - Parse markdown plan files with executable steps
  - Execute steps with real-time progress feedback
  - Handle failures gracefully with user confirmation
  - Provide detailed execution summary
  - Support various step types (commands, file operations, etc.)

Prerequisites:
  - GitHub CLI (gh) or GitLab CLI (glab) must be installed and authenticated
  - Valid markdown plan file with executable steps
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

      // Validate required options
      if (!options.issue) {
        console.error('Error: --issue <number> is required')
        console.error('Usage: git take-issue --issue 42 --plan-file plan.md')
        process.exit(1)
      }

      if (!options.planFile) {
        console.error('Error: --plan-file <path> is required')
        console.error('Usage: git take-issue --issue 42 --plan-file plan.md')
        process.exit(1)
      }

      const issueNumber = parseInt(options.issue, 10)
      if (isNaN(issueNumber)) {
        console.error('Error: Issue number must be a valid number')
        process.exit(1)
      }

      // Fetch issue details for context
      const issue = await fetchIssueDetails(issueNumber)
      console.log(`\n🎯 Target Issue: #${issue.number} - ${issue.title}`)

      // Load and parse the plan file
      const steps = await loadPlanFile(options.planFile)

      // Confirm execution
      const shouldExecute = await confirm({
        message: `Execute plan with ${steps.length} steps for issue #${issueNumber}?`,
        default: true,
      })

      if (!shouldExecute) {
        console.log('Execution cancelled by user')
        process.exit(0)
      }

      // Execute the plan
      await executePlan(steps, issueNumber)
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
