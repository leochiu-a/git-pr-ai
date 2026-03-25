import { defineConfig } from 'vite-plus/pack'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const skillReferences = resolve(
  __dirname,
  '../../.claude/skills/update-pr-desc/references',
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
    postinstall: 'scripts/postinstall.ts',
  },
  format: ['esm'],
  banner: {
    js: '#!/usr/bin/env node',
  },
  clean: true,
  copy: [
    { from: `${skillReferences}/github.md`, to: 'dist/references' },
    { from: `${skillReferences}/gitlab.md`, to: 'dist/references' },
    { from: `${skillReferences}/default-template.md`, to: 'dist/references' },
  ],
})
