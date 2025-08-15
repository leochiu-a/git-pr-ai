import { PRDetails } from '../../providers/types'

export interface ReviewPromptOptions {
  additionalContext?: string
}

export interface BuildReviewPromptArgs {
  prDetails: PRDetails
  options?: ReviewPromptOptions
  providerName: string
}

export function buildReviewPrompt({
  prDetails,
  options = {},
  providerName,
}: BuildReviewPromptArgs): string {
  const { additionalContext } = options

  const basePrompt = `You are an expert code reviewer. Think carefully and systematically about this Pull Request.

## PR Information
- Repository: ${prDetails.owner}/${prDetails.repo}
- PR #${prDetails.number}: ${prDetails.title}
- URL: ${prDetails.url}
- Target branch: ${prDetails.baseBranch}
- Source branch: ${prDetails.headBranch}

## Review Process

### Step 1: Analysis
First, examine the code changes focusing on:
- **Code Quality**: Adherence to best practices, readability, and maintainability
- **Logic & Bugs**: Potential issues, edge cases, and correctness
- **Performance**: Efficiency concerns and optimization opportunities
- **Security**: Vulnerability assessment and safe coding practices
- **Testing**: Coverage adequacy and test quality

### Step 2: Generate Review
Provide your review in this structured format:

## 📋 Changes Summary
[Concise description of what changed and why]

## ✅ Strengths
[Specific positive aspects and good practices]

## ⚠️ Suggestions
[Actionable improvement recommendations with examples]

## 🐛 Issues Found
[Critical bugs, security concerns, or problems]

## Overall Assessment
[Approve/Request Changes/Comment with reasoning]

### Step 3: Post Review
${
  providerName === 'GitLab'
    ? 'Save your review to a file and use: `glab mr note --message-file <filename>`'
    : 'Save your review to a file and use: `gh pr comment --body-file <filename>`'
}

## Key Guidelines
- Be specific and actionable in feedback
- Provide code examples when suggesting changes
- Focus on maintainability and correctness
- Consider the broader codebase context`

  let finalPrompt = basePrompt

  if (additionalContext) {
    finalPrompt += `\n\n## Additional Context\n${additionalContext}\n\nPlease incorporate this context into your review.`
  }

  return finalPrompt
}
