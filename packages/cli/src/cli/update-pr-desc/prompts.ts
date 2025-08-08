import { PRDetails } from '../../providers/types.js'

interface BuildUpdateDescriptionPromptArgs {
  prData: PRDetails
  additionalContext?: string
  providerName: string
}

export function buildUpdateDescriptionPrompt({
  prData,
  additionalContext,
  providerName,
}: BuildUpdateDescriptionPromptArgs): string {
  const basePrompt = `Update this Pull Request description:

## PR Information
- Repository: ${prData.owner}/${prData.repo}
- PR #${prData.number}: ${prData.title}
- Target branch: ${prData.baseBranch}
- Source branch: ${prData.headBranch}

Please follow these steps:
- Analyze the code changes to understand the purpose of this PR
- Generate a clear and informative PR description including:
  - Summary of changes and their purpose
  - Type of changes (bug fix, feature, breaking change, etc.)
  - Testing instructions (if applicable)
  - Breaking changes or migration notes (if any)
- Use ${providerName} CLI command to update the PR description

${additionalContext ? `\nAdditional context: ${additionalContext}` : ''}

Note: Use the appropriate ${providerName} CLI command to update the description.`

  return basePrompt
}
