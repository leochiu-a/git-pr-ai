import { CommitInfo } from './commit-summary'
import { PRInfo, ReviewedPRInfo } from './pr-summary'

export interface SummaryData {
  dateRange: string
  prs?: PRInfo[]
  commits?: CommitInfo[]
  reviewedPRs?: ReviewedPRInfo[]
}

/**
 * Format output as plain text
 */
export function formatAsText(
  data: SummaryData,
  showAllCommits = false,
): string {
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

  if (data.reviewedPRs) {
    lines.push(`👀 Reviewed PRs (${data.reviewedPRs.length}):`)
    if (data.reviewedPRs.length === 0) {
      lines.push('  No PR reviews found in this period')
    } else {
      // Group by repository
      const prsByRepo = data.reviewedPRs.reduce(
        (acc, pr) => {
          const repo = pr.repository.nameWithOwner
          if (!acc[repo]) {
            acc[repo] = []
          }
          acc[repo].push(pr)
          return acc
        },
        {} as Record<string, typeof data.reviewedPRs>,
      )

      // Sort repositories and display
      Object.keys(prsByRepo)
        .sort()
        .forEach((repo) => {
          lines.push(`  ${repo} (${prsByRepo[repo].length}):`)
          prsByRepo[repo].forEach((pr) => {
            lines.push(`    • #${pr.number}: ${pr.title}`)
          })
        })
    }
    lines.push('')
  }

  if (data.commits) {
    lines.push(`💾 Commits (${data.commits.length}):`)
    if (data.commits.length === 0) {
      lines.push('  No commits found in this period')
    } else {
      const commitsToShow = showAllCommits
        ? data.commits
        : data.commits.slice(0, 20)

      commitsToShow.forEach((commit) => {
        const type = extractCommitType(commit.message)
        lines.push(
          `  • ${type ? `${type}: ` : ''}${commit.message} (${commit.hash}) - ${commit.author}`,
        )
      })

      if (!showAllCommits && data.commits.length > 20) {
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

  if (data.reviewedPRs) {
    lines.push(`## 👀 Reviewed PRs (${data.reviewedPRs.length})`)
    lines.push('')

    if (data.reviewedPRs.length === 0) {
      lines.push('*No PR reviews found in this period*')
    } else {
      // Group by repository
      const prsByRepo = data.reviewedPRs.reduce(
        (acc, pr) => {
          const repo = pr.repository.nameWithOwner
          if (!acc[repo]) {
            acc[repo] = []
          }
          acc[repo].push(pr)
          return acc
        },
        {} as Record<string, typeof data.reviewedPRs>,
      )

      // Sort repositories and display
      Object.keys(prsByRepo)
        .sort()
        .forEach((repo) => {
          lines.push(`### ${repo} (${prsByRepo[repo].length})`)
          lines.push('')
          prsByRepo[repo].forEach((pr) => {
            lines.push(`- **[#${pr.number}](${pr.url})**: ${pr.title}`)
          })
          lines.push('')
        })
    }
  }

  if (data.commits) {
    lines.push(`## 💾 Commits (${data.commits.length})`)
    lines.push('')

    if (data.commits.length === 0) {
      lines.push('*No commits found in this period*')
    } else {
      data.commits.forEach((commit) => {
        const type = extractCommitType(commit.message)
        const message = type
          ? commit.message.replace(`${type}:`, '').trim()
          : commit.message
        lines.push(
          `- ${type ? `**${type}**:` : '•'} ${message} *(${commit.hash})* - ${commit.author}`,
        )
      })
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
export function generateStats(data: SummaryData, isMarkdown = false): string {
  const lines: string[] = []

  if (data.prs && data.prs.length > 0) {
    const prsByState = data.prs.reduce(
      (acc, pr) => {
        acc[pr.state] = (acc[pr.state] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    if (isMarkdown) {
      lines.push('## 📊 Statistics')
      lines.push('')
      lines.push('### Pull Request Statistics')
      lines.push('')
      Object.entries(prsByState).forEach(([state, count]) => {
        lines.push(`- **${state}**: ${count}`)
      })
    } else {
      lines.push('PR Statistics:')
      Object.entries(prsByState).forEach(([state, count]) => {
        lines.push(`  ${state}: ${count}`)
      })
    }
  }

  if (data.reviewedPRs && data.reviewedPRs.length > 0) {
    const reviewedPRsByRepo = data.reviewedPRs.reduce(
      (acc, pr) => {
        acc[pr.repository.nameWithOwner] =
          (acc[pr.repository.nameWithOwner] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    if (lines.length > 0) lines.push('')

    if (isMarkdown) {
      lines.push('### PR Review Statistics')
      lines.push('')
      Object.entries(reviewedPRsByRepo)
        .sort(([, a], [, b]) => b - a)
        .forEach(([repo, count]) => {
          lines.push(`- **${repo}**: ${count}`)
        })
    } else {
      lines.push('PR Review Statistics:')
      Object.entries(reviewedPRsByRepo)
        .sort(([, a], [, b]) => b - a)
        .forEach(([repo, count]) => {
          lines.push(`  ${repo}: ${count}`)
        })
    }
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

    if (isMarkdown) {
      lines.push('### Commit Statistics')
      lines.push('')
      Object.entries(commitsByType)
        .sort(([, a], [, b]) => b - a)
        .forEach(([type, count]) => {
          lines.push(`- **${type}**: ${count}`)
        })
    } else {
      lines.push('Commit Statistics:')
      Object.entries(commitsByType)
        .sort(([, a], [, b]) => b - a)
        .forEach(([type, count]) => {
          lines.push(`  ${type}: ${count}`)
        })
    }
  }

  return lines.join('\n')
}
