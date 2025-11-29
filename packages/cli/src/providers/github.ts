import { $ } from 'zx'
import ora from 'ora'
import fs from 'fs/promises'
import {
  GitProvider,
  PR,
  ReviewOptions,
  PRDetails,
  TemplateInfo,
  IssueDetails,
} from './types'

export class GitHubProvider implements GitProvider {
  name = 'GitHub'

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
      const currentBranch = await $`git rev-parse --abbrev-ref HEAD`
      const branchName = currentBranch.stdout.trim()

      const result =
        await $`gh pr list --state open --head ${branchName} --json url --limit 1`
      const prs = JSON.parse(result.stdout)

      if (prs.length > 0) {
        return prs[0].url
      }
      return null
    } catch {
      return null
    }
  }

  async openPR(): Promise<void> {
    const spinner = ora('Opening existing Pull Request...').start()
    await $`gh pr view --web`
    const result = await $`gh pr view --json url`
    const { url } = JSON.parse(result.stdout)
    spinner.succeed(`Opened PR: ${url}`)
  }

  async createPR(
    title: string,
    branch: string,
    baseBranch: string,
  ): Promise<void> {
    const spinner = ora('Creating Pull Request...').start()
    await $`gh pr create --title ${title} --base ${baseBranch} --head ${branch} --web`
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
    let prNumber = prNumberOrUrl
    let repoPath: string | undefined

    // If it looks like a URL, extract the PR number and repo path
    if (prNumberOrUrl && prNumberOrUrl.startsWith('http')) {
      const githubPattern = /https:\/\/github\.com\/([^/]+\/[^/]+)\/pull\/(\d+)/
      const match = prNumberOrUrl.match(githubPattern)
      if (!match) {
        throw new Error(
          'Invalid GitHub PR URL format. Expected: https://github.com/owner/repo/pull/123',
        )
      }
      repoPath = match[1]
      prNumber = match[2]
    }

    const prResult =
      await $`gh pr view ${prNumber} -R ${repoPath} --json number,title,url,baseRefName,headRefName,state,author`
    const repoResult = await $`gh repo view -R ${repoPath} --json owner,name`

    const prData = JSON.parse(prResult.stdout)
    const repoData = JSON.parse(repoResult.stdout)

    return {
      number: prData.number.toString(),
      title: prData.title,
      url: prData.url,
      baseBranch: prData.baseRefName,
      headBranch: prData.headRefName,
      owner: repoData.owner.login,
      repo: repoData.name,
      state: prData.state.toLowerCase(),
      author: prData.author.login,
    }
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
      const cmd = prNumber
        ? `gh pr comment ${prNumber} --body-file ${tempFile}`
        : `gh pr comment --body-file ${tempFile}`
      await $`${cmd}`
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
      const cmd = prNumber
        ? `gh pr edit ${prNumber} --body-file ${tempFile}`
        : `gh pr edit --body-file ${tempFile}`
      await $`${cmd}`
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
