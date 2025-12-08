import { loadConfig } from './config'
import { JiraTicketDetails } from './cli/plan-issue/types'

const JIRA_TICKET_PATTERN = /([A-Z0-9]+-\d+)/i
const JIRA_BROWSE_URL_PATTERN = /\/browse\/([A-Z0-9]+-\d+)/i

export function normalizeJiraTicketInput(input: string): string | null {
  if (!input) return null

  const browseMatch = input.match(JIRA_BROWSE_URL_PATTERN)
  if (browseMatch) {
    return browseMatch[1].toUpperCase()
  }

  const ticketMatch = input.match(JIRA_TICKET_PATTERN)
  return ticketMatch ? ticketMatch[1].toUpperCase() : null
}

export function extractJiraTicket(branchName: string): string | null {
  const ticket = normalizeJiraTicketInput(branchName)

  if (!ticket) {
    console.log('ℹ️ No JIRA ticket found in branch name, proceeding without it')
    return null
  }

  return ticket
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
