import { $ } from 'zx'

try {
  // Set up git aliases
  await $`git config --global alias.open-pr '!git-open-pr'`
  await $`git config --global alias.update-pr-desc '!git-update-pr-desc'`
  await $`git config --global alias.pr-review '!git-pr-review'`
  await $`git config --global alias.pr-ai '!git-pr-ai'`
  await $`git config --global alias.create-branch '!git-create-branch'`
  await $`git config --global alias.plan-issue '!git-plan-issue'`

  console.log('✅ Git aliases have been set up successfully!')
  console.log('You can now use:')
  console.log('  - git open-pr')
  console.log('  - git update-pr-desc <pr-url>')
  console.log('  - git pr-review [pr-url]')
  console.log('  - git pr-ai <command>')
  console.log('  - git create-branch --jira <ticket-id>')
  console.log('  - git plan-issue -i <issue-number>')
} catch {
  console.log('⚠️  Could not set up git aliases automatically.')
  console.log('You can manually set them up with:')
  console.log("git config --global alias.open-pr '!git-open-pr'")
  console.log("git config --global alias.update-pr-desc '!git-update-pr-desc'")
  console.log("git config --global alias.pr-review '!git-pr-review'")
  console.log("git config --global alias.pr-ai '!git-pr-ai'")
  console.log("git config --global alias.create-branch '!git-create-branch'")
}
