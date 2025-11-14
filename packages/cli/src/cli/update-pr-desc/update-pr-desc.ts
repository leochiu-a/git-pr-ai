import { Command } from 'commander'
import { checkGitCLI } from '../../git-helpers'
import { loadConfig } from '../../config'
import { executeAICommand } from '../../ai/executor'
import { getCurrentProvider } from '../../providers/factory'
import { buildUpdateDescriptionPrompt } from './prompts'
import { checkAndUpgrade } from '../../utils/version-checker'

function setupCommander() {
  const program = new Command()

  program
    .name('git-update-pr-desc')
    .description('Update PR description using AI')
    .argument('[prompt...]', 'additional context for the update')
    .option('--yolo', 'skip prompts and proceed with defaults')
    .addHelpText(
      'after',
      `
Examples:
  $ git update-pr-desc
    Update PR description with AI

  $ git update-pr-desc "focus on security improvements"
    Update with additional context

  $ git update-pr-desc --yolo
    Update without confirmation prompts
`,
    )

  return program
}

async function main() {
  const program = setupCommander()

  program.action(async (promptArgs: string[], options: { yolo?: boolean }) => {
    try {
      // Check for version updates
      await checkAndUpgrade()

      await checkGitCLI()

      // Get additional prompt from arguments
      const additionalPrompt = promptArgs.join(' ')

      const config = await loadConfig()
      const provider = await getCurrentProvider()

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

      await executeAICommand(prompt, {
        useLanguage: true,
        yolo: options.yolo,
        commandName: 'updatePrDesc',
      })

      // Show success message
      console.log('✅ PR description updated successfully!')
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      console.error('Error:', errorMessage)
      process.exit(1)
    }
  })

  program.parse()
}

main()
