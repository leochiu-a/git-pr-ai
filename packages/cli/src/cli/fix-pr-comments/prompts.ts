import { readFileSync, existsSync } from 'fs'
import { join, dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Path used inside the skill workflow to reference the helper scripts. The CLI
// rewrites this to the absolute scripts directory so the prompt works from any
// repository, not just one that has the skill installed.
const SKILL_SCRIPTS_PATH = '.claude/skills/fix-pr-comments/scripts'

export interface BuildFixCommentsPromptArgs {
  /** Optional comment URL — single-comment mode when provided, batch mode when omitted */
  commentUrl?: string
  /** Provider name from getCurrentProvider().name (e.g. 'GitHub', 'GitLab') */
  providerName: string
}

function getReferencesDir(): string {
  // Runtime (after build): references are copied to dist/references/fix-pr-comments/
  const distPath = join(__dirname, 'references', 'fix-pr-comments')
  if (existsSync(join(distPath, 'workflow.md'))) {
    return distPath
  }

  // Dev/test: resolve from monorepo root via process.cwd()
  const skillPath = resolve(
    process.cwd(),
    '../../.claude/skills/fix-pr-comments/references',
  )
  if (existsSync(join(skillPath, 'workflow.md'))) {
    return skillPath
  }

  throw new Error(
    `Skill reference files not found.\n  dist:  ${distPath}\n  skill: ${skillPath}`,
  )
}

function getScriptsDir(): string {
  // Runtime (after build): scripts are copied to dist/scripts/fix-pr-comments/
  const distPath = join(__dirname, 'scripts', 'fix-pr-comments')
  if (existsSync(join(distPath, 'fetch_comment.py'))) {
    return distPath
  }

  // Dev/test: resolve from monorepo root via process.cwd()
  const skillPath = resolve(
    process.cwd(),
    '../../.claude/skills/fix-pr-comments/scripts',
  )
  if (existsSync(join(skillPath, 'fetch_comment.py'))) {
    return skillPath
  }

  throw new Error(
    `Skill scripts not found.\n  dist:  ${distPath}\n  skill: ${skillPath}`,
  )
}

export function buildFixCommentsPrompt({
  commentUrl,
  providerName,
}: BuildFixCommentsPromptArgs): string {
  const referencesDir = getReferencesDir()
  const scriptsDir = getScriptsDir()
  const providerKey = providerName.toLowerCase()

  const workflow = readFileSync(join(referencesDir, 'workflow.md'), 'utf-8')
  const platformRef = readFileSync(
    join(referencesDir, `${providerKey}.md`),
    'utf-8',
  )

  // Rewrite the skill-relative scripts path to the resolved absolute directory
  // so the helper scripts run regardless of the current working directory.
  const workflowResolved = workflow.split(SKILL_SCRIPTS_PATH).join(scriptsDir)

  const modeContext = commentUrl
    ? `A comment URL was provided: ${commentUrl}\nUse single-comment mode (Step 1).`
    : `No comment URL was provided.\nUse batch mode (Step 0) to fix all open review comments on the current PR/MR.`

  return `Fix PR/MR review comments on ${providerName}.

${modeContext}

${workflowResolved}

---

## Platform reference (${providerName})

${platformRef}

Execute now!`
}
