import { describe, it, expect } from 'vitest'
import { sanitizeBranchName, extractBranchName } from './ai-output-parser'

describe('AI Output Parser', () => {
  describe('sanitizeBranchName', () => {
    it('should remove markdown bold markers', () => {
      expect(sanitizeBranchName('feat/add-lost-grace-discovered**')).toBe(
        'feat/add-lost-grace-discovered',
      )
    })

    it('should remove multiple markdown markers', () => {
      expect(sanitizeBranchName('**feat/test**')).toBe('feat/test')
    })

    it('should remove backticks', () => {
      expect(sanitizeBranchName('`feat/test`')).toBe('feat/test')
    })

    it('should remove underscores', () => {
      expect(sanitizeBranchName('feat/_test_')).toBe('feat/test')
    })

    it('should remove tildes', () => {
      expect(sanitizeBranchName('~feat/test~')).toBe('feat/test')
    })

    it('should handle multiple markers together', () => {
      expect(sanitizeBranchName('**`feat/test`**')).toBe('feat/test')
    })

    it('should preserve valid characters', () => {
      expect(sanitizeBranchName('feat/add-user-auth-123')).toBe(
        'feat/add-user-auth-123',
      )
    })

    it('should trim whitespace', () => {
      expect(sanitizeBranchName('  feat/test  ')).toBe('feat/test')
    })
  })

  describe('extractBranchName', () => {
    describe('new format with multiple options', () => {
      it('should extract 3 branch names from new format', () => {
        const result = extractBranchName(`
BRANCH_NAME_1: feat/add-feature
BRANCH_NAME_2: feat/implement-feature
BRANCH_NAME_3: feat/feature-implementation
        `)
        expect(result.success).toBe(true)
        expect(result.branchNames).toEqual([
          'feat/add-feature',
          'feat/implement-feature',
          'feat/feature-implementation',
        ])
      })

      it('should extract and sanitize multiple branch names', () => {
        const result = extractBranchName(`
BRANCH_NAME_1: **feat/add-feature**
BRANCH_NAME_2: \`feat/implement-feature\`
BRANCH_NAME_3: ~feat/feature-implementation~
        `)
        expect(result.success).toBe(true)
        expect(result.branchNames).toEqual([
          'feat/add-feature',
          'feat/implement-feature',
          'feat/feature-implementation',
        ])
      })

      it('should handle case-insensitive BRANCH_NAME prefix', () => {
        const result = extractBranchName(`
branch_name_1: feat/add-feature
BRANCH_NAME_2: feat/implement-feature
Branch_Name_3: feat/feature-implementation
        `)
        expect(result.success).toBe(true)
        expect(result.branchNames?.length).toBe(3)
      })

      it('should handle extra whitespace around branch names', () => {
        const result = extractBranchName(`
BRANCH_NAME_1:   feat/add-feature
BRANCH_NAME_2:    feat/implement-feature
BRANCH_NAME_3:     feat/feature-implementation
        `)
        expect(result.success).toBe(true)
        expect(result.branchNames).toEqual([
          'feat/add-feature',
          'feat/implement-feature',
          'feat/feature-implementation',
        ])
      })
    })

    describe('legacy format with single option', () => {
      it('should extract branch name from legacy format', () => {
        const result = extractBranchName('BRANCH_NAME: feat/add-feature')
        expect(result.success).toBe(true)
        expect(result.branchNames).toEqual(['feat/add-feature'])
      })

      it('should extract and sanitize branch name with markdown', () => {
        const result = extractBranchName(
          'BRANCH_NAME: feat/add-lost-grace-discovered**',
        )
        expect(result.success).toBe(true)
        expect(result.branchNames).toEqual(['feat/add-lost-grace-discovered'])
      })

      it('should be case-insensitive for BRANCH_NAME prefix', () => {
        const result = extractBranchName('branch_name: feat/test')
        expect(result.success).toBe(true)
        expect(result.branchNames).toEqual(['feat/test'])
      })

      it('should handle extra whitespace around branch name', () => {
        const result = extractBranchName('BRANCH_NAME:   feat/test   ')
        expect(result.success).toBe(true)
        expect(result.branchNames).toEqual(['feat/test'])
      })
    })

    describe('error cases', () => {
      it('should fail when no BRANCH_NAME found', () => {
        const result = extractBranchName('Some random output')
        expect(result.success).toBe(false)
        expect(result.error).toBeDefined()
      })

      it('should fail when BRANCH_NAME is empty', () => {
        const result = extractBranchName('BRANCH_NAME: ')
        expect(result.success).toBe(false)
        expect(result.error).toBeDefined()
      })

      it('should fail when output becomes empty after sanitization', () => {
        const result = extractBranchName('BRANCH_NAME: ***')
        expect(result.success).toBe(false)
        expect(result.error).toBeDefined()
      })

      it('should fail when all numbered options are empty', () => {
        const result = extractBranchName(`
BRANCH_NAME_1: ***
BRANCH_NAME_2: ***
BRANCH_NAME_3: ***
        `)
        expect(result.success).toBe(false)
        expect(result.error).toBeDefined()
      })
    })
  })
})
