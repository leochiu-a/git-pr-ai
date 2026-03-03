import { PRDetails } from '../../providers/types'
import { type AIExecutionOptions } from '../../ai/executor'

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
    const description = await executeAIWithOutput(prompt, {
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
