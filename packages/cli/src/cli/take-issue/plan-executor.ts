import { $ } from 'zx'
import { writeFileSync, existsSync, mkdirSync, unlinkSync } from 'fs'
import { dirname, resolve } from 'path'
import ora from 'ora'
import { confirm } from '@inquirer/prompts'

import { PlanStep, StepType, ExecutionResult } from './types'

/**
 * Parse a markdown plan file and extract executable steps
 */
export function parseMarkdownPlan(content: string): PlanStep[] {
  const steps: PlanStep[] = []
  const lines = content.split('\n')

  let currentStep: Partial<PlanStep> | null = null
  let stepNumber = 0
  let inCodeBlock = false
  let codeBlockType = ''
  let codeLines: string[] = []

  for (const line of lines) {
    const trimmedLine = line.trim()

    // Detect code blocks
    if (trimmedLine.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true
        codeBlockType = trimmedLine.slice(3).trim()
        codeLines = []
      } else {
        inCodeBlock = false
        if (currentStep && codeLines.length > 0) {
          const command = codeLines.join('\n').trim()
          currentStep.command = command
          currentStep.type = inferStepType(codeBlockType, command)
        }
        codeBlockType = ''
        codeLines = []
      }
      continue
    }

    if (inCodeBlock) {
      codeLines.push(line)
      continue
    }

    // Detect step headers (numbered lists or headings)
    if (isStepHeader(trimmedLine)) {
      // Finish previous step
      if (currentStep && currentStep.title) {
        steps.push({
          number: currentStep.number || steps.length + 1,
          title: currentStep.title,
          description: currentStep.description,
          type: currentStep.type || 'manual',
          command: currentStep.command,
          filePath: currentStep.filePath,
          content: currentStep.content,
          params: currentStep.params,
        })
      }

      // Start new step
      stepNumber++
      currentStep = {
        number: stepNumber,
        title: extractStepTitle(trimmedLine),
        type: 'manual',
      }
    } else if (currentStep && trimmedLine) {
      // Add to description if not empty and not a header
      if (!currentStep.description) {
        currentStep.description = trimmedLine
      } else {
        currentStep.description += '\n' + trimmedLine
      }

      // Try to extract file path from description
      const filePathMatch = trimmedLine.match(
        /(?:create|edit|modify|update)\s+(?:file\s+)?`?([^`\s]+\.[a-zA-Z0-9]+)`?/i,
      )
      if (filePathMatch) {
        currentStep.filePath = filePathMatch[1]
        if (trimmedLine.toLowerCase().includes('create')) {
          currentStep.type = 'create-file'
        } else {
          currentStep.type = 'edit-file'
        }
      }
    }
  }

  // Finish last step
  if (currentStep && currentStep.title) {
    steps.push({
      number: currentStep.number || steps.length + 1,
      title: currentStep.title,
      description: currentStep.description,
      type: currentStep.type || 'manual',
      command: currentStep.command,
      filePath: currentStep.filePath,
      content: currentStep.content,
      params: currentStep.params,
    })
  }

  return steps
}

/**
 * Execute a single plan step
 */
export async function executePlanStep(
  step: PlanStep,
  stepNumber: number,
): Promise<ExecutionResult> {
  const startTime = Date.now()
  const result: ExecutionResult = {
    step,
    success: false,
    timestamp: new Date(),
  }

  try {
    switch (step.type) {
      case 'command':
        result.output = await executeCommand(step.command!)
        result.success = true
        break

      case 'git':
        result.output = await executeGitCommand(step.command!)
        result.success = true
        break

      case 'npm':
        result.output = await executeNpmCommand(step.command!)
        result.success = true
        break

      case 'create-file':
        await createFile(step.filePath!, step.content || '', step.command)
        result.success = true
        result.output = `Created file: ${step.filePath}`
        break

      case 'edit-file':
        await editFile(step.filePath!, step.content || '', step.command)
        result.success = true
        result.output = `Edited file: ${step.filePath}`
        break

      case 'delete-file':
        await deleteFile(step.filePath!)
        result.success = true
        result.output = `Deleted file: ${step.filePath}`
        break

      case 'mkdir':
        await createDirectory(step.filePath!)
        result.success = true
        result.output = `Created directory: ${step.filePath}`
        break

      case 'test':
        result.output = await runTests(step.command)
        result.success = true
        break

      case 'build':
        result.output = await buildProject(step.command)
        result.success = true
        break

      case 'manual':
        result.success = await handleManualStep(step, stepNumber)
        result.output = result.success ? 'Completed by user' : 'Skipped by user'
        break

      default:
        throw new Error(`Unknown step type: ${step.type}`)
    }
  } catch (error) {
    result.success = false
    result.error = error instanceof Error ? error.message : String(error)
  }

  result.duration = Date.now() - startTime
  return result
}

// Helper functions

function isStepHeader(line: string): boolean {
  // Match numbered lists: "1.", "2.", etc.
  if (/^\d+\.\s/.test(line)) return true

  // Match headings: "## Step 1", "### 1.", etc.
  if (/^#{2,}\s*(?:step\s*)?(\d+|\w+)/i.test(line)) return true

  // Match bullet points with step indicators: "- Step 1", "* 1.", etc.
  if (/^[-*]\s*(?:step\s*)?(\d+|\w+)/i.test(line)) return true

  return false
}

function extractStepTitle(line: string): string {
  // Remove markdown formatting and numbering
  return line
    .replace(/^#{2,}\s*/, '') // Remove heading markers
    .replace(/^\d+\.\s*/, '') // Remove numbered list markers
    .replace(/^[-*]\s*/, '') // Remove bullet points
    .replace(/^(?:step\s*)?(\d+)\.?\s*/i, '') // Remove "Step N." prefix
    .trim()
}

function inferStepType(codeBlockType: string, command: string): StepType {
  const lowerType = codeBlockType.toLowerCase()
  const lowerCommand = command.toLowerCase()

  if (lowerType === 'bash' || lowerType === 'sh' || lowerType === 'shell') {
    if (lowerCommand.startsWith('git ')) return 'git'
    if (
      lowerCommand.startsWith('npm ') ||
      lowerCommand.startsWith('yarn ') ||
      lowerCommand.startsWith('pnpm ')
    )
      return 'npm'
    if (
      lowerCommand.includes(' test') ||
      lowerCommand.includes('jest') ||
      lowerCommand.includes('vitest')
    )
      return 'test'
    if (
      lowerCommand.includes(' build') ||
      lowerCommand.includes('webpack') ||
      lowerCommand.includes('vite')
    )
      return 'build'
    if (lowerCommand.startsWith('mkdir')) return 'mkdir'
    return 'command'
  }

  return 'command'
}

async function executeCommand(command: string): Promise<string> {
  const spinner = ora(`Executing: ${command}`).start()
  try {
    const result = await $`${command}`.quiet()
    spinner.succeed(`Command executed: ${command}`)
    return result.stdout.trim()
  } catch (error) {
    spinner.fail(`Command failed: ${command}`)
    throw error
  }
}

async function executeGitCommand(command: string): Promise<string> {
  const spinner = ora(`Git: ${command}`).start()
  try {
    const result = await $`${command}`.quiet()
    spinner.succeed(`Git command executed: ${command}`)
    return result.stdout.trim()
  } catch (error) {
    spinner.fail(`Git command failed: ${command}`)
    throw error
  }
}

async function executeNpmCommand(command: string): Promise<string> {
  const spinner = ora(`NPM: ${command}`).start()
  try {
    const result = await $`${command}`.quiet()
    spinner.succeed(`NPM command executed: ${command}`)
    return result.stdout.trim()
  } catch (error) {
    spinner.fail(`NPM command failed: ${command}`)
    throw error
  }
}

async function createFile(
  filePath: string,
  content: string,
  command?: string,
): Promise<void> {
  const spinner = ora(`Creating file: ${filePath}`).start()
  try {
    const resolvedPath = resolve(filePath)
    const dir = dirname(resolvedPath)

    // Create directory if it doesn't exist
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }

    // If command is provided and it's a code block, use that as content
    if (command && !content) {
      content = command
    }

    writeFileSync(resolvedPath, content, 'utf8')
    spinner.succeed(`Created file: ${filePath}`)
  } catch (error) {
    spinner.fail(`Failed to create file: ${filePath}`)
    throw error
  }
}

async function editFile(
  filePath: string,
  content: string,
  command?: string,
): Promise<void> {
  const spinner = ora(`Editing file: ${filePath}`).start()
  try {
    const resolvedPath = resolve(filePath)

    if (!existsSync(resolvedPath)) {
      throw new Error(`File not found: ${resolvedPath}`)
    }

    // If command is provided and it's a code block, use that as content
    if (command && !content) {
      content = command
    }

    // For now, we'll replace the entire file content
    // In a more advanced implementation, we could parse edit instructions
    writeFileSync(resolvedPath, content, 'utf8')
    spinner.succeed(`Edited file: ${filePath}`)
  } catch (error) {
    spinner.fail(`Failed to edit file: ${filePath}`)
    throw error
  }
}

async function deleteFile(filePath: string): Promise<void> {
  const spinner = ora(`Deleting file: ${filePath}`).start()
  try {
    const resolvedPath = resolve(filePath)

    if (!existsSync(resolvedPath)) {
      spinner.warn(`File not found (already deleted?): ${filePath}`)
      return
    }

    unlinkSync(resolvedPath)
    spinner.succeed(`Deleted file: ${filePath}`)
  } catch (error) {
    spinner.fail(`Failed to delete file: ${filePath}`)
    throw error
  }
}

async function createDirectory(dirPath: string): Promise<void> {
  const spinner = ora(`Creating directory: ${dirPath}`).start()
  try {
    const resolvedPath = resolve(dirPath)
    mkdirSync(resolvedPath, { recursive: true })
    spinner.succeed(`Created directory: ${dirPath}`)
  } catch (error) {
    spinner.fail(`Failed to create directory: ${dirPath}`)
    throw error
  }
}

async function runTests(command?: string): Promise<string> {
  const testCommand = command || 'npm test'
  const spinner = ora(`Running tests: ${testCommand}`).start()
  try {
    const result = await $`${testCommand}`.quiet()
    spinner.succeed(`Tests passed: ${testCommand}`)
    return result.stdout.trim()
  } catch (error) {
    spinner.fail(`Tests failed: ${testCommand}`)
    throw error
  }
}

async function buildProject(command?: string): Promise<string> {
  const buildCommand = command || 'npm run build'
  const spinner = ora(`Building project: ${buildCommand}`).start()
  try {
    const result = await $`${buildCommand}`.quiet()
    spinner.succeed(`Build successful: ${buildCommand}`)
    return result.stdout.trim()
  } catch (error) {
    spinner.fail(`Build failed: ${buildCommand}`)
    throw error
  }
}

async function handleManualStep(
  step: PlanStep,
  stepNumber: number,
): Promise<boolean> {
  console.log(`\n👤 Manual Step ${stepNumber}: ${step.title}`)
  if (step.description) {
    console.log(`   ${step.description}`)
  }

  const completed = await confirm({
    message: `Have you completed this manual step?`,
    default: false,
  })

  return completed
}
