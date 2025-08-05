#!/usr/bin/env node

import { execSync } from 'child_process'

try {
  // Set up git aliases
  const openPrCommand = `git config --global alias.open-pr '!git-open-pr'`
  const updatePrDescCommand = `git config --global alias.update-pr-desc '!git-update-pr-desc'`
  const prReviewCommand = `git config --global alias.pr-review '!git-pr-review'`

  execSync(openPrCommand, { stdio: 'inherit' })
  execSync(updatePrDescCommand, { stdio: 'inherit' })
  execSync(prReviewCommand, { stdio: 'inherit' })

  console.log('✅ Git aliases have been set up successfully!')
  console.log('You can now use:')
  console.log('  - git open-pr')
  console.log('  - git update-pr-desc <pr-url>')
  console.log('  - git pr-review [pr-url]')
} catch (error) {
  console.log('⚠️  Could not set up git aliases automatically.')
  console.log('You can manually set them up with:')
  console.log("git config --global alias.open-pr '!git-open-pr'")
  console.log("git config --global alias.update-pr-desc '!git-update-pr-desc'")
  console.log("git config --global alias.pr-review '!git-pr-review'")
}
