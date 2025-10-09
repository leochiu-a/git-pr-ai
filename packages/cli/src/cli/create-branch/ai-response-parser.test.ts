import { describe, it, expect } from 'vitest'
import { parseBranchNameFromAI } from './ai-response-parser'

describe('parseBranchNameFromAI', () => {
  describe('basic branch names', () => {
    it('should parse simple branch name without formatting', () => {
      const input = 'BRANCH_NAME: feature/ai-agent-integration'
      const result = parseBranchNameFromAI(input)
      expect(result).toBe('feature/ai-agent-integration')
    })

    it('should parse branch name with backticks', () => {
      const input = 'BRANCH_NAME: `feature/ai-agent-integration`'
      const result = parseBranchNameFromAI(input)
      expect(result).toBe('feature/ai-agent-integration')
    })

    it('should parse branch name with markdown formatting', () => {
      const input = 'BRANCH_NAME: **`feature/ai-agent-integration`**'
      const result = parseBranchNameFromAI(input)
      expect(result).toBe('feature/ai-agent-integration')
    })
  })

  describe('different branch types', () => {
    it('should parse feat branch', () => {
      const input = 'BRANCH_NAME: feat/add-cursor-agent-support'
      const result = parseBranchNameFromAI(input)
      expect(result).toBe('feat/add-cursor-agent-support')
    })

    it('should parse feat branch with backticks', () => {
      const input = 'BRANCH_NAME: `feat/add-cursor-agent-support`'
      const result = parseBranchNameFromAI(input)
      expect(result).toBe('feat/add-cursor-agent-support')
    })

    it('should parse feat branch with markdown formatting', () => {
      const input = 'BRANCH_NAME: **`feat/add-cursor-agent-support`**'
      const result = parseBranchNameFromAI(input)
      expect(result).toBe('feat/add-cursor-agent-support')
    })

    it('should parse fix branch', () => {
      const input = 'BRANCH_NAME: fix/update-user-validation'
      const result = parseBranchNameFromAI(input)
      expect(result).toBe('fix/update-user-validation')
    })

    it('should parse docs branch', () => {
      const input = 'BRANCH_NAME: docs/update-readme'
      const result = parseBranchNameFromAI(input)
      expect(result).toBe('docs/update-readme')
    })
  })

  describe('JIRA ticket branches', () => {
    it('should parse JIRA ticket branch', () => {
      const input = 'BRANCH_NAME: feat/PROJ-123-add-login-page'
      const result = parseBranchNameFromAI(input)
      expect(result).toBe('feat/PROJ-123-add-login-page')
    })

    it('should parse JIRA ticket branch with backticks', () => {
      const input = 'BRANCH_NAME: `feat/PROJ-123-add-login-page`'
      const result = parseBranchNameFromAI(input)
      expect(result).toBe('feat/PROJ-123-add-login-page')
    })

    it('should parse JIRA ticket branch with markdown formatting', () => {
      const input = 'BRANCH_NAME: **`feat/PROJ-123-add-login-page`**'
      const result = parseBranchNameFromAI(input)
      expect(result).toBe('feat/PROJ-123-add-login-page')
    })
  })

  describe('edge cases with additional text', () => {
    it('should parse branch name when followed by newline and text', () => {
      const input = 'BRANCH_NAME: feat/PROJ-123-add-login-page\nSome other text'
      const result = parseBranchNameFromAI(input)
      expect(result).toBe('feat/PROJ-123-add-login-page')
    })

    it('should parse branch name when followed by space and text', () => {
      const input = 'BRANCH_NAME: feat/PROJ-123-add-login-page Some other text'
      const result = parseBranchNameFromAI(input)
      expect(result).toBe('feat/PROJ-123-add-login-page')
    })

    it('should parse branch name with backticks when followed by text', () => {
      const input =
        'BRANCH_NAME: `feat/PROJ-123-add-login-page` Some other text'
      const result = parseBranchNameFromAI(input)
      expect(result).toBe('feat/PROJ-123-add-login-page')
    })

    it('should parse branch name with markdown when followed by text', () => {
      const input =
        'BRANCH_NAME: **`feat/PROJ-123-add-login-page`** Some other text'
      const result = parseBranchNameFromAI(input)
      expect(result).toBe('feat/PROJ-123-add-login-page')
    })
  })

  describe('case sensitivity', () => {
    it('should handle case insensitive BRANCH_NAME', () => {
      const input = 'branch_name: feature/ai-agent-integration'
      const result = parseBranchNameFromAI(input)
      expect(result).toBe('feature/ai-agent-integration')
    })

    it('should handle mixed case BRANCH_NAME', () => {
      const input = 'Branch_Name: feature/ai-agent-integration'
      const result = parseBranchNameFromAI(input)
      expect(result).toBe('feature/ai-agent-integration')
    })
  })

  describe('invalid inputs', () => {
    it('should return null for input without BRANCH_NAME', () => {
      const input = 'Some random text without branch name'
      const result = parseBranchNameFromAI(input)
      expect(result).toBeNull()
    })

    it('should return null for empty string', () => {
      const input = ''
      const result = parseBranchNameFromAI(input)
      expect(result).toBeNull()
    })

    it('should return null for input with only BRANCH_NAME and no value', () => {
      const input = 'BRANCH_NAME:'
      const result = parseBranchNameFromAI(input)
      expect(result).toBeNull()
    })

    it('should return null for input with only BRANCH_NAME and whitespace', () => {
      const input = 'BRANCH_NAME:   '
      const result = parseBranchNameFromAI(input)
      expect(result).toBe('')
    })
  })

  describe('whitespace handling', () => {
    it('should trim whitespace from parsed branch name', () => {
      const input = 'BRANCH_NAME:   feature/ai-agent-integration   '
      const result = parseBranchNameFromAI(input)
      expect(result).toBe('feature/ai-agent-integration')
    })

    it('should handle multiple spaces before branch name', () => {
      const input = 'BRANCH_NAME:    feature/ai-agent-integration'
      const result = parseBranchNameFromAI(input)
      expect(result).toBe('feature/ai-agent-integration')
    })
  })

  describe('complex formatting combinations', () => {
    it('should handle multiple asterisks and backticks', () => {
      const input = 'BRANCH_NAME: ***`feature/ai-agent-integration`***'
      const result = parseBranchNameFromAI(input)
      expect(result).toBe('feature/ai-agent-integration')
    })

    it('should handle only asterisks without backticks', () => {
      const input = 'BRANCH_NAME: **feature/ai-agent-integration**'
      const result = parseBranchNameFromAI(input)
      expect(result).toBe('feature/ai-agent-integration')
    })

    it('should handle only backticks without asterisks', () => {
      const input = 'BRANCH_NAME: `feature/ai-agent-integration`'
      const result = parseBranchNameFromAI(input)
      expect(result).toBe('feature/ai-agent-integration')
    })
  })
})
