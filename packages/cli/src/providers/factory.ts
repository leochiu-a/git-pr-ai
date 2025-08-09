import { $ } from 'zx'
import { GitProvider, ProviderType } from './types'
import { GitHubProvider } from './github'
import { GitLabProvider } from './gitlab'

let cachedProviderType: ProviderType | null = null
let cachedProvider: GitProvider | null = null

export async function detectProvider(): Promise<ProviderType> {
  if (cachedProviderType) {
    return cachedProviderType
  }

  try {
    const result = await $`git remote get-url origin`
    const remoteUrl = result.stdout.trim().toLowerCase()

    if (
      remoteUrl.includes('gitlab.com') ||
      remoteUrl.includes('gitlab') ||
      remoteUrl.match(/gitlab\./)
    ) {
      cachedProviderType = 'gitlab'
    } else {
      cachedProviderType = 'github'
    }

    return cachedProviderType
  } catch {
    throw new Error('Failed to detect provider')
  }
}

export async function getCurrentProvider(
  type?: ProviderType,
): Promise<GitProvider> {
  const providerType = type || (await detectProvider())

  if (cachedProvider && cachedProviderType === providerType) {
    return cachedProvider
  }

  switch (providerType) {
    case 'gitlab':
      cachedProvider = new GitLabProvider()
      break
    case 'github':
    default:
      cachedProvider = new GitHubProvider()
      break
  }

  cachedProviderType = providerType
  return cachedProvider
}
