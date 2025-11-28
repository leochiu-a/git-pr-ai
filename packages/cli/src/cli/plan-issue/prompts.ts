import { type JiraTicketDetails } from './types'
import { type IssueDetails } from '../../providers/types'

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

export function createJiraPrompt(ticket: JiraTicketDetails): string {
  return `
You are a senior software engineer tasked with converting a JIRA ticket into a well-structured GitHub issue.

JIRA Ticket Details:
- Key: ${ticket.key}
- Summary: ${ticket.summary}
- Description: ${ticket.description}
- Type: ${ticket.issueType}
- Priority: ${ticket.priority}
- Status: ${ticket.status}
${ticket.assignee ? `- Assignee: ${ticket.assignee}` : ''}
- Labels: ${ticket.labels.join(', ')}

Please convert this JIRA ticket into a GitHub/GitLab issue format:
1. **Title**: Convert the summary into a clear, actionable issue title
2. **Body**: Rewrite the description in markdown format with proper structure
3. **Labels**: Suggest appropriate labels based on the JIRA ticket
4. **Convert Reason**: Explain how you transformed the JIRA content for Git platform

Respond in JSON format:
{
  "title": "string",
  "body": "string", 
  "labels": ["string"],
  "convertReason": "string"
}

Focus on making the Git platform issue developer-friendly and actionable.
`
}
