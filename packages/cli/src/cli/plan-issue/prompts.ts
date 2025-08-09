import { IssueDetails } from './types'

export function createImplementationPlanPrompt(issue: IssueDetails): string {
  return `
You are a senior software engineer tasked with creating an implementation plan for a GitHub issue.

Issue Details:
- Number: #${issue.number}
- Title: ${issue.title}
- Description: ${issue.body}
- Labels: ${issue.labels.join(', ')}
${issue.assignee ? `- Assignee: ${issue.assignee}` : ''}
${issue.milestone ? `- Milestone: ${issue.milestone}` : ''}

Please create a comprehensive implementation plan that includes:

1. **Overview**: A brief summary of what needs to be implemented
2. **Tasks**: Break down the implementation into specific, actionable tasks with:
   - Title (concise task description)
   - Description (detailed explanation)
   - Priority (high/medium/low)
   - Estimated time (e.g., "2-3 hours", "1 day", etc.)
3. **Suggested Branch Name**: Following conventional naming (e.g., feat/issue-123-short-description, fix/issue-123-bug-description)
4. **Prerequisites**: Any dependencies, tools, or setup required
5. **Testing Strategy**: How to test the implementation

Respond in JSON format matching this structure:
{
  "overview": "string",
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "priority": "high|medium|low",
      "estimatedTime": "string"
    }
  ],
  "suggestedBranchName": "string",
  "prerequisites": ["string"],
  "testingStrategy": ["string"]
}

Focus on practical, actionable steps that a developer can follow to implement this issue.
`
}
