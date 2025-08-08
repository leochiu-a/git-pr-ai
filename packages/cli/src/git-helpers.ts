import { $ } from 'zx'
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
