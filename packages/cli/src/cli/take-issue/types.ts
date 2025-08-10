export interface PlanStep {
  /** Step number (1-based) */
  number: number
  /** Step title/summary */
  title: string
  /** Optional description */
  description?: string
  /** Type of step */
  type: StepType
  /** Command to execute (for command steps) */
  command?: string
  /** File path (for file operation steps) */
  filePath?: string
  /** File content (for file creation/modification steps) */
  content?: string
  /** Additional parameters for the step */
  params?: Record<string, unknown>
}

export type StepType =
  | 'command' // Execute shell command
  | 'create-file' // Create new file
  | 'edit-file' // Edit existing file
  | 'delete-file' // Delete file
  | 'mkdir' // Create directory
  | 'git' // Git operations
  | 'npm' // NPM operations
  | 'test' // Run tests
  | 'build' // Build project
  | 'manual' // Manual step (requires user confirmation)

export interface ExecutionResult {
  /** Step that was executed */
  step: PlanStep
  /** Whether execution was successful */
  success: boolean
  /** Output from the execution */
  output?: string
  /** Error message if failed */
  error?: string
  /** Execution time in milliseconds */
  duration?: number
  /** Timestamp when step was executed */
  timestamp: Date
}
