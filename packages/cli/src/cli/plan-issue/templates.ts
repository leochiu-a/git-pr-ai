import { OptimizedContent, CommentSolution, JiraGeneratedIssue } from './types'

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

export function formatJiraGeneratedIssue(content: JiraGeneratedIssue): string {
  return `## 🎫 JIRA to Git Platform Conversion

### Generated Title
${content.title}

### Generated Body
${content.body}

### Suggested Labels
${content.labels.map((label) => `\`${label}\``).join(', ')}

### Conversion Details
${content.convertReason}`
}
