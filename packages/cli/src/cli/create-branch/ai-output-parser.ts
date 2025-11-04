/**
 * Parse branch names from AI output and sanitize invalid characters
 */

const SINGLE_BRANCH_NAME_PATTERN = /BRANCH_NAME:\s*(.+)/i

interface ParseResult {
  success: boolean
  branchNames?: string[]
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
 * Extract and sanitize branch names from AI output
 * Supports both new format (BRANCH_NAME_1, BRANCH_NAME_2, BRANCH_NAME_3)
 * and legacy format (BRANCH_NAME)
 */
export function extractBranchName(aiOutput: string): ParseResult {
  // Try to match multiple branch names (new format)
  const branchMatches = aiOutput.match(/BRANCH_NAME_(\d):\s*(.+)/gi)

  if (branchMatches && branchMatches.length > 0) {
    // New format: extract all numbered branch names
    const branchNames: string[] = []

    for (let i = 1; i <= 3; i++) {
      const pattern = new RegExp(`BRANCH_NAME_${i}:\\s*(.+)`, 'i')
      const match = aiOutput.match(pattern)

      if (match && match[1]) {
        const sanitized = sanitizeBranchName(match[1])
        if (sanitized) {
          branchNames.push(sanitized)
        }
      }
    }

    if (branchNames.length === 0) {
      return {
        success: false,
        error: `No valid branch names found after sanitization`,
      }
    }

    return {
      success: true,
      branchNames,
    }
  }

  // Fallback to legacy format: single branch name
  const singleMatch = aiOutput.match(SINGLE_BRANCH_NAME_PATTERN)

  if (singleMatch && singleMatch[1]) {
    const sanitized = sanitizeBranchName(singleMatch[1])

    if (!sanitized) {
      return {
        success: false,
        error: `Branch name is empty after sanitization`,
      }
    }

    return {
      success: true,
      branchNames: [sanitized],
    }
  }

  return {
    success: false,
    error: `Could not parse branch name from AI output`,
  }
}
