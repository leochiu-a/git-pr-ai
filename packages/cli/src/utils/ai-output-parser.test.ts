import { describe, it, expect } from 'vitest'
import { parseNumberedOutput } from './ai-output-parser'

describe('parseNumberedOutput', () => {
  describe('basic numbered format', () => {
    it('should parse single numbered item', () => {
      const output = 'OPTION_1: value1'
      const result = parseNumberedOutput(output)

      expect(result.success).toBe(true)
      expect(result.values).toEqual(['value1'])
    })

    it('should parse multiple numbered items', () => {
      const output = `OPTION_1: value1
OPTION_2: value2
OPTION_3: value3`
      const result = parseNumberedOutput(output)

      expect(result.success).toBe(true)
      expect(result.values).toEqual(['value1', 'value2', 'value3'])
    })

    it('should handle case-insensitive prefix matching', () => {
      const output = `option_1: value1
OPTION_2: value2
OpTiOn_3: value3`
      const result = parseNumberedOutput(output)

      expect(result.success).toBe(true)
      expect(result.values).toEqual(['value1', 'value2', 'value3'])
    })

    it('should handle extra whitespace', () => {
      const output = `
      OPTION_1:   value1
      OPTION_2:  value2
      `
      const result = parseNumberedOutput(output)

      expect(result.success).toBe(true)
      expect(result.values).toEqual(['value1', 'value2'])
    })

    it('should skip empty values', () => {
      const output = `OPTION_1: value1
OPTION_2:
OPTION_3: value3`
      const result = parseNumberedOutput(output)

      expect(result.success).toBe(true)
      expect(result.values).toEqual(['value1', 'value3'])
    })

    it('should handle AI output with explanatory text', () => {
      const output = `Here are the suggestions:

OPTION_1: value1
OPTION_2: value2

These are the results.`
      const result = parseNumberedOutput(output)

      expect(result.success).toBe(true)
      expect(result.values).toEqual(['value1', 'value2'])
    })

    it('should handle markdown bold formatting', () => {
      const output = `**OPTION_1:** value1
**OPTION_2:** value2
**OPTION_3:** value3`
      const result = parseNumberedOutput(output)

      expect(result.success).toBe(true)
      expect(result.values).toEqual(['value1', 'value2', 'value3'])
    })

    it('should handle markdown code formatting', () => {
      const output = '`OPTION_1:` value1\n`OPTION_2:` value2'
      const result = parseNumberedOutput(output)

      expect(result.success).toBe(true)
      expect(result.values).toEqual(['value1', 'value2'])
    })

    it('should remove trailing markdown formatting', () => {
      const output = `OPTION_1: value1**
OPTION_2: value2**
OPTION_3: value3**`
      const result = parseNumberedOutput(output)

      expect(result.success).toBe(true)
      expect(result.values).toEqual(['value1', 'value2', 'value3'])
    })

    it('should handle both leading and trailing markdown formatting', () => {
      const output = `**OPTION_1:** refactor: standardize AI output format to use OPTION prefix**
**OPTION_2:** refactor: update output parsing format**
**OPTION_3:** refactor: standardize commit message parsing**`
      const result = parseNumberedOutput(output)

      expect(result.success).toBe(true)
      expect(result.values).toEqual([
        'refactor: standardize AI output format to use OPTION prefix',
        'refactor: update output parsing format',
        'refactor: standardize commit message parsing',
      ])
    })
  })

  describe('sanitization', () => {
    it('should apply sanitization function to values', () => {
      const output = `OPTION_1: **value1**
OPTION_2: __value2__`
      const sanitize = (value: string) => value.replace(/[*_]/g, '')
      const result = parseNumberedOutput(output, {
        sanitize,
      })

      expect(result.success).toBe(true)
      expect(result.values).toEqual(['value1', 'value2'])
    })

    it('should skip values that become empty after sanitization', () => {
      const output = `OPTION_1: **valid**
OPTION_2: ***
OPTION_3: __also-valid__`
      const sanitize = (value: string) => value.replace(/[*_]/g, '').trim()
      const result = parseNumberedOutput(output, {
        sanitize,
      })

      expect(result.success).toBe(true)
      expect(result.values).toEqual(['valid', 'also-valid'])
    })
  })

  describe('error cases', () => {
    it('should return error when no valid values found', () => {
      const output = 'Some random text without proper format'
      const result = parseNumberedOutput(output)

      expect(result.success).toBe(false)
      expect(result.error).toBe('No valid options found in AI output')
    })

    it('should return error when all values are empty', () => {
      const output = `OPTION_1:
OPTION_2:
OPTION_3:   `
      const result = parseNumberedOutput(output)

      expect(result.success).toBe(false)
      expect(result.error).toBe('No valid options found in AI output')
    })

    it('should return error when all values are removed by sanitization', () => {
      const output = `OPTION_1: ***
OPTION_2: ___`
      const sanitize = (value: string) => value.replace(/[*_]/g, '').trim()
      const result = parseNumberedOutput(output, {
        sanitize,
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('No valid options found in AI output')
    })
  })

  describe('real-world scenarios', () => {
    it('should handle commit message format', () => {
      const output = `OPTION_1: feat: add user authentication
OPTION_2: feat: implement login system
OPTION_3: feat: add JWT authentication`
      const result = parseNumberedOutput(output)

      expect(result.success).toBe(true)
      expect(result.values).toEqual([
        'feat: add user authentication',
        'feat: implement login system',
        'feat: add JWT authentication',
      ])
    })

    it('should handle branch name format', () => {
      const output = `OPTION_1: feat/add-auth
OPTION_2: bugfix/fix-login
OPTION_3: feat/add-jwt`
      const result = parseNumberedOutput(output)

      expect(result.success).toBe(true)
      expect(result.values).toEqual([
        'feat/add-auth',
        'bugfix/fix-login',
        'feat/add-jwt',
      ])
    })
  })
})
