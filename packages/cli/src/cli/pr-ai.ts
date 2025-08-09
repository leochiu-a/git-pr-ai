import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { Command } from 'commander'
import { select, confirm, input } from '@inquirer/prompts'
import { $ } from 'zx'
import ora from 'ora'
import {
  GitPrAiConfig,
  getConfigPath,
  getConfigDir,
  loadConfig,
} from '../config'

async function openConfig() {
  const configPath = getConfigPath()

  if (!existsSync(configPath)) {
    console.error(`Configuration file not found: ${configPath}`)
    console.log('Run "git pr-ai config" first to create configuration')
    process.exit(1)
  }

  const spinner = ora('Opening config file...').start()

  try {
    // Try to open with cursor first, then fallback to code
    try {
      await $`cursor ${configPath}`
      spinner.succeed(`Opened config file in Cursor: ${configPath}`)
    } catch {
      await $`code ${configPath}`
      spinner.succeed(`Opened config file in VS Code: ${configPath}`)
    }
  } catch (error) {
    spinner.fail('Failed to open config file')
    console.error(error instanceof Error ? error.message : String(error))
    console.log(`Config file location: ${configPath}`)
    process.exit(1)
  }
}

async function setupJiraConfig() {
  console.log('Setting up JIRA integration...\n')

  const baseUrl = await input({
    message: 'JIRA Base URL (e.g., https://your-company.atlassian.net):',
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
    message: 'JIRA Email:',
    validate: (value) => {
      if (!value.trim()) return 'Email is required'
      if (!value.includes('@')) return 'Please enter a valid email'
      return true
    },
  })

  const apiToken = await input({
    message:
      'JIRA API Token (create at https://id.atlassian.com/manage-profile/security/api-tokens):',
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

async function ensureConfigDir(): Promise<void> {
  const configDir = getConfigDir()
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true })
  }
}

function displayExistingConfig(config: GitPrAiConfig) {
  console.log('Found existing configuration:')
  console.log('')
  console.log(`Agent: ${config.agent}`)
  if (config.jira) {
    console.log(`JIRA: ${config.jira.baseUrl}`)
  } else {
    console.log('JIRA: Not configured')
  }
  console.log('')
}

async function confirmUpdate(force: boolean): Promise<boolean> {
  if (force) {
    return true
  }

  return await confirm({
    message: 'Configuration already exists. Would you like to update it?',
    default: true,
  })
}

function determineWhatToUpdate(options: {
  agent?: boolean
  jira?: boolean
}): string {
  if (options.agent && options.jira) {
    return 'both'
  } else if (options.agent) {
    return 'agent'
  } else if (options.jira) {
    return 'jira'
  }

  // Will ask user interactively
  return 'ask'
}

async function askWhatToUpdate(): Promise<string> {
  return await select({
    message: 'What would you like to configure?',
    choices: [
      { name: 'AI Agent only', value: 'agent' },
      { name: 'JIRA integration only', value: 'jira' },
      { name: 'Both AI Agent and JIRA integration', value: 'both' },
    ],
  })
}

async function updateAgentConfig(
  config: GitPrAiConfig,
): Promise<GitPrAiConfig> {
  const selectedAgent = await select({
    message: 'Which AI agent would you like to use?',
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
  return { ...config, agent: selectedAgent }
}

async function updateJiraConfig(config: GitPrAiConfig): Promise<GitPrAiConfig> {
  if (config.jira) {
    const shouldOverwrite = await confirm({
      message:
        'JIRA configuration already exists. Do you want to overwrite it?',
      default: false,
    })

    if (shouldOverwrite) {
      const jira = await setupJiraConfig()
      return { ...config, jira }
    } else {
      return config
    }
  } else {
    const jira = await setupJiraConfig()
    return { ...config, jira }
  }
}

async function saveConfig(config: GitPrAiConfig): Promise<void> {
  const configPath = getConfigPath()
  const spinner = ora('Saving configuration...').start()

  try {
    writeFileSync(configPath, JSON.stringify(config, null, 2))
    spinner.succeed('Configuration updated successfully!')
    console.log(`Config path: ${configPath}`)
    console.log(`AI agent: ${config.agent}`)
    if (config.jira) {
      console.log(`JIRA integration: ${config.jira.baseUrl}`)
    }
  } catch (error) {
    spinner.fail('Failed to update configuration')
    console.error(error)
    process.exit(1)
  }
}

async function initConfig(options: {
  force?: boolean
  agent?: boolean
  jira?: boolean
}) {
  await ensureConfigDir()

  // Load existing config if available
  const configPath = getConfigPath()
  const hasExistingConfig = existsSync(configPath)

  if (hasExistingConfig) {
    const existingConfig = await loadConfig()
    displayExistingConfig(existingConfig)

    const shouldProceed = await confirmUpdate(options.force || false)
    if (!shouldProceed) {
      console.log('Configuration update cancelled.')
      return
    }
  }

  // Load config (will use default if file doesn't exist)
  let config: GitPrAiConfig = await loadConfig()

  // Determine what to update
  const whatToUpdate =
    determineWhatToUpdate(options) === 'ask'
      ? await askWhatToUpdate()
      : determineWhatToUpdate(options)

  // Update configurations based on selection
  if (whatToUpdate === 'agent') {
    config = await updateAgentConfig(config)
  } else if (whatToUpdate === 'jira') {
    config = await updateJiraConfig(config)
  } else if (whatToUpdate === 'both') {
    config = await updateAgentConfig(config)
    config = await updateJiraConfig(config)
  }

  // Save the updated configuration
  await saveConfig(config)
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
      console.error('Error:', errorMessage)
      process.exit(1)
    }
  })

program.parse()
