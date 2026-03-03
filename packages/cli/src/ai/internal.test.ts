import { beforeEach, describe, expect, it, vi } from 'vitest'
import { $ } from 'zx'
import { executeAIInternal } from './internal'
import { getLanguage } from '../git-helpers'
import { createLanguagePrompt } from '../language-prompts'
import { getModelForCommand, loadConfig } from '../config'
import { stringifyCommand, type MockCommandResult } from '../test-utils/zx-mock'

vi.mock('zx')
vi.mock('../config', () => ({
  loadConfig: vi.fn(),
  getModelForCommand: vi.fn(),
}))
vi.mock('../git-helpers', () => ({
  getLanguage: vi.fn(),
}))
vi.mock('../language-prompts', () => ({
  createLanguagePrompt: vi.fn((prompt: string) => prompt),
}))

interface ExecutedCommand {
  command: string
  options?: unknown
}

const mockZx = vi.mocked($)
const mockLoadConfig = vi.mocked(loadConfig)
const mockGetLanguage = vi.mocked(getLanguage)
const mockCreateLanguagePrompt = vi.mocked(createLanguagePrompt)
const mockGetModelForCommand = vi.mocked(getModelForCommand)

function setupZxMock(): ExecutedCommand[] {
  const executedCommands: ExecutedCommand[] = []

  mockZx.mockImplementation((...firstCallArgs: unknown[]) => {
    // Direct tagged template usage: $`cmd`
    if (Array.isArray(firstCallArgs[0])) {
      const command = stringifyCommand(firstCallArgs)
      executedCommands.push({ command })

      return {
        quiet: vi.fn().mockResolvedValue({
          stdout: command.includes('--version') ? '1.0.0\n' : 'mock output\n',
        } as MockCommandResult),
      } as any
    }

    // Curried usage with options: $({ input })`cmd`
    const options = firstCallArgs[0]
    return ((...tagArgs: unknown[]) => {
      const command = stringifyCommand(tagArgs)
      executedCommands.push({ command, options })

      return {
        quiet: vi.fn().mockResolvedValue({
          stdout: 'mock output\n',
        } as MockCommandResult),
      } as any
    }) as any
  })

  return executedCommands
}

describe('executeAIInternal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLoadConfig.mockResolvedValue({ agent: 'claude' } as any)
    mockGetLanguage.mockResolvedValue('en')
    mockCreateLanguagePrompt.mockImplementation((prompt: string) => prompt)
    mockGetModelForCommand.mockReturnValue(undefined)
  })

  it('uses claude -p in capture mode to avoid interactive session', async () => {
    const executedCommands = setupZxMock()

    const result = await executeAIInternal('review prompt', {
      useLanguage: false,
      outputType: 'capture',
    })

    expect(result).toBe('mock output')
    expect(executedCommands[0]?.command).toBe('claude --version')
    expect(executedCommands[1]?.command).toBe('claude -p')
    expect(executedCommands[1]?.options).toEqual({ input: 'review prompt' })
  })

  it('uses claude -p with yolo and command model in capture mode', async () => {
    const executedCommands = setupZxMock()
    mockGetModelForCommand.mockReturnValue('sonnet')

    await executeAIInternal('review prompt', {
      outputType: 'capture',
      yolo: true,
      commandName: 'prReview',
    })

    expect(executedCommands[0]?.command).toBe('claude --version')
    expect(executedCommands[1]?.command).toBe(
      'claude -p --dangerously-skip-permissions --model sonnet',
    )
  })

  it('does not force yolo for codex capture mode when updating PR description', async () => {
    const executedCommands = setupZxMock()
    mockLoadConfig.mockResolvedValue({ agent: 'codex' } as any)

    await executeAIInternal('update prompt', {
      useLanguage: false,
      outputType: 'capture',
      commandName: 'updatePrDesc',
    })

    expect(executedCommands[0]?.command).toBe('codex --version')
    expect(executedCommands[1]?.command).toBe('codex exec')
  })
})
