export interface IssueDetails {
  number: number
  title: string
  body: string
  labels: string[]
  assignee?: string
  milestone?: string
}

export type PlanMode = 'optimize' | 'comment'

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
