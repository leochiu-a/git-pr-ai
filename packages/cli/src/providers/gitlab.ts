import { $ } from 'zx'
import ora from 'ora'
import { GitProvider, PR, ReviewOptions } from './types.js'

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
      const result = await $`glab repo view --json defaultBranch`
      const json = JSON.parse(result.stdout)
      return json.defaultBranch || 'main'
    } catch {
      console.warn(
        "⚠️ Could not determine default branch via glab, falling back to 'main'",
      )
      return 'main'
    }
  }

  async checkExistingPR(): Promise<string | null> {
    try {
      const result = await $`glab mr view --json webUrl`
      const { webUrl } = JSON.parse(result.stdout)
      return webUrl
    } catch {
      return null
    }
  }

  async openPR(): Promise<void> {
    const spinner = ora('Opening existing Merge Request...').start()
    await $`glab mr view --web`
    const result = await $`glab mr view --json webUrl`
    const { webUrl } = JSON.parse(result.stdout)
    spinner.succeed(`Opened MR: ${webUrl}`)
  }

  async createPR(
    title: string,
    branch: string,
    baseBranch: string,
  ): Promise<void> {
    const spinner = ora('Creating Merge Request...').start()
    await $`glab mr create --title ${title} --target-branch ${baseBranch} --source-branch ${branch} --web`
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
      const result = await $`glab mr list --json iid,title,webUrl,state,author`
      const mrs = JSON.parse(result.stdout)

      return mrs.map((mr: any) => ({
        number: mr.iid.toString(),
        title: mr.title,
        url: mr.webUrl,
        state: mr.state.toLowerCase(),
        author: mr.author.username,
      }))
    } catch {
      return []
    }
  }
}
