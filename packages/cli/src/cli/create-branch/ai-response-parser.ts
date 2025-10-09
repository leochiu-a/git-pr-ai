/**
 * Parses AI response to extract branch name from various formats
 * Handles cases where AI wraps branch name in backticks or markdown formatting
 *
 * @param aiOutput - The raw AI response string
 * @returns The extracted branch name or null if not found
 *
 * @example
 * parseBranchNameFromAI("BRANCH_NAME: feature/ai-agent-integration")
 * // returns "feature/ai-agent-integration"
 *
 * @example
 * parseBranchNameFromAI("BRANCH_NAME: **`feature/ai-agent-integration`**")
 * // returns "feature/ai-agent-integration"
 *
 * @example
 * parseBranchNameFromAI("BRANCH_NAME: `feat/add-cursor-agent-support`")
 * // returns "feat/add-cursor-agent-support"
 */
export function parseBranchNameFromAI(aiOutput: string): string | null {
  // Parse AI output - handle cases where AI wraps branch name in backticks or markdown
  const branchMatch = aiOutput.match(/BRANCH_NAME:\s*[*`]*(.+?)[*`]*(?:\s|$)/i)

  if (branchMatch) {
    return branchMatch[1].trim()
  }

  return null
}
