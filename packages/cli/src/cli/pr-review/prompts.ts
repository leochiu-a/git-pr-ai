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
1. Analyze the code changes to understand the purpose and quality of this PR/MR
2. Generate the review content according to the format above
3. Post the review as a comment using the appropriate CLI command

## CLI Commands by Provider:

### For ${providerName}:
${
  providerName === 'GitLab'
    ? `- View MR details: \`glab mr view -F json\`
- Get MR diff: \`glab mr diff\`  
- Post comment: \`glab mr note --message <message>\`
- Example: \`glab mr note --message "This is a review comment"\``
    : `- View PR details: \`gh pr view --json number,title,url,baseRefName,headRefName\`
- Get PR diff: \`gh pr diff\`
- Post comment: \`gh pr comment --body-file <file>\`
- Example: Save review to temp_review.md, then run \`gh pr comment --body-file temp_review.md\``
}

## For Gemini CLI Users - Step by Step:
1. **First, get the MR diff**:
   \`\`\`bash
   glab mr diff
   \`\`\`

2. **Create your review content and save to file**:
   \`\`\`bash
   cat > review_content.md << 'EOF'
   ## 📋 Changes Summary
   [Your analysis of the changes]

   ## ✅ Strengths  
   [Good practices you found]

   ## ⚠️ Suggestions for Improvement
   [Specific suggestions]

   ## 🐛 Potential Issues
   [Any issues found]

   ## Overall Assessment
   [Your final assessment]
   EOF
   \`\`\`

3. **Post the review as comment**:
   \`\`\`bash
   glab mr note --message review_content.md
   \`\`\`

4. **Clean up**:
   \`\`\`bash
   rm review_content.md
   \`\`\`

IMPORTANT:
- Use the comment posting commands above, avoid approve/unapprove commands  
- For Gemini CLI: Follow the 4-step process exactly for reliable results
- Always save review content to a file first, then post using --message-file
`

  let finalPrompt = basePrompt + analysisInstructions + reviewStructure

  if (additionalContext) {
    finalPrompt += `\n\n## Additional Context\n${additionalContext}\n\nPlease incorporate this context into your review.`
  }

  return finalPrompt
}
