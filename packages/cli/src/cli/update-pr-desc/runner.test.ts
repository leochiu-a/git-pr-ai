import { describe, expect, it, vi } from 'vitest'
import { PRDetails } from '../../providers/types'
import { runUpdateDescriptionWithExecutionMode } from './runner'

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
})
