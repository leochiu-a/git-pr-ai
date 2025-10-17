import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { $ } from 'zx'
import { confirm } from '@inquirer/prompts'
import ora from 'ora'
import fs from 'node:fs'
import dayjs from 'dayjs'
import { run as ncu } from 'npm-check-updates'
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
vi.mock('npm-check-updates')

const mockZx = vi.mocked($)
const mockConfirm = vi.mocked(confirm)
const mockOra = vi.mocked(ora)
const mockFs = vi.mocked(fs)
const mockDayjs = vi.mocked(dayjs)
const mockGetConfigDir = vi.mocked(getConfigDir)
const mockNcu = vi.mocked(ncu)

// Mock ora spinner
const mockSpinner = {
  start: vi.fn().mockReturnThis(),
  succeed: vi.fn().mockReturnThis(),
  fail: vi.fn().mockReturnThis(),
}

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
    it('should return version info when update is available', async () => {
      // Mock ncu returning an update
      mockNcu.mockResolvedValueOnce({ 'git-pr-ai': '1.9.6' } as any)

      const result = await checkLatestVersion('git-pr-ai')

      expect(result).toEqual({
        current: 'installed',
        latest: '1.9.6',
        hasUpdate: true,
      })
      expect(mockNcu).toHaveBeenCalledWith({
        global: true,
        filter: 'git-pr-ai',
        silent: true,
      })
    })

    it('should return up-to-date when no update available', async () => {
      // Mock ncu returning no updates (empty object)
      mockNcu.mockResolvedValueOnce({} as any)

      const result = await checkLatestVersion('git-pr-ai')

      expect(result).toEqual({
        current: 'up-to-date',
        latest: 'up-to-date',
        hasUpdate: false,
      })
    })

    it('should throw error when ncu fails', async () => {
      mockNcu.mockRejectedValueOnce(new Error('Network error'))

      await expect(checkLatestVersion('git-pr-ai')).rejects.toThrow(
        'Network error',
      )
    })
  })

  describe('promptForUpdate', () => {
    it('should prompt for update when update is available', async () => {
      // Mock ncu returning an update
      mockNcu.mockResolvedValueOnce({ 'git-pr-ai': '1.9.6' } as any)

      // Mock user confirmation
      mockConfirm.mockResolvedValueOnce(true)

      const result = await promptForUpdate('git-pr-ai')

      expect(result).toBe(true)
      expect(mockConfirm).toHaveBeenCalledWith({
        message: 'New git-pr-ai version 1.9.6 available. Upgrade now?',
        default: true,
      })
    })

    it('should return false when no update is available', async () => {
      // Mock ncu returning no updates
      mockNcu.mockResolvedValueOnce({} as any)

      const result = await promptForUpdate('git-pr-ai')

      expect(result).toBe(false)
      expect(mockConfirm).not.toHaveBeenCalled()
    })

    it('should return false when user declines update', async () => {
      // Mock ncu returning an update
      mockNcu.mockResolvedValueOnce({ 'git-pr-ai': '1.9.6' } as any)

      // Mock user declining
      mockConfirm.mockResolvedValueOnce(false)

      const result = await promptForUpdate('git-pr-ai')

      expect(result).toBe(false)
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
      mockNcu.mockResolvedValueOnce({ 'git-pr-ai': '1.9.6' } as any)
      // Mock upgrade success
      mockZx.mockResolvedValueOnce({} as any)

      // Mock user confirming
      mockConfirm.mockResolvedValueOnce(true)

      // Expect process.exit to throw our mocked error
      await expect(checkAndUpgrade()).rejects.toThrow(
        'process.exit unexpectedly called with "0"',
      )
    })

    it('should not upgrade when user declines', async () => {
      // Mock version check showing update available
      mockNcu.mockResolvedValueOnce({ 'git-pr-ai': '1.9.6' } as any)

      // Mock user declining
      mockConfirm.mockResolvedValueOnce(false)

      await checkAndUpgrade()

      expect(mockExit).not.toHaveBeenCalled()
    })

    it('should not upgrade when no update is available', async () => {
      // Mock version check showing no update
      mockNcu.mockResolvedValueOnce({} as any)

      await checkAndUpgrade()

      expect(mockConfirm).not.toHaveBeenCalled()
      expect(mockExit).not.toHaveBeenCalled()
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
      expect(mockNcu).not.toHaveBeenCalled()
      expect(mockConfirm).not.toHaveBeenCalled()
    })

    it('should update timestamp after checking for updates', async () => {
      // Mock file does not exist
      mockFs.existsSync.mockReturnValueOnce(false) // for shouldCheckVersion
      mockFs.existsSync.mockReturnValueOnce(false) // for updateLastCheckTimestamp - dir check

      // Mock no update available
      mockNcu.mockResolvedValueOnce({})

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
