import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import { type AIAgent } from './constants/agents'

export interface GitPrAiConfig {
  agent: AIAgent
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
