import { PRInfo, ReviewedPRInfo } from './pr-summary'

export interface SummaryData {
  dateRange: string
  prs?: PRInfo[]
  reviewedPRs?: ReviewedPRInfo[]
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
      // Group by repository if repository info exists
      if (data.prs.some((pr) => pr.repository)) {
        const prsByRepo = data.prs.reduce(
          (acc, pr) => {
            const repo = pr.repository?.nameWithOwner || 'Unknown Repository'
            if (!acc[repo]) {
              acc[repo] = []
            }
            acc[repo].push(pr)
            return acc
          },
          {} as Record<string, typeof data.prs>,
        )

        Object.keys(prsByRepo)
          .sort()
          .forEach((repo) => {
            lines.push(`  ${repo} (${prsByRepo[repo].length}):`)
            prsByRepo[repo].forEach((pr) => {
              const stateIcon = getStateIcon(pr.state)
              lines.push(
                `    ${stateIcon} #${pr.number}: ${pr.title} (${pr.state})`,
              )
            })
          })
      } else {
        data.prs.forEach((pr) => {
          const stateIcon = getStateIcon(pr.state)
          lines.push(
            `  ${stateIcon} #${pr.number}: ${pr.title} (${pr.state}) - ${pr.author}`,
          )
        })
      }
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
      // Group by repository if repository info exists
      if (data.prs.some((pr) => pr.repository)) {
        const prsByRepo = data.prs.reduce(
          (acc, pr) => {
            const repo = pr.repository?.nameWithOwner || 'Unknown Repository'
            if (!acc[repo]) {
              acc[repo] = []
            }
            acc[repo].push(pr)
            return acc
          },
          {} as Record<string, typeof data.prs>,
        )

        Object.keys(prsByRepo)
          .sort()
          .forEach((repo) => {
            lines.push(`### ${repo} (${prsByRepo[repo].length})`)
            lines.push('')
            prsByRepo[repo].forEach((pr) => {
              const stateIcon = getStateIcon(pr.state)
              lines.push(
                `- ${stateIcon} **[#${pr.number}](${pr.url})**: ${pr.title} *(${pr.state})*`,
              )
            })
            lines.push('')
          })
      } else {
        data.prs.forEach((pr) => {
          const stateIcon = getStateIcon(pr.state)
          lines.push(
            `- ${stateIcon} **#${pr.number}**: ${pr.title} *(${pr.state})* - ${pr.author}`,
          )
        })
        lines.push('')
      }
    }
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

  return lines.join('\n')
}
