import { IssueDetails } from './types'

export function createOptimizePrompt(issue: IssueDetails): string {
  return `
You are a senior product manager tasked with improving an existing GitHub issue to make it clearer and more actionable.

Current Issue:
- Number: #${issue.number}
- Title: ${issue.title}
- Description: ${issue.body}
- Labels: ${issue.labels.join(', ')}
${issue.assignee ? `- Assignee: ${issue.assignee}` : ''}
${issue.milestone ? `- Milestone: ${issue.milestone}` : ''}

Please optimize this issue by:
1. **Improved Title**: Make it more specific and actionable
2. **Improved Body**: Rewrite the description to be clearer and more structured
3. **Improvement Reason**: Explain what was unclear and how you improved it

Respond in JSON format:
{
  "improvedTitle": "string",
  "improvedBody": "string", 
  "improvementReason": "string"
}

Focus on clarity, specificity, and actionability.
`
}

export function createCommentPrompt(issue: IssueDetails): string {
  return `
You are a senior software engineer reviewing a GitHub issue and providing expert analysis and solutions.

Issue to Analyze:
- Number: #${issue.number}
- Title: ${issue.title}
- Description: ${issue.body}
- Labels: ${issue.labels.join(', ')}
${issue.assignee ? `- Assignee: ${issue.assignee}` : ''}
${issue.milestone ? `- Milestone: ${issue.milestone}` : ''}

Please provide:
1. **Analysis**: Your assessment of the issue, its complexity, and scope
2. **Suggested Solution**: Your recommended approach to solving this issue
3. **Implementation Notes**: Key considerations and technical details

Respond in JSON format:
{
  "analysis": "string",
  "suggestedSolution": "string", 
  "implementationNotes": ["string"]
}

Provide practical, actionable guidance that helps move the issue forward.
`
}
