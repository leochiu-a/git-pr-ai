import { PRDetails } from '../../providers/types'

export interface ReviewPromptOptions {
  reviewType?: 'comprehensive' | 'focused' | 'security'
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
  const { additionalContext, reviewType = 'comprehensive' } = options

  const basePrompt = `Please analyze this Pull Request and provide code review:

## PR Information
- Repository: ${prDetails.owner}/${prDetails.repo}
- PR #${prDetails.number}: ${prDetails.title}
- URL: ${prDetails.url}
- Target branch: ${prDetails.baseBranch}
- Source branch: ${prDetails.headBranch}`

  let analysisInstructions = ''

  switch (reviewType) {
    case 'security':
      analysisInstructions = `
Focus on security analysis:
- Potential security vulnerabilities
- Input validation issues
- Permission control checks
- Sensitive data handling`
      break
    case 'focused':
      analysisInstructions = `
Provide focused summary review:
- Main changes overview
- Potential issues identification
- Key recommendations`
      break
    default:
      analysisInstructions = `
Analyze the following aspects:
- Code quality and best practices
- Potential bugs or issues
- Performance considerations
- Code consistency and style
- Test coverage`
  }

  const reviewStructure = `

Please provide structured review in the following format:

## 📋 Changes Summary
[Brief description of main changes]

## ✅ Strengths
[Point out good practices and improvements]

## ⚠️ Suggestions for Improvement
[Specific improvement suggestions]

## 🐛 Potential Issues
[List any issues found]

## Overall Assessment
[Approve/Request Changes/Comment Only]

Please follow these steps:
- Analyze the code changes to understand the purpose and quality of this PR/MR.
- Generate the review content according to the format above.
- Use the ${providerName} CLI command to post the review content as a PR/MR comment.

IMPORTANT:
- Select the appropriate ${providerName} CLI command to post the review content as a PR/MR comment.
- For Gemini CLI, save the review content to a markdown file and then use that file as the comment content.
- Use the comment command to post the review content as a PR/MR comment, and avoid using the approve command.
`

  let finalPrompt = basePrompt + analysisInstructions + reviewStructure

  if (additionalContext) {
    finalPrompt += `\n\n## Additional Context\n${additionalContext}\n\nPlease incorporate this context into your review.`
  }

  return finalPrompt
}
