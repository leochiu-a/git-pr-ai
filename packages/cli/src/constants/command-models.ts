import { type CommandName } from '../config'

export const COMMAND_MODEL_CHOICES: { name: string; value: CommandName }[] = [
  { name: 'Create Branch (git create-branch)', value: 'createBranch' },
  { name: 'AI Commit (git ai-commit)', value: 'aiCommit' },
  { name: 'PR Review (git pr-review)', value: 'prReview' },
  {
    name: 'Update PR Description (git update-pr-desc)',
    value: 'updatePrDesc',
  },
  { name: 'Plan Issue (git plan-issue)', value: 'planIssue' },
  { name: 'Take Issue (git take-issue)', value: 'takeIssue' },
]
