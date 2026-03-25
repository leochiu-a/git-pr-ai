import { readFileSync, existsSync } from 'fs'
import { join, dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

import { GitProvider } from '../../providers/types'

export interface UpdateDescriptionPromptOptions {
  additionalContext?: string
  nonInteractive?: boolean
}

export interface BuildUpdateDescriptionPromptArgs {
  options?: UpdateDescriptionPromptOptions
  provider: GitProvider
}

function getReferencesDir(): string {
  // Runtime (after build): references are copied to dist/references/
  const distPath = join(__dirname, 'references')
  if (existsSync(join(distPath, 'github.md'))) {
    return distPath
  }

  // Dev/test: resolve from monorepo root via process.cwd()
  const skillPath = resolve(
    process.cwd(),
    '../../.claude/skills/update-pr-desc/references',
  )
  if (existsSync(join(skillPath, 'github.md'))) {
    return skillPath
  }
  throw new Error(`Skill reference files not found. Expected at: ${distPath}`)
}

export async function buildUpdateDescriptionPrompt({
  options = {},
  provider,
}: BuildUpdateDescriptionPromptArgs): Promise<string> {
  const { additionalContext, nonInteractive = false } = options

  const providerKey = provider.name.toLowerCase()
  const referencesDir = getReferencesDir()
  let prompt = readFileSync(join(referencesDir, `${providerKey}.md`), 'utf-8')

  // Resolve PR template upfront so the AI doesn't need to find it at runtime
  const template = await provider.findPRTemplate()
  if (template.exists && template.content) {
    console.log(`📋 Using PR template from: ${template.path}`)
    prompt += `\n\n## Resolved PR Template\nTemplate found at \`${template.path}\`. Use this structure:\n\n\`\`\`\n${template.content}\n\`\`\``
  } else {
    console.log('📝 No PR template found, using default template')
    const defaultTemplate = readFileSync(
      join(referencesDir, 'default-template.md'),
      'utf-8',
    )
    prompt += `\n\n## Resolved PR Template\nNo repo template found. Use this default template:\n\n\`\`\`\n${defaultTemplate}\n\`\`\``
  }

  if (additionalContext) {
    prompt += `\n\n## Additional Context\n${additionalContext}\n\nPlease incorporate this context into your description.`
  }

  if (nonInteractive) {
    prompt += `\n\n## Output Instructions\nOutput ONLY the PR description text. Do not execute any CLI commands to update the PR — the description will be applied programmatically.`
  }

  return prompt
}
