import { Command } from 'commander'
import { checkGitCLI } from '../git-helpers'
import { getCurrentProvider } from '../providers/factory'

interface PeriodStats {
  totalPRs: number
  authorStats: Record<string, number>
  statusStats: {
    open: number
    closed: number
    merged: number
  }
}

type PeriodType = 'weekly' | 'monthly'

function getWeekRange(weeksAgo: number): { start: string; end: string } {
  const now = new Date()
  const currentDay = now.getDay()
  const daysToMonday = currentDay === 0 ? 6 : currentDay - 1

  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - daysToMonday - (weeksAgo * 7))
  weekStart.setHours(0, 0, 0, 0)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  return {
    start: weekStart.toISOString().split('T')[0],
    end: weekEnd.toISOString().split('T')[0]
  }
}

function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date()
  
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  monthStart.setHours(0, 0, 0, 0)
  
  const monthEnd = new Date(now)
  monthEnd.setHours(23, 59, 59, 999)

  return {
    start: monthStart.toISOString().split('T')[0],
    end: monthEnd.toISOString().split('T')[0]
  }
}

function formatPeriodRange(start: string, end: string, type: PeriodType): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  
  if (type === 'monthly') {
    return startDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric'
    })
  }
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: startDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
  }
  
  return `${formatDate(startDate)} - ${formatDate(endDate)}`
}

async function getPRStats(type: PeriodType): Promise<PeriodStats> {
  const provider = await getCurrentProvider()
  
  const { start, end } = type === 'weekly' ? getWeekRange(1) : getCurrentMonthRange()
  const prs = await provider.searchPRsByDateRange(start, end)
  
  const authorStats: Record<string, number> = {}
  const statusStats = { open: 0, closed: 0, merged: 0 }

  prs.forEach(pr => {
    authorStats[pr.author] = (authorStats[pr.author] || 0) + 1
    
    if (pr.state === 'merged') {
      statusStats.merged++
    } else if (pr.state === 'closed') {
      statusStats.closed++
    } else {
      statusStats.open++
    }
  })

  return {
    totalPRs: prs.length,
    authorStats,
    statusStats
  }
}

function displayStats(stats: PeriodStats, type: PeriodType) {
  const periodEmoji = type === 'weekly' ? '📅' : '🗓️'
  const { start, end } = type === 'weekly' ? getWeekRange(1) : getCurrentMonthRange()
  const periodRange = formatPeriodRange(start, end, type)
  
  console.log(`\n📊 ${type === 'weekly' ? 'Weekly' : 'Monthly'} PR Statistics\n`)
  
  console.log(`${periodEmoji} ${type === 'weekly' ? 'Last Week' : 'This Month'}: ${periodRange}`)
  console.log(`   Total PRs: ${stats.totalPRs}`)
  
  if (stats.totalPRs > 0) {
    console.log(`   Status: Open: ${stats.statusStats.open}, Closed: ${stats.statusStats.closed}, Merged: ${stats.statusStats.merged}`)
    
    if (Object.keys(stats.authorStats).length > 0) {
      console.log(`   Authors:`)
      Object.entries(stats.authorStats)
        .sort(([,a], [,b]) => b - a)
        .forEach(([author, count]) => {
          console.log(`     ${author}: ${count}`)
        })
    }
  }
  console.log()
}

function setupCommander() {
  const program = new Command()

  program
    .name('git-pr-stats')
    .description('Get PR statistics for the current repository')
    .option('--weekly', 'Show weekly statistics (last week)')
    .option('--monthly', 'Show monthly statistics (this month)')
    .addHelpText(
      'after',
      `
Examples:
  $ git pr-stats --weekly
    Show PR statistics for last week

  $ git pr-stats --monthly
    Show PR statistics for this month

Features:
  - Shows total PR count per period
  - Breaks down by author and status (open/closed/merged)
  - Weekly periods: Monday to Sunday
  - Monthly periods: Full calendar months

Prerequisites:
  - Git provider CLI (gh for GitHub, glab for GitLab) must be installed and authenticated
    `,
    )

  return program
}

async function main() {
  const program = setupCommander()

  program.action(async (options: { weekly?: boolean; monthly?: boolean }) => {
    try {
      await checkGitCLI()
      
      // Check if both options are provided
      if (options.weekly && options.monthly) {
        console.error('❌ Please specify either --weekly or --monthly, not both')
        process.exit(1)
      }
      
      // Default to weekly if no option is specified
      if (!options.weekly && !options.monthly) {
        options.weekly = true
      }
      
      const type: PeriodType = options.weekly ? 'weekly' : 'monthly'
      const periodLabel = type === 'weekly' ? 'last week' : 'this month'
      
      console.log(`🔍 Analyzing PR activity for ${periodLabel}...`)
      
      const stats = await getPRStats(type)
      displayStats(stats, type)
      
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