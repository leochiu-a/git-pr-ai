import { describe, expect, it } from 'vite-plus/test'
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
  it('reads base instructions from skill reference file', () => {
    const prompt = buildReviewPrompt({ prDetails, providerName: 'GitHub' })

    // Content that lives in the skill reference file, not hardcoded in prompts.ts
    expect(prompt).toContain('## GitHub Code Review')
    expect(prompt).toContain('## JSON rules')
  })

  it('injects PR context dynamically', () => {
    const prompt = buildReviewPrompt({ prDetails, providerName: 'GitHub' })

    expect(prompt).toContain('leochiu-a/git-pr-ai#101')
    expect(prompt).toContain('feat/add-non-interactive → main')
  })

  it('forces COMMENT event when reviewing your own GitHub PR', () => {
    const prompt = buildReviewPrompt({
      prDetails,
      providerName: 'GitHub',
    })

    expect(prompt).toContain('If PR_AUTHOR equals CURRENT_USER')
    expect(prompt).toContain('"event": "COMMENT"')
  })
})
