import { describe, it, expect, vi, beforeEach } from 'vite-plus/test'
import ora from 'ora'
import { loadConfig } from '../../config'
import { getCurrentBranch } from '../../git-helpers'
import { extractJiraTicket, getJiraTicketDetails } from '../../jira'
import {
  buildJiraCommitMessage,
  parseJiraInput,
  resolveJiraContext,
} from './utils'

vi.mock('ora')
vi.mock('../../config')
vi.mock('../../git-helpers')
vi.mock('../../jira', async () => {
  const actual =
    await vi.importActual<typeof import('../../jira')>('../../jira')
  return {
    ...actual,
    extractJiraTicket: vi.fn(),
    getJiraTicketDetails: vi.fn(),
  }
})

describe('ai-commit jira utils', () => {
  const mockSpinner = {
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    warn: vi.fn().mockReturnThis(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(ora).mockReturnValue(mockSpinner as any)
    vi.mocked(loadConfig).mockResolvedValue({} as any)
    vi.mocked(getCurrentBranch).mockResolvedValue('feat/PROJ-123-add-auth')
    vi.mocked(extractJiraTicket).mockReturnValue('PROJ-123')
    vi.mocked(getJiraTicketDetails).mockResolvedValue(null)
  })

  describe('parseJiraInput', () => {
    it('parses a ticket key', () => {
      expect(parseJiraInput('proj-123')).toEqual({ key: 'PROJ-123' })
    })

    it('parses a ticket URL', () => {
      expect(
        parseJiraInput('https://example.atlassian.net/browse/KB2CW-2684'),
      ).toEqual({
        key: 'KB2CW-2684',
        browseUrl: 'https://example.atlassian.net/browse/KB2CW-2684',
      })
    })

    it('throws on invalid input', () => {
      expect(() => parseJiraInput('not-a-ticket')).toThrow(
        'Invalid JIRA ticket format. Use a key like PROJ-123 or a JIRA URL.',
      )
    })
  })

  describe('resolveJiraContext', () => {
    it('uses branch ticket when option is true', async () => {
      vi.mocked(loadConfig).mockResolvedValue({
        jira: {
          baseUrl: 'https://example.atlassian.net',
          email: 'test@example.com',
          apiToken: 'token',
        },
      } as any)

      const result = await resolveJiraContext(true)

      expect(getCurrentBranch).toHaveBeenCalled()
      expect(extractJiraTicket).toHaveBeenCalledWith('feat/PROJ-123-add-auth')
      expect(getJiraTicketDetails).toHaveBeenCalledWith('PROJ-123')
      expect(result).toEqual({
        key: 'PROJ-123',
        source: 'branch',
        browseUrl: 'https://example.atlassian.net/browse/PROJ-123',
      })
    })

    it('returns null when branch has no ticket', async () => {
      vi.mocked(extractJiraTicket).mockReturnValue(null)

      const result = await resolveJiraContext(true)
      expect(result).toBeNull()
      expect(getJiraTicketDetails).not.toHaveBeenCalled()
    })

    it('returns key-only context when API returns null', async () => {
      vi.mocked(loadConfig).mockResolvedValue({
        jira: {
          baseUrl: 'https://example.atlassian.net',
          email: 'test@example.com',
          apiToken: 'token',
        },
      } as any)

      const result = await resolveJiraContext('PROJ-123')

      expect(getJiraTicketDetails).toHaveBeenCalledWith('PROJ-123')
      expect(result).toEqual({
        key: 'PROJ-123',
        source: 'api',
        browseUrl: 'https://example.atlassian.net/browse/PROJ-123',
      })
    })

    it('returns detailed context when API succeeds', async () => {
      vi.mocked(loadConfig).mockResolvedValue({
        jira: {
          baseUrl: 'https://example.atlassian.net',
          email: 'test@example.com',
          apiToken: 'token',
        },
      } as any)

      vi.mocked(getJiraTicketDetails).mockResolvedValue({
        key: 'PROJ-123',
        summary: 'Add auth',
        description: 'Details',
        issueType: 'Story',
        priority: 'High',
        status: 'In Progress',
        assignee: 'Ada',
        labels: ['backend'],
      })

      const result = await resolveJiraContext('PROJ-123')

      expect(result).toEqual({
        key: 'PROJ-123',
        summary: 'Add auth',
        description: 'Details',
        issueType: 'Story',
        priority: 'High',
        status: 'In Progress',
        assignee: 'Ada',
        labels: ['backend'],
        source: 'api',
        browseUrl: 'https://example.atlassian.net/browse/PROJ-123',
      })
    })
  })

  describe('buildJiraCommitMessage', () => {
    it('uses summary and includes link when available', () => {
      const message = buildJiraCommitMessage('feat', {
        key: 'PROJ-123',
        summary: 'Add auth flow',
        browseUrl: 'https://example.atlassian.net/browse/PROJ-123',
        source: 'api',
      })

      expect(message).toContain('feat: [PROJ-123] Add auth flow')
      expect(message).toContain(
        'link: https://example.atlassian.net/browse/PROJ-123',
      )
    })

    it('falls back to key when summary missing', () => {
      const message = buildJiraCommitMessage('fix', {
        key: 'PROJ-999',
        source: 'branch',
      })

      expect(message).toBe('fix: [PROJ-999] PROJ-999')
    })
  })
})
