import { Command } from 'commander'
import { select } from '@inquirer/prompts'
import ora from 'ora'
import { $ } from 'zx'
import { writeFileSync } from 'fs'
import { join } from 'path'

import { checkGitCLI } from '../../git-helpers'
import { executeAIWithOutput } from '../../ai-executor'
import { IssueDetails, ImplementationPlan } from './types'
import { createImplementationPlanPrompt } from './prompts'
import {
  formatUpdatedIssueBody,
  formatPlanComment,
  formatPlanSection,
} from './templates'

async function fetchIssueDetails(issueNumber: number): Promise<IssueDetails> {
  const spinner = ora('Fetching issue details...').start()

  try {
    const result =
      await $`gh issue view ${issueNumber} --json number,title,body,labels,assignees,milestone`
    const issue = JSON.parse(result.stdout) as {
      number: number
      title: string
      body: string
      labels: Array<{ name: string }>
      assignees: Array<{ login: string }>
      milestone?: { title: string }
    }

    spinner.succeed(`Fetched issue #${issue.number}: ${issue.title}`)

    return {
      number: issue.number,
      title: issue.title,
      body: issue.body || '',
      labels: issue.labels?.map((label) => label.name) || [],
      assignee: issue.assignees?.[0]?.login,
      milestone: issue.milestone?.title,
    }
  } catch {
    spinner.fail('Failed to fetch issue details')
    throw new Error(
      `Could not fetch issue #${issueNumber}. Make sure it exists and you have access to it.`,
    )
  }
}

async function generateImplementationPlan(
  issue: IssueDetails,
): Promise<ImplementationPlan> {
  const spinner = ora('Generating implementation plan...').start()

  try {
    const prompt = createImplementationPlanPrompt(issue)
    const response = await executeAIWithOutput(prompt)
    const plan = JSON.parse(response)

    spinner.succeed('Implementation plan generated')
    return plan
  } catch (error) {
    spinner.fail('Failed to generate implementation plan')
    throw new Error(
      `Could not generate plan: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

async function updateIssueDescription(
  issueNumber: number,
  updatedBody: string,
): Promise<void> {
  const spinner = ora('Updating issue description...').start()

  try {
    await $`gh issue edit ${issueNumber} --body ${updatedBody}`
    spinner.succeed(`Updated issue #${issueNumber} with implementation plan`)
  } catch (error) {
    spinner.fail('Failed to update issue description')
    throw new Error(
      `Could not update issue: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

async function addIssueComment(
  issueNumber: number,
  comment: string,
): Promise<void> {
  const spinner = ora('Adding implementation plan as comment...').start()

  try {
    await $`gh issue comment ${issueNumber} --body ${comment}`
    spinner.succeed(
      `Added implementation plan comment to issue #${issueNumber}`,
    )
  } catch (error) {
    spinner.fail('Failed to add comment')
    throw new Error(
      `Could not add comment: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

async function savePlanToFile(
  issue: IssueDetails,
  plan: ImplementationPlan,
): Promise<void> {
  const spinner = ora('Saving implementation plan to file...').start()

  try {
    const fileName = `issue-${issue.number}-plan.md`
    const filePath = join(process.cwd(), fileName)
    const content = formatPlanSection(plan)

    writeFileSync(filePath, content, 'utf8')
    spinner.succeed(`Implementation plan saved to ${fileName}`)
  } catch (error) {
    spinner.fail('Failed to save file')
    throw new Error(
      `Could not save file: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

function setupCommander() {
  const program = new Command()

  program
    .name('git-plan-issue')
    .description(
      'Smart Issue Planning - Analyze GitHub issues and create implementation plans',
    )
    .requiredOption('-i, --issue <number>', 'GitHub issue number to plan')
    .addHelpText(
      'after',
      `
Examples:
  $ git plan-issue -i 42
    Create implementation plan for issue #42

Features:
  - Fetches issue details from GitHub
  - Generates AI-powered implementation plan
  - Creates structured task breakdown
  - Suggests branch naming convention
  - Identifies prerequisites and testing strategy
  - Interactively ask if you want to update issue, add comment, or save to file

Prerequisites:
  - GitHub CLI (gh) must be installed and authenticated
  - AI agent must be configured (run 'git pr-ai config' first)
    `,
    )

  return program
}

async function main() {
  const program = setupCommander()

  program.action(async (options: { issue: string }) => {
    try {
      await checkGitCLI()

      // Get issue number
      const issueNumber = parseInt(options.issue, 10)
      if (isNaN(issueNumber)) {
        throw new Error('Issue number must be a valid number')
      }

      // Fetch issue details
      const issue = await fetchIssueDetails(issueNumber)

      // Generate implementation plan
      const plan = await generateImplementationPlan(issue)

      // Output the plan
      console.log(formatPlanSection(plan))

      // Ask user what they want to do next
      const action = await select({
        message: 'What would you like to do with this implementation plan?',
        choices: [
          { name: 'Update issue description', value: 'update' },
          { name: 'Add as comment to issue', value: 'comment' },
          { name: 'Save to file', value: 'save' },
          { name: 'Nothing (just display)', value: 'none' },
        ],
        default: 'none',
      })

      if (action === 'update') {
        const updatedBody = formatUpdatedIssueBody(issue, plan)
        await updateIssueDescription(issue.number, updatedBody)
      } else if (action === 'comment') {
        const comment = formatPlanComment(plan)
        await addIssueComment(issue.number, comment)
      } else if (action === 'save') {
        await savePlanToFile(issue, plan)
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
