/**
 * Parse branch name from AI output and sanitize invalid characters
 */

const BRANCH_NAME_PATTERN = /BRANCH_NAME:\s*(.+)/i

interface ParseResult {
  success: boolean
  branchName?: string
  error?: string
}

/**
 * Remove markdown and invalid git branch name characters
 */
export function sanitizeBranchName(branchName: string): string {
  return branchName
    .replace(/[*`_~]/g, '') // Remove markdown formatting
    .trim()
}

/**
 * Extract and sanitize branch name from AI output
 */
export function extractBranchName(aiOutput: string): ParseResult {
  const branchMatch = aiOutput.match(BRANCH_NAME_PATTERN)

  if (!branchMatch || !branchMatch[1]) {
    return {
      success: false,
      error: `Could not parse branch name from AI output`,
    }
  }

  const sanitized = sanitizeBranchName(branchMatch[1])

  if (!sanitized) {
    return {
      success: false,
      error: `Branch name is empty after sanitization`,
    }
  }

  return {
    success: true,
    branchName: sanitized,
  }
}
