import { $ } from 'zx'
import { loadConfig, getModelForCommand, type CommandName } from '../config'
import { getLanguage } from '../git-helpers'
import { createLanguagePrompt } from '../language-prompts'
import { type AIAgent } from '../constants/agents'

export async function executeAIInternal(
  prompt: string,
  options?: {
    useLanguage?: boolean
    yolo?: boolean
    outputType?: 'inherit'
    commandName?: CommandName
  },
): Promise<void>
export async function executeAIInternal(
  prompt: string,
  options: {
    useLanguage?: boolean
    yolo?: boolean
    outputType: 'capture' | 'json'
    commandName?: CommandName
  },
): Promise<string>
export async function executeAIInternal(
  prompt: string,
  options: {
    useLanguage?: boolean
    yolo?: boolean
    outputType?: 'inherit' | 'capture' | 'json'
    commandName?: CommandName
  } = {},
): Promise<string | void> {
  const {
    useLanguage = true,
    yolo = false,
    outputType = 'inherit',
    commandName,
  } = options
  const config = await loadConfig()
  const language = useLanguage ? await getLanguage() : 'en'
  const finalPrompt = useLanguage
    ? createLanguagePrompt(prompt, language)
    : prompt

  // Get model configuration for the command if specified
  const model = commandName
    ? getModelForCommand(config, commandName)
    : undefined

  switch (config.agent) {
    case 'claude':
      await checkClaudeCLI()
      break
    case 'gemini':
      await checkGeminiCLI()
      break
    case 'cursor-agent':
      await checkCursorAgentCLI()
      break
    case 'codex':
      await checkCodexCLI()
      break
    default:
      throw new Error(`Unsupported AI agent: ${config.agent}`)
  }

  if (outputType === 'inherit') {
    await runAICommand(config.agent, finalPrompt, yolo, model)
    return
  } else {
    const output = await runAICommandWithOutput(
      config.agent,
      finalPrompt,
      yolo,
      model,
    )
    return outputType === 'json' ? extractJsonFromOutput(output) : output
  }
}

async function runAICommand(
  agent: AIAgent,
  prompt: string,
  yolo: boolean,
  model?: string,
): Promise<void> {
  if (yolo) {
    if (agent === 'claude') {
      if (model) {
        await $({
          stdio: 'inherit',
        })`claude --dangerously-skip-permissions --model ${model} ${prompt}`
      } else {
        await $({
          stdio: 'inherit',
        })`claude --dangerously-skip-permissions ${prompt}`
      }
    } else if (agent === 'gemini') {
      if (model) {
        await $({
          stdio: 'inherit',
        })`gemini --yolo --prompt-interactive --model ${model} ${prompt}`
      } else {
        await $({
          stdio: 'inherit',
        })`gemini --yolo --prompt-interactive ${prompt}`
      }
    } else if (agent === 'cursor-agent') {
      if (model) {
        await $({
          stdio: 'inherit',
        })`cursor-agent --force --model ${model} ${prompt}`
      } else {
        await $({
          stdio: 'inherit',
        })`cursor-agent --force ${prompt}`
      }
    } else if (agent === 'codex') {
      if (model) {
        await $({ stdio: 'inherit' })`codex --yolo --model ${model} ${prompt}`
      } else {
        await $({ stdio: 'inherit' })`codex --yolo ${prompt}`
      }
    }
  } else {
    if (agent === 'claude') {
      if (model) {
        await $({ stdio: 'inherit' })`claude --model ${model} ${prompt}`
      } else {
        await $({ stdio: 'inherit' })`claude ${prompt}`
      }
    } else if (agent === 'gemini') {
      if (model) {
        await $({
          stdio: 'inherit',
        })`gemini --prompt-interactive --model ${model} ${prompt}`
      } else {
        await $({ stdio: 'inherit' })`gemini --prompt-interactive ${prompt}`
      }
    } else if (agent === 'cursor-agent') {
      if (model) {
        await $({ stdio: 'inherit' })`cursor-agent --model ${model} ${prompt}`
      } else {
        await $({ stdio: 'inherit' })`cursor-agent ${prompt}`
      }
    } else if (agent === 'codex') {
      if (model) {
        await $({ stdio: 'inherit' })`codex --model ${model} ${prompt}`
      } else {
        await $({ stdio: 'inherit' })`codex ${prompt}`
      }
    }
  }
}

async function runAICommandWithOutput(
  agent: AIAgent,
  prompt: string,
  yolo: boolean,
  model?: string,
): Promise<string> {
  let result

  if (yolo) {
    if (agent === 'claude') {
      if (model) {
        result = await $({
          input: prompt,
        })`claude --dangerously-skip-permissions --model ${model}`.quiet()
      } else {
        result = await $({
          input: prompt,
        })`claude --dangerously-skip-permissions`.quiet()
      }
    } else if (agent === 'gemini') {
      if (model) {
        result = await $({
          input: prompt,
        })`gemini --yolo --model ${model}`.quiet()
      } else {
        result = await $({ input: prompt })`gemini --yolo`.quiet()
      }
    } else if (agent === 'cursor-agent') {
      if (model) {
        result = await $({
          input: prompt,
        })`cursor-agent --print --force --model ${model}`.quiet()
      } else {
        result = await $({
          input: prompt,
        })`cursor-agent --print --force`.quiet()
      }
    } else if (agent === 'codex') {
      if (model) {
        result = await $({
          input: prompt,
        })`codex exec --yolo --model ${model}`.quiet()
      } else {
        result = await $({ input: prompt })`codex exec --yolo`.quiet()
      }
    }
  } else {
    if (agent === 'claude') {
      if (model) {
        result = await $({ input: prompt })`claude --model ${model}`.quiet()
      } else {
        result = await $({ input: prompt })`claude`.quiet()
      }
    } else if (agent === 'gemini') {
      if (model) {
        result = await $({ input: prompt })`gemini --model ${model}`.quiet()
      } else {
        result = await $({ input: prompt })`gemini`.quiet()
      }
    } else if (agent === 'cursor-agent') {
      if (model) {
        result = await $({
          input: prompt,
        })`cursor-agent --print --model ${model}`.quiet()
      } else {
        result = await $({ input: prompt })`cursor-agent --print`.quiet()
      }
    } else if (agent === 'codex') {
      if (model) {
        result = await $({ input: prompt })`codex exec --model ${model}`.quiet()
      } else {
        result = await $({ input: prompt })`codex exec`.quiet()
      }
    }
  }

  if (!result) {
    throw new Error(`AI command failed: no result returned for agent ${agent}`)
  }

  return result.stdout.trim()
}

function extractJsonFromOutput(output: string): string {
  const firstBrace = output.indexOf('{')
  const lastBrace = output.lastIndexOf('}')

  if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
    throw new Error('No valid JSON object found in AI response')
  }

  return output.substring(firstBrace, lastBrace + 1)
}

async function checkClaudeCLI(): Promise<void> {
  try {
    await $`claude --version`.quiet()
  } catch {
    console.error('🤖 Claude CLI not found')
    console.error('Please install Claude Code: https://claude.ai/code')
    process.exit(1)
  }
}

async function checkGeminiCLI(): Promise<void> {
  try {
    await $`gemini --version`.quiet()
  } catch {
    console.error('🤖 Gemini CLI not found')
    console.error('Please install Gemini CLI')
    process.exit(1)
  }
}

async function checkCursorAgentCLI(): Promise<void> {
  try {
    await $`cursor-agent --version`.quiet()
  } catch {
    console.error('🤖 Cursor Agent not found')
    console.error('Please install Cursor Agent: https://cursor.com/cli')
    process.exit(1)
  }
}

async function checkCodexCLI(): Promise<void> {
  try {
    await $`codex --version`.quiet()
  } catch {
    console.error('🤖 Codex CLI not found')
    console.error(
      'Please install Codex CLI from the official Codex documentation',
    )
    process.exit(1)
  }
}
