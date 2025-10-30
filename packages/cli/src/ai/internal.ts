import { $ } from 'zx'
import { loadConfig } from '../config'
import { getLanguage } from '../git-helpers'
import { createLanguagePrompt } from '../language-prompts'

export async function executeAIInternal(
  prompt: string,
  options?: {
    useLanguage?: boolean
    yolo?: boolean
    outputType?: 'inherit'
  },
): Promise<void>
export async function executeAIInternal(
  prompt: string,
  options: {
    useLanguage?: boolean
    yolo?: boolean
    outputType: 'capture' | 'json'
  },
): Promise<string>
export async function executeAIInternal(
  prompt: string,
  options: {
    useLanguage?: boolean
    yolo?: boolean
    outputType?: 'inherit' | 'capture' | 'json'
  } = {},
): Promise<string | void> {
  const { useLanguage = true, yolo = false, outputType = 'inherit' } = options
  const config = await loadConfig()
  const language = useLanguage ? await getLanguage() : 'en'
  const finalPrompt = useLanguage
    ? createLanguagePrompt(prompt, language)
    : prompt

  switch (config.agent) {
    case 'claude':
      await checkClaudeCLI()
      break
    case 'gemini':
      await checkGeminiCLI()
      break
    default:
      throw new Error(`Unsupported AI agent: ${config.agent}`)
  }

  if (outputType === 'inherit') {
    await runAICommand(config.agent, finalPrompt, yolo)
    return
  } else {
    const output = await runAICommandWithOutput(config.agent, finalPrompt, yolo)
    return outputType === 'json' ? extractJsonFromOutput(output) : output
  }
}

async function runAICommand(
  agent: string,
  prompt: string,
  yolo: boolean,
): Promise<void> {
  if (yolo) {
    if (agent === 'claude') {
      await $({
        stdio: 'inherit',
      })`claude --dangerously-skip-permissions ${prompt}`
    } else {
      await $({
        stdio: 'inherit',
      })`gemini --yolo --prompt-interactive ${prompt}`
    }
  } else {
    if (agent === 'claude') {
      await $({ stdio: 'inherit' })`claude ${prompt}`
    } else {
      await $({ stdio: 'inherit' })`gemini --prompt-interactive ${prompt}`
    }
  }
}

async function runAICommandWithOutput(
  agent: string,
  prompt: string,
  yolo: boolean,
): Promise<string> {
  let result

  if (yolo) {
    if (agent === 'claude') {
      result = await $({
        input: prompt,
      })`claude --dangerously-skip-permissions`.quiet()
    } else {
      result = await $({ input: prompt })`gemini --yolo`.quiet()
    }
  } else {
    if (agent === 'claude') {
      result = await $({ input: prompt })`claude`.quiet()
    } else {
      result = await $({ input: prompt })`gemini`.quiet()
    }
  }

  return result.stdout.trim()
}

function extractJsonFromOutput(output: string): string {
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
