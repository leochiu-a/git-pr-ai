import { beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { $ } from 'zx'
import ora from 'ora'
import fs from 'fs/promises'
import { GitHubProvider } from './github'
import { setupCommandMock } from '../test-utils/zx-mock'

vi.mock('zx')
vi.mock('ora')

const mockZx = vi.mocked($)

const mockSpinner = {
  start: vi.fn().mockReturnThis(),
  succeed: vi.fn().mockReturnThis(),
  fail: vi.fn().mockReturnThis(),
}

describe('GitHubProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(ora).mockReturnValue(mockSpinner as any)
  })

  it('checkExistingPR finds upstream PR in fork workflow', async () => {
    const provider = new GitHubProvider()

    setupCommandMock((command) => {
      if (command === 'git rev-parse --abbrev-ref HEAD') {
        return { stdout: 'feat/fork-branch\n' }
      }
      if (
        command === 'gh repo view --json nameWithOwner,owner,name,isFork,parent'
      ) {
        return {
          stdout: JSON.stringify({
            nameWithOwner: 'alice/fork-repo',
            owner: { login: 'alice' },
            name: 'fork-repo',
            isFork: true,
            parent: {
              nameWithOwner: 'org/main-repo',
              owner: { login: 'org' },
              name: 'main-repo',
            },
          }),
        }
      }
      if (
        command.includes(
          'gh pr list --state open --repo org/main-repo --head feat/fork-branch',
        )
      ) {
        return {
          stdout: JSON.stringify([
            {
              number: 42,
              url: 'https://github.com/org/main-repo/pull/42',
              headRefName: 'feat/fork-branch',
              headRepositoryOwner: { login: 'alice' },
            },
          ]),
        }
      }
      throw new Error(`Unexpected command: ${command}`)
    })

    const result = await provider.checkExistingPR()
    expect(result).toBe('https://github.com/org/main-repo/pull/42')
  })

  it('checkExistingPR prefers upstream PR when both upstream/current can exist', async () => {
    const provider = new GitHubProvider()
    const executedCommands = setupCommandMock((command) => {
      if (command === 'git rev-parse --abbrev-ref HEAD') {
        return { stdout: 'feat/fork-branch\n' }
      }
      if (
        command === 'gh repo view --json nameWithOwner,owner,name,isFork,parent'
      ) {
        return {
          stdout: JSON.stringify({
            nameWithOwner: 'alice/fork-repo',
            owner: { login: 'alice' },
            name: 'fork-repo',
            isFork: true,
            parent: {
              nameWithOwner: 'org/main-repo',
              owner: { login: 'org' },
              name: 'main-repo',
            },
          }),
        }
      }
      if (
        command.includes(
          'gh pr list --state open --repo org/main-repo --head feat/fork-branch',
        )
      ) {
        return {
          stdout: JSON.stringify([
            {
              number: 42,
              url: 'https://github.com/org/main-repo/pull/42',
              headRefName: 'feat/fork-branch',
              headRepositoryOwner: { login: 'alice' },
            },
          ]),
        }
      }
      if (
        command.includes(
          'gh pr list --state open --repo alice/fork-repo --head feat/fork-branch',
        )
      ) {
        return {
          stdout: JSON.stringify([
            {
              number: 99,
              url: 'https://github.com/alice/fork-repo/pull/99',
              headRefName: 'feat/fork-branch',
              headRepositoryOwner: { login: 'alice' },
            },
          ]),
        }
      }
      throw new Error(`Unexpected command: ${command}`)
    })

    const result = await provider.checkExistingPR()
    expect(result).toBe('https://github.com/org/main-repo/pull/42')
    expect(
      executedCommands.some((command) =>
        command.includes('gh pr list --state open --repo alice/fork-repo'),
      ),
    ).toBe(false)
  })

  it('openPR opens PR using resolved URL', async () => {
    const provider = new GitHubProvider()
    const executedCommands = setupCommandMock((command) => {
      if (command === 'git rev-parse --abbrev-ref HEAD') {
        return { stdout: 'feat/fork-branch\n' }
      }
      if (
        command === 'gh repo view --json nameWithOwner,owner,name,isFork,parent'
      ) {
        return {
          stdout: JSON.stringify({
            nameWithOwner: 'alice/fork-repo',
            owner: { login: 'alice' },
            name: 'fork-repo',
            isFork: true,
            parent: {
              nameWithOwner: 'org/main-repo',
              owner: { login: 'org' },
              name: 'main-repo',
            },
          }),
        }
      }
      if (
        command.includes(
          'gh pr list --state open --repo org/main-repo --head feat/fork-branch',
        )
      ) {
        return {
          stdout: JSON.stringify([
            {
              number: 42,
              url: 'https://github.com/org/main-repo/pull/42',
              headRefName: 'feat/fork-branch',
              headRepositoryOwner: { login: 'alice' },
            },
          ]),
        }
      }
      if (
        command === 'gh pr view https://github.com/org/main-repo/pull/42 --web'
      ) {
        return { stdout: '' }
      }
      if (
        command ===
        'gh pr view https://github.com/org/main-repo/pull/42 --json url'
      ) {
        return {
          stdout: JSON.stringify({
            url: 'https://github.com/org/main-repo/pull/42',
          }),
        }
      }
      throw new Error(`Unexpected command: ${command}`)
    })

    await provider.openPR()

    expect(
      executedCommands.includes(
        'gh pr view https://github.com/org/main-repo/pull/42 --web',
      ),
    ).toBe(true)
  })

  it('openPR surfaces PR lookup failures instead of masking as missing PR', async () => {
    const provider = new GitHubProvider()

    setupCommandMock((command) => {
      if (command === 'git rev-parse --abbrev-ref HEAD') {
        return { stdout: 'feat/fork-branch\n' }
      }
      if (
        command === 'gh repo view --json nameWithOwner,owner,name,isFork,parent'
      ) {
        throw new Error('gh auth failed')
      }
      throw new Error(`Unexpected command: ${command}`)
    })

    await expect(provider.openPR()).rejects.toThrow('gh auth failed')
  })

  it('getPRDetails without args resolves upstream PR and actual repo ownership', async () => {
    const provider = new GitHubProvider()

    setupCommandMock((command) => {
      if (command === 'git rev-parse --abbrev-ref HEAD') {
        return { stdout: 'feat/fork-branch\n' }
      }
      if (
        command === 'gh repo view --json nameWithOwner,owner,name,isFork,parent'
      ) {
        return {
          stdout: JSON.stringify({
            nameWithOwner: 'alice/fork-repo',
            owner: { login: 'alice' },
            name: 'fork-repo',
            isFork: true,
            parent: {
              nameWithOwner: 'org/main-repo',
              owner: { login: 'org' },
              name: 'main-repo',
            },
          }),
        }
      }
      if (
        command.includes(
          'gh pr list --state open --repo org/main-repo --head feat/fork-branch',
        )
      ) {
        return {
          stdout: JSON.stringify([
            {
              number: 42,
              url: 'https://github.com/org/main-repo/pull/42',
              headRefName: 'feat/fork-branch',
              headRepositoryOwner: { login: 'alice' },
            },
          ]),
        }
      }
      if (
        command ===
        'gh pr view 42 --repo org/main-repo --json number,title,url,baseRefName,headRefName,state,author'
      ) {
        return {
          stdout: JSON.stringify({
            number: 42,
            title: 'Fix branch discovery',
            url: 'https://github.com/org/main-repo/pull/42',
            baseRefName: 'main',
            headRefName: 'feat/fork-branch',
            state: 'OPEN',
            author: { login: 'alice' },
          }),
        }
      }
      throw new Error(`Unexpected command: ${command}`)
    })

    const details = await provider.getPRDetails()
    expect(details.owner).toBe('org')
    expect(details.repo).toBe('main-repo')
    expect(details.number).toBe('42')
  })

  it('getPRDetails with URL uses repository from URL', async () => {
    const provider = new GitHubProvider()
    const executedCommands = setupCommandMock((command) => {
      if (
        command ===
        'gh pr view 77 --repo org/main-repo --json number,title,url,baseRefName,headRefName,state,author'
      ) {
        return {
          stdout: JSON.stringify({
            number: 77,
            title: 'Use explicit repo from URL',
            url: 'https://github.com/org/main-repo/pull/77',
            baseRefName: 'main',
            headRefName: 'feat/fork-branch',
            state: 'OPEN',
            author: { login: 'alice' },
          }),
        }
      }
      throw new Error(`Unexpected command: ${command}`)
    })

    const details = await provider.getPRDetails(
      'https://github.com/org/main-repo/pull/77',
    )

    expect(details.owner).toBe('org')
    expect(details.repo).toBe('main-repo')
    expect(details.number).toBe('77')
    expect(executedCommands[0]).toBe(
      'gh pr view 77 --repo org/main-repo --json number,title,url,baseRefName,headRefName,state,author',
    )
  })

  it('getPRDetails with number tries upstream first, then current repo', async () => {
    const provider = new GitHubProvider()
    const executedCommands = setupCommandMock((command) => {
      if (
        command === 'gh repo view --json nameWithOwner,owner,name,isFork,parent'
      ) {
        return {
          stdout: JSON.stringify({
            nameWithOwner: 'alice/fork-repo',
            owner: { login: 'alice' },
            name: 'fork-repo',
            isFork: true,
            parent: {
              nameWithOwner: 'org/main-repo',
              owner: { login: 'org' },
              name: 'main-repo',
            },
          }),
        }
      }
      if (
        command ===
        'gh pr view 123 --repo org/main-repo --json number,title,url,baseRefName,headRefName,state,author'
      ) {
        throw new Error('no pull requests found for branch "123"')
      }
      if (
        command ===
        'gh pr view 123 --repo alice/fork-repo --json number,title,url,baseRefName,headRefName,state,author'
      ) {
        return {
          stdout: JSON.stringify({
            number: 123,
            title: 'Fallback to current repo',
            url: 'https://github.com/alice/fork-repo/pull/123',
            baseRefName: 'main',
            headRefName: 'feat/fork-branch',
            state: 'OPEN',
            author: { login: 'alice' },
          }),
        }
      }
      throw new Error(`Unexpected command: ${command}`)
    })

    const details = await provider.getPRDetails('123')

    expect(details.owner).toBe('alice')
    expect(details.repo).toBe('fork-repo')
    expect(executedCommands[1]).toContain('--repo org/main-repo')
    expect(executedCommands[2]).toContain('--repo alice/fork-repo')
  })

  it('getPRDetails with number rethrows non-not-found errors during repo probing', async () => {
    const provider = new GitHubProvider()
    const executedCommands = setupCommandMock((command) => {
      if (
        command === 'gh repo view --json nameWithOwner,owner,name,isFork,parent'
      ) {
        return {
          stdout: JSON.stringify({
            nameWithOwner: 'alice/fork-repo',
            owner: { login: 'alice' },
            name: 'fork-repo',
            isFork: true,
            parent: {
              nameWithOwner: 'org/main-repo',
              owner: { login: 'org' },
              name: 'main-repo',
            },
          }),
        }
      }
      if (
        command ===
        'gh pr view 123 --repo org/main-repo --json number,title,url,baseRefName,headRefName,state,author'
      ) {
        throw new Error('gh auth failed')
      }
      if (
        command ===
        'gh pr view 123 --repo alice/fork-repo --json number,title,url,baseRefName,headRefName,state,author'
      ) {
        return {
          stdout: JSON.stringify({
            number: 123,
            title: 'Should not be reached',
            url: 'https://github.com/alice/fork-repo/pull/123',
            baseRefName: 'main',
            headRefName: 'feat/fork-branch',
            state: 'OPEN',
            author: { login: 'alice' },
          }),
        }
      }
      throw new Error(`Unexpected command: ${command}`)
    })

    await expect(provider.getPRDetails('123')).rejects.toThrow('gh auth failed')
    expect(
      executedCommands.some((command) =>
        command.includes('--repo alice/fork-repo'),
      ),
    ).toBe(false)
  })

  it('createPR uses web flow by default', async () => {
    const provider = new GitHubProvider()
    const executedCommands = setupCommandMock((command) => {
      if (
        command ===
        'gh pr create --title feat: add login --base main --head feat/add-login --web'
      ) {
        return { stdout: '' }
      }
      throw new Error(`Unexpected command: ${command}`)
    })

    await provider.createPR('feat: add login', 'feat/add-login', 'main')

    expect(
      executedCommands.includes(
        'gh pr create --title feat: add login --base main --head feat/add-login --web',
      ),
    ).toBe(true)
  })

  it('createPR skips web flow when web option is false', async () => {
    const provider = new GitHubProvider()
    const executedCommands = setupCommandMock((command) => {
      if (
        command ===
        'gh pr create --title feat: add login --body "" --base main --head feat/add-login'
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
        'gh pr create --title feat: add login --body "" --base main --head feat/add-login',
      ),
    ).toBe(true)
  })

  it('getPRDetails without args throws clear error when no PR found', async () => {
    const provider = new GitHubProvider()

    setupCommandMock((command) => {
      if (command === 'git rev-parse --abbrev-ref HEAD') {
        return { stdout: 'feat/fork-branch\n' }
      }
      if (
        command === 'gh repo view --json nameWithOwner,owner,name,isFork,parent'
      ) {
        return {
          stdout: JSON.stringify({
            nameWithOwner: 'alice/fork-repo',
            owner: { login: 'alice' },
            name: 'fork-repo',
            isFork: true,
            parent: {
              nameWithOwner: 'org/main-repo',
              owner: { login: 'org' },
              name: 'main-repo',
            },
          }),
        }
      }
      if (
        command.includes(
          'gh pr list --state open --repo org/main-repo --head feat/fork-branch',
        ) ||
        command.includes(
          'gh pr list --state open --repo alice/fork-repo --head feat/fork-branch',
        )
      ) {
        return { stdout: '[]' }
      }
      throw new Error(`Unexpected command: ${command}`)
    })

    await expect(provider.getPRDetails()).rejects.toThrow(
      'No open pull request found for branch "feat/fork-branch" in repositories: org/main-repo, alice/fork-repo',
    )
  })

  it('updateDescription executes gh command as structured args instead of a single command string', async () => {
    const provider = new GitHubProvider()
    vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined)
    vi.spyOn(fs, 'unlink').mockResolvedValue(undefined)

    mockZx.mockImplementation((...args: unknown[]) => {
      const [template, ...values] = args as [string[], ...unknown[]]
      const isSingleInterpolatedCommand =
        template.length === 2 &&
        template[0] === '' &&
        template[1] === '' &&
        values.length === 1 &&
        typeof values[0] === 'string'

      if (isSingleInterpolatedCommand) {
        throw new Error(`/bin/bash: ${String(values[0])}: command not found`)
      }

      return Promise.resolve({ stdout: '' })
    })

    await expect(
      provider.updateDescription('body', '101'),
    ).resolves.toBeUndefined()
  })

  it('postComment executes gh command as structured args instead of a single command string', async () => {
    const provider = new GitHubProvider()
    vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined)
    vi.spyOn(fs, 'unlink').mockResolvedValue(undefined)

    mockZx.mockImplementation((...args: unknown[]) => {
      const [template, ...values] = args as [string[], ...unknown[]]
      const isSingleInterpolatedCommand =
        template.length === 2 &&
        template[0] === '' &&
        template[1] === '' &&
        values.length === 1 &&
        typeof values[0] === 'string'

      if (isSingleInterpolatedCommand) {
        throw new Error(`/bin/bash: ${String(values[0])}: command not found`)
      }

      return Promise.resolve({ stdout: '' })
    })

    await expect(provider.postComment('body', '101')).resolves.toBeUndefined()
  })
})
