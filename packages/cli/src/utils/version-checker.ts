import { confirm } from '@inquirer/prompts'
import dayjs from 'dayjs'
import fs from 'node:fs'
import path from 'node:path'
import ora from 'ora'
import { run as ncu } from 'npm-check-updates'
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
 * Detect which package manager has the package installed globally
 */
async function detectPackageManager(
  packageName: string,
): Promise<'pnpm' | 'npm'> {
  // Try pnpm first
  try {
    await $`pnpm list -g ${packageName}`.quiet()
    return 'pnpm'
  } catch {
    // Fall back to npm
    return 'npm'
  }
}

/**
 * Check current package's latest version using npm-check-updates
 */
export async function checkLatestVersion(
  packageName: string,
): Promise<VersionCheckResult & { packageManager: 'pnpm' | 'npm' }> {
  try {
    // Detect which package manager was used to install the package
    const packageManager = await detectPackageManager(packageName)

    // Use npm-check-updates to check for global package updates
    // Must specify packageManager to check the correct global directory
    // Returns { "package-name": "1.9.10" } if update available, {} if not
    const upgraded = (await ncu({
      global: true,
      filter: packageName,
      packageManager,
      silent: true,
    })) as Record<string, string> | undefined

    const latest = upgraded?.[packageName]
    const hasUpdate = !!latest

    return {
      current: hasUpdate ? 'installed' : 'up-to-date',
      latest: latest || 'up-to-date',
      hasUpdate,
      packageManager,
    }
  } catch (error) {
    console.error('Failed to check latest version: ', error)
    throw error
  }
}

/**
 * Check version and prompt for upgrade
 */
export async function promptForUpdate(
  packageName: string,
): Promise<{ shouldUpdate: boolean; packageManager: 'pnpm' | 'npm' }> {
  try {
    const versionInfo = await checkLatestVersion(packageName)

    if (versionInfo.hasUpdate) {
      const shouldUpdate = await confirm({
        message: `New ${packageName} version ${versionInfo.latest} available. Upgrade now?`,
        default: true,
      })

      return { shouldUpdate, packageManager: versionInfo.packageManager }
    } else {
      return { shouldUpdate: false, packageManager: versionInfo.packageManager }
    }
  } catch (error) {
    console.error('Failed to prompt for update: ', error)
    throw error
  }
}

/**
 * Execute package upgrade using the detected package manager
 */
export async function upgradePackage(
  packageName: string,
  packageManager: 'pnpm' | 'npm',
): Promise<boolean> {
  const spinner = ora(`Installing ${packageName}@latest...`).start()

  try {
    if (packageManager === 'pnpm') {
      await $`pnpm add -g ${packageName}@latest`
    } else {
      await $`npm install -g ${packageName}@latest`
    }
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

  const { shouldUpdate, packageManager } = await promptForUpdate(packageName)

  updateLastCheckTimestamp()

  if (shouldUpdate) {
    const success = await upgradePackage(packageName, packageManager)
    if (success) {
      process.exit(0)
    }
  }
}
