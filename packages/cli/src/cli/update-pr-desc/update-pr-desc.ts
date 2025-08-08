import ora from 'ora'

import { checkGitCLI, getPRUrl } from '../../git-helpers.js'
import { loadConfig } from '../../config.js'
import { executeAICommand } from '../../ai-executor.js'
import { getCurrentProvider } from '../../providers/factory.js'
import { buildUpdateDescriptionPrompt } from './prompts.js'

async function main() {
  await checkGitCLI()

  // Get additional prompt from command line arguments
  const additionalPrompt = process.argv.slice(2).join(' ')

  const config = await loadConfig()
  const provider = await getCurrentProvider()

  const prUrl = await getPRUrl()

  console.log(`PR URL: ${prUrl}`)
  console.log(`Using ${config.agent.toUpperCase()} for AI assistance`)

  const updateSpinner = ora(
    'AI is generating and updating PR description...',
  ).start()

  try {
    // Use provider to get detailed PR info
    const prDetails = await provider.getPRDetails()
    const template = await provider.findPRTemplate()

    // Show template info to user
    if (template.exists) {
      console.log(`📋 Using PR template from: ${template.path}`)
    } else {
      console.log('📝 No PR template found, using default template')
    }

    // Use prompts function to construct the complete prompt
    const prompt = buildUpdateDescriptionPrompt({
      prData: prDetails,
      additionalContext: additionalPrompt,
      providerName: provider.name,
    })

    await executeAICommand(prompt)
    updateSpinner.succeed('PR description updated successfully!')
  } catch {
    updateSpinner.fail('Failed to update PR description')
    process.exit(1)
  }
}

main()
