import { writeFileSync } from 'fs'
import { resolve } from 'path'

export interface OutputOptions {
  md?: string | boolean
}

/**
 * Handle output to console or file based on options
 */
export function handleOutput(
  content: string,
  options: OutputOptions,
  dateRange: { since: string; until: string },
): void {
  const finalOutput = content

  // Handle markdown file output
  if (typeof options.md === 'string') {
    // Output to specified file
    const filePath = resolve(options.md)
    writeToFile(filePath, finalOutput)
  } else if (options.md === true) {
    // Generate default filename and save
    const filename = generateDefaultFilename(dateRange.since, dateRange.until)
    const filePath = resolve(filename)
    writeToFile(filePath, finalOutput)
  } else {
    // Output to console
    console.log(finalOutput)
  }
}

/**
 * Write content to file with error handling
 */
function writeToFile(filePath: string, content: string): void {
  try {
    writeFileSync(filePath, content, 'utf-8')
    console.log(`📝 Weekly summary saved to: ${filePath}`)
  } catch (error) {
    console.error(`❌ Failed to write file: ${filePath}`)
    console.error(
      'Error:',
      error instanceof Error ? error.message : String(error),
    )
    process.exit(1)
  }
}

/**
 * Generate default markdown filename based on date range
 */
function generateDefaultFilename(since: string, until: string): string {
  return `weekly-summary-${since}-to-${until}.md`
}
