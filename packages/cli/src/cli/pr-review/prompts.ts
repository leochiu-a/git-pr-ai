import { PRDetails } from '../../providers/types'

export interface BuildReviewPromptArgs {
  prDetails: PRDetails
  options?: {
    additionalContext?: string
  }
  providerName: string
}

interface BasePromptArgs {
  prDetails: PRDetails
  additionalContext?: string
}

function buildBasePrompt(
  prDetails: PRDetails,
  providerName: string,
  diffCommand: string,
): string {
  return `You are a senior software engineer conducting a code review.
Your goal is to identify issues that could impact functionality, security, performance, or maintainability, and provide actionable feedback with clear examples.

Review PR #${prDetails.number} and submit via ${providerName} API

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
IMPORTANT: Only comment on lines that appear in the diff (modified/added lines).
Do NOT comment on unchanged code or lines outside the diff.

Include actual code (problem + fix) in each comment.
Use multi-line highlight for code blocks.

### 4. Submit review`
}

export function buildGitHubReviewPrompt({
  prDetails,
  additionalContext,
}: BasePromptArgs): string {
  const diffCommand = `gh pr diff ${prDetails.number}`
  const basePrompt = buildBasePrompt(prDetails, 'GitHub', diffCommand)

  const submitInstructions = `
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
      "body": "**Issue**\\n\\nCurrent:\\n\\\`\\\`\\\`ts\\nconst x = \\"value\\"\\n\\\`\\\`\\\`\\n\\nFix:\\n\\\`\\\`\\\`ts\\nconst x = 'value'\\n\\\`\\\`\\\`",
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
- Double quotes in code: \\" (MUST escape!)
- Single quotes: ' (NO backslash!)
- start_line < line (first line to last line)
- CRITICAL: Verify all line numbers exist in diff before submitting

**Events:**
- COMMENT = feedback
- APPROVE = no issues
- REQUEST_CHANGES = critical problems
`

  return `${basePrompt}

${submitInstructions}
${additionalContext ? `\n**User request:** ${additionalContext}\n` : ''}
Execute now!`
}

export function buildGitLabReviewPrompt({
  prDetails,
  additionalContext,
}: BasePromptArgs): string {
  const diffCommand = `glab mr diff ${prDetails.number}`
  const basePrompt = buildBasePrompt(prDetails, 'GitLab', diffCommand)

  const submitInstructions = `
**Step A - Get project ID and SHAs:**
\`\`\`bash
# Split commands to avoid shell parsing errors
glab mr view ${prDetails.number} -F json > /tmp/mr.json
glab repo view -F json > /tmp/repo.json

PROJECT_ID=$(cat /tmp/repo.json | jq -r '.id')
MR_IID=$(cat /tmp/mr.json | jq -r '.iid')
BASE_SHA=$(cat /tmp/mr.json | jq -r '.diff_refs.base_sha')
HEAD_SHA=$(cat /tmp/mr.json | jq -r '.diff_refs.head_sha')
START_SHA=$(cat /tmp/mr.json | jq -r '.diff_refs.start_sha')
\`\`\`

**Step B - Submit overall review (use --raw-field, NOT --input):**
\`\`\`bash
glab api --method POST /projects/$PROJECT_ID/merge_requests/$MR_IID/notes \\
  --raw-field 'body=## Review Summary

Key points:
- Point 1
- Point 2'
\`\`\`

**Step C - Submit inline comments (use --raw-field for all fields):**
\`\`\`bash
glab api --method POST /projects/$PROJECT_ID/merge_requests/$MR_IID/discussions \\
  --raw-field 'body=**Issue**

Current:
\\\`\\\`\\\`ts
const x = "value"
\\\`\\\`\\\`

Fix:
\\\`\\\`\\\`ts
const x = '"'"'value'"'"'
\\\`\\\`\\\`' \\
  --raw-field 'position[position_type]=text' \\
  --raw-field 'position[base_sha]=$BASE_SHA' \\
  --raw-field 'position[head_sha]=$HEAD_SHA' \\
  --raw-field 'position[start_sha]=$START_SHA' \\
  --raw-field 'position[new_path]=src/file.ts' \\
  --raw-field 'position[old_path]=src/file.ts' \\
  --raw-field 'position[new_line]=15'
\`\`\`

**Important notes:**
- MUST use --raw-field (GitLab API requires form fields, not JSON)
- Escape single quotes in bash: '"'"' (e.g., 'Vue'"'"'s' → "Vue's")
- Code blocks: \\\`\\\`\\\` (triple backticks with backslash)
- new_line: line number in new file (after change)
- CRITICAL: Verify line numbers exist in diff before submitting
`

  return `${basePrompt}

${submitInstructions}
${additionalContext ? `\n**User request:** ${additionalContext}\n` : ''}
Execute now!`
}

export function buildReviewPrompt({
  prDetails,
  options = {},
  providerName,
}: BuildReviewPromptArgs): string {
  const { additionalContext } = options

  const isGitHub = providerName === 'GitHub'

  if (isGitHub) {
    return buildGitHubReviewPrompt({ prDetails, additionalContext })
  } else {
    return buildGitLabReviewPrompt({ prDetails, additionalContext })
  }
}
