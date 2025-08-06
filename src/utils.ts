import { $ } from 'zx'
import { loadConfig } from './config.js'

$.verbose = false

export async function getDefaultBranch() {
  try {
    const result = await $`gh repo view --json defaultBranchRef`
    const json = JSON.parse(result.stdout)
    if (json.defaultBranchRef && json.defaultBranchRef.name) {
      return json.defaultBranchRef.name
    }
    return 'main'
  } catch {
    console.warn(
      "⚠️ Could not determine default branch via gh, falling back to 'main'",
    )
    return 'main'
  }
}

export async function getCurrentBranch() {
  const result = await $`git branch --show-current`
  return result.stdout.trim()
}

export function extractJiraTicket(branchName: string): string | null {
  const jiraPattern = /([A-Z][A-Z0-9]*-\d+)/
  const match = branchName.match(jiraPattern)

  if (!match) {
    console.log('ℹ️ No JIRA ticket found in branch name, proceeding without it')
    return null
  }

  return match[1]
}

export async function getJiraTicketTitle(
  ticketKey: string,
): Promise<string | null> {
  const config = await loadConfig()

  if (!config.jira) {
    console.log('ℹ️ No JIRA configuration found, using ticket key only')
    return null
  }

  try {
    const { baseUrl, email, apiToken } = config.jira
    const auth = Buffer.from(`${email}:${apiToken}`).toString('base64')

    const response = await fetch(
      `${baseUrl}/rest/api/3/issue/${ticketKey}?fields=summary`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: 'application/json',
        },
      },
    )

    if (!response.ok) {
      console.warn(
        `⚠️ Could not fetch JIRA ticket ${ticketKey}: ${response.status}`,
      )
      return null
    }

    const data = await response.json()
    return data.fields.summary
  } catch (error) {
    console.warn(
      `⚠️ Error fetching JIRA ticket ${ticketKey}:`,
      error instanceof Error ? error.message : String(error),
    )
    return null
  }
}

export async function checkGitHubCLI() {
  try {
    await $`gh --version`.quiet()
  } catch {
    console.error('❌ Please install GitHub CLI (gh) first')
    console.error('Installation: https://cli.github.com/')
    process.exit(1)
  }

  try {
    const result = await $`gh auth status`.quiet()
    // Check if there's at least one authenticated account
    if (!result.stdout.includes('✓ Logged in to')) {
      throw new Error('No authenticated accounts found')
    }
  } catch {
    // If no output captured, try alternative check
    try {
      await $`gh api user`.quiet()
    } catch {
      console.error('❌ Please authenticate with GitHub CLI first')
      console.error('Run: gh auth login')
      process.exit(1)
    }
  }
}
