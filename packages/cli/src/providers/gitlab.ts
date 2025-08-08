import { $ } from 'zx'
import ora from 'ora'
import fs from 'fs/promises'
import {
  GitProvider,
  PR,
  ReviewOptions,
  PRDetails,
  TemplateInfo,
} from './types.js'

export class GitLabProvider implements GitProvider {
  name = 'GitLab'

  async checkCLI(): Promise<void> {
    try {
      await $`glab --version`.quiet()
    } catch {
      console.error('❌ Please install GitLab CLI (glab) first')
      console.error('Installation: https://gitlab.com/gitlab-org/cli')
      process.exit(1)
    }

    try {
      await $`glab auth status`.quiet()
    } catch {
      console.error('❌ Please authenticate with GitLab CLI first')
      console.error('Run: glab auth login')
      process.exit(1)
    }
  }

  async getDefaultBranch(): Promise<string> {
    try {
      const result = await $`glab repo view -F json`
      const json = JSON.parse(result.stdout)
      return json.default_branch || 'main'
    } catch {
      console.warn(
        "⚠️ Could not determine default branch via glab, falling back to 'main'",
      )
      return 'main'
    }
  }

  async checkExistingPR(): Promise<string | null> {
    try {
      const result = await $`glab mr view -F json`
      const json = JSON.parse(result.stdout)
      return json.web_url
    } catch {
      return null
    }
  }

  async openPR(): Promise<void> {
    const spinner = ora('Opening existing Merge Request...').start()
    await $`glab mr view --web`
    const result = await $`glab mr view -F json`
    const json = JSON.parse(result.stdout)
    spinner.succeed(`Opened MR: ${json.web_url}`)
  }

  async createPR(
    title: string,
    branch: string,
    baseBranch: string,
  ): Promise<void> {
    const spinner = ora('Creating Merge Request...').start()
    await $`glab mr create --title "${title}" --target-branch ${baseBranch} --source-branch ${branch} --web`
    spinner.succeed('Merge Request created successfully!')
  }

  async updatePRDescription(prNumber?: string): Promise<void> {
    const spinner = ora('Updating MR description...').start()
    try {
      if (prNumber) {
        await $`glab mr update ${prNumber} --description-file -`
      } else {
        await $`glab mr update --description-file -`
      }
      spinner.succeed('MR description updated successfully!')
    } catch (error) {
      spinner.fail('Failed to update MR description')
      throw error
    }
  }

  async reviewPR(prNumber: string, options: ReviewOptions): Promise<void> {
    const spinner = ora('Submitting MR review...').start()

    try {
      let cmd = `glab mr review ${prNumber}`

      if (options.approve) {
        cmd = `glab mr approve ${prNumber}`
      } else if (options.requestChanges) {
        cmd = `glab mr unapprove ${prNumber}`
      }

      if (options.comment) {
        await $`glab mr note ${prNumber} --message "${options.comment}"`
      }

      if (
        cmd.includes('review') ||
        cmd.includes('approve') ||
        cmd.includes('unapprove')
      ) {
        await $`${cmd}`.quiet()
      }

      spinner.succeed('MR review submitted successfully!')
    } catch (error) {
      spinner.fail('Failed to submit MR review')
      throw error
    }
  }

  async listPRs(): Promise<PR[]> {
    try {
      const result = await $`glab mr list -F json`
      const mrs = JSON.parse(result.stdout)

      // oxlint-disable-next-line no-explicit-any
      return mrs.map((mr: any) => ({
        number: mr.iid.toString(),
        title: mr.title,
        url: mr.web_url,
        state: mr.state.toLowerCase(),
        author: mr.author.username,
      }))
    } catch {
      return []
    }
  }

  async getPRDetails(): Promise<PRDetails> {
    const mrResult = await $`glab mr view -F json`
    const repoResult = await $`glab repo view -F json`

    const mrData = JSON.parse(mrResult.stdout)
    const repoData = JSON.parse(repoResult.stdout)

    return {
      number: mrData.iid.toString(),
      title: mrData.title,
      url: mrData.web_url,
      baseBranch: mrData.target_branch,
      headBranch: mrData.source_branch,
      owner: repoData.owner?.username || repoData.namespace?.path,
      repo: repoData.name,
      state: mrData.state.toLowerCase(),
      author: mrData.author.username,
    }
  }

  async getPRDiff(prNumber?: string): Promise<string> {
    const cmd = prNumber ? `glab mr diff ${prNumber}` : `glab mr diff`
    const result = await $`${cmd}`
    return result.stdout
  }

  async findPRTemplate(): Promise<TemplateInfo> {
    const possiblePaths = [
      '.gitlab/merge_request_templates/default.md',
      '.gitlab/merge_request_templates/Default.md',
      '.gitlab/merge_request_templates/merge_request_template.md',
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
        ? `glab mr note ${prNumber} --message-file ${tempFile}`
        : `glab mr note --message-file ${tempFile}`
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
        ? `glab mr update ${prNumber} --description-file ${tempFile}`
        : `glab mr update --description-file ${tempFile}`
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
      // Check if there's an existing MR for current branch
      const mrUrl = await this.checkExistingPR()
      if (!mrUrl) {
        return null
      }

      // Get detailed MR information for current branch
      return await this.getPRDetails()
    } catch {
      return null
    }
  }
}
