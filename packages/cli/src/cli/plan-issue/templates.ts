import { OptimizedContent, CommentSolution } from './types'

export function formatOptimizedContent(content: OptimizedContent): string {
  return `## ✨ Optimized Issue Content

### Improved Title
${content.improvedTitle}

### Improved Description
${content.improvedBody}

### What Was Improved
${content.improvementReason}`
}

export function formatCommentSolution(solution: CommentSolution): string {
  return `## 💡 Analysis & Solution

### Analysis
${solution.analysis}

### Suggested Solution
${solution.suggestedSolution}

### Implementation Notes
${solution.implementationNotes.map((note) => `- ${note}`).join('\n')}`
}

export function formatOptimizedIssueBody(content: OptimizedContent): string {
  return content.improvedBody
}

export function formatCommentIssueComment(solution: CommentSolution): string {
  return formatCommentSolution(solution)
}
