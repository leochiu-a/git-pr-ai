import { writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { Command } from 'commander'
import { select, confirm } from '@inquirer/prompts'
import { GitPrAiConfig } from '../config.js'

const CONFIG_FILENAME = '.git-pr-ai.json'

async function promptAgentSelection(): Promise<'claude' | 'gemini'> {
  const answer = await select({
    message: '🤖 Which AI agent would you like to use?',
    choices: [
      {
        name: 'Claude (Anthropic)',
        value: 'claude' as const,
      },
      {
        name: 'Gemini (Google)',
        value: 'gemini' as const,
      },
    ],
  })

  return answer
}

async function initConfig(options: { force?: boolean }) {
  const configPath = join(process.cwd(), CONFIG_FILENAME)

  if (existsSync(configPath) && !options.force) {
    const shouldOverwrite = await confirm({
      message: `${CONFIG_FILENAME} already exists. Do you want to overwrite it?`,
      default: false,
    })

    if (!shouldOverwrite) {
      console.log('❌ Configuration initialization cancelled.')
      return
    }
  }

  const selectedAgent = await promptAgentSelection()

  const config: GitPrAiConfig = {
    agent: selectedAgent,
  }

  try {
    writeFileSync(configPath, JSON.stringify(config, null, 2))
    console.log(`\n✅ ${CONFIG_FILENAME} created successfully!`)
    console.log(`🎯 Selected AI agent: ${selectedAgent}`)
  } catch (error) {
    console.error(`❌ Failed to create ${CONFIG_FILENAME}:`, error)
    process.exit(1)
  }
}

const program = new Command()

program.name('git-pr-ai').description('Git PR AI tools')

program
  .command('init')
  .description('Initialize Git PR AI configuration')
  .option('-f, --force', 'force overwrite existing configuration')
  .action(async (options) => {
    try {
      await initConfig(options)
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      console.error('❌ Error:', errorMessage)
      process.exit(1)
    }
  })

program.parse()
