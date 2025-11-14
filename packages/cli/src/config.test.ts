import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import {
  loadConfig,
  getConfigPath,
  getConfigDir,
  getModelForCommand,
  CONFIG_FILENAME,
  type GitPrAiConfig,
} from './config'

// Mock fs module
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}))

// Mock os module
vi.mock('os', () => ({
  homedir: vi.fn(() => '/mock/home'),
}))

// Mock path module
vi.mock('path', () => ({
  join: vi.fn((...paths: string[]) => paths.join('/')),
}))

describe('Config', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getConfigPath', () => {
    it('should return correct config path', () => {
      const result = getConfigPath()
      expect(join).toHaveBeenCalledWith(
        '/mock/home',
        '.git-pr-ai',
        CONFIG_FILENAME,
      )
      expect(result).toBe('/mock/home/.git-pr-ai/.git-pr-ai.json')
    })
  })

  describe('getConfigDir', () => {
    it('should return correct config directory', () => {
      const result = getConfigDir()
      expect(join).toHaveBeenCalledWith('/mock/home', '.git-pr-ai')
      expect(result).toBe('/mock/home/.git-pr-ai')
    })
  })

  describe('loadConfig', () => {
    it('should return default config when file does not exist', async () => {
      vi.mocked(existsSync).mockReturnValue(false)

      const config = await loadConfig()

      expect(config).toEqual({
        agent: 'claude',
      })
    })

    it('should merge config from file with defaults', async () => {
      const mockConfig = {
        agent: 'gemini',
        jira: {
          baseUrl: 'https://example.atlassian.net',
          email: 'test@example.com',
          apiToken: 'token123',
        },
      }

      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockConfig))

      const config = await loadConfig()

      expect(config).toEqual(mockConfig)
    })

    it('should handle invalid JSON and return default config', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue('invalid json')

      const config = await loadConfig()

      expect(config).toEqual({
        agent: 'claude',
      })
      expect(consoleSpy).toHaveBeenCalledWith(
        '⚠️ Failed to parse .git-pr-ai.json, using default configuration',
      )

      consoleSpy.mockRestore()
    })
  })

  describe('getModelForCommand', () => {
    it('should return model for specific command and agent', () => {
      const config: GitPrAiConfig = {
        agent: 'claude',
        model: {
          createBranch: {
            claude: 'haiku',
            gemini: 'gemini-2.5-flash',
          },
        },
      }

      expect(getModelForCommand(config, 'createBranch')).toBe('haiku')
    })

    it('should return undefined if command has no model config', () => {
      const config: GitPrAiConfig = {
        agent: 'claude',
      }

      expect(getModelForCommand(config, 'createBranch')).toBeUndefined()
    })

    it('should return undefined if command config exists but agent not specified', () => {
      const config: GitPrAiConfig = {
        agent: 'claude',
        model: {
          createBranch: {
            gemini: 'gemini-2.5-flash',
          },
        },
      }

      expect(getModelForCommand(config, 'createBranch')).toBeUndefined()
    })

    it('should return correct model for different agents', () => {
      const config: GitPrAiConfig = {
        agent: 'gemini',
        model: {
          createBranch: {
            claude: 'haiku',
            gemini: 'gemini-2.5-flash',
          },
        },
      }

      expect(getModelForCommand(config, 'createBranch')).toBe(
        'gemini-2.5-flash',
      )
    })

    it('should handle multiple commands with different models', () => {
      const config: GitPrAiConfig = {
        agent: 'claude',
        model: {
          createBranch: {
            claude: 'haiku',
          },
          prReview: {
            claude: 'sonnet',
          },
        },
      }

      expect(getModelForCommand(config, 'createBranch')).toBe('haiku')
      expect(getModelForCommand(config, 'prReview')).toBe('sonnet')
      expect(getModelForCommand(config, 'aiCommit')).toBeUndefined()
    })

    it('should handle all supported agents', () => {
      const config: GitPrAiConfig = {
        agent: 'cursor-agent',
        model: {
          createBranch: {
            claude: 'haiku',
            gemini: 'gemini-2.5-flash',
            'cursor-agent': 'cursor-model',
            codex: 'codex-model',
          },
        },
      }

      expect(getModelForCommand(config, 'createBranch')).toBe('cursor-model')

      // Test with different agents
      config.agent = 'codex'
      expect(getModelForCommand(config, 'createBranch')).toBe('codex-model')
    })
  })
})
