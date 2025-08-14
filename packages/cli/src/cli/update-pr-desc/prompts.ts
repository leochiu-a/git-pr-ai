import { PRDetails } from '../../providers/types'

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
- Follow the repository's Pull Request/Merge Request template structure if available
- Generate a clear and informative PR description (ALL section headers MUST be in English) including:
  - Description of the changes and their purpose
  - Type of changes (MUST be in English with this exact format):
    - [ ] Bug fix (non-breaking change which fixes an issue)
    - [ ] New feature (non-breaking change which adds functionality)
    - [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
  - Testing instructions (if applicable)
  - Breaking changes or migration notes (if any)
- Use ${providerName} CLI command to update the PR description

${additionalContext ? `\nAdditional context: ${additionalContext}` : ''}

Note: Use the appropriate ${providerName} CLI command to update the description.`

  return basePrompt
}
