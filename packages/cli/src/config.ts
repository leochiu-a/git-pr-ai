import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import { type AIAgent } from './constants/agents'

export interface CommandModelConfig {
  gemini?: string
  claude?: string
  'cursor-agent'?: string
  codex?: string
}

export type CommandName =
  | 'createBranch'
  | 'aiCommit'
  | 'prReview'
  | 'updatePrDesc'
  | 'planIssue'
  | 'takeIssue'

export interface GitPrAiConfig {
  agent: AIAgent
  model?: {
    createBranch?: CommandModelConfig
    aiCommit?: CommandModelConfig
    prReview?: CommandModelConfig
    updatePrDesc?: CommandModelConfig
    planIssue?: CommandModelConfig
    takeIssue?: CommandModelConfig
  }
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

/**
 * Get the model configuration for a specific command based on the current agent
 * @param config - The Git PR AI configuration
 * @param commandName - The name of the command
 * @returns The model string if configured, undefined otherwise
 */
export function getModelForCommand(
  config: GitPrAiConfig,
  commandName: CommandName,
): string | undefined {
  return config.model?.[commandName]?.[config.agent]
}
