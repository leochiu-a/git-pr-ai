import { defineConfig } from 'vite-plus/pack'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const updatePrDescReferences = resolve(
  __dirname,
  '../../.claude/skills/update-pr-desc/references',
)

const codeReviewReferences = resolve(
  __dirname,
  '../../.claude/skills/code-review/references',
)

const fixPrCommentsReferences = resolve(
  __dirname,
  '../../.claude/skills/fix-pr-comments/references',
)

const fixPrCommentsScripts = resolve(
  __dirname,
  '../../.claude/skills/fix-pr-comments/scripts',
)

export default defineConfig({
  entry: {
    'git-open-pr': 'src/cli/open-pr/open-pr.ts',
    'git-update-pr-desc': 'src/cli/update-pr-desc/update-pr-desc.ts',
    'git-pr-review': 'src/cli/pr-review/pr-review.ts',
    'git-pr-ai': 'src/cli/pr-ai.ts',
    'git-create-branch': 'src/cli/create-branch/create-branch.ts',
    'git-plan-issue': 'src/cli/plan-issue/plan-issue.ts',
    'git-take-issue': 'src/cli/take-issue/take-issue.ts',
    'git-weekly-summary': 'src/cli/weekly-summary/weekly-summary.ts',
    'git-ai-commit': 'src/cli/ai-commit/ai-commit.ts',
    'git-fix-pr-comments': 'src/cli/fix-pr-comments/fix-pr-comments.ts',
    postinstall: 'scripts/postinstall.ts',
  },
  format: ['esm'],
  banner: {
    js: '#!/usr/bin/env node',
  },
  clean: true,
  copy: [
    { from: `${updatePrDescReferences}/github.md`, to: 'dist/references' },
    { from: `${updatePrDescReferences}/gitlab.md`, to: 'dist/references' },
    {
      from: `${updatePrDescReferences}/default-template.md`,
      to: 'dist/references',
    },
    {
      from: `${codeReviewReferences}/github.md`,
      to: 'dist/references/code-review',
    },
    {
      from: `${codeReviewReferences}/gitlab.md`,
      to: 'dist/references/code-review',
    },
    {
      from: `${fixPrCommentsReferences}/workflow.md`,
      to: 'dist/references/fix-pr-comments',
    },
    {
      from: `${fixPrCommentsReferences}/github.md`,
      to: 'dist/references/fix-pr-comments',
    },
    {
      from: `${fixPrCommentsReferences}/gitlab.md`,
      to: 'dist/references/fix-pr-comments',
    },
    {
      from: `${fixPrCommentsScripts}/fetch_comment.py`,
      to: 'dist/scripts/fix-pr-comments',
    },
    {
      from: `${fixPrCommentsScripts}/fetch_pr_comments.py`,
      to: 'dist/scripts/fix-pr-comments',
    },
  ],
})
