import { $ } from 'zx'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

export interface GitPrAiConfig {
  agent: 'claude' | 'gemini'
  jira?: {
    baseUrl: string
    email: string
    apiToken: string
  }
}

const DEFAULT_CONFIG: GitPrAiConfig = {
  agent: 'claude',
}

export const CONFIG_FILENAME = '.git-pr-ai.json'

export function getConfigPath(): string {
  return join(homedir(), '.git-pr-ai', CONFIG_FILENAME)
}

export function getConfigDir(): string {
  return join(homedir(), '.git-pr-ai')
}

export async function loadConfig(): Promise<GitPrAiConfig> {
  const configPath = getConfigPath()
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

export async function executeAIWithOutput(prompt: string): Promise<string> {
  const config = await loadConfig()

  switch (config.agent) {
    case 'claude':
      await checkClaudeCLI()
      const result = await $`echo ${prompt} | claude`.quiet()
      return result.stdout.trim()
    case 'gemini':
      await checkGeminiCLI()
      const geminiResult = await $`echo ${prompt} | gemini`.quiet()
      return geminiResult.stdout.trim()
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
