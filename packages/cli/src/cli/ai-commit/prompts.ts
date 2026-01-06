type JiraContext = {
  ticketKey: string
  title?: string | null
}

export const createCommitMessagePrompt = (
  gitDiff: string,
  userPrompt?: string,
  jira?: JiraContext,
) => {
  const trimmedPrompt = userPrompt?.trim()
  const contextBlocks: string[] = []

  if (jira) {
    contextBlocks.push(
      `JIRA Ticket: ${jira.ticketKey}\nJIRA Title: ${jira.title || 'Not available'}`,
    )
  }

  if (trimmedPrompt) {
    contextBlocks.push(`Additional context from user:\n${trimmedPrompt}`)
  }

  const extraContext = contextBlocks.length
    ? `\n${contextBlocks.join('\n\n')}\n`
    : '\n'

  return `Based on the following git diff, generate 3 commit message options:

${gitDiff}

${extraContext}
Please analyze the changes and provide 3 commit message options with different approaches:
1. An appropriate commit type prefix following commitlint conventional types:
   - feat: new features
   - fix: bug fixes
   - docs: documentation changes
   - style: formatting changes
   - refactor: code refactoring
   - perf: performance improvements
   - test: adding/updating tests
   - chore: maintenance tasks
   - ci: CI/CD changes
   - build: build system changes
2. Three commit messages following the format: {type}: {description}
   - Option 1: Most concise and direct description
   - Option 2: Alternative wording with more context
   - Option 3: Most detailed description

Requirements:
- Choose the commit type based on the changes shown in the diff
- If a JIRA Ticket is provided, use this exact format for every option:
  {type}: [TICKET-123] {JIRA_TITLE}
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
