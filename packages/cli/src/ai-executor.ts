import { $ } from 'zx'
import { loadConfig } from './config'

export async function executeAICommand(prompt: string): Promise<void> {
  const config = await loadConfig()

  switch (config.agent) {
    case 'claude':
      await checkClaudeCLI()
      await $({ stdio: 'inherit' })`claude ${prompt}`
      break
    case 'gemini':
      await checkGeminiCLI()
      await $({ stdio: 'inherit' })`gemini -i ${prompt}`
      break
    default:
      throw new Error(`Unsupported AI agent: ${config.agent}`)
  }
}

export async function executeAIWithOutput(prompt: string): Promise<string> {
  const config = await loadConfig()

  switch (config.agent) {
    case 'claude':
      await checkClaudeCLI()
      const result = await $`echo ${prompt} | claude`.quiet()
      return extractJsonFromOutput(result.stdout.trim())
    case 'gemini':
      await checkGeminiCLI()
      const geminiResult = await $`echo ${prompt} | gemini`.quiet()
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
