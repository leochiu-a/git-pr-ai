import { $ } from 'zx'
import { checkGitHubCLI } from '../utils.js'
import { executeAICommand, loadConfig } from '../config.js'

interface PRInfo {
  url: string
  number: number
  targetBranch: string
  currentBranch: string
  owner: string
  repo: string
}

async function parsePRUrl(prUrl: string): Promise<PRInfo> {
  const urlPattern = /https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/
  const match = prUrl.match(urlPattern)

  if (!match) {
    throw new Error(
      'Invalid PR URL format. Expected: https://github.com/owner/repo/pull/123',
    )
  }

  const [, owner, repo, prNumber] = match

  try {
    const result =
      await $`gh pr view ${prNumber} --repo ${owner}/${repo} --json baseRefName,headRefName,url`
    const { baseRefName, headRefName, url } = JSON.parse(result.stdout)

    return {
      url,
      number: parseInt(prNumber),
      targetBranch: baseRefName,
      currentBranch: headRefName,
      owner,
      repo,
    }
  } catch (error) {
    throw new Error(`Failed to fetch PR information: ${error}`)
  }
}

async function getCurrentBranchPRInfo(): Promise<PRInfo | null> {
  try {
    const result = await $`gh pr view --json baseRefName,headRefName,url,number`
    const { baseRefName, headRefName, url, number } = JSON.parse(result.stdout)

    const repoResult = await $`gh repo view --json owner,name`
    const { owner, name: repo } = JSON.parse(repoResult.stdout)

    return {
      url,
      number,
      targetBranch: baseRefName,
      currentBranch: headRefName,
      owner: owner.login,
      repo,
    }
  } catch {
    return null
  }
}

async function reviewPR(prInfo: PRInfo): Promise<void> {
  const config = await loadConfig()
  console.log(
    `🔍 Reviewing PR #${prInfo.number} using ${config.agent.toUpperCase()}...`,
  )
  console.log(`🔗 PR URL: ${prInfo.url}`)
  console.log(`📋 Target branch: ${prInfo.targetBranch}`)
  console.log(`🌿 Source branch: ${prInfo.currentBranch}`)

  const prompt = `Review this GitHub Pull Request and provide a comprehensive code review:

Repository: ${prInfo.owner}/${prInfo.repo}
PR #${prInfo.number}: ${prInfo.url}
Target branch: ${prInfo.targetBranch}
Source branch: ${prInfo.currentBranch}

Please follow these steps:
1. Use the GitHub CLI to fetch the PR details and diff
2. Analyze the code changes for:
   - Code quality and best practices
   - Potential bugs or issues
   - Security concerns
   - Performance implications
   - Code consistency and style
   - Test coverage
3. Generate a structured review comment with:
   - Summary of changes
   - Positive feedback on good practices
   - Constructive feedback on areas for improvement
   - Specific suggestions for fixes if needed
   - Overall recommendation (approve, request changes, or comment)
4. Post the review comment to the PR using GitHub CLI

Focus on being constructive and helpful in the review.`

  try {
    await executeAICommand(prompt)
    console.log('✅ PR review completed and comment posted!')
  } catch (error) {
    console.error('❌ Failed to complete PR review')
    throw error
  }
}

function showHelp() {
  console.log(`
Git PR Review - AI-powered Pull Request Review Tool

Usage:
  git pr-review [pr-url]

Arguments:
  pr-url    Optional GitHub PR URL to review
            Format: https://github.com/owner/repo/pull/123

Examples:
  git pr-review
    # Review PR for current branch

  git pr-review https://github.com/owner/repo/pull/123
    # Review specific PR by URL

Description:
  This tool uses AI (Claude or Gemini) to perform comprehensive code reviews on GitHub Pull Requests.
  It analyzes code changes, identifies potential issues, and posts constructive feedback.

Configuration:
  - Create .git-pr-ai.json with {"agent": "claude"} or {"agent": "gemini"}
  - Defaults to Claude if no configuration is provided

Prerequisites:
  - GitHub CLI (gh) must be installed and authenticated
  - Claude Code (for Claude) or Gemini CLI (for Gemini) must be installed and authenticated
  `)
}

async function main() {
  try {
    const prUrl = process.argv[2]

    // Handle help flags
    if (prUrl === '--help' || prUrl === '-h' || prUrl === 'help') {
      showHelp()
      process.exit(0)
    }

    await checkGitHubCLI()

    let prInfo: PRInfo | null = null

    if (prUrl) {
      console.log(`🔍 Reviewing PR from URL: ${prUrl}`)
      prInfo = await parsePRUrl(prUrl)
    } else {
      console.log('🔍 Looking for PR on current branch...')
      prInfo = await getCurrentBranchPRInfo()

      if (!prInfo) {
        console.error('❌ No PR found for current branch')
        console.error(
          'Please provide a PR URL or switch to a branch with an existing PR',
        )
        console.error('Usage: git pr-review [pr-url]')
        process.exit(1)
      }
    }

    await reviewPR(prInfo)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ Error:', errorMessage)
    process.exit(1)
  }
}

main()
