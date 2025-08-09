export interface IssueDetails {
  number: number
  title: string
  body: string
  labels: string[]
  assignee?: string
  milestone?: string
}

export type PlanMode = 'optimize' | 'comment' | 'jira'

export interface OptimizedContent {
  improvedTitle: string
  improvedBody: string
  improvementReason: string
}

export interface CommentSolution {
  analysis: string
  suggestedSolution: string
  implementationNotes: string[]
}

export interface JiraTicketDetails {
  key: string
  summary: string
  description: string
  issueType: string
  priority: string
  status: string
  assignee?: string
  labels: string[]
}

export interface JiraGeneratedIssue {
  title: string
  body: string
  labels: string[]
  convertReason: string
}
