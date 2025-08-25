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
