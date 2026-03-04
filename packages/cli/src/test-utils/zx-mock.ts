import { vi } from 'vitest'
import { $ } from 'zx'

export interface MockCommandResult {
  stdout: string
}

const mockZx = vi.mocked($)

export function stringifyCommand(args: unknown[]): string {
  const [template, ...values] = args as [string[], ...unknown[]]
  return template
    .reduce((cmd, chunk, index) => {
      const value = index < values.length ? String(values[index]) : ''
      return cmd + chunk + value
    }, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function setupCommandMock(
  handler: (command: string) => MockCommandResult | Promise<MockCommandResult>,
): string[] {
  const executedCommands: string[] = []

  mockZx.mockImplementation((...args: unknown[]) => {
    const command = stringifyCommand(args)
    executedCommands.push(command)

    try {
      return Promise.resolve(handler(command))
    } catch (error) {
      return Promise.reject(error)
    }
  })

  return executedCommands
}
