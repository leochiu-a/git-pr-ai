import { loadConfig } from './config'
import { JiraTicketDetails } from './cli/plan-issue/types'

export function extractJiraTicket(branchName: string): string | null {
  const jiraPattern = /([A-Z0-9]+-\d+)/
  const match = branchName.match(jiraPattern)

  if (!match) {
    console.log('ℹ️ No JIRA ticket found in branch name, proceeding without it')
    return null
  }

  return match[1]
}

function createJiraApiUrl(baseUrl: string, ticketKey: string): string {
  return `${baseUrl}/rest/api/3/issue/${ticketKey}?fields=summary,description,issuetype,priority,status,assignee,labels`
}

function createJiraAuthHeader(email: string, apiToken: string): string {
  return Buffer.from(`${email}:${apiToken}`).toString('base64')
}

type JiraDescriptionADF = {
  content?: Array<{
    content?: Array<{ text?: string }>
  }>
}

interface JiraIssueResponse {
  fields: {
    summary?: string
    description?: string | JiraDescriptionADF
    issuetype?: { name?: string }
    priority?: { name?: string }
    status?: { name?: string }
    assignee?: { displayName?: string }
    labels?: unknown[]
  }
}

async function fetchJiraTicketData(
  url: string,
  authHeader: string,
): Promise<JiraIssueResponse> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${authHeader}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const data: JiraIssueResponse = await response.json()
  return data
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

    return data.fields.summary ?? null
  } catch (error) {
    console.warn(
      `⚠️ Error fetching JIRA ticket ${ticketKey}:`,
      error instanceof Error ? error.message : String(error),
    )
    return null
  }
}

export async function getJiraTicketDetails(
  ticketKey: string,
): Promise<JiraTicketDetails | null> {
  const config = await loadConfig()

  if (!config.jira) {
    console.log('ℹ️ No JIRA configuration found')
    return null
  }

  try {
    const { baseUrl, email, apiToken } = config.jira

    const apiUrl = createJiraApiUrl(baseUrl, ticketKey)
    const authHeader = createJiraAuthHeader(email, apiToken)
    const data = await fetchJiraTicketData(apiUrl, authHeader)

    return {
      key: ticketKey,
      summary: data.fields.summary || '',
      description:
        (typeof data.fields.description === 'string'
          ? data.fields.description
          : data.fields.description?.content?.[0]?.content?.[0]?.text) || '',
      issueType: data.fields.issuetype?.name || '',
      priority: data.fields.priority?.name || '',
      status: data.fields.status?.name || '',
      assignee: data.fields.assignee?.displayName,
      labels: data.fields.labels?.map((label: unknown) => String(label)) || [],
    }
  } catch (error) {
    console.warn(
      `⚠️ Error fetching JIRA ticket ${ticketKey}:`,
      error instanceof Error ? error.message : String(error),
    )
    return null
  }
}
