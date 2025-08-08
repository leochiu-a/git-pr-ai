import { PRDetails, TemplateInfo } from '../../providers/types.js'

interface BuildUpdateDescriptionPromptArgs {
  prData: PRDetails & { diff: string }
  template?: TemplateInfo
  additionalContext?: string
  providerName: string
}

export function buildUpdateDescriptionPrompt({
  prData,
  template,
  additionalContext,
  providerName,
}: BuildUpdateDescriptionPromptArgs): string {
  const basePrompt = `Update this Pull Request description following these steps:

## PR Information
- Repository: ${prData.owner}/${prData.repo}
- PR #${prData.number}: ${prData.title}
- Target branch: ${prData.baseBranch}
- Source branch: ${prData.headBranch}

## Code Changes
\`\`\`diff
${prData.diff.length > 5000 ? prData.diff.substring(0, 5000) + '\n...(truncated)' : prData.diff}
\`\`\`

Please follow these steps:
1. ${template?.exists ? `Use the existing PR template found in the repository` : `Create a comprehensive PR description using standard format`}
2. Analyze the code changes and understand what this PR accomplishes
3. Generate a clear and informative PR description that includes:
   - Summary of changes and their purpose
   - Type of changes (bug fix, feature, breaking change, etc.)
   - Testing instructions if applicable
   - Any breaking changes or migration notes
4. Update the PR description:
   - Save the formatted description to a temporary file
   - Use the ${providerName} CLI command to update the PR description
   - Delete the temporary file

${
  template?.exists && template.content
    ? `
Template to use:
\`\`\`
${template.content}
\`\`\`
`
    : ''
}${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ''}

Note: Use the appropriate ${providerName} CLI command to update the description. No manual intervention is required.`

  return basePrompt
}
