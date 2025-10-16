import { PRDetails } from '../../providers/types'

export interface BuildReviewPromptArgs {
  prDetails: PRDetails
  options?: {
    additionalContext?: string
  }
  providerName: string
}

export function buildReviewPrompt({
  prDetails,
  options = {},
  providerName,
}: BuildReviewPromptArgs): string {
  const { additionalContext } = options

  const isGitHub = providerName === 'GitHub'
  const diffCommand = isGitHub
    ? `gh pr diff ${prDetails.number}`
    : `glab mr diff ${prDetails.number}`

  const basePrompt = `Review PR #${prDetails.number} and submit via ${providerName} API

PR: ${prDetails.owner}/${prDetails.repo}#${prDetails.number}
Branch: ${prDetails.headBranch} → ${prDetails.baseBranch}

## Steps

### 1. Get diff
\`\`\`bash
${diffCommand}
\`\`\`

### 2. Find issues
Focus: bugs, security, performance, maintainability

### 3. Write comments
Include actual code (problem + fix) in each comment.
Use multi-line highlight for code blocks.

### 4. Submit review

${
  isGitHub
    ? `
**Step A - Get SHA:**
\`\`\`bash
SHA=$(gh pr view ${prDetails.number} --json headRefOid -q '.headRefOid')
\`\`\`

**Step B - Create review.json:**
\`\`\`json
{
  "commit_id": "REPLACE_WITH_SHA_FROM_STEP_A",
  "body": "Overall review\\n\\nKey points:\\n- Point 1\\n- Point 2",
  "event": "COMMENT",
  "comments": [
    {
      "path": "src/file.ts",
      "start_line": 10,
      "line": 15,
      "body": "**Issue**\\n\\nCurrent:\\n\\\`\\\`\\\`ts\\ncode here\\n\\\`\\\`\\\`\\n\\nFix:\\n\\\`\\\`\\\`ts\\nfixed code\\n\\\`\\\`\\\`",
      "side": "RIGHT"
    }
  ]
}
\`\`\`

**Step C - Submit:**
\`\`\`bash
gh api --method POST \\
  -H "Accept: application/vnd.github+json" \\
  -H "X-GitHub-Api-Version: 2022-11-28" \\
  /repos/${prDetails.owner}/${prDetails.repo}/pulls/${prDetails.number}/reviews \\
  --input review.json
\`\`\`

**JSON rules:**
- Newlines: \\n
- Code blocks: \\\`\\\`\\\`
- Single quotes: ' (NO backslash!)
- start_line < line (first line to last line)

**Events:**
- COMMENT = feedback
- APPROVE = no issues
- REQUEST_CHANGES = critical problems
`
    : `Use glab API for GitLab MR`
}

${additionalContext ? `\n**User request:** ${additionalContext}\n` : ''}
Execute now!`

  return basePrompt
}
