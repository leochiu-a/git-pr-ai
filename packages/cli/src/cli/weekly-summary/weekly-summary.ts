import { Command } from 'commander'
import ora from 'ora'
import {
  getCurrentWeekRange,
  validateDate,
  validateDateRange,
  formatDateRange,
} from './date-utils'
import { getCommitsInRange } from './commit-summary'
import { getPRsInRange, getReviewedPRsInRange } from './pr-summary'
import {
  formatAsText,
  formatAsMarkdown,
  generateStats,
  SummaryData,
} from './formatters'
import { handleOutput } from './output-handler'

interface WeeklySummaryOptions {
  pr?: boolean
  commit?: boolean
  review?: boolean
  since?: string
  until?: string
  md?: string | boolean
  stats?: boolean
}

async function weeklySummary(options: WeeklySummaryOptions) {
  try {
    // Determine what to include
    // For markdown output, always include everything
    const isMarkdownOutput = !!options.md
    const includePRs =
      isMarkdownOutput ||
      options.pr ||
      (!options.pr && !options.commit && !options.review)
    const includeCommits =
      isMarkdownOutput ||
      options.commit ||
      (!options.pr && !options.commit && !options.review)
    const includeReviewedPRs =
      isMarkdownOutput ||
      options.review ||
      (!options.pr && !options.commit && !options.review)

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

      // Fetch reviewed PRs if requested
      if (includeReviewedPRs) {
        spinner.text = 'Fetching PR reviews...'
        summaryData.reviewedPRs = await getReviewedPRsInRange(since, until)
      }

      // Fetch commits if requested
      if (includeCommits) {
        spinner.text = 'Fetching commits...'
        summaryData.commits = await getCommitsInRange(since, until)
      }

      spinner.succeed('Weekly summary generated!')

      // Format output based on markdown option
      const isMarkdown = !!options.md
      const content = isMarkdown
        ? formatAsMarkdown(summaryData)
        : formatAsText(summaryData, isMarkdown)

      // Generate statistics if requested or if markdown output
      const includeStats = options.stats || isMarkdown
      const statsContent = includeStats
        ? generateStats(summaryData, isMarkdown)
        : ''

      // Handle output (console or file)
      handleOutput(content, statsContent, options, { since, until })
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
    .description(
      'Generate a summary of weekly Git activity (PRs, commits, and reviews)',
    )
    .option('--pr', 'include Pull Requests in summary')
    .option('--commit', 'include commits in summary')
    .option('--review', 'include PR reviews in summary')
    .option(
      '--since <date>',
      'start date (YYYY-MM-DD), defaults to Monday of current week',
    )
    .option('--until <date>', 'end date (YYYY-MM-DD), defaults to today')
    .option(
      '--md [filename]',
      'output in Markdown format with full summary (PRs, commits, and stats), optionally specify filename',
    )
    .option('--stats', 'show additional statistics')
    .addHelpText(
      'after',
      `

Examples:
  $ git-weekly-summary                    # Show PRs, commits, and reviews for current week
  $ git-weekly-summary --pr              # Show only PRs for current week
  $ git-weekly-summary --commit          # Show only commits for current week
  $ git-weekly-summary --review          # Show only PR reviews for current week
  $ git-weekly-summary --since 2025-08-10 --until 2025-08-16
  $ git-weekly-summary --md              # Full summary to markdown file (auto-generated filename)
  $ git-weekly-summary --md summary.md   # Full summary to specific markdown file
  $ git-weekly-summary --pr --stats      # PRs only with statistics to console
  $ git-weekly-summary --review --stats  # PR reviews only with statistics to console

Note: --md output always includes full summary (PRs, commits, reviews, and statistics)
Date format: YYYY-MM-DD
Default range: Monday of current week to today
`,
    )
    .action(weeklySummary)

  return program
}

const program = setupCommander()
program.parse()
