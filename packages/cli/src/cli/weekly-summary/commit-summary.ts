import { $ } from 'zx'
import { toGitLogFormat } from './date-utils'

export interface CommitInfo {
  hash: string
  message: string
  author: string
  date: string
}

/**
 * Get commits within the specified date range
 */
export async function getCommitsInRange(
  since: string,
  until: string,
): Promise<CommitInfo[]> {
  try {
    const sinceTime = toGitLogFormat(since)
    const untilTime = toGitLogFormat(until) + 'T23:59:59'

    // Get current git user
    const userResult = await $`git config user.name`
    const currentUser = userResult.stdout.trim()

    const result =
      await $`git log --since=${sinceTime} --until=${untilTime} --author=${currentUser} --pretty=format:"%H|%s|%an|%ai" --no-merges`

    if (!result.stdout.trim()) {
      return []
    }

    const commits = result.stdout
      .trim()
      .split('\n')
      .map((line) => {
        const [hash, message, author, date] = line.split('|')
        return {
          hash: hash.substring(0, 7), // Short hash
          message: message.trim(),
          author: author.trim(),
          date: date.trim(),
        }
      })

    return commits
  } catch (error) {
    console.error('Error fetching commits:', error)
    return []
  }
}

/**
 * Group commits by type (feat, fix, docs, etc.)
 */
export function groupCommitsByType(
  commits: CommitInfo[],
): Record<string, CommitInfo[]> {
  const groups: Record<string, CommitInfo[]> = {}

  commits.forEach((commit) => {
    const typeMatch = commit.message.match(/^(\w+)(?:\(.+\))?:\s*(.+)/)
    const type = typeMatch ? typeMatch[1] : 'other'

    if (!groups[type]) {
      groups[type] = []
    }

    groups[type].push(commit)
  })

  return groups
}

/**
 * Get commit statistics
 */
export function getCommitStats(commits: CommitInfo[]): {
  total: number
  byAuthor: Record<string, number>
  byType: Record<string, number>
} {
  const byAuthor: Record<string, number> = {}
  const byType: Record<string, number> = {}

  commits.forEach((commit) => {
    // Count by author
    byAuthor[commit.author] = (byAuthor[commit.author] || 0) + 1

    // Count by type
    const typeMatch = commit.message.match(/^(\w+)(?:\(.+\))?:/)
    const type = typeMatch ? typeMatch[1] : 'other'
    byType[type] = (byType[type] || 0) + 1
  })

  return {
    total: commits.length,
    byAuthor,
    byType,
  }
}
