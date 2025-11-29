import { Command } from 'commander'

import { checkGitCLI } from '../../git-helpers'
import { loadConfig } from '../../config'
import { executeAICommand } from '../../ai/executor'
import { getCurrentProvider } from '../../providers/factory'
import { PRDetails } from '../../providers/types'
import { buildReviewPrompt } from './prompts'
import { checkAndUpgrade } from '../../utils/version-checker'

async function reviewPR(
  prDetails: PRDetails,
  options: { additionalContext?: string; yolo?: boolean } = {},
) {
  const config = await loadConfig()
  const provider = await getCurrentProvider()

  console.log(
    `Reviewing PR #${prDetails.number} using ${config.agent.toUpperCase()}...`,
  )
  console.log(`PR URL: ${prDetails.url}`)
  console.log(`Target branch: ${prDetails.baseBranch}`)
  console.log(`Source branch: ${prDetails.headBranch}`)

  console.log('🤖 Launching AI assistant for PR review...')

  try {
    const prompt = buildReviewPrompt({
      prDetails,
      options,
      providerName: provider.name,
    })

    await executeAICommand(prompt, {
      useLanguage: true,
      yolo: options.yolo,
      commandName: 'prReview',
    })
    console.log('✅ PR/MR review completed and comment posted!')
  } catch (error) {
    console.error('❌ Failed to complete PR/MR review')
    throw error
  }
}

function setupCommander() {
  const program = new Command()

  program
    .name('git-pr-review')
    .description('AI-powered Pull Request/Merge Request Review Tool')
    .argument(
      '[prNumberOrUrl]',
      'Specific PR/MR number or full URL to review (optional)',
    )
    .option('-c, --context <context>', 'Additional context for the review')
    .option('--yolo', 'skip prompts and proceed with defaults')
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
    Create .git-pr-ai.json with {"agent": "claude"}
      - Agent can be set to any supported provider (see docs/introduction/ai-providers)
    Defaults to Claude if no configuration is provided

  Prerequisites:
    - GitHub CLI (gh) or GitLab CLI (glab) must be installed and authenticated
    - Install and authenticate the CLI for your chosen AI provider
    `,
    )

  return program
}

async function main() {
  const program = setupCommander()

  program.action(
    async (
      prNumberOrUrl: string | undefined,
      options: { context?: string; yolo?: boolean },
    ) => {
      try {
        // Check for version updates
        await checkAndUpgrade()

        await checkGitCLI()

        const provider = await getCurrentProvider()
        const prDetails = await provider.getPRDetails(prNumberOrUrl)

        await reviewPR(prDetails, {
          additionalContext: options.context,
          yolo: options.yolo,
        })
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
