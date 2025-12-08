import { describe, it, expect, vi } from 'vitest'
import { extractJiraTicket, normalizeJiraTicketInput } from './jira'

describe('normalizeJiraTicketInput', () => {
  it('returns ticket when provided with plain key', () => {
    expect(normalizeJiraTicketInput('PROJ-123')).toBe('PROJ-123')
  })

  it('normalizes lowercase keys', () => {
    expect(normalizeJiraTicketInput('proj-456')).toBe('PROJ-456')
  })

  it('extracts ticket from browse URL', () => {
    const url = 'https://example.atlassian.net/browse/PROJ-789'
    expect(normalizeJiraTicketInput(url)).toBe('PROJ-789')
  })

  it('extracts ticket from browse URL with lowercase key and query params', () => {
    const url = 'https://example.atlassian.net/browse/proj-999?atlOrigin=test'
    expect(normalizeJiraTicketInput(url)).toBe('PROJ-999')
  })

  it('returns null for invalid input', () => {
    expect(normalizeJiraTicketInput('invalid-input')).toBeNull()
  })
})

describe('extractJiraTicket', () => {
  it('extracts ticket from branch name', () => {
    expect(extractJiraTicket('feat/PROJ-123-add-feature')).toBe('PROJ-123')
  })

  it('logs and returns null when no ticket found', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    expect(extractJiraTicket('feat/add-feature')).toBeNull()
    logSpy.mockRestore()
  })
})
