import { describe, expect, it } from 'vite-plus/test'
import { createDiffBranchPrompt } from './prompts'

describe('create-branch prompts', () => {
  it('diff prompt should not instruct AI to include JIRA ticket in branch name', () => {
    const prompt = createDiffBranchPrompt('diff content')

    expect(prompt).not.toContain('JIRA ticket')
    expect(prompt).not.toContain('{ticket-id}')
    expect(prompt).toContain('{prefix}/{description}')
  })
})
