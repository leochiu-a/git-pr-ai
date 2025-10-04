import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { $ } from 'zx'
import { confirm } from '@inquirer/prompts'
import ora from 'ora'
import fs from 'node:fs'
import dayjs from 'dayjs'
import {
  checkLatestVersion,
  promptForUpdate,
  upgradePackage,
  checkAndUpgrade,
} from './version-checker'
import { getConfigDir } from '../config'

// Mock dependencies
vi.mock('zx')
vi.mock('@inquirer/prompts')
vi.mock('ora')
vi.mock('node:fs')
vi.mock('dayjs')
vi.mock('../config')

const mockZx = vi.mocked($)
const mockConfirm = vi.mocked(confirm)
const mockOra = vi.mocked(ora)
const mockFs = vi.mocked(fs)
const mockDayjs = vi.mocked(dayjs)
const mockGetConfigDir = vi.mocked(getConfigDir)

// Mock ora spinner
const mockSpinner = {
  start: vi.fn().mockReturnThis(),
  succeed: vi.fn().mockReturnThis(),
  fail: vi.fn().mockReturnThis(),
}

// Helper to create zx mock with .quiet() support
const createZxMock = (stdout: string) => ({
  quiet: vi.fn().mockResolvedValue({ stdout }),
})

describe('version-checker', () => {
  beforeEach(() => {
    // Reset spinner functions
    mockSpinner.start.mockClear().mockReturnThis()
    mockSpinner.succeed.mockClear().mockReturnThis()
    mockSpinner.fail.mockClear().mockReturnThis()

    vi.clearAllMocks()
    // Always return the spinner mock after clearing
    mockOra.mockReturnValue(mockSpinner as any)
    mockGetConfigDir.mockReturnValue('/mock/.git-pr-ai')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('checkLatestVersion', () => {
    it('should return version info when package is installed and update available', async () => {
      // Mock current version check
      mockZx.mockReturnValueOnce(
        createZxMock(
          JSON.stringify({
            dependencies: {
              'git-pr-ai': {
                version: '1.9.5',
              },
            },
          }),
        ) as any,
      )

      // Mock latest version check
      mockZx.mockReturnValueOnce(createZxMock('1.9.6\n') as any)

      const result = await checkLatestVersion('git-pr-ai')

      expect(result).toEqual({
        current: '1.9.5',
        latest: '1.9.6',
        hasUpdate: true,
      })
    })

    it('should return no update when versions are the same', async () => {
      // Mock current version check
      mockZx.mockReturnValueOnce(
        createZxMock(
          JSON.stringify({
            dependencies: {
              'git-pr-ai': {
                version: '1.9.6',
              },
            },
          }),
        ) as any,
      )

      // Mock latest version check
      mockZx.mockReturnValueOnce(createZxMock('1.9.6\n') as any)

      const result = await checkLatestVersion('git-pr-ai')

      expect(result).toEqual({
        current: '1.9.6',
        latest: '1.9.6',
        hasUpdate: false,
      })
    })

    it('should return not installed when package is not found', async () => {
      // Mock current version check (package not found)
      mockZx.mockReturnValueOnce(
        createZxMock(
          JSON.stringify({
            dependencies: {},
          }),
        ) as any,
      )

      // Mock latest version check
      mockZx.mockReturnValueOnce(createZxMock('1.9.6\n') as any)

      const result = await checkLatestVersion('git-pr-ai')

      expect(result).toEqual({
        current: 'not installed',
        latest: '1.9.6',
        hasUpdate: false,
      })
    })

    it('should throw error when npm commands fail', async () => {
      mockZx.mockReturnValueOnce({
        quiet: vi.fn().mockRejectedValueOnce(new Error('npm command failed')),
      } as any)

      await expect(checkLatestVersion('git-pr-ai')).rejects.toThrow(
        'npm command failed',
      )
    })
  })

  describe('promptForUpdate', () => {
    it('should prompt for update when update is available', async () => {
      // Mock version check
      mockZx
        .mockReturnValueOnce(
          createZxMock(
            JSON.stringify({
              dependencies: { 'git-pr-ai': { version: '1.9.5' } },
            }),
          ) as any,
        )
        .mockReturnValueOnce(createZxMock('1.9.6\n') as any)

      // Mock user confirmation
      mockConfirm.mockResolvedValueOnce(true)

      const result = await promptForUpdate('git-pr-ai')

      expect(result).toBe(true)
      expect(mockConfirm).toHaveBeenCalledWith({
        message:
          'New git-pr-ai version available (1.9.5 → 1.9.6). Upgrade now?',
        default: true,
      })
    })

    it('should return false when no update is available', async () => {
      // Mock version check (same versions)
      mockZx
        .mockReturnValueOnce(
          createZxMock(
            JSON.stringify({
              dependencies: { 'git-pr-ai': { version: '1.9.6' } },
            }),
          ) as any,
        )
        .mockReturnValueOnce(createZxMock('1.9.6\n') as any)

      const result = await promptForUpdate('git-pr-ai')

      expect(result).toBe(false)
      expect(mockConfirm).not.toHaveBeenCalled()
    })

    it('should return false when user declines update', async () => {
      // Mock version check
      mockZx
        .mockReturnValueOnce(
          createZxMock(
            JSON.stringify({
              dependencies: { 'git-pr-ai': { version: '1.9.5' } },
            }),
          ) as any,
        )
        .mockReturnValueOnce(createZxMock('1.9.6\n') as any)

      // Mock user declining
      mockConfirm.mockResolvedValueOnce(false)

      const result = await promptForUpdate('git-pr-ai')

      expect(result).toBe(false)
    })

    it('should throw error when version check fails', async () => {
      mockZx.mockReturnValueOnce({
        quiet: vi.fn().mockRejectedValueOnce(new Error('Version check failed')),
      } as any)

      await expect(promptForUpdate('git-pr-ai')).rejects.toThrow(
        'Version check failed',
      )
    })
  })

  describe('upgradePackage', () => {
    it('should return true when upgrade succeeds', async () => {
      mockZx.mockResolvedValueOnce({} as any)

      const result = await upgradePackage('git-pr-ai')

      expect(result).toBe(true)
      expect(mockOra).toHaveBeenCalledWith('Installing git-pr-ai@latest...')
      expect(mockSpinner.start).toHaveBeenCalled()
      expect(mockSpinner.succeed).toHaveBeenCalledWith(
        'Successfully upgraded git-pr-ai!',
      )
    })

    it('should throw error when upgrade fails', async () => {
      mockZx.mockRejectedValueOnce(new Error('npm install failed'))

      await expect(upgradePackage('git-pr-ai')).rejects.toThrow(
        'npm install failed',
      )
      expect(mockSpinner.fail).toHaveBeenCalledWith('Failed to upgrade package')
    })
  })

  describe('checkAndUpgrade', () => {
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(((code) => {
      throw new Error(`process.exit unexpectedly called with "${code}"`)
    }) as any)

    afterEach(() => {
      mockExit.mockClear()
    })

    it('should upgrade and exit when user confirms', async () => {
      // Mock file not exists (shouldCheckVersion returns true)
      mockFs.existsSync.mockReturnValue(false)

      // Mock version check showing update available
      mockZx
        .mockReturnValueOnce(
          createZxMock(
            JSON.stringify({
              dependencies: { 'git-pr-ai': { version: '1.9.5' } },
            }),
          ) as any,
        )
        .mockReturnValueOnce(createZxMock('1.9.6\n') as any)
        // Mock upgrade success (no .quiet() for npm install)
        .mockResolvedValueOnce({} as any)

      // Mock user confirming
      mockConfirm.mockResolvedValueOnce(true)

      // Expect process.exit to throw our mocked error
      await expect(checkAndUpgrade()).rejects.toThrow(
        'process.exit unexpectedly called with "0"',
      )
    })

    it('should not upgrade when user declines', async () => {
      // Mock version check showing update available
      mockZx
        .mockReturnValueOnce(
          createZxMock(
            JSON.stringify({
              dependencies: { 'git-pr-ai': { version: '1.9.5' } },
            }),
          ) as any,
        )
        .mockReturnValueOnce(createZxMock('1.9.6\n') as any)

      // Mock user declining
      mockConfirm.mockResolvedValueOnce(false)

      await checkAndUpgrade()

      expect(mockExit).not.toHaveBeenCalled()
      // Verify npm install was not called (only 2 calls for version checks)
      expect(mockZx).toHaveBeenCalledTimes(2)
    })

    it('should not upgrade when no update is available', async () => {
      // Mock version check showing no update
      mockZx
        .mockReturnValueOnce(
          createZxMock(
            JSON.stringify({
              dependencies: { 'git-pr-ai': { version: '1.9.6' } },
            }),
          ) as any,
        )
        .mockReturnValueOnce(createZxMock('1.9.6\n') as any)

      await checkAndUpgrade()

      expect(mockConfirm).not.toHaveBeenCalled()
      expect(mockExit).not.toHaveBeenCalled()
    })

    it('should use custom package name when provided', async () => {
      // Mock file not exists (shouldCheckVersion returns true)
      mockFs.existsSync.mockReturnValue(false)

      // Mock version check for custom package
      mockZx
        .mockReturnValueOnce(
          createZxMock(
            JSON.stringify({
              dependencies: { 'custom-pkg': { version: '1.0.0' } },
            }),
          ) as any,
        )
        .mockReturnValueOnce(createZxMock('1.0.1\n') as any)
        // Mock upgrade success (no .quiet() for npm install)
        .mockResolvedValueOnce({} as any)

      mockConfirm.mockResolvedValueOnce(true)

      // Expect process.exit to throw our mocked error
      await expect(checkAndUpgrade('custom-pkg')).rejects.toThrow(
        'process.exit unexpectedly called with "0"',
      )
    })

    it('should skip check when already checked today', async () => {
      const mockToday = {
        isSame: vi.fn().mockReturnValue(true),
      }

      // Mock file exists and contains today's timestamp
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue(
        JSON.stringify({ timestamp: Date.now() }),
      )
      mockDayjs.mockReturnValue(mockToday as unknown)

      await checkAndUpgrade()

      // Should not call version check or prompt
      expect(mockZx).not.toHaveBeenCalled()
      expect(mockConfirm).not.toHaveBeenCalled()
    })

    it('should check when last check was on a different day', async () => {
      const mockLastCheck = {
        isSame: vi.fn().mockReturnValue(false),
      }
      const mockToday = {}

      // Mock file exists with yesterday's timestamp
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue(
        JSON.stringify({ timestamp: Date.now() - 86400000 }), // 1 day ago
      )
      mockDayjs.mockReturnValueOnce(mockLastCheck as unknown)
      mockDayjs.mockReturnValueOnce(mockToday as unknown)

      // Mock no update available
      mockZx
        .mockReturnValueOnce(
          createZxMock(
            JSON.stringify({
              dependencies: { 'git-pr-ai': { version: '1.9.6' } },
            }),
          ) as any,
        )
        .mockReturnValueOnce(createZxMock('1.9.6\n') as any)

      await checkAndUpgrade()

      // Should perform version check
      expect(mockZx).toHaveBeenCalledTimes(2)
      // Should update timestamp
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/mock/.git-pr-ai/last-version-check.json',
        expect.stringContaining('timestamp'),
      )
    })

    it('should check when last-version-check.json does not exist', async () => {
      // Mock file does not exist
      mockFs.existsSync.mockReturnValue(false)

      // Mock no update available
      mockZx
        .mockReturnValueOnce(
          createZxMock(
            JSON.stringify({
              dependencies: { 'git-pr-ai': { version: '1.9.6' } },
            }),
          ) as any,
        )
        .mockReturnValueOnce(createZxMock('1.9.6\n') as any)

      await checkAndUpgrade()

      // Should perform version check
      expect(mockZx).toHaveBeenCalledTimes(2)
    })

    it('should update timestamp after checking for updates', async () => {
      // Mock file does not exist
      mockFs.existsSync.mockReturnValueOnce(false) // for shouldCheckVersion
      mockFs.existsSync.mockReturnValueOnce(false) // for updateLastCheckTimestamp - dir check

      // Mock no update available
      mockZx
        .mockReturnValueOnce(
          createZxMock(
            JSON.stringify({
              dependencies: { 'git-pr-ai': { version: '1.9.6' } },
            }),
          ) as any,
        )
        .mockReturnValueOnce(createZxMock('1.9.6\n') as any)

      await checkAndUpgrade()

      // Should create config directory
      expect(mockFs.mkdirSync).toHaveBeenCalledWith('/mock/.git-pr-ai', {
        recursive: true,
      })

      // Should write timestamp file
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/mock/.git-pr-ai/last-version-check.json',
        expect.stringContaining('timestamp'),
      )
    })
  })
})
