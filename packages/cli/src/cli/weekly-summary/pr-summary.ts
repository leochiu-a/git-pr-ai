import { $ } from 'zx'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween.js'
import { PR } from '../../providers/types'

dayjs.extend(isBetween)

export interface PRInfo extends PR {
  createdAt: string
  updatedAt: string
  repository?: {
    name: string
    nameWithOwner: string
  }
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

    // Use GitHub CLI to search for PRs across all repositories by current user
    const result =
      await $`gh search prs --author=${currentUser} --json number,title,url,state,author,createdAt,updatedAt,repository --limit 200`
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
        repository: {
          name: string
          nameWithOwner: string
        }
      }
      return {
        number: pr.number.toString(),
        title: pr.title,
        url: pr.url,
        state: pr.state.toLowerCase() as 'open' | 'closed' | 'merged',
        author: pr.author.login,
        createdAt: pr.createdAt,
        updatedAt: pr.updatedAt,
        repository: pr.repository,
      }
    })
  } catch (error) {
    console.error('Error fetching PRs:', error)
    return []
  }
}

export interface ReviewedPRInfo {
  number: string
  title: string
  url: string
  repository: {
    name: string
    nameWithOwner: string
  }
  reviewedAt: string
}

/**
 * Get PRs reviewed by the current user within the specified date range
 */
export async function getReviewedPRsInRange(
  since: string,
  until: string,
): Promise<ReviewedPRInfo[]> {
  try {
    // Get current user's GitHub username
    const currentUserResult = await $`gh api user --jq .login`
    const currentUser = currentUserResult.stdout.trim()

    // Use GitHub CLI to search for PRs reviewed by the current user
    const result =
      await $`gh search prs --reviewed-by=${currentUser} --json number,title,url,repository,updatedAt --limit 200`
    const allPRs = JSON.parse(result.stdout) as unknown[]

    const sinceDate = dayjs(since)
    const untilDate = dayjs(until).endOf('day')

    // Filter PRs by date range (using updatedAt as a proxy for review activity)
    const filteredPRs = allPRs.filter((prData: unknown) => {
      const pr = prData as {
        updatedAt: string
      }
      const updatedAt = dayjs(pr.updatedAt)

      // Include PR if it was updated in the date range (indication of review activity)
      return updatedAt.isBetween(sinceDate, untilDate, null, '[]')
    })

    return filteredPRs.map((prData: unknown) => {
      const pr = prData as {
        number: number
        title: string
        url: string
        repository: {
          name: string
          nameWithOwner: string
        }
        updatedAt: string
      }
      return {
        number: pr.number.toString(),
        title: pr.title,
        url: pr.url,
        repository: pr.repository,
        reviewedAt: pr.updatedAt,
      }
    })
  } catch (error) {
    console.error('Error fetching reviewed PRs:', error)
    return []
  }
}
