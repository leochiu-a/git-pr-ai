export type CommitJiraContext = {
  key: string
  summary?: string
  description?: string
  issueType?: string
  priority?: string
  status?: string
  assignee?: string
  labels?: string[]
  browseUrl?: string
  source: 'branch' | 'api'
}

function formatJiraContext(context: CommitJiraContext | null): string {
  if (!context) return ''

  const lines = [
    `JIRA key: ${context.key}`,
    context.summary ? `Summary: ${context.summary}` : null,
    context.description ? `Description: ${context.description}` : null,
    context.issueType ? `Issue type: ${context.issueType}` : null,
    context.labels && context.labels.length > 0
      ? `Labels: ${context.labels.join(', ')}`
      : null,
  ].filter(Boolean)

  return `JIRA context:\n${lines.join('\n')}\n\n`
}

export const createCommitMessagePrompt = (
  gitDiff: string,
  commitType: string,
  userPrompt?: string,
  jiraContext: CommitJiraContext | null = null,
) => {
  const trimmedPrompt = userPrompt?.trim()
  const contextBlocks: string[] = []

  if (jiraContext) {
    contextBlocks.push(formatJiraContext(jiraContext).trimEnd())
  }

  if (trimmedPrompt) {
    contextBlocks.push(`Additional context from user:\n${trimmedPrompt}`)
  }

  const extraContext = contextBlocks.length
    ? `\n${contextBlocks.join('\n\n')}\n`
    : '\n'

  const isAutoCommitType = commitType === 'auto'
  const commitTypeSection = isAutoCommitType
    ? `Commit type selection: AI decides

Choose the most suitable conventional commit type for each option.`
    : `Commit type selected: ${commitType}`

  const commitTypeRequirements = isAutoCommitType
    ? `- Use a valid conventional commit type (feat|fix|docs|style|refactor|perf|test|chore|ci|build)
- Choose the best type based on the actual diff for each option`
    : `- Use the selected commit type (${commitType}) for all options`

  return `Based on the following git diff, generate 3 commit message options:

${gitDiff}

${extraContext}
${commitTypeSection}

Please analyze the changes and provide 3 commit message options with different approaches:
1. Three commit messages following the format: {type}: {description}
   - Option 1: Most concise and direct description
   - Option 2: Alternative wording with more context
   - Option 3: Most detailed description

Requirements:
${commitTypeRequirements}
- Keep the description clear and concise (max 72 characters)
- Use imperative mood (e.g., "add feature" not "adds feature" or "added feature")
- Do not end the subject line with a period
- Provide 3 distinct options with different perspectives
- Focus on WHAT changed and WHY, not HOW

Please respond with exactly this format:
OPTION_1: {first_generated_commit_message}
OPTION_2: {second_generated_commit_message}
OPTION_3: {third_generated_commit_message}

Examples:
OPTION_1: feat: add user authentication module
OPTION_2: feat: implement login and signup functionality
OPTION_3: feat: add JWT-based authentication system for users
`
}
