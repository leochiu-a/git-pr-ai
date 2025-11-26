import { $ } from 'zx'
import { GitProvider, ProviderType } from './types'
import { GitHubProvider } from './github'
import { GitLabProvider } from './gitlab'
import { loadConfig } from '../config'

export async function detectProvider(): Promise<ProviderType> {
  try {
    const result = await $`git remote get-url origin`
    const remoteUrl = result.stdout.trim().toLowerCase()

    if (
      remoteUrl.includes('gitlab.com') ||
      remoteUrl.includes('gitlab') ||
      remoteUrl.match(/gitlab\./)
    ) {
      return 'gitlab'
    }

    return 'github'
  } catch {
    throw new Error('Failed to detect provider')
  }
}

export async function getCurrentProvider(): Promise<GitProvider> {
  const config = await loadConfig()
  const providerType = config.gitProvider ?? (await detectProvider())

  switch (providerType) {
    case 'gitlab':
      return new GitLabProvider()
    case 'github':
    default:
      return new GitHubProvider()
  }
}
