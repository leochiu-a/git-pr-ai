import ora from 'ora'
import { PRDetails } from '../../providers/types'
import { type AIExecutionOptions } from '../../ai/executor'

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
    const spinner = ora('AI is reviewing PR...').start()
    try {
      const reviewContent = await executeAIWithOutput(prompt, {
        useLanguage: true,
        yolo,
        commandName: 'prReview',
      })
      await postComment(reviewContent, prDetails.number)
      spinner.succeed('PR review completed successfully')
    } catch (error) {
      spinner.fail('Failed to review PR')
      throw error
    }
    return
  }

  await executeAICommand(prompt, {
    useLanguage: true,
    yolo,
    commandName: 'prReview',
  })
}
