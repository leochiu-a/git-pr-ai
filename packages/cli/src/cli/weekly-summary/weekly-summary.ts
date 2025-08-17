import { Command } from 'commander'
import ora from 'ora'
import {
  getCurrentWeekRange,
  validateDate,
  validateDateRange,
  formatDateRange,
} from './date-utils'
import { getCommitsInRange } from './commit-summary'
import { getPRsInRange } from './pr-summary'
import {
  formatAsText,
  formatAsMarkdown,
  generateStats,
  SummaryData,
} from './formatters'

interface WeeklySummaryOptions {
  pr?: boolean
  commit?: boolean
  since?: string
  until?: string
  md?: boolean
  stats?: boolean
}

async function weeklySummary(options: WeeklySummaryOptions) {
  try {
    // Determine what to include
    const includePRs = options.pr || (!options.pr && !options.commit)
    const includeCommits = options.commit || (!options.pr && !options.commit)

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

      // Fetch commits if requested
      if (includeCommits) {
        spinner.text = 'Fetching commits...'
        summaryData.commits = await getCommitsInRange(since, until)
      }

      spinner.succeed('Weekly summary generated!')

      // Format and display output
      const output = options.md
        ? formatAsMarkdown(summaryData)
        : formatAsText(summaryData)

      console.log(output)

      // Show statistics if requested
      if (options.stats) {
        console.log('\n' + generateStats(summaryData))
      }
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
    .description('Generate a summary of weekly Git activity (PRs and commits)')
    .option('--pr', 'include Pull Requests in summary')
    .option('--commit', 'include commits in summary')
    .option(
      '--since <date>',
      'start date (YYYY-MM-DD), defaults to Monday of current week',
    )
    .option('--until <date>', 'end date (YYYY-MM-DD), defaults to today')
    .option('--md', 'output in Markdown format')
    .option('--stats', 'show additional statistics')
    .addHelpText(
      'after',
      `

Examples:
  $ git-weekly-summary                    # Show both PRs and commits for current week
  $ git-weekly-summary --pr              # Show only PRs for current week
  $ git-weekly-summary --commit          # Show only commits for current week
  $ git-weekly-summary --since 2025-08-10 --until 2025-08-16
  $ git-weekly-summary --md              # Output in Markdown format
  $ git-weekly-summary --pr --md --stats # PRs in Markdown with statistics

Date format: YYYY-MM-DD
Default range: Monday of current week to today
`,
    )
    .action(weeklySummary)

  return program
}

const program = setupCommander()
program.parse()
