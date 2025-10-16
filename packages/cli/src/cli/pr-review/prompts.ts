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

  const basePrompt = `# Task: Review PR #${prDetails.number} and Submit via ${providerName} API

**PR Info:**
- Repo: ${prDetails.owner}/${prDetails.repo}
- PR: #${prDetails.number} - ${prDetails.title}
- URL: ${prDetails.url}
- Branch: ${prDetails.headBranch} → ${prDetails.baseBranch}

## Step-by-Step Instructions

### 1. Get the code diff
\`\`\`bash
${diffCommand}
\`\`\`

### 2. Analyze the changes
Look for:
- 🐛 Bugs, edge cases, logic errors
- 🔒 Security issues (SQL injection, XSS, auth bypass)
- ⚡ Performance problems (O(n²), memory leaks)
- 📖 Maintainability (naming, complexity, documentation)

### 3. Write your inline comments

**CRITICAL: Show actual code, not just line numbers**

✅ Good example:
\`\`\`
**Missing null check**

Current code:
\`\`\`ts
const user = await getUser(id)
return user.email  // will crash if user is null
\`\`\`

Fix:
\`\`\`ts
const user = await getUser(id)
if (!user) throw new Error('User not found')
return user.email
\`\`\`
\`\`\`

❌ Bad example:
\`\`\`
Line 42 needs a null check
\`\`\`

### 4. Submit the review

${
  isGitHub
    ? `**GitHub API submission:**

Step 4a - Get commit SHA:
\`\`\`bash
COMMIT_SHA=$(gh pr view ${prDetails.number} --json headRefOid -q '.headRefOid')
echo $COMMIT_SHA
\`\`\`

Step 4b - Create payload file \`review.json\`:
\`\`\`json
{
  "commit_id": "PUT_COMMIT_SHA_HERE",
  "body": "## Review Summary\\n\\n[Your overall assessment]\\n\\n### Key Points\\n- Point 1\\n- Point 2",
  "event": "COMMENT",
  "comments": [
    {
      "path": "path/to/file.ts",
      "line": 42,
      "body": "**Missing null check**\\n\\nCurrent:\\n\\\`\\\`\\\`ts\\nconst user = data.find(u => u.id === id)\\nreturn user.name\\n\\\`\\\`\\\`\\n\\nFix:\\n\\\`\\\`\\\`ts\\nconst user = data.find(u => u.id === id)\\nif (!user) throw new Error('Not found')\\nreturn user.name\\n\\\`\\\`\\\`",
      "side": "RIGHT"
    }
  ]
}
\`\`\`

**JSON escaping rules:**
- Newlines: Use \\n
- Double quotes: Use \\"
- Backticks (for code blocks): Use \\\`\\\`\\\`
- Single quotes: Use directly ' (NO backslash!)
- Backslashes: Use \\\\

Step 4c - Submit:
\`\`\`bash
gh api --method POST \\
  -H "Accept: application/vnd.github+json" \\
  -H "X-GitHub-Api-Version: 2022-11-28" \\
  /repos/${prDetails.owner}/${prDetails.repo}/pulls/${prDetails.number}/reviews \\
  --input review.json
\`\`\`

**Event types:**
- \`COMMENT\` - General feedback
- \`APPROVE\` - No blocking issues
- \`REQUEST_CHANGES\` - Critical bugs/security issues

**Important JSON notes:**
- Replace \`PUT_COMMIT_SHA_HERE\` with actual SHA from step 4a
- Use \\\`\\\`\\\` (escaped backticks) for code blocks in JSON strings
- Use \\n for newlines in JSON strings
- Use \\" to escape double quotes in JSON strings
- DO NOT escape single quotes - use them directly: t('foo') NOT t(\\'foo\\')
- The \`path\` must match the file path in the diff exactly`
    : `**GitLab API submission:**

1. Get MR details:
\`\`\`bash
glab mr view ${prDetails.number} --json
\`\`\`

2. Post inline comments and overall review using GitLab API
3. Use glab CLI or direct API calls`
}

## Quick Guidelines

**DO:**
✅ Show code snippets in every inline comment (problem + solution)
✅ Explain WHY (security risk, will crash, performance issue, etc.)
✅ Use \`APPROVE\` if code is good (empty comments array is fine!)
✅ Be helpful and constructive

**DON'T:**
❌ Say "line X needs fixing" without showing code
❌ Include HTML comments like \`<!-- comment -->\` (they break rendering)
❌ Generate long explanations - be concise and actionable

${additionalContext ? `\n## Additional Context\n${additionalContext}\n` : ''}
---

**Execute now:** Get diff → Review → Submit via API!`

  return basePrompt
}
