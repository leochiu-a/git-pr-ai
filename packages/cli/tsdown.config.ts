import { defineConfig } from 'tsdown'

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
    postinstall: 'scripts/postinstall.ts',
  },
  format: ['esm'],
  banner: {
    js: '#!/usr/bin/env node',
  },
  clean: true,
  copy: ['src/cli/update-pr-desc/default-template.md'],
})
