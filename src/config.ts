import { $ } from 'zx'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

export interface GitPrAiConfig {
  agent: 'claude' | 'gemini'
}

const DEFAULT_CONFIG: GitPrAiConfig = {
  agent: 'claude',
}

export async function loadConfig(): Promise<GitPrAiConfig> {
  const configPath = join(process.cwd(), '.git-pr-ai.json')
  let config = { ...DEFAULT_CONFIG }

  if (existsSync(configPath)) {
    try {
      const configContent = readFileSync(configPath, 'utf8')
      const fileConfig = JSON.parse(configContent)
      config = { ...config, ...fileConfig }
    } catch {
      console.warn(
        '⚠️ Failed to parse .git-pr-ai.json, using default configuration',
      )
    }
  }

  const envAgent = process.env.GIT_PR_AI_AGENT
  if (envAgent === 'claude' || envAgent === 'gemini') {
    config.agent = envAgent
  }

  return config
}

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

async function checkClaudeCLI(): Promise<void> {
  try {
    await $`claude --version`.quiet()
  } catch {
    console.error('❌ Claude CLI not found')
    console.error('Please install Claude Code: https://claude.ai/code')
    process.exit(1)
  }
}

async function checkGeminiCLI(): Promise<void> {
  try {
    await $`gemini --version`.quiet()
  } catch {
    console.error('❌ Gemini CLI not found')
    console.error('Please install Gemini CLI')
    process.exit(1)
  }
}
