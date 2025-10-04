import { confirm } from '@inquirer/prompts'
import dayjs from 'dayjs'
import fs from 'node:fs'
import path from 'node:path'
import ora from 'ora'
import { $ } from 'zx'
import { getConfigDir } from '../config'

interface VersionCheckResult {
  current: string
  latest: string
  hasUpdate: boolean
}

interface LastCheckData {
  timestamp: number
}

/**
 * Check current package's latest version
 */
export async function checkLatestVersion(
  packageName: string,
): Promise<VersionCheckResult> {
  try {
    // Get current version
    const currentVersionResult =
      await $`npm list ${packageName} --global --depth=0 --json`.quiet()
    const currentData = JSON.parse(currentVersionResult.stdout)
    const current =
      currentData.dependencies?.[packageName]?.version || 'unknown'

    // Get latest version
    const latestVersionResult = await $`npm view ${packageName} version`.quiet()
    const latest = latestVersionResult.stdout.trim()

    const hasUpdate = current !== latest && current !== 'unknown'

    return {
      current: current === 'unknown' ? 'not installed' : current,
      latest,
      hasUpdate,
    }
  } catch (error) {
    console.error('Failed to check latest version: ', error)
    throw error
  }
}

/**
 * Check version and prompt for upgrade
 */
export async function promptForUpdate(packageName: string): Promise<boolean> {
  try {
    const versionInfo = await checkLatestVersion(packageName)

    if (versionInfo.hasUpdate) {
      const shouldUpdate = await confirm({
        message: `New ${packageName} version available (${versionInfo.current} → ${versionInfo.latest}). Upgrade now?`,
        default: true,
      })

      return shouldUpdate
    } else {
      return false
    }
  } catch (error) {
    console.error('Failed to prompt for update: ', error)
    throw error
  }
}

/**
 * Execute package upgrade
 */
export async function upgradePackage(packageName: string): Promise<boolean> {
  const spinner = ora(`Installing ${packageName}@latest...`).start()

  try {
    await $`npm install -g ${packageName}@latest`
    spinner.succeed(`Successfully upgraded ${packageName}!`)
    return true
  } catch (error) {
    spinner.fail('Failed to upgrade package')
    console.error(error)
    throw error
  }
}

/**
 * Get the path to the last version check config file
 */
function getLastVersionCheckPath(): string {
  return path.join(getConfigDir(), 'last-version-check.json')
}

/**
 * Check if version check was performed today
 */
function shouldCheckVersion(): boolean {
  const filePath = getLastVersionCheckPath()

  if (!fs.existsSync(filePath)) {
    return true
  }

  try {
    const data: LastCheckData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    const lastCheck = dayjs(data.timestamp)
    const today = dayjs()

    // Check if it's a different day
    return !lastCheck.isSame(today, 'day')
  } catch {
    return true
  }
}

/**
 * Update the last check timestamp
 */
function updateLastCheckTimestamp(): void {
  const filePath = getLastVersionCheckPath()
  const configDir = getConfigDir()

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true })
  }

  const data: LastCheckData = {
    timestamp: Date.now(),
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

/**
 * Main function to check version and upgrade
 */
export async function checkAndUpgrade(
  packageName: string = 'git-pr-ai',
): Promise<void> {
  if (!shouldCheckVersion()) {
    return
  }

  const shouldUpdate = await promptForUpdate(packageName)

  updateLastCheckTimestamp()

  if (shouldUpdate) {
    const success = await upgradePackage(packageName)
    if (success) {
      process.exit(0)
    }
  }
}
