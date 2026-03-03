import { describe, expect, it, vi } from 'vitest'
import { PRDetails } from '../../providers/types'
import { runReviewWithExecutionMode } from './runner'

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
})
