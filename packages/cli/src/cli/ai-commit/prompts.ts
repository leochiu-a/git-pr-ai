import { readFileSync, existsSync } from 'fs'
import { join, dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export type CommitJiraContext = {
  key: string
  summary?: string
  description?: string
  issueType?: string
  priority?: string
  status?: string
  assignee?: string
  labels?: string[]
  browseUrl?: string
  source: 'branch' | 'api'
}

function getReferencesDir(): string {
  // Runtime (after build): references are copied to dist/references/ai-commit/
  const distPath = join(__dirname, 'references', 'ai-commit')
  if (existsSync(join(distPath, 'commit.md'))) {
    return distPath
  }

  // Dev/test: resolve from monorepo root via process.cwd()
  const skillPath = resolve(
    process.cwd(),
    '../../.claude/skills/ai-commit/references',
  )
  if (existsSync(join(skillPath, 'commit.md'))) {
    return skillPath
  }

  throw new Error(`Skill reference files not found. Expected at: ${distPath}`)
}

function formatJiraContext(context: CommitJiraContext | null): string {
  if (!context) return ''

  const lines = [
    `JIRA key: ${context.key}`,
    context.summary ? `Summary: ${context.summary}` : null,
    context.description ? `Description: ${context.description}` : null,
    context.issueType ? `Issue type: ${context.issueType}` : null,
    context.labels && context.labels.length > 0
      ? `Labels: ${context.labels.join(', ')}`
      : null,
  ].filter(Boolean)

  return `JIRA context:\n${lines.join('\n')}\n\n`
}

export const createCommitMessagePrompt = (
  gitDiff: string,
  commitType: string,
  userPrompt?: string,
  jiraContext: CommitJiraContext | null = null,
) => {
  const referencesDir = getReferencesDir()
  const instructions = readFileSync(join(referencesDir, 'commit.md'), 'utf-8')

  const trimmedPrompt = userPrompt?.trim()
  const contextBlocks: string[] = []

  if (jiraContext) {
    contextBlocks.push(formatJiraContext(jiraContext).trimEnd())
  }

  if (trimmedPrompt) {
    contextBlocks.push(`Additional context from user:\n${trimmedPrompt}`)
  }

  const extraContext = contextBlocks.length
    ? `\n${contextBlocks.join('\n\n')}\n`
    : '\n'

  const isAutoCommitType = commitType === 'auto'
  const commitTypeSection = isAutoCommitType
    ? `Commit type selection: AI decides

Choose the most suitable conventional commit type for each option.`
    : `Commit type selected: ${commitType}`

  const commitTypeRequirements = isAutoCommitType
    ? `- Use a valid conventional commit type (feat|fix|docs|style|refactor|perf|test|chore|ci|build)
- Choose the best type based on the actual diff for each option`
    : `- Use the selected commit type (${commitType}) for all options`

  return `Based on the following git diff, generate 3 commit message options:

${gitDiff}

${extraContext}
${commitTypeSection}

## Commit type requirements
${commitTypeRequirements}

${instructions}`
}
