import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear.js'
import isoWeek from 'dayjs/plugin/isoWeek.js'

dayjs.extend(weekOfYear)
dayjs.extend(isoWeek)

export interface DateRange {
  since: string
  until: string
}

/**
 * Get the date range for the current week (Monday to today)
 */
export function getCurrentWeekRange(): DateRange {
  const today = dayjs()
  const monday = today.startOf('isoWeek')

  return {
    since: monday.format('YYYY-MM-DD'),
    until: today.format('YYYY-MM-DD'),
  }
}

/**
 * Validate and format date string
 */
export function validateDate(dateString: string): string {
  const date = dayjs(dateString, 'YYYY-MM-DD', true)

  if (!date.isValid()) {
    throw new Error(
      `Invalid date format: ${dateString}. Expected format: YYYY-MM-DD`,
    )
  }

  return date.format('YYYY-MM-DD')
}

/**
 * Ensure the date range is valid (since <= until)
 */
export function validateDateRange(since: string, until: string): void {
  const sinceDate = dayjs(since)
  const untilDate = dayjs(until)

  if (sinceDate.isAfter(untilDate)) {
    throw new Error('Start date cannot be after end date')
  }
}

/**
 * Format date range for display
 */
export function formatDateRange(since: string, until: string): string {
  const sinceDate = dayjs(since)
  const untilDate = dayjs(until)

  return `${sinceDate.format('YYYY-MM-DD')} to ${untilDate.format('YYYY-MM-DD')}`
}

/**
 * Get date in git log format (ISO 8601)
 */
export function toGitLogFormat(date: string): string {
  return dayjs(date).format('YYYY-MM-DDTHH:mm:ss')
}
