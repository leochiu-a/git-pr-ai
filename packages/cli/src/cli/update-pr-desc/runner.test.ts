import { describe, expect, it, vi, beforeEach } from 'vitest'
import ora from 'ora'
import { PRDetails } from '../../providers/types'
import { runUpdateDescriptionWithExecutionMode } from './runner'

vi.mock('ora')

const prDetails: PRDetails = {
  number: '456',
  title: 'Update desc',
  url: 'https://example.com/pr/456',
  baseBranch: 'main',
  headBranch: 'feat/desc',
  owner: 'acme',
  repo: 'demo',
  state: 'open',
  author: 'dev',
}

describe('runUpdateDescriptionWithExecutionMode', () => {
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
    const executeAIWithOutput = vi.fn().mockResolvedValue('new description')
    const executeAICommand = vi.fn()
    const updateDescription = vi.fn().mockResolvedValue(undefined)

    await runUpdateDescriptionWithExecutionMode({
      prompt: 'original prompt',
      prDetails,
      nonInteractive: true,
      yolo: false,
      executeAIWithOutput,
      executeAICommand,
      updateDescription,
    })

    expect(executeAIWithOutput).toHaveBeenCalledWith('original prompt', {
      useLanguage: true,
      yolo: false,
      commandName: 'updatePrDesc',
    })
  })

  it('uses captured AI output and updates description in non-interactive mode', async () => {
    const executeAIWithOutput = vi.fn().mockResolvedValue('new description')
    const executeAICommand = vi.fn()
    const updateDescription = vi.fn().mockResolvedValue(undefined)

    await runUpdateDescriptionWithExecutionMode({
      prompt: 'prompt',
      prDetails,
      nonInteractive: true,
      yolo: false,
      executeAIWithOutput,
      executeAICommand,
      updateDescription,
    })

    expect(executeAIWithOutput).toHaveBeenCalledTimes(1)
    expect(executeAICommand).not.toHaveBeenCalled()
    expect(updateDescription).toHaveBeenCalledWith('new description', '456')
  })

  it('uses interactive executor in normal mode', async () => {
    const executeAIWithOutput = vi.fn()
    const executeAICommand = vi.fn().mockResolvedValue(undefined)
    const updateDescription = vi.fn()

    await runUpdateDescriptionWithExecutionMode({
      prompt: 'prompt',
      prDetails,
      nonInteractive: false,
      yolo: true,
      executeAIWithOutput,
      executeAICommand,
      updateDescription,
    })

    expect(executeAICommand).toHaveBeenCalledTimes(1)
    expect(executeAIWithOutput).not.toHaveBeenCalled()
    expect(updateDescription).not.toHaveBeenCalled()
  })

  it('shows spinner during non-interactive AI execution', async () => {
    const executeAIWithOutput = vi.fn().mockResolvedValue('new description')
    const executeAICommand = vi.fn()
    const updateDescription = vi.fn().mockResolvedValue(undefined)

    await runUpdateDescriptionWithExecutionMode({
      prompt: 'prompt',
      prDetails,
      nonInteractive: true,
      yolo: false,
      executeAIWithOutput,
      executeAICommand,
      updateDescription,
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
    const updateDescription = vi.fn()

    await expect(
      runUpdateDescriptionWithExecutionMode({
        prompt: 'prompt',
        prDetails,
        nonInteractive: true,
        yolo: false,
        executeAIWithOutput,
        executeAICommand,
        updateDescription,
      }),
    ).rejects.toThrow('AI failed')

    expect(mockSpinner.start).toHaveBeenCalled()
    expect(mockSpinner.fail).toHaveBeenCalled()
    expect(mockSpinner.succeed).not.toHaveBeenCalled()
  })

  it('does not show spinner in interactive mode', async () => {
    const executeAIWithOutput = vi.fn()
    const executeAICommand = vi.fn().mockResolvedValue(undefined)
    const updateDescription = vi.fn()

    await runUpdateDescriptionWithExecutionMode({
      prompt: 'prompt',
      prDetails,
      nonInteractive: false,
      yolo: false,
      executeAIWithOutput,
      executeAICommand,
      updateDescription,
    })

    expect(ora).not.toHaveBeenCalled()
  })
})
