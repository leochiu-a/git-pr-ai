import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildUpdateDescriptionPrompt } from './prompts'
import { GitProvider, PRDetails } from '../../providers/types'

const prDetails: PRDetails = {
  number: '42',
  title: 'Fix fork PR discovery',
  url: 'https://github.com/org/main-repo/pull/42',
  baseBranch: 'main',
  headBranch: 'feat/fork-branch',
  owner: 'org',
  repo: 'main-repo',
  state: 'open',
  author: 'alice',
}

const provider = {
  name: 'GitHub',
  findPRTemplate: vi.fn(),
} as unknown as GitProvider

describe('update-pr-desc prompts', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    ;(provider.findPRTemplate as ReturnType<typeof vi.fn>).mockResolvedValue({
      exists: false,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('includes explicit GitHub repo in PR update command', async () => {
    const prompt = await buildUpdateDescriptionPrompt({
      prDetails,
      provider,
    })

    expect(prompt).toContain(
      'gh pr edit 42 --repo org/main-repo --body-file description.md',
    )
  })

  it('always includes Step 3 CLI commands for AI execution', async () => {
    const prompt = await buildUpdateDescriptionPrompt({
      prDetails,
      provider,
    })

    expect(prompt).toContain('gh pr edit')
    expect(prompt).toContain('Step 3')
    expect(prompt).toContain('MUST execute all CLI commands')
  })

  it('excludes Step 3 in non-interactive mode', async () => {
    const prompt = await buildUpdateDescriptionPrompt({
      prDetails,
      provider,
      options: { nonInteractive: true },
    })

    expect(prompt).not.toContain('gh pr edit')
    expect(prompt).not.toContain('### Step 3: Update PR')
    expect(prompt).not.toContain('MUST execute all CLI commands')
  })
})
