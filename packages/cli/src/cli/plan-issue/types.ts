export interface IssueDetails {
  number: number
  title: string
  body: string
  labels: string[]
  assignee?: string
  milestone?: string
}

export interface ImplementationPlan {
  overview: string
  tasks: Array<{
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    estimatedTime: string
  }>
  suggestedBranchName: string
  prerequisites: string[]
  testingStrategy: string[]
}
