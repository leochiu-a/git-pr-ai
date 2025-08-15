import { PRDetails } from '../../providers/types'

export interface UpdateDescriptionPromptOptions {
  additionalContext?: string
}

export interface BuildUpdateDescriptionPromptArgs {
  prDetails: PRDetails
  options?: UpdateDescriptionPromptOptions
  providerName: string
}

export function buildUpdateDescriptionPrompt({
  prDetails,
  options = {},
  providerName,
}: BuildUpdateDescriptionPromptArgs): string {
  const { additionalContext } = options
  const basePrompt = `You are an expert technical writer. Think carefully and systematically about updating this Pull Request description.

## PR Information
- Repository: ${prDetails.owner}/${prDetails.repo}
- PR #${prDetails.number}: ${prDetails.title}
- URL: ${prDetails.url}
- Target branch: ${prDetails.baseBranch}
- Source branch: ${prDetails.headBranch}

## Update Process

### Step 1: Analysis
First, examine the code changes to understand:
- **Purpose**: What problem does this PR solve?
- **Scope**: What files and functionality are affected?
- **Impact**: How does this change the user/developer experience?
- **Dependencies**: Are there related changes or requirements?

### Step 2: Generate Description
Create a comprehensive PR description following this structure:

## 📝 Description
[Clear explanation of what changed and why]

## 🔄 Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)

## 🧪 Testing
[Instructions for testing these changes]

## 💥 Breaking Changes
[List any breaking changes and migration notes, if applicable]

## 📋 Checklist
- [ ] Code follows the style guidelines
- [ ] Self-review has been performed
- [ ] Tests have been added/updated
- [ ] Documentation has been updated

### Step 3: Update PR
Save your description to a file and update the PR:

${
  providerName === 'GitLab'
    ? `1. Save the description to description.md file
2. Update the MR: \`glab mr edit --description-file description.md\``
    : `1. Save the description to description.md file  
2. Update the PR: \`gh pr edit --body-file description.md\``
}

IMPORTANT: You must complete all 3 steps above. Do not stop after generating the description - execute the CLI commands to actually update the PR.

## Key Guidelines
- Write clear, concise descriptions
- Use proper markdown formatting
- Include all relevant technical details
- Consider both technical and non-technical readers
- MUST execute all CLI commands to complete the task - do not just provide instructions to the user`

  let finalPrompt = basePrompt

  if (additionalContext) {
    finalPrompt += `\n\n## Additional Context\n${additionalContext}\n\nPlease incorporate this context into your description.`
  }

  return finalPrompt
}
