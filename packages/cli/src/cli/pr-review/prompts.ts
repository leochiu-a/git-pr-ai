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
MR_JSON=$(glab mr view ${prDetails.number} -F json)
PROJECT_ID=$(glab repo view -F json | jq -r '.id')
BASE_SHA=$(echo "$MR_JSON" | jq -r '.diff_refs.base_sha')
HEAD_SHA=$(echo "$MR_JSON" | jq -r '.diff_refs.head_sha')
START_SHA=$(echo "$MR_JSON" | jq -r '.diff_refs.start_sha')
\`\`\`

**Step B - Create review.json for overall review note:**

\`\`\`json
{
  "body": "Overall review summary\\n\\nKey points:\\n- Point 1\\n- Point 2"
}
\`\`\`

**Step C - Create discussion.json for each code comment:**
\`\`\`json
{
  "body": "**Issue**\\n\\nCurrent:\\n\\\`\\\`\\\`ts\\nconst x = \\"value\\"\\n\\\`\\\`\\\`\\n\\nFix:\\n\\\`\\\`\\\`ts\\nconst x = 'value'\\n\\\`\\\`\\\`",
  "position": {
    "position_type": "text",
    "base_sha": "REPLACE_WITH_BASE_SHA_FROM_STEP_A",
    "head_sha": "REPLACE_WITH_HEAD_SHA_FROM_STEP_A",
    "start_sha": "REPLACE_WITH_START_SHA_FROM_STEP_A",
    "new_path": "src/file.ts",
    "old_path": "src/file.ts",
    "new_line": 15
  }
}
\`\`\`

**Step C - Submit:**
\`\`\`bash
# Submit overall review (if created)
glab api --method POST \\
  /projects/$PROJECT_ID/merge_requests/$MR_IID/notes \\
  --input review.json

# Submit inline comments (repeat for each comment)
glab api --method POST \\
  /projects/$PROJECT_ID/merge_requests/$MR_IID/discussions \\
  --input discussion.json
\`\`\`

**JSON rules:**
- Newlines: \\n
- Code blocks: \\\`\\\`\\\`
- Double quotes in code: \\" (MUST escape!)
- Single quotes: ' (NO backslash!)
- new_line: for added/modified lines (after change)
- old_line: for deleted lines (before change)
- CRITICAL: Verify all line numbers exist in diff before submitting

**Multi-line comments:**
Add line_range to position for multi-line highlighting:
\`\`\`json
"position": {
  ...,
  "line_range": {
    "start": { "line_code": "...", "type": "new" },
    "end": { "line_code": "...", "type": "new" }
  }
}
\`\`\`
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
