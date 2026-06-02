import { describe, expect, it } from 'vite-plus/test'
import { buildFixCommentsPrompt } from './prompts'

describe('fix-pr-comments prompts', () => {
  it('reads the shared workflow from the skill reference files', () => {
    const prompt = buildFixCommentsPrompt({ providerName: 'GitHub' })

    // Content that lives in the skill workflow reference, not hardcoded here
    expect(prompt).toContain('Fix PR/MR Comments — Workflow')
    expect(prompt).toContain('## Step 0: Determine mode')
    expect(prompt).toContain('## Step 5: Reply to the comment')
  })

  it('appends the platform-specific reference', () => {
    const githubPrompt = buildFixCommentsPrompt({ providerName: 'GitHub' })
    expect(githubPrompt).toContain('GitHub — Comment Details & Reply')

    const gitlabPrompt = buildFixCommentsPrompt({ providerName: 'GitLab' })
    expect(gitlabPrompt).toContain('GitLab — Comment Details & Reply')
  })

  it('rewrites the skill-relative scripts path to an absolute directory', () => {
    const prompt = buildFixCommentsPrompt({ providerName: 'GitHub' })

    // The relative `python3 .claude/...` invocation must become an absolute
    // path so the scripts run regardless of the current working directory.
    expect(prompt).not.toContain('python3 .claude/skills/')
    expect(prompt).toMatch(/python3 \/.*\/fetch_comment\.py/)
    expect(prompt).toMatch(/python3 \/.*\/fetch_pr_comments\.py/)
  })

  it('uses single-comment mode when a URL is provided', () => {
    const url = 'https://github.com/owner/repo/pull/1#discussion_r123'
    const prompt = buildFixCommentsPrompt({
      commentUrl: url,
      providerName: 'GitHub',
    })

    expect(prompt).toContain(`A comment URL was provided: ${url}`)
    expect(prompt).toContain('single-comment mode')
  })

  it('uses batch mode when no URL is provided', () => {
    const prompt = buildFixCommentsPrompt({ providerName: 'GitHub' })

    expect(prompt).toContain('No comment URL was provided')
    expect(prompt).toContain('batch mode')
  })
})
