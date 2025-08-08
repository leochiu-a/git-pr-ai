import { $ } from 'zx'
import { GitProvider, ProviderType } from './types.js'
import { GitHubProvider } from './github.js'
import { GitLabProvider } from './gitlab.js'

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
    } else {
      return 'github'
    }
  } catch {
    throw new Error('Failed to detect provider')
  }
}

export async function getCurrentProvider(
  type?: ProviderType,
): Promise<GitProvider> {
  const providerType = type || (await detectProvider())

  switch (providerType) {
    case 'gitlab':
      return new GitLabProvider()
    case 'github':
    default:
      return new GitHubProvider()
  }
}
