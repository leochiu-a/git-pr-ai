import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { Command } from 'commander'
import { select, confirm, input } from '@inquirer/prompts'
import { $ } from 'zx'
import {
  GitPrAiConfig,
  getConfigPath,
  getConfigDir,
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
        const url = new URL(value)
        if (url.protocol !== 'https:') {
          return 'JIRA Base URL must use HTTPS'
        }
        if (!url.hostname.endsWith('.atlassian.net')) {
          return 'JIRA Base URL must be a valid Atlassian domain (e.g., your-company.atlassian.net)'
        }
        return true
      } catch {
        return 'Please enter a valid JIRA URL'
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

async function initConfig(options: {
  force?: boolean
  agent?: boolean
  jira?: boolean
}) {
  const configDir = getConfigDir()
  const configPath = getConfigPath()

  // Ensure config directory exists first
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true })
  }

  let existingConfig: GitPrAiConfig | null = null

  // Check if config already exists
  if (existsSync(configPath)) {
    try {
      existingConfig = await loadConfig()
      console.log('📋 Found existing configuration:')
      console.log(`   Agent: ${existingConfig.agent}`)
      if (existingConfig.jira) {
        console.log(`   JIRA: ${existingConfig.jira.baseUrl}`)
      } else {
        console.log('   JIRA: Not configured')
      }
      console.log('')
    } catch {
      console.warn(
        '⚠️ Failed to load existing configuration, will create new one',
      )
    }

    if (!options.force) {
      const shouldUpdate = await confirm({
        message: 'Configuration already exists. Would you like to update it?',
        default: true,
      })

      if (!shouldUpdate) {
        console.log('❌ Configuration update cancelled.')
        return
      }
    }
  }

  // Start with existing config or default
  const config: GitPrAiConfig = existingConfig
    ? { ...existingConfig }
    : { agent: 'claude' }

  // Determine what to update based on options or ask user
  let whatToUpdate: string

  if (options.agent && options.jira) {
    whatToUpdate = 'both'
  } else if (options.agent) {
    whatToUpdate = 'agent'
  } else if (options.jira) {
    whatToUpdate = 'jira'
  } else {
    // Ask user what to configure
    whatToUpdate = await select({
      message: '🔧 What would you like to configure?',
      choices: [
        {
          name: 'AI Agent only',
          value: 'agent',
        },
        {
          name: 'JIRA integration only',
          value: 'jira',
        },
        {
          name: 'Both AI Agent and JIRA integration',
          value: 'both',
        },
      ],
    })
  }

  // Update agent if selected
  if (whatToUpdate === 'agent' || whatToUpdate === 'both') {
    const selectedAgent = await promptAgentSelection()
    config.agent = selectedAgent
  }

  // Update JIRA if selected
  if (whatToUpdate === 'jira' || whatToUpdate === 'both') {
    if (config.jira) {
      const shouldOverwriteJira = await confirm({
        message:
          'JIRA configuration already exists. Do you want to overwrite it?',
        default: false,
      })

      if (shouldOverwriteJira) {
        config.jira = await setupJiraConfig()
      }
    } else {
      config.jira = await setupJiraConfig()
    }
  }

  try {
    writeFileSync(configPath, JSON.stringify(config, null, 2))
    console.log(`\n✅ Configuration updated successfully!`)
    console.log(`📁 Config path: ${configPath}`)
    console.log(`🎯 AI agent: ${config.agent}`)
    if (config.jira) {
      console.log(`🔧 JIRA integration: ${config.jira.baseUrl}`)
    }
  } catch (error) {
    console.error(`❌ Failed to update configuration:`, error)
    process.exit(1)
  }
}

const program = new Command()

program.name('git-pr-ai').description('Git PR AI tools')

program
  .command('config')
  .description('Initialize or update Git PR AI configuration')
  .option('-f, --force', 'force overwrite existing configuration')
  .option('-o, --open', 'open existing configuration file')
  .option('-a, --agent', 'configure AI agent only')
  .option('-j, --jira', 'configure JIRA integration only')
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

program.parse()
