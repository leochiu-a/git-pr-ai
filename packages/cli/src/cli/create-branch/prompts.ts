export const createJiraBranchPrompt = (
  jiraTicket: string,
  jiraTitle: string | null,
) => `Based on the following JIRA ticket information, generate 3 git branch name options:

JIRA Ticket: ${jiraTicket}
JIRA Title: ${jiraTitle || 'Not available'}

Please analyze the ticket and provide 3 branch name options with different approaches:
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
2. Three descriptive branch names following the format: {prefix}/{ticket-id}-{description}
   - Option 1: Most conservative/straightforward interpretation
   - Option 2: Alternative approach with different wording
   - Option 3: Most detailed/comprehensive approach

Requirements:
- Use kebab-case for the description
- Keep the description concise but meaningful (max 30 characters)
- Use only lowercase letters, numbers, and hyphens for the description part
- IMPORTANT: Keep the ticket-id exactly as provided (do not convert to lowercase)
- Choose the branch type based on the ticket content
- Prefer 'feat' over 'feature' and 'fix' over 'bugfix' to align with commitlint
- Provide 3 distinct options with different perspectives

Please respond with exactly this format:
OPTION_1: {first_generated_branch_name}
OPTION_2: {second_generated_branch_name}
OPTION_3: {third_generated_branch_name}

Example:
OPTION_1: feat/PROJ-123-add-user-auth
OPTION_2: feat/PROJ-123-implement-authentication
OPTION_3: feat/PROJ-123-user-authentication-system`

export const createCustomBranchPrompt = (
  customPrompt: string,
) => `Based on the following prompt, generate 3 git branch name options:

${customPrompt}

Please analyze the request and provide 3 branch name options with different approaches:
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
2. Three descriptive branch names following the format: {prefix}/{description}
   - Option 1: Most conservative/straightforward interpretation
   - Option 2: Alternative approach with different wording
   - Option 3: Most detailed/comprehensive approach

Requirements:
- Use kebab-case for the description
- Keep the description concise but meaningful (max 40 characters)
- Use only lowercase letters, numbers, and hyphens
- Choose the branch type based on the prompt content
- Generate descriptions that capture the essence of the request
- Provide 3 distinct options with different perspectives

Please respond with exactly this format:
OPTION_1: {first_generated_branch_name}
OPTION_2: {second_generated_branch_name}
OPTION_3: {third_generated_branch_name}

Example:
OPTION_1: feat/add-user-authentication
OPTION_2: feat/implement-user-auth-system
OPTION_3: feat/user-authentication-module`

export const createDiffBranchPrompt = (
  gitDiff: string,
) => `Based on the following git diff, generate 3 git branch name options:

${gitDiff}

Please analyze the changes and provide 3 branch name options with different approaches:
1. First, check for any JIRA ticket IDs in the diff content (format: PROJECT-123, KB2CW-456, etc.)
2. An appropriate branch type prefix following commitlint conventional types:
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
3. Three descriptive branch names following the format:
   - If JIRA ticket found: {prefix}/{ticket-id}-{description}
   - If no JIRA ticket: {prefix}/{description}
   - Option 1: Most conservative/straightforward interpretation
   - Option 2: Alternative approach with different wording
   - Option 3: Most detailed/comprehensive approach

Requirements:
- Look for JIRA ticket IDs in commit messages, comments, or file paths
- If found, include the EXACT ticket ID in the branch name (preserve case)
- Use kebab-case for the description
- Keep the description concise but meaningful (max 30 characters if ticket included, 40 if not)
- Use only lowercase letters, numbers, and hyphens for the description part
- Choose the branch type based on the changes shown in the diff
- Generate descriptions that capture the essence of the changes
- Provide 3 distinct options with different perspectives

Please respond with exactly this format:
OPTION_1: {first_generated_branch_name}
OPTION_2: {second_generated_branch_name}
OPTION_3: {third_generated_branch_name}

Examples:
OPTION_1: feat/KB2CW-123-add-user-auth
OPTION_2: feat/KB2CW-123-implement-authentication
OPTION_3: feat/KB2CW-123-user-authentication-system
Or without JIRA:
OPTION_1: fix/update-validation-logic
OPTION_2: fix/improve-form-validation
OPTION_3: fix/validation-error-handling`
