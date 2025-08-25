import { Command } from 'commander'
import ora from 'ora'
import {
  getCurrentWeekRange,
  validateDate,
  validateDateRange,
  formatDateRange,
} from './date-utils'
import { getPRsInRange, getReviewedPRsInRange } from './pr-summary'
import { formatAsText, formatAsMarkdown, SummaryData } from './formatters'
import { handleOutput } from './output-handler'

interface WeeklySummaryOptions {
  since?: string
  until?: string
  md?: string | boolean
}

async function weeklySummary(options: WeeklySummaryOptions) {
  try {
    // Always include PRs and reviews
    const includePRs = true
    const includeReviewedPRs = true

    // Determine date range
    let since: string
    let until: string

    if (options.since || options.until) {
      const defaultRange = getCurrentWeekRange()
      since = options.since ? validateDate(options.since) : defaultRange.since
      until = options.until ? validateDate(options.until) : defaultRange.until
    } else {
      const range = getCurrentWeekRange()
      since = range.since
      until = range.until
    }

    validateDateRange(since, until)

    const spinner = ora('Fetching weekly summary...').start()

    try {
      const summaryData: SummaryData = {
        dateRange: formatDateRange(since, until),
      }

      // Fetch PRs if requested
      if (includePRs) {
        spinner.text = 'Fetching Pull Requests...'
        summaryData.prs = await getPRsInRange(since, until)
      }

      // Fetch reviewed PRs
      if (includeReviewedPRs) {
        spinner.text = 'Fetching PR reviews...'
        summaryData.reviewedPRs = await getReviewedPRsInRange(since, until)
      }

      spinner.succeed('Weekly summary generated!')

      // Format output based on markdown option
      const isMarkdown = !!options.md
      const content = isMarkdown
        ? formatAsMarkdown(summaryData)
        : formatAsText(summaryData, isMarkdown)

      // Handle output (console or file)
      handleOutput(content, options, { since, until })
    } catch (error) {
      spinner.fail('Failed to generate weekly summary')
      console.error(
        'Error:',
        error instanceof Error ? error.message : String(error),
      )
      process.exit(1)
    }
  } catch (error) {
    console.error(
      'Error:',
      error instanceof Error ? error.message : String(error),
    )
    process.exit(1)
  }
}

function setupCommander() {
  const program = new Command()

  program
    .name('git-weekly-summary')
    .description('Generate a summary of weekly Git activity (PRs and reviews)')
    .option(
      '--since <date>',
      'start date (YYYY-MM-DD), defaults to Monday of current week',
    )
    .option('--until <date>', 'end date (YYYY-MM-DD), defaults to today')
    .option(
      '--md [filename]',
      'output in Markdown format with full summary (PRs, commits, and stats), optionally specify filename',
    )
    .addHelpText(
      'after',
      `

Examples:
  $ git-weekly-summary                    # Show PRs and reviews with statistics for current week
  $ git-weekly-summary --since 2025-08-10 --until 2025-08-16
  $ git-weekly-summary --md              # Full summary to markdown file (auto-generated filename)
  $ git-weekly-summary --md summary.md   # Full summary to specific markdown file
Date format: YYYY-MM-DD
Default range: Monday of current week to today
`,
    )
    .action(weeklySummary)

  return program
}

const program = setupCommander()
program.parse()
