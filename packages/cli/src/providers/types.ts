export interface GitProvider {
  /** Provider name (e.g., 'GitHub', 'GitLab') */
  name: string

  /** Check if the provider's CLI tool is installed and authenticated */
  checkCLI(): Promise<void>

  /** Get the default branch name for the repository */
  getDefaultBranch(): Promise<string>

  /** Check if there's an existing PR/MR for the current branch */
  checkExistingPR(): Promise<string | null>

  /** Open the existing PR/MR in the default browser */
  openPR(): Promise<void>

  /** Create a new PR/MR with the specified title and branch configuration */
  createPR(title: string, branch: string, baseBranch: string): Promise<void>

  /** Update PR/MR description (deprecated - use updateDescription instead) */
  updatePRDescription(prNumber?: string): Promise<void>

  /** Submit a review for the specified PR/MR */
  reviewPR(prNumber: string, options: ReviewOptions): Promise<void>

  /** List all open PRs/MRs in the repository */
  listPRs(): Promise<PR[]>

  /** Get detailed information about a specific PR/MR (by number) or from URL */
  getPRDetails(): Promise<PRDetails>

  /** Get the diff/changes for a specific PR/MR */
  getPRDiff(prNumber?: string): Promise<string>

  /** Find and return PR/MR template information if it exists */
  findPRTemplate(): Promise<TemplateInfo>

  /** Post a comment on a PR/MR */
  postComment(content: string, prNumber?: string): Promise<void>

  /** Update the description of a PR/MR */
  updateDescription(content: string, prNumber?: string): Promise<void>

  /** Get PR/MR information for the current branch */
  getCurrentBranchPR(): Promise<PRDetails | null>

  /** Issue management methods */
  /** Fetch issue details by number */
  getIssue(issueNumber: number): Promise<IssueDetails>

  /** Update an issue with new title and/or body */
  updateIssue(issueNumber: number, title?: string, body?: string): Promise<void>

  /** Add a comment to an issue */
  addIssueComment(issueNumber: number, comment: string): Promise<void>

  /** Create a new issue */
  createIssue(title: string, body: string, labels?: string[]): Promise<void>

  /** Search for PRs/MRs within a specific date range */
  searchPRsByDateRange(startDate: string, endDate: string): Promise<PR[]>
}

export interface IssueDetails {
  number: number
  title: string
  body: string
  labels: string[]
  assignee?: string
  milestone?: string
}

/** Basic PR/MR information for listing purposes */
export interface PR {
  /** PR/MR number */
  number: string
  /** PR/MR title */
  title: string
  /** PR/MR URL */
  url: string
  /** Current state of the PR/MR */
  state: 'open' | 'closed' | 'merged'
  /** Author username */
  author: string
}

/** Detailed PR/MR information including repository context */
export interface PRDetails {
  /** PR/MR number */
  number: string
  /** PR/MR title */
  title: string
  /** PR/MR URL */
  url: string
  /** Target/base branch name */
  baseBranch: string
  /** Source/head branch name */
  headBranch: string
  /** Repository owner username */
  owner: string
  /** Repository name */
  repo: string
  /** Current state of the PR/MR */
  state: 'open' | 'closed' | 'merged'
  /** Author username */
  author: string
}

/** Information about PR/MR template files */
export interface TemplateInfo {
  /** Whether a template file exists */
  exists: boolean
  /** Template file content if it exists */
  content?: string
  /** Path to the template file */
  path?: string
}

/** Options for submitting a PR/MR review */
export interface ReviewOptions {
  /** Whether to approve the PR/MR */
  approve?: boolean
  /** Whether to request changes */
  requestChanges?: boolean
  /** Review comment text */
  comment?: string
}

/** Supported Git hosting provider types */
export type ProviderType = 'github' | 'gitlab'
