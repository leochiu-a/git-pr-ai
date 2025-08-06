import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { Command } from 'commander'
import { select, confirm, input } from '@inquirer/prompts'
import { $ } from 'zx'
import {
  GitPrAiConfig,
  getConfigPath,
  getConfigDir,
  CONFIG_FILENAME,
  loadConfig,
} from '../config.js'

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

async function openConfig() {
  const configPath = getConfigPath()

  if (!existsSync(configPath)) {
    console.error(`❌ Configuration file not found: ${configPath}`)
    console.log('💡 Run "git pr-ai config" first to create configuration')
    process.exit(1)
  }

  try {
    // Try to open with cursor first, then fallback to code
    try {
      await $`cursor ${configPath}`
      console.log(`📖 Opened config file in Cursor: ${configPath}`)
    } catch {
      await $`code ${configPath}`
      console.log(`📖 Opened config file in VS Code: ${configPath}`)
    }
  } catch (error) {
    console.error(
      '❌ Failed to open config file:',
      error instanceof Error ? error.message : String(error),
    )
    console.log(`📁 Config file location: ${configPath}`)
    process.exit(1)
  }
}

async function setupJiraConfig() {
  console.log('🔧 Setting up JIRA integration...\n')

  const baseUrl = await input({
    message: '🌐 JIRA Base URL (e.g., https://your-company.atlassian.net):',
    validate: (value) => {
      if (!value.trim()) return 'Base URL is required'
      try {
        new URL(value)
        return true
      } catch {
        return 'Please enter a valid URL'
      }
    },
  })

  const email = await input({
    message: '📧 JIRA Email:',
    validate: (value) => {
      if (!value.trim()) return 'Email is required'
      if (!value.includes('@')) return 'Please enter a valid email'
      return true
    },
  })

  const apiToken = await input({
    message:
      '🔑 JIRA API Token (create at https://id.atlassian.com/manage-profile/security/api-tokens):',
    validate: (value) => {
      if (!value.trim()) return 'API Token is required'
      return true
    },
  })

  return {
    baseUrl: baseUrl.trim(),
    email: email.trim(),
    apiToken: apiToken.trim(),
  }
}

async function initConfig(options: { force?: boolean }) {
  const configDir = getConfigDir()
  const configPath = getConfigPath()

  // Ensure config directory exists first
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true })
  }

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

  const setupJira = await confirm({
    message: '🔧 Would you like to setup JIRA integration?',
    default: false,
  })

  const config: GitPrAiConfig = {
    agent: selectedAgent,
  }

  if (setupJira) {
    config.jira = await setupJiraConfig()
  }

  try {
    writeFileSync(configPath, JSON.stringify(config, null, 2))
    console.log(`\n✅ ${CONFIG_FILENAME} created successfully!`)
    console.log(`📁 Config path: ${configPath}`)
    console.log(`🎯 Selected AI agent: ${selectedAgent}`)
    if (config.jira) {
      console.log(`🔧 JIRA integration: ${config.jira.baseUrl}`)
    }
  } catch (error) {
    console.error(`❌ Failed to create ${CONFIG_FILENAME}:`, error)
    process.exit(1)
  }
}

async function configureJira() {
  const configDir = getConfigDir()
  const configPath = getConfigPath()

  // Ensure config directory exists first
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true })
  }

  let config: GitPrAiConfig

  if (existsSync(configPath)) {
    try {
      config = await loadConfig()
    } catch {
      console.error('❌ Failed to load existing configuration')
      process.exit(1)
    }
  } else {
    config = {
      agent: 'claude',
    }
  }

  console.log('🔧 Configuring JIRA integration...')

  if (config.jira) {
    const shouldOverwrite = await confirm({
      message:
        'JIRA configuration already exists. Do you want to overwrite it?',
      default: false,
    })

    if (!shouldOverwrite) {
      console.log('❌ JIRA configuration cancelled.')
      return
    }
  }

  config.jira = await setupJiraConfig()

  try {
    writeFileSync(configPath, JSON.stringify(config, null, 2))
    console.log(`\n✅ JIRA configuration updated successfully!`)
    console.log(`📁 Config path: ${configPath}`)
    console.log(`🔧 JIRA Base URL: ${config.jira.baseUrl}`)
    console.log(`📧 JIRA Email: ${config.jira.email}`)
  } catch (error) {
    console.error(`❌ Failed to update JIRA configuration:`, error)
    process.exit(1)
  }
}

const program = new Command()

program.name('git-pr-ai').description('Git PR AI tools')

program
  .command('config')
  .description('Initialize Git PR AI configuration')
  .option('-f, --force', 'force overwrite existing configuration')
  .option('-o, --open', 'open existing configuration file')
  .action(async (options) => {
    try {
      if (options.open) {
        await openConfig()
      } else {
        await initConfig(options)
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      console.error('❌ Error:', errorMessage)
      process.exit(1)
    }
  })

program
  .command('jira')
  .description('Configure JIRA integration settings')
  .action(async () => {
    try {
      await configureJira()
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      console.error('❌ Error:', errorMessage)
      process.exit(1)
    }
  })

program.parse()
