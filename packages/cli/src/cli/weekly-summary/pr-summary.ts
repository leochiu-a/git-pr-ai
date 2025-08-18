import { $ } from 'zx'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween.js'
import { PR } from '../../providers/types'

dayjs.extend(isBetween)

export interface PRInfo extends PR {
  createdAt: string
  updatedAt: string
}

/**
 * Get PRs within the specified date range
 */
export async function getPRsInRange(
  since: string,
  until: string,
): Promise<PRInfo[]> {
  try {
    // Get current user's GitHub username
    const currentUserResult = await $`gh api user --jq .login`
    const currentUser = currentUserResult.stdout.trim()

    // Use GitHub CLI to get PRs with date information, filtered by current user
    const result =
      await $`gh pr list --state all --author ${currentUser} --json number,title,url,state,author,createdAt,updatedAt --limit 100`
    const allPRs = JSON.parse(result.stdout) as unknown[]

    const sinceDate = dayjs(since)
    const untilDate = dayjs(until).endOf('day')

    // Filter PRs by date range (using createdAt or updatedAt)
    const filteredPRs = allPRs.filter((prData: unknown) => {
      const pr = prData as {
        createdAt: string
        updatedAt: string
      }
      const createdAt = dayjs(pr.createdAt)
      const updatedAt = dayjs(pr.updatedAt)

      // Include PR if it was created or updated in the date range
      return (
        createdAt.isBetween(sinceDate, untilDate, null, '[]') ||
        updatedAt.isBetween(sinceDate, untilDate, null, '[]')
      )
    })

    return filteredPRs.map((prData: unknown) => {
      const pr = prData as {
        number: number
        title: string
        url: string
        state: string
        author: { login: string }
        createdAt: string
        updatedAt: string
      }
      return {
        number: pr.number.toString(),
        title: pr.title,
        url: pr.url,
        state: pr.state.toLowerCase() as 'open' | 'closed' | 'merged',
        author: pr.author.login,
        createdAt: pr.createdAt,
        updatedAt: pr.updatedAt,
      }
    })
  } catch (error) {
    console.error('Error fetching PRs:', error)
    return []
  }
}

/**
 * Group PRs by state
 */
export function groupPRsByState(prs: PRInfo[]): Record<string, PRInfo[]> {
  const groups: Record<string, PRInfo[]> = {
    open: [],
    merged: [],
    closed: [],
  }

  prs.forEach((pr) => {
    if (groups[pr.state]) {
      groups[pr.state].push(pr)
    }
  })

  return groups
}

/**
 * Get PR statistics
 */
export function getPRStats(prs: PRInfo[]): {
  total: number
  byState: Record<string, number>
  byAuthor: Record<string, number>
} {
  const byState: Record<string, number> = {}
  const byAuthor: Record<string, number> = {}

  prs.forEach((pr) => {
    // Count by state
    byState[pr.state] = (byState[pr.state] || 0) + 1

    // Count by author
    byAuthor[pr.author] = (byAuthor[pr.author] || 0) + 1
  })

  return {
    total: prs.length,
    byState,
    byAuthor,
  }
}

/**
 * Sort PRs by update date (newest first)
 */
export function sortPRsByDate(prs: PRInfo[]): PRInfo[] {
  return prs.sort((a, b) => {
    return dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf()
  })
}
