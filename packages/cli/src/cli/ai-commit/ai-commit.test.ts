import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { $ } from 'zx'
import { createCommit } from './git-commit'

vi.mock('zx')

const mockZx = vi.mocked($)

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('createCommit', () => {
  it('throws without calling console.error when there are no staged changes', async () => {
    mockZx.mockReturnValue(
      Object.assign(Promise.resolve({ stdout: '', exitCode: 0 }), {
        exitCode: Promise.resolve(0),
      }) as any,
    )

    await expect(createCommit('feat: something')).rejects.toThrow(
      'No staged changes detected. Please stage your files before committing.',
    )

    expect(console.error).not.toHaveBeenCalled()
  })
})
