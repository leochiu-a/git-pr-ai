/**
 * Shared utilities for parsing AI-generated output
 */

export interface ParseResult<T = string> {
  success: boolean
  values?: T[]
  error?: string
}

export interface ParseOptions {
  /**
   * Prefix pattern to match (default: 'OPTION')
   */
  prefix?: string
  /**
   * Optional sanitization function to apply to extracted values
   */
  sanitize?: (value: string) => string
}

/**
 * Generic parser for AI output with numbered patterns
 * Supports patterns like:
 * - OPTION_1: value1
 * - OPTION_2: value2
 * - OPTION_3: value3
 */
export function parseNumberedOutput(
  aiOutput: string,
  options: ParseOptions = {},
): ParseResult {
  const { prefix = 'OPTION', sanitize } = options
  const lines = aiOutput.trim().split('\n')
  const values: string[] = []

  for (const line of lines) {
    // Match patterns like: PREFIX_1: value, PREFIX_2: value
    // Also handles markdown formatting like **PREFIX_1:** or `PREFIX_1:`
    const numberedPattern = new RegExp(
      `^[*\`]*${prefix}_(\\d+):[*\`]*\\s*(.+)$`,
      'i',
    )
    const match = line.trim().match(numberedPattern)

    if (match) {
      let value = match[2].trim()
      // Remove trailing markdown formatting (**, `, etc.)
      value = value.replace(/[*`]+$/, '').trim()
      if (sanitize) {
        value = sanitize(value)
      }
      if (value) {
        values.push(value)
      }
    }
  }

  if (values.length === 0) {
    return {
      success: false,
      error: 'No valid options found in AI output',
    }
  }

  return {
    success: true,
    values,
  }
}
