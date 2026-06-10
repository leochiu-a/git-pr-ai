import { vi } from 'vite-plus/test'
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

    let promise: Promise<MockCommandResult>
    try {
      promise = Promise.resolve(handler(command))
    } catch (error) {
      promise = Promise.reject(error)
    }

    // zx's ProcessPromise supports chaining `.quiet()`; mirror it so mocked
    // commands using `$`...`.quiet()` resolve through the same handler.
    const processPromise = promise as Promise<MockCommandResult> & {
      quiet: () => Promise<MockCommandResult>
    }
    processPromise.quiet = () => processPromise
    return processPromise
  })

  return executedCommands
}
