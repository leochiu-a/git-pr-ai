import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

import { GitProvider, PRDetails } from '../../providers/types'

export interface UpdateDescriptionPromptOptions {
  additionalContext?: string
}

export interface BuildUpdateDescriptionPromptArgs {
  prDetails: PRDetails
  options?: UpdateDescriptionPromptOptions
  provider: GitProvider
}

function readDefaultTemplate(): string {
  const defaultTemplatePath = join(__dirname, 'default-template.md')

  if (!existsSync(defaultTemplatePath)) {
    throw new Error(
      `Default template file not found at: ${defaultTemplatePath}`,
    )
  }

  try {
    const content = readFileSync(defaultTemplatePath, 'utf-8')
    if (!content.trim()) {
      throw new Error('Default template file is empty')
    }
    return content
  } catch (error) {
    throw new Error(`Failed to read default template file: ${error}`)
  }
}

function buildStep1Prompt(): string {
  return `### Step 1: Analysis
First, examine the code changes to understand:
- **Purpose**: What problem does this PR solve?
- **Scope**: What files and functionality are affected?
- **Impact**: How does this change the user/developer experience?
- **Dependencies**: Are there related changes or requirements?
`
}

async function buildStep2Prompt({
  provider,
}: {
  provider: GitProvider
}): Promise<string> {
  const template = await provider.findPRTemplate()

  // Show template info to user
  if (template.exists) {
    console.log(`📋 Using PR template from: ${template.path}`)
  } else {
    console.log('📝 No PR template found, using default template')
  }

  const isTemplateExists = template?.exists && template.content

  const templateSection = isTemplateExists
    ? `### Step 2: Generate Description
Use the following PR template structure from ${template.path}:

\`\`\`
${template.content}
\`\`\`

Fill in this template with relevant information based on the code changes. Make sure to:
- Replace any placeholder text or empty sections with actual content
- Keep the template's original structure and formatting
- Fill in all required fields and checkboxes as appropriate
- IMPORTANT: Keep section headings in English (e.g., "## Summary", "## Test Plan") but write the content in the configured language`
    : `### Step 2: Generate Description
Create a comprehensive PR description following this structure:

${readDefaultTemplate()}

IMPORTANT: Keep all section headings in English (e.g., "## Summary", "## Test Plan", "## Breaking Changes") 
but write the content in the configured language include all required fields and checkboxes as appropriate.`

  return templateSection
}

function buildStep3Prompt({ providerName }: { providerName: string }): string {
  return `### Step 3: Update PR
Save your description to a file and update the PR:

${
  providerName === 'GitLab'
    ? `1. Save the description to description.md file
2. Update the MR: \`glab mr update --description "$(cat description.md)"\``
    : `1. Save the description to description.md file  
2. Update the PR: \`gh pr edit --body-file description.md\``
}

IMPORTANT: You must complete all 3 steps above. Do not stop after generating the description - execute the CLI commands to actually update the PR.

## Key Guidelines
- Write clear, concise descriptions
- Use proper markdown formatting
- Include all relevant technical details
- Consider both technical and non-technical readers
- IMPORTANT: Always use English section headings (e.g., "## Summary", "## Test Plan") but write content in the configured language
- MUST execute all CLI commands to complete the task - do not just provide instructions to the user`
}

export async function buildUpdateDescriptionPrompt({
  prDetails,
  options = {},
  provider,
}: BuildUpdateDescriptionPromptArgs): Promise<string> {
  const { additionalContext } = options

  const basePrompt = `You are an expert technical writer. Think carefully and systematically about updating this Pull Request description.

## PR Information
- Repository: ${prDetails.owner}/${prDetails.repo}
- PR #${prDetails.number}: ${prDetails.title}
- URL: ${prDetails.url}
- Target branch: ${prDetails.baseBranch}
- Source branch: ${prDetails.headBranch}

## Update Process

${buildStep1Prompt()}

${await buildStep2Prompt({ provider })}

${buildStep3Prompt({ providerName: provider.name })}
`

  let finalPrompt = basePrompt

  if (additionalContext) {
    finalPrompt += `\n\n## Additional Context\n${additionalContext}\n\nPlease incorporate this context into your description.`
  }

  return finalPrompt
}
