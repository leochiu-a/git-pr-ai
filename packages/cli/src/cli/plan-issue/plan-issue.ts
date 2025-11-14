import { Command } from 'commander'
import { select, confirm } from '@inquirer/prompts'
import ora from 'ora'
import { writeFileSync } from 'fs'
import { join } from 'path'

import { executeAIWithJsonOutput } from '../../ai/executor'
import { getJiraTicketDetails } from '../../jira'
import { getCurrentProvider } from '../../providers/factory'
import {
  PlanMode,
  OptimizedContent,
  CommentSolution,
  JiraGeneratedIssue,
} from './types'
import { IssueDetails } from '../../providers/types'
import {
  createOptimizePrompt,
  createCommentPrompt,
  createJiraPrompt,
} from './prompts'
import {
  formatOptimizedContent,
  formatCommentSolution,
  formatOptimizedIssueBody,
  formatCommentIssueComment,
  formatJiraGeneratedIssue,
} from './templates'
import { checkAndUpgrade } from '../../utils/version-checker'

async function fetchIssueDetails(issueNumber: number): Promise<IssueDetails> {
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

async function optimizeIssue(issue: IssueDetails): Promise<OptimizedContent> {
  const spinner = ora('Optimizing issue content...').start()

  try {
    const prompt = createOptimizePrompt(issue)
    const response = await executeAIWithJsonOutput(prompt, {
      commandName: 'planIssue',
    })
    const content = JSON.parse(response)

    spinner.succeed('Issue content optimized')
    return content
  } catch (error) {
    spinner.fail('Failed to optimize issue')
    throw new Error(
      `Could not optimize issue: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

async function generateComment(issue: IssueDetails): Promise<CommentSolution> {
  const spinner = ora('Analyzing issue and generating solution...').start()

  try {
    const prompt = createCommentPrompt(issue)
    const response = await executeAIWithJsonOutput(prompt, {
      commandName: 'planIssue',
    })
    const solution = JSON.parse(response)

    spinner.succeed('Analysis and solution generated')
    return solution
  } catch (error) {
    spinner.fail('Failed to generate analysis')
    throw new Error(
      `Could not generate analysis: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

async function processJiraTicket(
  ticketKey: string,
): Promise<JiraGeneratedIssue> {
  console.log(`JIRA Ticket: ${ticketKey}`)
  const spinner = ora('Fetching JIRA ticket details...').start()

  try {
    const ticketDetails = await getJiraTicketDetails(ticketKey)
    if (!ticketDetails) {
      throw new Error('Could not fetch JIRA ticket details')
    }
    spinner.succeed(`JIRA Title: ${ticketDetails.summary}`)

    const convertSpinner = ora(
      'Converting JIRA ticket to GitHub issue...',
    ).start()
    const prompt = createJiraPrompt(ticketDetails)
    const response = await executeAIWithJsonOutput(prompt, {
      commandName: 'planIssue',
    })
    const issue = JSON.parse(response)

    convertSpinner.succeed('JIRA ticket converted to GitHub issue')
    return issue
  } catch (error) {
    spinner.fail('Failed to process JIRA ticket')
    throw new Error(
      `Could not process JIRA ticket: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

async function updateIssue(
  issueNumber: number,
  title?: string,
  body?: string,
): Promise<void> {
  const provider = await getCurrentProvider()
  await provider.updateIssue(issueNumber, title, body)
}

async function addIssueComment(
  issueNumber: number,
  comment: string,
): Promise<void> {
  const provider = await getCurrentProvider()
  await provider.addIssueComment(issueNumber, comment)
}

async function createNewIssue(
  title: string,
  body: string,
  labels: string[],
): Promise<void> {
  const provider = await getCurrentProvider()
  await provider.createIssue(title, body, labels)
}

async function saveContentToFile(
  issue: IssueDetails,
  content: string,
  mode: PlanMode,
): Promise<void> {
  const spinner = ora('Saving content to file...').start()

  try {
    const modeNames = {
      optimize: 'optimized',
      comment: 'analysis',
      jira: 'jira-conversion',
    }
    const fileName = `issue-${issue.number}-${modeNames[mode]}.md`
    const filePath = join(process.cwd(), fileName)

    writeFileSync(filePath, content, 'utf8')
    spinner.succeed(`Content saved to ${fileName}`)
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
    .option('-i, --issue <number>', 'GitHub issue number to plan')
    .option('-j, --jira <key>', 'JIRA ticket key to convert to GitHub issue')
    .addHelpText(
      'after',
      `
Examples:
  $ git plan-issue -i 42
    Enhance issue #42 with AI-powered assistance
  
  $ git plan-issue -j ABC-123
    Convert JIRA ticket ABC-123 to Git platform issue

Modes:
  1. Optimize - Improve existing issue for clarity and actionability
  2. Comment - Provide analysis and solution recommendations  
  3. JIRA - Convert JIRA ticket to Git platform issue format

Features:
  - Two focused AI-powered enhancement modes
  - Smart content optimization
  - Interactive replacement confirmation
  - Save enhanced content to files

Prerequisites:
  - GitHub CLI (gh) must be installed and authenticated
  - AI agent must be configured (run 'git pr-ai config' first)
    `,
    )

  return program
}

async function main() {
  const program = setupCommander()

  program.action(async (options: { issue?: string; jira?: string }) => {
    try {
      // Check for version updates
      await checkAndUpgrade()

      const provider = await getCurrentProvider()
      await provider.checkCLI()

      // Validate input - must have either issue or jira
      if (!options.issue && !options.jira) {
        throw new Error('Must provide either --issue <number> or --jira <key>')
      }
      if (options.issue && options.jira) {
        throw new Error(
          'Cannot use both --issue and --jira options. Choose one.',
        )
      }

      if (options.jira) {
        // JIRA mode
        const jiraResult = await processJiraTicket(options.jira)
        const displayContent = formatJiraGeneratedIssue(jiraResult)

        // Display the result
        console.log(displayContent)

        // Ask what to do with the result
        const action = await select({
          message: 'What would you like to do with this JIRA conversion?',
          choices: [
            { name: 'Create new issue (GitHub/GitLab)', value: 'create' },
            { name: 'Save to file', value: 'save' },
            { name: 'Nothing (just display)', value: 'none' },
          ],
          default: 'none',
        })

        if (action === 'create') {
          await createNewIssue(
            jiraResult.title,
            jiraResult.body,
            jiraResult.labels,
          )
        } else if (action === 'save') {
          const fileName = `jira-${options.jira}-conversion.md`
          const filePath = join(process.cwd(), fileName)
          writeFileSync(filePath, displayContent, 'utf8')
          console.log(`Content saved to ${fileName}`)
        }
      } else if (options.issue) {
        // GitHub issue mode
        const issueNumber = parseInt(options.issue, 10)
        if (isNaN(issueNumber)) {
          throw new Error('Issue number must be a valid number')
        }

        // Fetch issue details
        const issue = await fetchIssueDetails(issueNumber)

        // Ask user to choose mode
        const mode = await select({
          message: 'How would you like to enhance this issue?',
          choices: [
            {
              name: 'Optimize - Improve existing content for clarity',
              value: 'optimize' as PlanMode,
            },
            {
              name: 'Comment - Add analysis and solution recommendations',
              value: 'comment' as PlanMode,
            },
          ],
        })

        let result: OptimizedContent | CommentSolution
        let displayContent: string
        let updateTitle: string | undefined
        let updateBody: string | undefined

        // Process based on selected mode
        switch (mode) {
          case 'optimize': {
            const optimizedResult = await optimizeIssue(issue)
            result = optimizedResult
            displayContent = formatOptimizedContent(optimizedResult)
            updateTitle = optimizedResult.improvedTitle
            updateBody = formatOptimizedIssueBody(optimizedResult)
            break
          }
          case 'comment': {
            const commentResult = await generateComment(issue)
            result = commentResult
            displayContent = formatCommentSolution(commentResult)
            break
          }
          default:
            throw new Error('Invalid mode selected')
        }

        // Display the result
        console.log(displayContent)

        // Ask what to do with the result
        const actions: Array<{ name: string; value: string }> = [
          { name: 'Save to file', value: 'save' },
          { name: 'Nothing (just display)', value: 'none' },
        ]

        if (mode !== 'comment') {
          actions.unshift({ name: 'Replace issue content', value: 'replace' })
        } else {
          actions.unshift({ name: 'Add as comment', value: 'comment' })
        }

        const action = await select({
          message: 'What would you like to do with this content?',
          choices: actions,
          default: 'none',
        })

        if (action === 'replace' && (updateTitle || updateBody)) {
          const shouldReplace = await confirm({
            message: `Replace the issue content? This will ${updateTitle ? 'update the title and ' : ''}overwrite the existing description.`,
            default: false,
          })

          if (shouldReplace) {
            await updateIssue(issue.number, updateTitle, updateBody)
          }
        } else if (action === 'comment' && mode === 'comment') {
          const comment = formatCommentIssueComment(result as CommentSolution)
          await addIssueComment(issue.number, comment)
        } else if (action === 'save') {
          await saveContentToFile(issue, displayContent, mode)
        }
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
