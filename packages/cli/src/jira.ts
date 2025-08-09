import { loadConfig } from './config'

export function extractJiraTicket(branchName: string): string | null {
  const jiraPattern = /([A-Z]+-\d+)/
  const match = branchName.match(jiraPattern)

  if (!match) {
    console.log('ℹ️ No JIRA ticket found in branch name, proceeding without it')
    return null
  }

  return match[1]
}

function createJiraApiUrl(baseUrl: string, ticketKey: string): string {
  return `${baseUrl}/rest/api/3/issue/${ticketKey}?fields=summary`
}

function createJiraAuthHeader(email: string, apiToken: string): string {
  return Buffer.from(`${email}:${apiToken}`).toString('base64')
}

async function fetchJiraTicketData(
  url: string,
  authHeader: string,
): Promise<{ fields: { summary: string } }> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${authHeader}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  return response.json()
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

    const apiUrl = createJiraApiUrl(baseUrl, ticketKey)
    const authHeader = createJiraAuthHeader(email, apiToken)
    const data = await fetchJiraTicketData(apiUrl, authHeader)

    return data.fields.summary
  } catch (error) {
    console.warn(
      `⚠️ Error fetching JIRA ticket ${ticketKey}:`,
      error instanceof Error ? error.message : String(error),
    )
    return null
  }
}
