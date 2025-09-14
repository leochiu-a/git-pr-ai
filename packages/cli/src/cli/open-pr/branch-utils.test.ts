import { describe, it, expect } from 'vitest'
import { convertBranchNameToPRTitle } from './branch-utils'

describe('convertBranchNameToPRTitle', () => {
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
