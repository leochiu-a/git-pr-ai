import { Command } from 'commander'
import { checkGitCLI } from '../../git-helpers'
import { loadConfig } from '../../config'
import { executeAICommand, executeAIWithOutput } from '../../ai/executor'
import { getCurrentProvider } from '../../providers/factory'
import { buildUpdateDescriptionPrompt } from './prompts'
import { checkAndUpgrade } from '../../utils/version-checker'
import { runUpdateDescriptionWithExecutionMode } from './runner'
import {
  assertNoYoloWithNonInteractive,
  resolveNonInteractiveMode,
} from '../shared/non-interactive'

function setupCommander() {
  const program = new Command()

  program
    .name('git-update-pr-desc')
    .description('Update PR description using AI')
    .argument('[prompt...]', 'additional context for the update')
    .option('--non-interactive', 'run without interactive AI session')
    .option('--ci', 'alias of --non-interactive')
    .option(
      '--yolo',
      'run interactive AI session with fewer permission prompts',
    )
    .addHelpText(
      'after',
      `
Examples:
  $ git update-pr-desc
    Update PR description with AI

  $ git update-pr-desc "focus on security improvements"
    Update with additional context

  $ git update-pr-desc --non-interactive
    Run non-interactive flow and update description from captured AI output

  $ git update-pr-desc --yolo
    Keep interactive AI session with YOLO behavior
`,
    )

  return program
}

async function main() {
  const program = setupCommander()

  program.action(
    async (
      promptArgs: string[],
      options: { yolo?: boolean; nonInteractive?: boolean; ci?: boolean },
    ) => {
      try {
        // Check for version updates
        await checkAndUpgrade()

        await checkGitCLI()

        // Get additional prompt from arguments
        const additionalPrompt = promptArgs.join(' ')

        const config = await loadConfig()
        const provider = await getCurrentProvider()
        assertNoYoloWithNonInteractive(options)
        const nonInteractive = resolveNonInteractiveMode(options, {
          includeLegacyYolo: false,
        })

        console.log(`Using ${config.agent.toUpperCase()} for AI assistance`)

        // Use provider to get detailed PR info
        const prDetails = await provider.getPRDetails()

        // Use prompts function to construct the complete prompt
        const prompt = await buildUpdateDescriptionPrompt({
          prDetails: prDetails,
          options: { additionalContext: additionalPrompt },
          provider,
        })

        console.log('🤖 Launching AI assistant...')

        await runUpdateDescriptionWithExecutionMode({
          prompt,
          prDetails,
          nonInteractive,
          yolo: Boolean(options.yolo),
          executeAIWithOutput,
          executeAICommand,
          updateDescription: provider.updateDescription.bind(provider),
        })

        // Show success message
        console.log('✅ PR description updated successfully!')
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error)
        console.error('Error:', errorMessage)
        process.exit(1)
      }
    },
  )

  program.parse()
}

main()
