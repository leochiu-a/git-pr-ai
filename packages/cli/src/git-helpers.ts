import { $ } from 'zx'
import ora from 'ora'
import { getCurrentProvider } from './providers/factory.js'

$.verbose = false

export async function getCurrentBranch() {
  const result = await $`git branch --show-current`
  return result.stdout.trim()
}

export async function getDefaultBranch() {
  const provider = await getCurrentProvider()
  return provider.getDefaultBranch()
}

export async function checkGitCLI() {
  const provider = await getCurrentProvider()
  return provider.checkCLI()
}

// Legacy function for backwards compatibility
export async function checkGitHubCLI() {
  return checkGitCLI()
}

export async function getPRUrl(): Promise<string> {
  const provider = await getCurrentProvider()
  const spinner = ora('Looking for PR/MR on current branch...').start()

  try {
    const prDetails = await provider.getCurrentBranchPR()
    if (!prDetails) {
      spinner.warn('No PR/MR found for current branch')
      throw new Error('No PR/MR found for current branch')
    }

    spinner.succeed('Found PR/MR for current branch')
    return prDetails.url
  } catch (error) {
    spinner.fail('Failed to get PR/MR information')
    throw error
  }
}
