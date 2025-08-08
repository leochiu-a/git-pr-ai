import { Command } from 'commander'
import ora from 'ora'

import { checkGitCLI, getPRUrl } from '../../git-helpers.js'
import { loadConfig } from '../../config.js'
import { executeAICommand } from '../../ai-executor.js'
import { getCurrentProvider } from '../../providers/factory.js'
import { PRDetails } from '../../providers/types.js'
import { buildReviewPrompt, ReviewPromptOptions } from './prompts.js'

async function reviewPR(
  prDetails: PRDetails,
  options: ReviewPromptOptions = {},
) {
  const config = await loadConfig()
  const provider = await getCurrentProvider()

  console.log(
    `Reviewing PR #${prDetails.number} using ${config.agent.toUpperCase()}...`,
  )
  console.log(`PR URL: ${prDetails.url}`)
  console.log(`Target branch: ${prDetails.baseBranch}`)
  console.log(`Source branch: ${prDetails.headBranch}`)

  const reviewSpinner = ora(
    'AI is analyzing the PR and generating the review...',
  ).start()

  try {
    // Use provider to get diff (we already have the PR details)
    const diff = await provider.getPRDiff(prDetails.number)

    // Build the complete prompt using the prompts function
    const prompt = buildReviewPrompt(
      { ...prDetails, diff },
      options,
      provider.name,
    )

    await executeAICommand(prompt)
    reviewSpinner.succeed('PR/MR review completed and comment posted!')
  } catch (error) {
    reviewSpinner.fail('Failed to complete PR/MR review')
    throw error
  }
}

function setupCommander() {
  const program = new Command()

  program
    .name('git-pr-review')
    .description('AI-powered Pull Request/Merge Request Review Tool')
    .argument('[pr-url]', 'PR/MR URL to review (supports GitHub and GitLab)')
    .option('-c, --context <context>', 'Additional context for the review')
    .addHelpText(
      'after',
      `
Examples:
  $ git pr-review
    Review PR/MR for current branch, or list available PRs/MRs if none found

  $ git pr-review https://github.com/owner/repo/pull/123
    Review specific GitHub PR by URL

  $ git pr-review https://gitlab.com/owner/repo/-/merge_requests/123
    Review specific GitLab MR by URL

  $ git pr-review -c "Focus on security issues"
    Review with additional context

Behavior:
  1. If a URL is provided, review that specific PR/MR
  2. If no URL is provided, look for PR/MR on current branch
  3. If no PR/MR found on current branch, list all available PRs/MRs and use the first one

Configuration:
  Create .git-pr-ai.json with {"agent": "claude"} or {"agent": "gemini"}
  Defaults to Claude if no configuration is provided

Prerequisites:
  - GitHub CLI (gh) or GitLab CLI (glab) must be installed and authenticated
  - Claude Code (for Claude) or Gemini CLI (for Gemini) must be installed and authenticated
    `,
    )

  return program
}

async function main() {
  const program = setupCommander()

  program.action(
    async (prUrl: string | undefined | null, options: { context?: string }) => {
      try {
        await checkGitCLI()

        const provider = await getCurrentProvider()

        // 如果沒有提供 URL，自動獲取
        if (!prUrl) {
          prUrl = await getPRUrl()
        } else {
          console.log(`Reviewing PR/MR from URL: ${prUrl}`)
        }

        const prDetails = await provider.getPRDetails(prUrl)
        await reviewPR(prDetails, { additionalContext: options.context })
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error)
        console.error('Error:', errorMessage)
        process.exit(1)
      }
    },
  )

  program.parse()
}

main()
