import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    'git-open-pr': 'src/cli/open-pr.ts',
    'git-update-pr-desc': 'src/cli/update-pr-desc.ts',
    'git-pr-review': 'src/cli/pr-review.ts',
    'git-pr-ai': 'src/cli/pr-ai.ts',
    postinstall: 'scripts/postinstall.ts',
  },
  format: ['esm'],
  banner: {
    js: '#!/usr/bin/env node',
  },
  clean: true,
})
