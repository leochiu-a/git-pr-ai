import { $ } from 'zx'
import { loadConfig } from './config'
import { getLanguage } from './git-helpers'
import { createLanguagePrompt } from './language-prompts'

export async function executeAICommand(
  prompt: string,
  options: { useLanguage?: boolean; yolo?: boolean } = {},
): Promise<void> {
  const { useLanguage = true, yolo = false } = options
  const config = await loadConfig()
  const language = useLanguage ? await getLanguage() : 'en'
  const finalPrompt = useLanguage
    ? createLanguagePrompt(prompt, language)
    : prompt

  switch (config.agent) {
    case 'claude':
      await checkClaudeCLI()
      if (yolo) {
        await $({
          stdio: 'inherit',
        })`claude --dangerously-skip-permissions ${finalPrompt}`
      } else {
        await $({ stdio: 'inherit' })`claude ${finalPrompt}`
      }
      break
    case 'gemini':
      await checkGeminiCLI()
      if (yolo) {
        await $({ stdio: 'inherit' })`gemini -i --yolo ${finalPrompt}`
      } else {
        await $({ stdio: 'inherit' })`gemini -i ${finalPrompt}`
      }
      break
    default:
      throw new Error(`Unsupported AI agent: ${config.agent}`)
  }
}

export async function executeAIWithOutput(
  prompt: string,
  options: { useLanguage?: boolean; yolo?: boolean } = {},
): Promise<string> {
  const { useLanguage = true, yolo = false } = options
  const config = await loadConfig()
  const language = useLanguage ? await getLanguage() : 'en'
  const finalPrompt = useLanguage
    ? createLanguagePrompt(prompt, language)
    : prompt

  switch (config.agent) {
    case 'claude':
      await checkClaudeCLI()
      const result = yolo
        ? await $`echo ${finalPrompt} | claude --dangerously-skip-permissions`.quiet()
        : await $`echo ${finalPrompt} | claude`.quiet()
      return result.stdout.trim()
    case 'gemini':
      await checkGeminiCLI()
      const geminiResult = yolo
        ? await $`echo ${finalPrompt} | gemini --yolo`.quiet()
        : await $`echo ${finalPrompt} | gemini`.quiet()
      return geminiResult.stdout.trim()
    default:
      throw new Error(`Unsupported AI agent: ${config.agent}`)
  }
}

export async function executeAIWithJsonOutput(
  prompt: string,
  options: { useLanguage?: boolean; yolo?: boolean } = {},
): Promise<string> {
  const { useLanguage = false, yolo = false } = options
  const config = await loadConfig()
  const language = useLanguage ? await getLanguage() : 'en'
  const finalPrompt = useLanguage
    ? createLanguagePrompt(prompt, language)
    : prompt

  switch (config.agent) {
    case 'claude':
      await checkClaudeCLI()
      const result = yolo
        ? await $`echo ${finalPrompt} | claude --dangerously-skip-permissions`.quiet()
        : await $`echo ${finalPrompt} | claude`.quiet()
      return extractJsonFromOutput(result.stdout.trim())
    case 'gemini':
      await checkGeminiCLI()
      const geminiResult = yolo
        ? await $`echo ${finalPrompt} | gemini --yolo`.quiet()
        : await $`echo ${finalPrompt} | gemini`.quiet()
      return extractJsonFromOutput(geminiResult.stdout.trim())
    default:
      throw new Error(`Unsupported AI agent: ${config.agent}`)
  }
}

function extractJsonFromOutput(output: string): string {
  // Find the JSON object in the output by looking for the first '{' and last '}'
  const firstBrace = output.indexOf('{')
  const lastBrace = output.lastIndexOf('}')

  if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
    throw new Error('No valid JSON object found in AI response')
  }

  return output.substring(firstBrace, lastBrace + 1)
}

async function checkClaudeCLI(): Promise<void> {
  try {
    await $`claude --version`.quiet()
  } catch {
    console.error('🤖 Claude CLI not found')
    console.error('Please install Claude Code: https://claude.ai/code')
    process.exit(1)
  }
}

async function checkGeminiCLI(): Promise<void> {
  try {
    await $`gemini --version`.quiet()
  } catch {
    console.error('🤖 Gemini CLI not found')
    console.error('Please install Gemini CLI')
    process.exit(1)
  }
}
