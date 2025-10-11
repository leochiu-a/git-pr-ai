import { SupportedLanguage } from './git-helpers'

interface LanguagePrompts {
  systemInstruction: string
  responseFormat: string
}

export const LANGUAGE_PROMPTS: Record<SupportedLanguage, LanguagePrompts> = {
  en: {
    systemInstruction: 'Please respond in English.',
    responseFormat: 'Please provide your response in English.',
  },
  'zh-TW': {
    systemInstruction: '請用繁體中文回應。',
    responseFormat: '請用繁體中文提供你的回應。',
  },
}

export function createLanguagePrompt(
  basePrompt: string,
  language: SupportedLanguage,
): string {
  const languagePrompt = LANGUAGE_PROMPTS[language]

  return `IMPORTANT: ${languagePrompt.systemInstruction}

${basePrompt}

${languagePrompt.responseFormat}`
}
