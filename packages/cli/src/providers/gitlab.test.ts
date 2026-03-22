import { beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import ora from 'ora'
import { GitLabProvider } from './gitlab'
import { setupCommandMock } from '../test-utils/zx-mock'

vi.mock('zx')
vi.mock('ora')

const mockSpinner = {
  start: vi.fn().mockReturnThis(),
  succeed: vi.fn().mockReturnThis(),
  fail: vi.fn().mockReturnThis(),
}

describe('GitLabProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(ora).mockReturnValue(mockSpinner as any)
  })

  it('createPR uses web flow by default', async () => {
    const provider = new GitLabProvider()
    const executedCommands = setupCommandMock((command) => {
      if (
        command ===
        'glab mr create --title feat: add login --target-branch main --source-branch feat/add-login --description "" --web'
      ) {
        return { stdout: '' }
      }
      throw new Error(`Unexpected command: ${command}`)
    })

    await provider.createPR('feat: add login', 'feat/add-login', 'main')

    expect(
      executedCommands.includes(
        'glab mr create --title feat: add login --target-branch main --source-branch feat/add-login --description "" --web',
      ),
    ).toBe(true)
  })

  it('createPR skips web flow when web option is false', async () => {
    const provider = new GitLabProvider()
    const executedCommands = setupCommandMock((command) => {
      if (
        command ===
        'glab mr create --title feat: add login --target-branch main --source-branch feat/add-login --description ""'
      ) {
        return { stdout: '' }
      }
      throw new Error(`Unexpected command: ${command}`)
    })

    await provider.createPR('feat: add login', 'feat/add-login', 'main', {
      web: false,
    })

    expect(
      executedCommands.includes(
        'glab mr create --title feat: add login --target-branch main --source-branch feat/add-login --description ""',
      ),
    ).toBe(true)
  })

  it('checkExistingPR returns MR URL when one exists', async () => {
    const provider = new GitLabProvider()

    setupCommandMock((command) => {
      if (command === 'git rev-parse --abbrev-ref HEAD') {
        return { stdout: 'feat/mr-branch\n' }
      }
      if (
        command ===
        'glab mr list -s opened --source-branch feat/mr-branch -F json | head -1'
      ) {
        return {
          stdout: JSON.stringify([
            { web_url: 'https://gitlab.com/group/project/-/merge_requests/99' },
          ]),
        }
      }
      throw new Error(`Unexpected command: ${command}`)
    })

    const result = await provider.checkExistingPR()
    expect(result).toBe('https://gitlab.com/group/project/-/merge_requests/99')
  })

  it('checkExistingPR returns null when no MR exists', async () => {
    const provider = new GitLabProvider()

    setupCommandMock((command) => {
      if (command === 'git rev-parse --abbrev-ref HEAD') {
        return { stdout: 'feat/mr-branch\n' }
      }
      if (
        command ===
        'glab mr list -s opened --source-branch feat/mr-branch -F json | head -1'
      ) {
        return { stdout: '[]' }
      }
      throw new Error(`Unexpected command: ${command}`)
    })

    const result = await provider.checkExistingPR()
    expect(result).toBeNull()
  })

  it('getPRDetails parses GitLab MR URL input correctly', async () => {
    const provider = new GitLabProvider()

    setupCommandMock((command) => {
      if (command === 'glab mr view 123 -F json') {
        return {
          stdout: JSON.stringify({
            iid: 123,
            title: 'Fix issue',
            web_url: 'https://gitlab.com/group/project/-/merge_requests/123',
            target_branch: 'main',
            source_branch: 'feat/mr-branch',
            state: 'opened',
            author: { username: 'alice' },
          }),
        }
      }
      if (command === 'glab repo view -F json') {
        return {
          stdout: JSON.stringify({
            name: 'project',
            namespace: { path: 'group' },
          }),
        }
      }
      throw new Error(`Unexpected command: ${command}`)
    })

    const details = await provider.getPRDetails(
      'https://gitlab.com/group/project/-/merge_requests/123',
    )

    expect(details.number).toBe('123')
    expect(details.owner).toBe('group')
    expect(details.repo).toBe('project')
    expect(details.url).toBe(
      'https://gitlab.com/group/project/-/merge_requests/123',
    )
  })

  it('getPRDetails throws clear error when no current-branch MR exists', async () => {
    const provider = new GitLabProvider()

    setupCommandMock((command) => {
      if (command === 'git rev-parse --abbrev-ref HEAD') {
        return { stdout: 'feat/mr-branch\n' }
      }
      if (
        command ===
        'glab mr list -s opened --source-branch feat/mr-branch -F json | head -1'
      ) {
        return { stdout: '[]' }
      }
      throw new Error(`Unexpected command: ${command}`)
    })

    await expect(provider.getPRDetails()).rejects.toThrow(
      "No open Merge Request found for the current branch. Please ensure there's an open MR before running this command.",
    )
  })
})
