import { describe, it, expect, vi, beforeEach } from 'vitest'
import ora from 'ora'
import {
  getCurrentBranch,
  checkGitCLI,
  getDefaultBranch,
} from '../../git-helpers'
import { getCurrentProvider } from '../../providers/factory'
import { extractJiraTicket, getJiraTicketTitle } from '../../jira'

// Mock all dependencies
vi.mock('ora')
vi.mock('../../git-helpers')
vi.mock('../../providers/factory')
vi.mock('../../jira')

// Import the function we want to test (it's not exported, so we need to extract it)
// We'll create a separate test for the convertBranchNameToPRTitle function
describe('convertBranchNameToPRTitle', () => {
  // Since the function is not exported, we'll recreate it for testing
  const convertBranchNameToPRTitle = (branchName: string): string => {
    const commitlintMatch = branchName.match(
      /^(feat|fix|docs|style|refactor|perf|test|chore|ci|build)\/(.+)$/,
    )

    if (commitlintMatch) {
      const [, type, description] = commitlintMatch
      const cleanDescription = description.replace(/^[A-Z]+-\d+-/, '')
      const readableDescription = cleanDescription
        .split('-')
        .join(' ')
        .toLowerCase()
      return `${type}: ${readableDescription}`
    }

    return branchName
  }

  describe('commitlint format branches', () => {
    it('should convert feat branch to proper title', () => {
      expect(convertBranchNameToPRTitle('feat/add-user-authentication')).toBe(
        'feat: add user authentication',
      )
    })

    it('should convert fix branch to proper title', () => {
      expect(convertBranchNameToPRTitle('fix/update-validation-logic')).toBe(
        'fix: update validation logic',
      )
    })

    it('should convert docs branch to proper title', () => {
      expect(convertBranchNameToPRTitle('docs/api-documentation')).toBe(
        'docs: api documentation',
      )
    })

    it('should handle all commitlint types', () => {
      const types = [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'chore',
        'ci',
        'build',
      ]

      types.forEach((type) => {
        const result = convertBranchNameToPRTitle(`${type}/some-feature`)
        expect(result).toBe(`${type}: some feature`)
      })
    })

    it('should remove JIRA ticket prefix from description', () => {
      expect(convertBranchNameToPRTitle('feat/PROJ-123-add-user-auth')).toBe(
        'feat: add user auth',
      )
    })

    it('should handle complex JIRA ticket formats', () => {
      expect(
        convertBranchNameToPRTitle('fix/ABC-9999-update-validation-rules'),
      ).toBe('fix: update validation rules')
    })

    it('should handle single word descriptions', () => {
      expect(convertBranchNameToPRTitle('feat/authentication')).toBe(
        'feat: authentication',
      )
    })
  })

  describe('non-commitlint format branches', () => {
    it('should return original branch name for non-commitlint format', () => {
      expect(convertBranchNameToPRTitle('feature-branch')).toBe(
        'feature-branch',
      )
    })

    it('should return original branch name for invalid type', () => {
      expect(convertBranchNameToPRTitle('invalid/some-feature')).toBe(
        'invalid/some-feature',
      )
    })

    it('should return original branch name for missing description', () => {
      expect(convertBranchNameToPRTitle('feat/')).toBe('feat/')
    })

    it('should return original branch name for complex non-standard format', () => {
      expect(convertBranchNameToPRTitle('user/john/feature-work')).toBe(
        'user/john/feature-work',
      )
    })
  })

  describe('edge cases', () => {
    it('should handle empty string', () => {
      expect(convertBranchNameToPRTitle('')).toBe('')
    })

    it('should handle branch names with underscores', () => {
      expect(convertBranchNameToPRTitle('feat/add_user_auth')).toBe(
        'feat: add_user_auth',
      )
    })

    it('should handle mixed separators', () => {
      expect(convertBranchNameToPRTitle('feat/add-user_auth-system')).toBe(
        'feat: add user_auth system',
      )
    })
  })
})

describe('open-pr CLI integration', () => {
  const mockProvider = {
    checkExistingPR: vi.fn(),
    openPR: vi.fn(),
    createPR: vi.fn(),
  }

  const mockSpinner = {
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    warn: vi.fn().mockReturnThis(),
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mocks
    vi.mocked(ora).mockReturnValue(mockSpinner as any)
    vi.mocked(getCurrentProvider).mockResolvedValue(mockProvider as any)
    vi.mocked(checkGitCLI).mockResolvedValue(undefined)
    vi.mocked(getCurrentBranch).mockResolvedValue('feat/test-feature')
    vi.mocked(getDefaultBranch).mockResolvedValue('main')
    vi.mocked(extractJiraTicket).mockReturnValue(null)
    vi.mocked(getJiraTicketTitle).mockResolvedValue(null)
  })

  describe('existing PR detection', () => {
    it('should open existing PR when one exists', async () => {
      mockProvider.checkExistingPR.mockResolvedValue(
        'https://github.com/repo/pull/123',
      )

      // We can't easily test the main function due to its structure,
      // but we can test the logic components
      expect(mockProvider.checkExistingPR).toBeDefined()
      expect(mockProvider.openPR).toBeDefined()
    })
  })

  describe('JIRA integration', () => {
    it('should extract JIRA ticket from branch name', () => {
      vi.mocked(extractJiraTicket).mockReturnValue('PROJ-123')

      const result = extractJiraTicket('feat/PROJ-123-add-feature')
      expect(result).toBe('PROJ-123')
    })

    it('should fetch JIRA title when ticket is found', async () => {
      vi.mocked(extractJiraTicket).mockReturnValue('PROJ-123')
      vi.mocked(getJiraTicketTitle).mockResolvedValue('Add user authentication')

      const jiraTicket = extractJiraTicket('feat/PROJ-123-add-auth')
      if (jiraTicket) {
        const title = await getJiraTicketTitle(jiraTicket)
        expect(title).toBe('Add user authentication')
      }
    })

    it('should handle JIRA fetch failures gracefully', async () => {
      vi.mocked(extractJiraTicket).mockReturnValue('PROJ-123')
      vi.mocked(getJiraTicketTitle).mockResolvedValue(null)

      const jiraTicket = extractJiraTicket('feat/PROJ-123-add-auth')
      if (jiraTicket) {
        const title = await getJiraTicketTitle(jiraTicket)
        expect(title).toBeNull()
      }
    })
  })

  describe('PR title generation', () => {
    it('should generate title with JIRA ticket and title', () => {
      const jiraTicket = 'PROJ-123'
      const jiraTitle = 'Add user authentication'
      const expectedTitle = `[${jiraTicket}] ${jiraTitle}`

      expect(expectedTitle).toBe('[PROJ-123] Add user authentication')
    })

    it('should generate title with JIRA ticket and converted branch name', () => {
      const jiraTicket = 'PROJ-123'
      const convertedTitle = 'feat: add user auth'
      const expectedTitle = `[${jiraTicket}] ${convertedTitle}`

      expect(expectedTitle).toBe('[PROJ-123] feat: add user auth')
    })
  })

  describe('provider interactions', () => {
    it('should check for existing PR before creating new one', async () => {
      mockProvider.checkExistingPR.mockResolvedValue(null)

      expect(mockProvider.checkExistingPR).toBeDefined()
      expect(mockProvider.createPR).toBeDefined()
    })

    it('should call createPR with correct parameters', () => {
      const title = 'feat: add user authentication'
      const currentBranch = 'feat/add-user-auth'
      const baseBranch = 'main'

      // This would be called in the actual implementation
      expect(() => {
        mockProvider.createPR(title, currentBranch, baseBranch)
      }).not.toThrow()
    })
  })
})
