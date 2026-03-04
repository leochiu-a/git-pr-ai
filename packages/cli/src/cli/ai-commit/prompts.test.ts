import { describe, it, expect } from 'vitest'
import { createCommitMessagePrompt } from './prompts'

describe('ai-commit prompts', () => {
  it('includes selected commit type', () => {
    const prompt = createCommitMessagePrompt('diff', 'feat')

    expect(prompt).toContain('Commit type selected: feat')
    expect(prompt).toContain('Use the selected commit type (feat)')
  })

  it('includes jira context when provided', () => {
    const prompt = createCommitMessagePrompt('diff', 'fix', undefined, {
      key: 'PROJ-123',
      summary: 'Fix auth',
      description: 'More details',
      issueType: 'Bug',
      priority: 'High',
      status: 'In Progress',
      assignee: 'Ada',
      labels: ['api'],
      source: 'api',
    })

    expect(prompt).toContain('JIRA context:')
    expect(prompt).toContain('JIRA key: PROJ-123')
    expect(prompt).toContain('Summary: Fix auth')
    expect(prompt).toContain('Description: More details')
  })

  it('lets AI decide commit type when type is auto', () => {
    const prompt = createCommitMessagePrompt('diff', 'auto')

    expect(prompt).toContain('Commit type selection: AI decides')
    expect(prompt).toContain(
      'Choose the most suitable conventional commit type for each option',
    )
    expect(prompt).not.toContain('Use the selected commit type')
  })
})
