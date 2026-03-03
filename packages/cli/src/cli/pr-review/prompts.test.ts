import { describe, expect, it } from 'vitest'
import { buildReviewPrompt } from './prompts'
import { PRDetails } from '../../providers/types'

const prDetails: PRDetails = {
  number: '101',
  title: 'Improve non-interactive review flow',
  url: 'https://github.com/leochiu-a/git-pr-ai/pull/101',
  baseBranch: 'main',
  headBranch: 'feat/add-non-interactive',
  owner: 'leochiu-a',
  repo: 'git-pr-ai',
  state: 'open',
  author: 'leochiu-a',
}

describe('pr-review prompts', () => {
  it('forces COMMENT event when reviewing your own GitHub PR', () => {
    const prompt = buildReviewPrompt({
      prDetails,
      providerName: 'GitHub',
    })

    expect(prompt).toContain('PR_AUTHOR=$(gh pr view 101 --json author')
    expect(prompt).toContain("CURRENT_USER=$(gh api user -q '.login')")
    expect(prompt).toContain('If PR_AUTHOR equals CURRENT_USER')
    expect(prompt).toContain('"event": "COMMENT"')
  })
})
