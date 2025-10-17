import { confirm } from '@inquirer/prompts'
import dayjs from 'dayjs'
import fs from 'node:fs'
import path from 'node:path'
import ora from 'ora'
import latestVersion from 'latest-version'
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
    // Get latest version from npm registry using latest-version package
    const latest = await latestVersion(packageName)

    // Get current version by finding the actual executable and reading its package.json
    // This avoids issues with monorepo and local workspaces
    let current = 'unknown'
    try {
      // Try to find the package in pnpm global directory first
      try {
        const pnpmRootResult = await $`pnpm root -g`.quiet()
        const pnpmRoot = pnpmRootResult.stdout.trim()
        const pnpmPackageJsonPath = `${pnpmRoot}/${packageName}/package.json`
        const packageJsonContent = fs.readFileSync(pnpmPackageJsonPath, 'utf-8')
        const packageJson = JSON.parse(packageJsonContent)
        current = packageJson.version || 'unknown'
      } catch {
        // Fall back to npm global directory
        const prefixResult = await $`npm config get prefix`.quiet()
        const npmPrefix = prefixResult.stdout.trim()
        const npmPackageJsonPath = `${npmPrefix}/lib/node_modules/${packageName}/package.json`
        const packageJsonContent = fs.readFileSync(npmPackageJsonPath, 'utf-8')
        const packageJson = JSON.parse(packageJsonContent)
        current = packageJson.version || 'unknown'
      }
    } catch {
      // If we can't find the global package, it might not be installed
      current = 'unknown'
    }

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
