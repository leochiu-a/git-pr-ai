import { describe, it, expect, vi, beforeEach, afterEach } from 'vite-plus/test'
import { buildUpdateDescriptionPrompt } from './prompts'
import { GitProvider } from '../../providers/types'

const provider = {
  name: 'GitHub',
  findPRTemplate: vi.fn(),
} as unknown as GitProvider

const gitlabProvider = {
  name: 'GitLab',
  findPRTemplate: vi.fn(),
} as unknown as GitProvider

describe('update-pr-desc prompts', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    ;(provider.findPRTemplate as ReturnType<typeof vi.fn>).mockResolvedValue({
      exists: false,
    })
    ;(
      gitlabProvider.findPRTemplate as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ exists: false })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('uses github.md skill file for GitHub provider', async () => {
    const prompt = await buildUpdateDescriptionPrompt({ provider })

    expect(prompt).toContain('gh pr view')
    expect(prompt).toContain('gh pr diff')
    expect(prompt).toContain('gh pr edit')
  })

  it('uses gitlab.md skill file for GitLab provider', async () => {
    const prompt = await buildUpdateDescriptionPrompt({
      provider: gitlabProvider,
    })

    expect(prompt).toContain('glab mr view')
    expect(prompt).toContain('glab mr diff')
    expect(prompt).toContain('glab mr update')
  })

  it('inlines default template when no repo template exists', async () => {
    const prompt = await buildUpdateDescriptionPrompt({ provider })

    expect(prompt).toContain('## Resolved PR Template')
    expect(prompt).toContain('No repo template found')
    expect(prompt).toContain('## Summary')
  })

  it('inlines repo template when one exists', async () => {
    ;(provider.findPRTemplate as ReturnType<typeof vi.fn>).mockResolvedValue({
      exists: true,
      content: '## My Custom Template\n- item',
      path: '.github/pull_request_template.md',
    })

    const prompt = await buildUpdateDescriptionPrompt({ provider })

    expect(prompt).toContain('## Resolved PR Template')
    expect(prompt).toContain('## My Custom Template')
    expect(prompt).toContain('.github/pull_request_template.md')
  })

  it('appends additional context when provided', async () => {
    const prompt = await buildUpdateDescriptionPrompt({
      provider,
      options: { additionalContext: 'focus on security changes' },
    })

    expect(prompt).toContain('focus on security changes')
    expect(prompt).toContain('## Additional Context')
  })

  it('appends output instructions in non-interactive mode', async () => {
    const prompt = await buildUpdateDescriptionPrompt({
      provider,
      options: { nonInteractive: true },
    })

    expect(prompt).toContain('Output ONLY the PR description text')
    expect(prompt).toContain('## Output Instructions')
  })

  it('does not include output instructions in interactive mode', async () => {
    const prompt = await buildUpdateDescriptionPrompt({ provider })

    expect(prompt).not.toContain('Output ONLY the PR description text')
  })
})
