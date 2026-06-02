import { Command } from 'commander'

import { loadConfig } from '../../config'
import { executeAICommand } from '../../ai/executor'
import { getCurrentProvider } from '../../providers/factory'
import { buildFixCommentsPrompt } from './prompts'
import { checkAndUpgrade } from '../../utils/version-checker'

interface FixCommentsOptions {
  /** Run interactive AI session with fewer permission prompts */
  yolo?: boolean
}

async function fixComments(
  commentUrl: string | undefined,
  options: FixCommentsOptions,
  provider: Awaited<ReturnType<typeof getCurrentProvider>>,
) {
  const config = await loadConfig()

  if (commentUrl) {
    console.log(`Fixing review comment using ${config.agent.toUpperCase()}...`)
    console.log(`Comment: ${commentUrl}`)
  } else {
    console.log(
      `Fixing all open review comments on the current PR/MR using ${config.agent.toUpperCase()}...`,
    )
  }

  console.log('🤖 Launching AI assistant to fix PR/MR comments...')

  const prompt = buildFixCommentsPrompt({
    commentUrl,
    providerName: provider.name,
  })

  await executeAICommand(prompt, {
    useLanguage: true,
    yolo: options.yolo,
    commandName: 'fixPrComments',
  })
}

function setupCommander() {
  const program = new Command()

  program
    .name('git-fix-pr-comments')
    .description('AI-powered tool to fix PR/MR review comments')
    .argument(
      '[commentUrl]',
      'Specific comment URL to fix (optional). If omitted, fixes all open review comments on the current PR/MR',
    )
    .option(
      '--yolo',
      'run interactive AI session with fewer permission prompts',
    )
    .addHelpText(
      'after',
      `
Examples:
  $ git fix-pr-comments
    Fix all open review comments on the current PR/MR

  $ git fix-pr-comments https://github.com/owner/repo/pull/1#discussion_r123
    Fix a specific GitHub PR review comment

  $ git fix-pr-comments https://gitlab.com/owner/repo/-/merge_requests/1#note_456
    Fix a specific GitLab MR comment

  $ git fix-pr-comments --yolo
    Fix all open comments with fewer permission prompts

  Behavior:
    1. If a comment URL is provided, fix that specific comment
    2. If no URL is provided, fetch all open review comments on the current
       PR/MR and fix them in sequence
    3. Each fix is committed, pushed, and a reply is posted to the comment

  Configuration:
    Create .git-pr-ai.json with {"agent": "claude"}
      - Agent can be set to any supported provider (see docs/introduction/ai-providers)
    Defaults to Claude if no configuration is provided

  Prerequisites:
    - GitHub CLI (gh) or GitLab CLI (glab) must be installed and authenticated
    - python3 must be available to run the helper scripts
    - Install and authenticate the CLI for your chosen AI provider
    `,
    )

  return program
}

async function main() {
  const program = setupCommander()

  program.action(
    async (commentUrl: string | undefined, options: FixCommentsOptions) => {
      try {
        // Check for version updates
        await checkAndUpgrade()

        const provider = await getCurrentProvider()
        await provider.checkCLI()

        await fixComments(commentUrl, options, provider)
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
