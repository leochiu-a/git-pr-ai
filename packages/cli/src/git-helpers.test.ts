import { describe, it, expect, vi, beforeEach } from 'vitest'
import { $ } from 'zx'
import { getCurrentProvider } from './providers/factory'
import type { GitProvider } from './providers/types'
import {
  getCurrentBranch,
  getDefaultBranch,
  checkGitCLI,
  getLanguage,
  setLanguage,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
} from './git-helpers'

// Mock result type for zx commands
interface MockCommandResult {
  stdout: string
  stderr?: string
  exitCode?: number
}

// Mock zx
vi.mock('zx')

// Mock providers/factory
vi.mock('./providers/factory', () => ({
  getCurrentProvider: vi.fn(),
}))

const mockZx = vi.mocked($)

describe('Git Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCurrentBranch', () => {
    it('should return current branch name', async () => {
      const mockResult: MockCommandResult = { stdout: 'feature/test-branch\n' }
      mockZx.mockResolvedValue(mockResult)

      const result = await getCurrentBranch()

      expect(result).toBe('feature/test-branch')
    })

    it('should trim whitespace from branch name', async () => {
      const mockResult: MockCommandResult = { stdout: '  main  \n' }
      mockZx.mockResolvedValue(mockResult)

      const result = await getCurrentBranch()

      expect(result).toBe('main')
    })
  })

  describe('getDefaultBranch', () => {
    it('should return default branch from provider', async () => {
      const mockProvider: Partial<GitProvider> = {
        getDefaultBranch: vi.fn().mockResolvedValue('main'),
      }
      vi.mocked(getCurrentProvider).mockResolvedValue(
        mockProvider as GitProvider,
      )

      const result = await getDefaultBranch()

      expect(result).toBe('main')
      expect(mockProvider.getDefaultBranch).toHaveBeenCalled()
    })
  })

  describe('checkGitCLI', () => {
    it('should check CLI availability through provider', async () => {
      const mockProvider: Partial<GitProvider> = {
        checkCLI: vi.fn().mockResolvedValue(true),
      }
      vi.mocked(getCurrentProvider).mockResolvedValue(
        mockProvider as GitProvider,
      )

      const result = await checkGitCLI()

      expect(result).toBe(true)
      expect(mockProvider.checkCLI).toHaveBeenCalled()
    })
  })

  describe('SUPPORTED_LANGUAGES', () => {
    it('should have correct supported languages', () => {
      expect(SUPPORTED_LANGUAGES).toEqual({
        en: 'English',
        'zh-TW': '繁體中文 (Traditional Chinese)',
      })
    })
  })

  describe('getLanguage', () => {
    it('should return configured language', async () => {
      const mockResult: MockCommandResult = { stdout: 'zh-TW\n' }
      mockZx.mockResolvedValue(mockResult)

      const result = await getLanguage()

      expect(result).toBe('zh-TW')
    })

    it('should return english for valid language', async () => {
      const mockResult: MockCommandResult = { stdout: 'en\n' }
      mockZx.mockResolvedValue(mockResult)

      const result = await getLanguage()

      expect(result).toBe('en')
    })

    it('should return default language for invalid configured language', async () => {
      const mockResult: MockCommandResult = { stdout: 'invalid-language\n' }
      mockZx.mockResolvedValue(mockResult)

      const result = await getLanguage()

      expect(result).toBe(DEFAULT_LANGUAGE)
    })

    it('should return default language for empty response', async () => {
      const mockResult: MockCommandResult = { stdout: '\n' }
      mockZx.mockResolvedValue(mockResult)

      const result = await getLanguage()

      expect(result).toBe(DEFAULT_LANGUAGE)
    })

    it('should return default language when git config fails', async () => {
      mockZx.mockRejectedValue(new Error('Git config failed'))

      const result = await getLanguage()

      expect(result).toBe(DEFAULT_LANGUAGE)
    })
  })

  describe('setLanguage', () => {
    it('should set language successfully', async () => {
      const mockResult: MockCommandResult = { stdout: '' }
      mockZx.mockResolvedValue(mockResult)

      await expect(setLanguage('zh-TW')).resolves.toBeUndefined()
    })

    it('should handle git config errors', async () => {
      mockZx.mockRejectedValue(new Error('Permission denied'))

      await expect(setLanguage('en')).rejects.toThrow('Permission denied')
    })
  })
})
