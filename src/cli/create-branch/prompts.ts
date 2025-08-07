export const createJiraBranchPrompt = (
  jiraTicket: string,
  jiraTitle: string | null,
) => `Based on the following JIRA ticket information, generate a git branch name:

JIRA Ticket: ${jiraTicket}
JIRA Title: ${jiraTitle || 'Not available'}

Please analyze the ticket and provide:
1. An appropriate branch type prefix following commitlint conventional types:
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
2. A descriptive branch name following the format: {prefix}/{ticket-id}-{description}

Requirements:
- Use kebab-case for the description
- Keep the description concise but meaningful (max 30 characters)
- Use only lowercase letters, numbers, and hyphens
- Choose the branch type based on the ticket content
- Prefer 'feat' over 'feature' and 'fix' over 'bugfix' to align with commitlint

Please respond with exactly this format:
BRANCH_NAME: {your_generated_branch_name}

Example:
BRANCH_NAME: feat/PROJ-123-add-user-auth`

export const createCustomBranchPrompt = (
  customPrompt: string,
) => `Based on the following prompt, generate a git branch name:

${customPrompt}

Please analyze the request and provide:
1. An appropriate branch type prefix following commitlint conventional types:
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
2. A descriptive branch name following the format: {prefix}/{description}

Requirements:
- Use kebab-case for the description
- Keep the description concise but meaningful (max 40 characters)
- Use only lowercase letters, numbers, and hyphens
- Choose the branch type based on the prompt content
- Generate a description that captures the essence of the request

Please respond with exactly this format:
BRANCH_NAME: {your_generated_branch_name}

Example:
BRANCH_NAME: feat/add-user-authentication`

export const createDiffBranchPrompt = (
  gitDiff: string,
) => `Based on the following git diff, generate a git branch name:

${gitDiff}

Please analyze the changes and provide:
1. An appropriate branch type prefix following commitlint conventional types:
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
2. A descriptive branch name following the format: {prefix}/{description}

Requirements:
- Use kebab-case for the description
- Keep the description concise but meaningful (max 40 characters)
- Use only lowercase letters, numbers, and hyphens
- Choose the branch type based on the changes shown in the diff
- Generate a description that captures the essence of the changes

Please respond with exactly this format:
BRANCH_NAME: {your_generated_branch_name}

Example:
BRANCH_NAME: feat/add-user-authentication`
