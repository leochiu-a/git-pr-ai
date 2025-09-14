import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getCurrentWeekRange,
  validateDate,
  validateDateRange,
  formatDateRange,
  toGitLogFormat,
} from './date-utils'

describe('Date Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCurrentWeekRange', () => {
    it('should return current week range from Monday to today', () => {
      // Mock specific date for consistent testing
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-15T10:00:00Z')) // Monday

      const result = getCurrentWeekRange()

      expect(result).toEqual({
        since: '2024-01-15',
        until: '2024-01-15',
      })

      vi.useRealTimers()
    })
  })

  describe('validateDate', () => {
    it('should validate and format correct date', () => {
      const result = validateDate('2024-01-15')
      expect(result).toBe('2024-01-15')
    })

    it('should throw error for invalid date format', () => {
      expect(() => validateDate('invalid-date')).toThrow(
        'Invalid date format: invalid-date. Expected format: YYYY-MM-DD',
      )
    })

    it('should throw error for incorrect format', () => {
      expect(() => validateDate('15-01-2024')).toThrow(
        'Invalid date format: 15-01-2024. Expected format: YYYY-MM-DD',
      )
    })
  })

  describe('validateDateRange', () => {
    it('should not throw for valid date range', () => {
      expect(() => validateDateRange('2024-01-01', '2024-01-15')).not.toThrow()
    })

    it('should not throw for equal dates', () => {
      expect(() => validateDateRange('2024-01-15', '2024-01-15')).not.toThrow()
    })

    it('should throw error when start date is after end date', () => {
      expect(() => validateDateRange('2024-01-15', '2024-01-01')).toThrow(
        'Start date cannot be after end date',
      )
    })
  })

  describe('formatDateRange', () => {
    it('should format date range correctly', () => {
      const result = formatDateRange('2024-01-01', '2024-01-15')
      expect(result).toBe('2024-01-01 to 2024-01-15')
    })
  })

  describe('toGitLogFormat', () => {
    it('should convert date to git log format', () => {
      const result = toGitLogFormat('2024-01-15')
      expect(result).toBe('2024-01-15T00:00:00')
    })
  })
})
