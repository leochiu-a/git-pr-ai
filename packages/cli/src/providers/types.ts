export interface GitProvider {
  name: string
  checkCLI(): Promise<void>
  getDefaultBranch(): Promise<string>
  checkExistingPR(): Promise<string | null>
  openPR(): Promise<void>
  createPR(title: string, branch: string, baseBranch: string): Promise<void>
  updatePRDescription(prNumber?: string): Promise<void>
  reviewPR(prNumber: string, options: ReviewOptions): Promise<void>
  listPRs(): Promise<PR[]>
}

export interface PR {
  number: string
  title: string
  url: string
  state: 'open' | 'closed' | 'merged'
  author: string
}

export interface ReviewOptions {
  approve?: boolean
  requestChanges?: boolean
  comment?: string
}

export type ProviderType = 'github' | 'gitlab'
