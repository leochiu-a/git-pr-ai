import { executeAIInternal } from './internal'
import { type CommandName } from '../config'

export async function executeAICommand(
  prompt: string,
  options: {
    useLanguage?: boolean
    yolo?: boolean
    commandName?: CommandName
  } = {},
): Promise<void> {
  await executeAIInternal(prompt, { ...options, outputType: 'inherit' })
}

export async function executeAIWithOutput(
  prompt: string,
  options: {
    useLanguage?: boolean
    yolo?: boolean
    commandName?: CommandName
  } = {},
): Promise<string> {
  return await executeAIInternal(prompt, { ...options, outputType: 'capture' })
}

export async function executeAIWithJsonOutput(
  prompt: string,
  options: {
    useLanguage?: boolean
    yolo?: boolean
    commandName?: CommandName
  } = {},
): Promise<string> {
  return await executeAIInternal(prompt, { ...options, outputType: 'json' })
}
