import { IssueDetails } from '../../providers/types'

export function createIssuePrompt(issue: IssueDetails): string {
  return `Implement the GitHub issue: #${issue.number} - ${issue.title}

Issue Description:
${issue.body || 'No description provided'}

Please analyze the issue and implement the necessary changes to the codebase.`
}

export function createPlanPrompt(planContent: string): string {
  return `Execute the following development plan:

${planContent}

Please analyze the plan and implement the necessary changes to the codebase.`
}
