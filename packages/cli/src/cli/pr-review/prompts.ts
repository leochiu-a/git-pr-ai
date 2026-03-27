import { readFileSync, existsSync } from 'fs'
import { join, dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

import { PRDetails } from '../../providers/types'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export interface BuildReviewPromptArgs {
  prDetails: PRDetails
  options?: {
    additionalContext?: string
  }
  providerName: string
}

function getReferencesDir(): string {
  // Runtime (after build): references are copied to dist/references/code-review/
  const distPath = join(__dirname, 'references', 'code-review')
  if (existsSync(join(distPath, 'github.md'))) {
    return distPath
  }

  // Dev/test: resolve from monorepo root via process.cwd()
  const skillPath = resolve(
    process.cwd(),
    '../../.claude/skills/code-review/references',
  )
  if (existsSync(join(skillPath, 'github.md'))) {
    return skillPath
  }

  throw new Error(`Skill reference files not found. Expected at: ${distPath}`)
}

export function buildReviewPrompt({
  prDetails,
  options = {},
  providerName,
}: BuildReviewPromptArgs): string {
  const { additionalContext } = options

  const referencesDir = getReferencesDir()
  const providerKey = providerName.toLowerCase()
  const instructions = readFileSync(
    join(referencesDir, `${providerKey}.md`),
    'utf-8',
  )

  const prContext = `Review PR #${prDetails.number} and submit via ${providerName} API

PR: ${prDetails.owner}/${prDetails.repo}#${prDetails.number}
Branch: ${prDetails.headBranch} → ${prDetails.baseBranch}`

  return `${prContext}

${instructions}
${additionalContext ? `\n**User request:** ${additionalContext}\n` : ''}
Execute now!`
}
