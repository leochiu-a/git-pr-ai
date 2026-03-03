import { PRDetails } from '../../providers/types'
import { CommandName } from '../../config'

interface AIExecutionOptions {
  useLanguage?: boolean
  yolo?: boolean
  commandName?: CommandName
}

interface ReviewRunnerArgs {
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
  postComment: (content: string, prNumber?: string) => Promise<void>
}

export async function runReviewWithExecutionMode({
  prompt,
  prDetails,
  nonInteractive,
  yolo,
  executeAIWithOutput,
  executeAICommand,
  postComment,
}: ReviewRunnerArgs): Promise<void> {
  if (nonInteractive) {
    const outputOnlyPrompt = `${prompt}

IMPORTANT: You are running in non-interactive mode.
Do not execute any shell command.
Return only the final markdown review content to be posted as a PR comment.`

    const reviewContent = await executeAIWithOutput(outputOnlyPrompt, {
      useLanguage: true,
      yolo,
      commandName: 'prReview',
    })
    await postComment(reviewContent, prDetails.number)
    return
  }

  await executeAICommand(prompt, {
    useLanguage: true,
    yolo,
    commandName: 'prReview',
  })
}
