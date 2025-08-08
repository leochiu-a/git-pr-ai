import { $ } from 'zx'
import ora from 'ora'
import { GitProvider, PR, ReviewOptions } from './types.js'

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
      const result = await $`gh pr view --json url`
      const { url } = JSON.parse(result.stdout)
      return url
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
}
