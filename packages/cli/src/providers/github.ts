import { $ } from 'zx'
import ora from 'ora'
import fs from 'fs/promises'
import {
  CreatePROptions,
  GitProvider,
  PR,
  ReviewOptions,
  PRDetails,
  TemplateInfo,
  IssueDetails,
} from './types'

interface GitHubRepoRef {
  owner: string
  name: string
  fullName: string
}

interface GitHubRepoContext {
  current: GitHubRepoRef
  isFork: boolean
  parent: GitHubRepoRef | null
}

interface GitHubPRListItem {
  number: number
  url: string
  headRefName: string
  headRepositoryOwner?: { login: string } | null
}

interface GitHubPRReference {
  number: string
  url: string
  repo: GitHubRepoRef
}

interface FindOpenPRResult {
  pr: GitHubPRReference | null
  branchName: string
  searchedRepos: string[]
}

interface GitHubPRViewData {
  number: number
  title: string
  url: string
  baseRefName: string
  headRefName: string
  state: string
  author: { login: string }
}

export class GitHubProvider implements GitProvider {
  name = 'GitHub'

  /**
   * Parse PR URL into explicit repo + PR number.
   * In fork workflows, local repo and PR target repo may differ.
   * Returning owner/repo here allows downstream calls to always pass `--repo`
   * and avoid accidental resolution in the current working repository.
   */
  private parseGitHubPRUrl(prUrl: string): {
    repo: GitHubRepoRef
    number: string
  } {
    const githubPattern =
      /https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)(?:\/.*)?$/
    const match = prUrl.match(githubPattern)

    if (!match) {
      throw new Error(
        'Invalid GitHub PR URL format. Expected: https://github.com/owner/repo/pull/123',
      )
    }

    const owner = match[1]
    const name = match[2]
    const number = match[3]

    return {
      repo: {
        owner,
        name,
        fullName: `${owner}/${name}`,
      },
      number,
    }
  }

  /**
   * Decide repository search order for PR lookup.
   * For fork-based flows, upstream is checked first to avoid selecting a same-branch
   * PR in the fork by mistake. Non-fork repositories only search the current repo.
   */
  private getPRSearchTargets(repoContext: GitHubRepoContext): GitHubRepoRef[] {
    if (repoContext.isFork && repoContext.parent) {
      return [repoContext.parent, repoContext.current]
    }
    return [repoContext.current]
  }

  /**
   * Load current repository + fork parent context from GitHub.
   * This provides both the current repo identity and possible upstream target,
   * which is required for deterministic cross-repo PR resolution.
   */
  private async getRepoContext(): Promise<GitHubRepoContext> {
    const result =
      await $`gh repo view --json nameWithOwner,owner,name,isFork,parent`
    const repoData = JSON.parse(result.stdout) as {
      nameWithOwner: string
      owner: { login: string }
      name: string
      isFork: boolean
      parent?: {
        nameWithOwner?: string
        owner?: { login: string }
        name?: string
      } | null
    }

    const current: GitHubRepoRef = {
      owner: repoData.owner.login,
      name: repoData.name,
      fullName: repoData.nameWithOwner,
    }

    let parent: GitHubRepoRef | null = null
    if (repoData.parent?.nameWithOwner) {
      const [owner = '', name = ''] = repoData.parent.nameWithOwner.split('/')
      if (owner && name) {
        parent = {
          owner,
          name,
          fullName: repoData.parent.nameWithOwner,
        }
      }
    } else if (repoData.parent?.owner?.login && repoData.parent?.name) {
      // Keep a fallback path because different hosts/versions may not always return nameWithOwner.
      parent = {
        owner: repoData.parent.owner.login,
        name: repoData.parent.name,
        fullName: `${repoData.parent.owner.login}/${repoData.parent.name}`,
      }
    }

    return {
      current,
      isFork: repoData.isFork,
      parent,
    }
  }

  /**
   * Find the open PR for the current branch with fork-aware, cross-repo lookup.
   * The lookup scans [upstream, current] when on a fork, then returns the first
   * branch+owner match. This avoids false positives when branch names overlap.
   */
  private async findOpenPRForCurrentBranch(): Promise<FindOpenPRResult> {
    const currentBranch = await $`git rev-parse --abbrev-ref HEAD`
    const branchName = currentBranch.stdout.trim()

    const repoContext = await this.getRepoContext()
    const searchTargets = this.getPRSearchTargets(repoContext)

    for (const targetRepo of searchTargets) {
      const result =
        await $`gh pr list --state open --repo ${targetRepo.fullName} --head ${branchName} --json number,url,headRefName,headRepositoryOwner --limit 100`
      const prs = JSON.parse(result.stdout) as GitHubPRListItem[]

      // `gh pr list --head` cannot use "<owner>:<branch>" syntax.
      // In fork workflows this can return PRs from other owners with the same branch name.
      // We explicitly pin the branch owner to current repo owner to avoid false matches.
      const matchingPR = prs.find((pr) => {
        return (
          pr.headRefName === branchName &&
          pr.headRepositoryOwner?.login?.toLowerCase() ===
            repoContext.current.owner.toLowerCase()
        )
      })

      if (matchingPR) {
        return {
          pr: {
            number: String(matchingPR.number),
            url: matchingPR.url,
            repo: targetRepo,
          },
          branchName,
          searchedRepos: searchTargets.map((repo) => repo.fullName),
        }
      }
    }

    return {
      pr: null,
      branchName,
      // Keep searched repos for actionable error messages in callers.
      searchedRepos: searchTargets.map((repo) => repo.fullName),
    }
  }

  /**
   * Read PR details from a specific repository.
   * Always pass `--repo` to keep resolution explicit and independent from cwd context.
   */
  private async getPRView(
    prNumberOrBranch: string,
    repo: GitHubRepoRef,
  ): Promise<GitHubPRViewData> {
    const prResult =
      await $`gh pr view ${prNumberOrBranch} --repo ${repo.fullName} --json number,title,url,baseRefName,headRefName,state,author`
    return JSON.parse(prResult.stdout) as GitHubPRViewData
  }

  /**
   * Convert gh PR payload to our provider-neutral PRDetails model.
   * Repository identity is taken from the resolved target repo to keep downstream
   * commands aligned with the actual PR location.
   */
  private toPRDetails(
    prData: GitHubPRViewData,
    repo: GitHubRepoRef,
  ): PRDetails {
    return {
      number: prData.number.toString(),
      title: prData.title,
      url: prData.url,
      baseBranch: prData.baseRefName,
      headBranch: prData.headRefName,
      owner: repo.owner,
      repo: repo.name,
      state: prData.state.toLowerCase() as PRDetails['state'],
      author: prData.author.login,
    }
  }

  async checkCLI(): Promise<void> {
    try {
      await $`gh --version`.quiet()
    } catch {
      console.error('❌ Please install GitHub CLI (gh) first')
      console.error('Installation: https://cli.github.com/')
      process.exit(1)
    }

    try {
      const result = await $`gh auth status`.quiet()
      if (!result.stdout.includes('✓ Logged in to')) {
        throw new Error('No authenticated accounts found')
      }
    } catch {
      try {
        await $`gh api user`.quiet()
      } catch {
        console.error('❌ Please authenticate with GitHub CLI first')
        console.error('Run: gh auth login')
        process.exit(1)
      }
    }
  }

  async getDefaultBranch(): Promise<string> {
    try {
      const result = await $`gh repo view --json defaultBranchRef`
      const json = JSON.parse(result.stdout)
      if (json.defaultBranchRef && json.defaultBranchRef.name) {
        return json.defaultBranchRef.name
      }
      return 'main'
    } catch {
      console.warn(
        "⚠️ Could not determine default branch via gh, falling back to 'main'",
      )
      return 'main'
    }
  }

  async checkExistingPR(): Promise<string | null> {
    try {
      const result = await this.findOpenPRForCurrentBranch()
      return result.pr?.url ?? null
    } catch {
      return null
    }
  }

  async openPR(): Promise<void> {
    const spinner = ora('Opening existing Pull Request...').start()
    try {
      const currentBranchPR = await this.findOpenPRForCurrentBranch()
      if (!currentBranchPR.pr) {
        throw new Error(
          'No open Pull Request found for the current branch. Please create one first.',
        )
      }
      const prUrl = currentBranchPR.pr.url

      await $`gh pr view ${prUrl} --web`
      const result = await $`gh pr view ${prUrl} --json url`
      const { url } = JSON.parse(result.stdout) as { url: string }
      spinner.succeed(`Opened PR: ${url}`)
    } catch (error) {
      spinner.fail('Failed to open Pull Request')
      throw error
    }
  }

  async createPR(
    title: string,
    branch: string,
    baseBranch: string,
    options: CreatePROptions = {},
  ): Promise<void> {
    const spinner = ora('Creating Pull Request...').start()
    const useWeb = options.web !== false

    if (useWeb) {
      await $`gh pr create --title ${title} --base ${baseBranch} --head ${branch} --web`
    } else {
      // `zx` runs `gh` in non-interactive mode, so we must provide a body explicitly.
      await $`gh pr create --title ${title} --body "" --base ${baseBranch} --head ${branch}`
    }
    spinner.succeed('Pull Request created successfully!')
  }

  async updatePRDescription(prNumber?: string): Promise<void> {
    const spinner = ora('Updating PR description...').start()
    try {
      if (prNumber) {
        await $`gh pr edit ${prNumber} --body-file -`
      } else {
        await $`gh pr edit --body-file -`
      }
      spinner.succeed('PR description updated successfully!')
    } catch (error) {
      spinner.fail('Failed to update PR description')
      throw error
    }
  }

  async reviewPR(prNumber: string, options: ReviewOptions): Promise<void> {
    const spinner = ora('Submitting PR review...').start()

    try {
      let cmd = `gh pr review ${prNumber}`

      if (options.approve) {
        cmd += ' --approve'
      } else if (options.requestChanges) {
        cmd += ' --request-changes'
      } else {
        cmd += ' --comment'
      }

      if (options.comment) {
        cmd += ` --body "${options.comment}"`
      }

      await $`${cmd}`.quiet()
      spinner.succeed('PR review submitted successfully!')
    } catch (error) {
      spinner.fail('Failed to submit PR review')
      throw error
    }
  }

  async listPRs(): Promise<PR[]> {
    try {
      const result = await $`gh pr list --json number,title,url,state,author`
      const prs = JSON.parse(result.stdout)

      // oxlint-disable-next-line no-explicit-any
      return prs.map((pr: any) => ({
        number: pr.number.toString(),
        title: pr.title,
        url: pr.url,
        state: pr.state.toLowerCase(),
        author: pr.author.login,
      }))
    } catch {
      return []
    }
  }

  async getPRDetails(prNumberOrUrl?: string): Promise<PRDetails> {
    // URL input should be treated as authoritative target repo, never inferred from cwd.
    if (prNumberOrUrl?.startsWith('http')) {
      const parsedPR = this.parseGitHubPRUrl(prNumberOrUrl)
      const prData = await this.getPRView(parsedPR.number, parsedPR.repo)
      return this.toPRDetails(prData, parsedPR.repo)
    }

    if (prNumberOrUrl) {
      const repoContext = await this.getRepoContext()
      const searchTargets = this.getPRSearchTargets(repoContext)

      // Number-only input is ambiguous in fork workflows, so we try in deterministic order.
      for (const targetRepo of searchTargets) {
        try {
          const prData = await this.getPRView(prNumberOrUrl, targetRepo)
          return this.toPRDetails(prData, targetRepo)
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          if (message.toLowerCase().includes('no pull requests found')) {
            continue
          }
          throw error
        }
      }

      throw new Error(
        `No pull request found for "${prNumberOrUrl}" in repositories: ${searchTargets
          .map((repo) => repo.fullName)
          .join(', ')}`,
      )
    }

    const currentBranchPR = await this.findOpenPRForCurrentBranch()
    if (!currentBranchPR.pr) {
      throw new Error(
        `No open pull request found for branch "${currentBranchPR.branchName}" in repositories: ${currentBranchPR.searchedRepos.join(', ')}`,
      )
    }

    // No explicit input: resolve by current branch, then fetch details with explicit repo context.
    const prData = await this.getPRView(
      currentBranchPR.pr.number,
      currentBranchPR.pr.repo,
    )
    return this.toPRDetails(prData, currentBranchPR.pr.repo)
  }

  async getPRDiff(prNumber?: string): Promise<string> {
    const cmd = prNumber ? `gh pr diff ${prNumber}` : `gh pr diff`
    const result = await $`${cmd}`
    return result.stdout
  }

  async findPRTemplate(): Promise<TemplateInfo> {
    const possiblePaths = [
      '.github/pull_request_template.md',
      '.github/PULL_REQUEST_TEMPLATE.md',
      '.github/pull_request_template/default.md',
    ]

    for (const templatePath of possiblePaths) {
      try {
        const content = await fs.readFile(templatePath, 'utf-8')
        return {
          exists: true,
          content,
          path: templatePath,
        }
      } catch {
        // Continue to next path
      }
    }

    return { exists: false }
  }

  async postComment(content: string, prNumber?: string): Promise<void> {
    const tempFile = 'temp_comment.md'
    await fs.writeFile(tempFile, content)

    try {
      if (prNumber) {
        await $`gh pr comment ${prNumber} --body-file ${tempFile}`
      } else {
        await $`gh pr comment --body-file ${tempFile}`
      }
    } finally {
      try {
        await fs.unlink(tempFile)
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  async updateDescription(content: string, prNumber?: string): Promise<void> {
    const tempFile = 'temp_description.md'
    await fs.writeFile(tempFile, content)

    try {
      if (prNumber) {
        await $`gh pr edit ${prNumber} --body-file ${tempFile}`
      } else {
        await $`gh pr edit --body-file ${tempFile}`
      }
    } finally {
      try {
        await fs.unlink(tempFile)
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  async getCurrentBranchPR(): Promise<PRDetails | null> {
    try {
      // Check if there's an existing PR for current branch
      const prUrl = await this.checkExistingPR()
      if (!prUrl) {
        return null
      }

      // Get detailed PR information for current branch
      return await this.getPRDetails()
    } catch {
      return null
    }
  }

  async getIssue(issueNumber: number): Promise<IssueDetails> {
    try {
      const result =
        await $`gh issue view ${issueNumber} --json number,title,body,labels,assignees,milestone`
      const issue = JSON.parse(result.stdout) as {
        number: number
        title: string
        body: string
        labels: Array<{ name: string }>
        assignees: Array<{ login: string }>
        milestone?: { title: string }
      }

      return {
        number: issue.number,
        title: issue.title,
        body: issue.body || '',
        labels: issue.labels?.map((label) => label.name) || [],
        assignee: issue.assignees?.[0]?.login,
        milestone: issue.milestone?.title,
      }
    } catch {
      throw new Error(
        `Could not fetch issue #${issueNumber}. Make sure it exists and you have access to it.`,
      )
    }
  }

  async updateIssue(
    issueNumber: number,
    title?: string,
    body?: string,
  ): Promise<void> {
    const spinner = ora('Updating issue...').start()

    try {
      const args = ['gh', 'issue', 'edit', issueNumber.toString()]
      if (title) {
        args.push('--title', title)
      }
      if (body) {
        args.push('--body', body)
      }

      await $`${args}`
      spinner.succeed(`Updated issue #${issueNumber}`)
    } catch (error) {
      spinner.fail('Failed to update issue')
      throw new Error(
        `Could not update issue: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  async addIssueComment(issueNumber: number, comment: string): Promise<void> {
    const spinner = ora('Adding comment to issue...').start()

    try {
      await $`gh issue comment ${issueNumber} --body ${comment}`
      spinner.succeed(`Added comment to issue #${issueNumber}`)
    } catch (error) {
      spinner.fail('Failed to add comment')
      throw new Error(
        `Could not add comment: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  async createIssue(
    title: string,
    body: string,
    labels?: string[],
  ): Promise<void> {
    const spinner = ora('Creating new issue...').start()

    try {
      const args = ['gh', 'issue', 'create', '--title', title, '--body', body]
      if (labels && labels.length > 0) {
        args.push('--label', labels.join(','))
      }

      const result = await $`${args}`
      spinner.succeed('New issue created successfully')
      console.log(result.stdout.trim())
    } catch (error) {
      spinner.fail('Failed to create issue')
      throw new Error(
        `Could not create issue: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}
