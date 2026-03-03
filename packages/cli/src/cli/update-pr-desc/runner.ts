import { PRDetails } from '../../providers/types'
import { CommandName } from '../../config'

interface AIExecutionOptions {
  useLanguage?: boolean
  yolo?: boolean
  commandName?: CommandName
}

interface UpdateDescriptionRunnerArgs {
  prompt: string
  prDetails: PRDetails
  nonInteractive: boolean
  yolo: boolean
  executeAIWithOutput: (
    prompt: string,
    options?: AIExecutionOptions,
  ) => Promise<string>
  executeAICommand: (
    prompt: string,
    options?: AIExecutionOptions,
  ) => Promise<void>
  updateDescription: (content: string, prNumber?: string) => Promise<void>
}

export async function runUpdateDescriptionWithExecutionMode({
  prompt,
  prDetails,
  nonInteractive,
  yolo,
  executeAIWithOutput,
  executeAICommand,
  updateDescription,
}: UpdateDescriptionRunnerArgs): Promise<void> {
  if (nonInteractive) {
    const outputOnlyPrompt = `${prompt}

IMPORTANT: You are running in non-interactive mode.
Do not execute any shell command.
Return only the final PR description markdown content.`

    const description = await executeAIWithOutput(outputOnlyPrompt, {
      useLanguage: true,
      yolo,
      commandName: 'updatePrDesc',
    })
    await updateDescription(description, prDetails.number)
    return
  }

  await executeAICommand(prompt, {
    useLanguage: true,
    yolo,
    commandName: 'updatePrDesc',
  })
}
