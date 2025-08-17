import { CommitInfo } from './commit-summary'
import { PRInfo } from './pr-summary'

export interface SummaryData {
  dateRange: string
  prs?: PRInfo[]
  commits?: CommitInfo[]
}

/**
 * Format output as plain text
 */
export function formatAsText(data: SummaryData): string {
  const lines: string[] = []

  lines.push(`=== Weekly Summary (${data.dateRange}) ===`)
  lines.push('')

  if (data.prs) {
    lines.push(`📝 Pull Requests (${data.prs.length}):`)
    if (data.prs.length === 0) {
      lines.push('  No PRs found in this period')
    } else {
      data.prs.forEach((pr) => {
        const stateIcon = getStateIcon(pr.state)
        lines.push(
          `  ${stateIcon} #${pr.number}: ${pr.title} (${pr.state}) - ${pr.author}`,
        )
      })
    }
    lines.push('')
  }

  if (data.commits) {
    lines.push(`💾 Commits (${data.commits.length}):`)
    if (data.commits.length === 0) {
      lines.push('  No commits found in this period')
    } else {
      data.commits.slice(0, 20).forEach((commit) => {
        // Show first 20 commits
        const type = extractCommitType(commit.message)
        lines.push(
          `  • ${type ? `${type}: ` : ''}${commit.message} (${commit.hash}) - ${commit.author}`,
        )
      })

      if (data.commits.length > 20) {
        lines.push(`  ... and ${data.commits.length - 20} more commits`)
      }
    }
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Format output as markdown
 */
export function formatAsMarkdown(data: SummaryData): string {
  const lines: string[] = []

  lines.push(`# Weekly Summary (${data.dateRange})`)
  lines.push('')

  if (data.prs) {
    lines.push(`## 📝 Pull Requests (${data.prs.length})`)
    lines.push('')

    if (data.prs.length === 0) {
      lines.push('*No PRs found in this period*')
    } else {
      data.prs.forEach((pr) => {
        const stateIcon = getStateIcon(pr.state)
        lines.push(
          `- ${stateIcon} **#${pr.number}**: ${pr.title} *(${pr.state})* - ${pr.author}`,
        )
      })
    }
    lines.push('')
  }

  if (data.commits) {
    lines.push(`## 💾 Commits (${data.commits.length})`)
    lines.push('')

    if (data.commits.length === 0) {
      lines.push('*No commits found in this period*')
    } else {
      data.commits.slice(0, 20).forEach((commit) => {
        // Show first 20 commits
        const type = extractCommitType(commit.message)
        const message = type
          ? commit.message.replace(`${type}:`, '').trim()
          : commit.message
        lines.push(
          `- ${type ? `**${type}**:` : '•'} ${message} *(${commit.hash})* - ${commit.author}`,
        )
      })

      if (data.commits.length > 20) {
        lines.push('')
        lines.push(`*... and ${data.commits.length - 20} more commits*`)
      }
    }
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Get icon for PR state
 */
function getStateIcon(state: string): string {
  switch (state) {
    case 'open':
      return '🟢'
    case 'merged':
      return '🟣'
    case 'closed':
      return '🔴'
    default:
      return '•'
  }
}

/**
 * Extract commit type from message (feat, fix, docs, etc.)
 */
function extractCommitType(message: string): string | null {
  const match = message.match(/^(\w+)(?:\(.+\))?:/)
  return match ? match[1] : null
}

/**
 * Generate summary statistics
 */
export function generateStats(data: SummaryData): string {
  const lines: string[] = []

  if (data.prs && data.prs.length > 0) {
    const prsByState = data.prs.reduce(
      (acc, pr) => {
        acc[pr.state] = (acc[pr.state] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    lines.push('PR Statistics:')
    Object.entries(prsByState).forEach(([state, count]) => {
      lines.push(`  ${state}: ${count}`)
    })
  }

  if (data.commits && data.commits.length > 0) {
    const commitsByType = data.commits.reduce(
      (acc, commit) => {
        const type = extractCommitType(commit.message) || 'other'
        acc[type] = (acc[type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    if (lines.length > 0) lines.push('')
    lines.push('Commit Statistics:')
    Object.entries(commitsByType)
      .sort(([, a], [, b]) => b - a)
      .forEach(([type, count]) => {
        lines.push(`  ${type}: ${count}`)
      })
  }

  return lines.join('\n')
}
