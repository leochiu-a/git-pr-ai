import { checkGitCLI } from '../../git-helpers'
import { loadConfig } from '../../config'
import { executeAICommand } from '../../ai-executor'
import { getCurrentProvider } from '../../providers/factory'
import { buildUpdateDescriptionPrompt } from './prompts'

async function main() {
  await checkGitCLI()

  // Get additional prompt from command line arguments
  const additionalPrompt = process.argv.slice(2).join(' ')

  const config = await loadConfig()
  const provider = await getCurrentProvider()

  try {
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

    await executeAICommand(prompt)

    // Show success message
    console.log('✅ PR description updated successfully!')
  } catch (error) {
    console.error(error)
    console.error('❌ Failed to update PR description')
    process.exit(1)
  }
}

main()
