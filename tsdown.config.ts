import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    'git-open-pr': 'src/cli/open-pr.ts',
    'git-update-pr-desc': 'src/cli/update-pr-desc.ts',
    'git-pr-review': 'src/cli/pr-review.ts',
    'git-pr-ai-init': 'src/cli/pr-ai-init.ts',
    postinstall: 'scripts/postinstall.ts',
  },
  banner: {
    js: '#!/usr/bin/env node',
  },
})
