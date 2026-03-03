import { executeAIInternal } from './internal'
import { type CommandName } from '../config'

export interface AIExecutionOptions {
  useLanguage?: boolean
  yolo?: boolean
  commandName?: CommandName
}

export async function executeAICommand(
  prompt: string,
  options: AIExecutionOptions = {},
): Promise<void> {
  await executeAIInternal(prompt, { ...options, outputType: 'inherit' })
}

export async function executeAIWithOutput(
  prompt: string,
  options: AIExecutionOptions = {},
): Promise<string> {
  return await executeAIInternal(prompt, { ...options, outputType: 'capture' })
}

export async function executeAIWithJsonOutput(
  prompt: string,
  options: AIExecutionOptions = {},
): Promise<string> {
  return await executeAIInternal(prompt, { ...options, outputType: 'json' })
}
