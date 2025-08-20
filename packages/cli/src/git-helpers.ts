import { $ } from 'zx'
import { getCurrentProvider } from './providers/factory'

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

export type SupportedLanguage = 'en' | 'zh-TW'

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, string> = {
  en: 'English',
  'zh-TW': '繁體中文 (Traditional Chinese)',
}

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en'

export async function getLanguage(): Promise<SupportedLanguage> {
  try {
    const result = await $`git config pr-ai.language`
    const language = result.stdout.trim() as SupportedLanguage
    return Object.keys(SUPPORTED_LANGUAGES).includes(language)
      ? language
      : DEFAULT_LANGUAGE
  } catch {
    return DEFAULT_LANGUAGE
  }
}

export async function setLanguage(language: SupportedLanguage): Promise<void> {
  await $`git config pr-ai.language ${language}`
}
