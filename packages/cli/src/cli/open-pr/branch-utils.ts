/**
 * Convert a commitlint-formatted branch name to a proper PR title
 *
 * Examples:
 * - fix/update-validation-logic -> fix: update validation logic
 * - docs/api-documentation -> docs: api documentation
 */
export function convertBranchNameToPRTitle(branchName: string): string {
  // Check if branch follows commitlint format (type/description or type/ticket-description)
  const commitlintMatch = branchName.match(
    /^(feat|fix|docs|style|refactor|perf|test|chore|ci|build)\/(.+)$/,
  )

  if (commitlintMatch) {
    const [, type, description] = commitlintMatch

    // Remove JIRA ticket from description if present (e.g., PROJ-123-add-user-auth -> add-user-auth)
    const cleanDescription = description.replace(/^[A-Z]+-\d+-/, '')

    // Convert kebab-case to readable text
    const readableDescription = cleanDescription
      .split('-')
      .join(' ')
      .toLowerCase()

    return `${type}: ${readableDescription}`
  }

  // Fallback to original branch name if not commitlint format
  return branchName
}
