import { describe, expect, it, vi, beforeEach } from 'vite-plus/test'
import ora from 'ora'
import { PRDetails } from '../../providers/types'
import { runReviewWithExecutionMode } from './runner'

vi.mock('ora')

const prDetails: PRDetails = {
  number: '123',
  title: 'Test PR',
  url: 'https://example.com/pr/123',
  baseBranch: 'main',
  headBranch: 'feat/test',
  owner: 'acme',
  repo: 'demo',
  state: 'open',
  author: 'dev',
}

describe('runReviewWithExecutionMode', () => {
  const mockSpinner = {
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(ora).mockReturnValue(mockSpinner as any)
  })

  it('uses original prompt in non-interactive mode without appending extra instructions', async () => {
    const executeAIWithOutput = vi.fn().mockResolvedValue('review body')
    const executeAICommand = vi.fn()
    const postComment = vi.fn().mockResolvedValue(undefined)

    await runReviewWithExecutionMode({
      prompt: 'original prompt',
      prDetails,
      nonInteractive: true,
      yolo: false,
      executeAIWithOutput,
      executeAICommand,
      postComment,
    })

    expect(executeAIWithOutput).toHaveBeenCalledWith('original prompt', {
      useLanguage: true,
      yolo: false,
      commandName: 'prReview',
    })
  })

  it('uses captured AI output and posts a comment in non-interactive mode', async () => {
    const executeAIWithOutput = vi.fn().mockResolvedValue('review body')
    const executeAICommand = vi.fn()
    const postComment = vi.fn().mockResolvedValue(undefined)

    await runReviewWithExecutionMode({
      prompt: 'prompt',
      prDetails,
      nonInteractive: true,
      yolo: false,
      executeAIWithOutput,
      executeAICommand,
      postComment,
    })

    expect(executeAIWithOutput).toHaveBeenCalledTimes(1)
    expect(executeAICommand).not.toHaveBeenCalled()
    expect(postComment).toHaveBeenCalledWith('review body', '123')
  })

  it('uses interactive executor in normal mode', async () => {
    const executeAIWithOutput = vi.fn()
    const executeAICommand = vi.fn().mockResolvedValue(undefined)
    const postComment = vi.fn()

    await runReviewWithExecutionMode({
      prompt: 'prompt',
      prDetails,
      nonInteractive: false,
      yolo: true,
      executeAIWithOutput,
      executeAICommand,
      postComment,
    })

    expect(executeAICommand).toHaveBeenCalledTimes(1)
    expect(executeAIWithOutput).not.toHaveBeenCalled()
    expect(postComment).not.toHaveBeenCalled()
  })

  it('shows spinner during non-interactive AI execution', async () => {
    const executeAIWithOutput = vi.fn().mockResolvedValue('review body')
    const executeAICommand = vi.fn()
    const postComment = vi.fn().mockResolvedValue(undefined)

    await runReviewWithExecutionMode({
      prompt: 'prompt',
      prDetails,
      nonInteractive: true,
      yolo: false,
      executeAIWithOutput,
      executeAICommand,
      postComment,
    })

    expect(ora).toHaveBeenCalled()
    expect(mockSpinner.start).toHaveBeenCalled()
    expect(mockSpinner.succeed).toHaveBeenCalled()
  })

  it('shows spinner failure when AI execution fails in non-interactive mode', async () => {
    const executeAIWithOutput = vi
      .fn()
      .mockRejectedValue(new Error('AI failed'))
    const executeAICommand = vi.fn()
    const postComment = vi.fn()

    await expect(
      runReviewWithExecutionMode({
        prompt: 'prompt',
        prDetails,
        nonInteractive: true,
        yolo: false,
        executeAIWithOutput,
        executeAICommand,
        postComment,
      }),
    ).rejects.toThrow('AI failed')

    expect(mockSpinner.start).toHaveBeenCalled()
    expect(mockSpinner.fail).toHaveBeenCalled()
    expect(mockSpinner.succeed).not.toHaveBeenCalled()
  })

  it('does not show spinner in interactive mode', async () => {
    const executeAIWithOutput = vi.fn()
    const executeAICommand = vi.fn().mockResolvedValue(undefined)
    const postComment = vi.fn()

    await runReviewWithExecutionMode({
      prompt: 'prompt',
      prDetails,
      nonInteractive: false,
      yolo: false,
      executeAIWithOutput,
      executeAICommand,
      postComment,
    })

    expect(ora).not.toHaveBeenCalled()
  })
})
