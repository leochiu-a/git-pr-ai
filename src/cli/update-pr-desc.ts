import { $ } from 'zx'
import { checkGitHubCLI } from '../git-helpers.js'
import { loadConfig } from '../config.js'
import { executeAICommand } from '../ai-executor.js'

async function getPRInfo(): Promise<{
  targetBranch: string
  currentBranch: string
  url: string
} | null> {
  try {
    const result = await $`gh pr view --json baseRefName,headRefName,url`
    const { baseRefName, headRefName, url } = JSON.parse(result.stdout)

    return {
      targetBranch: baseRefName,
      currentBranch: headRefName,
      url,
    }
  } catch {
    return null
  }
}

async function main() {
  await checkGitHubCLI()

  // Get additional prompt from command line arguments
  const additionalPrompt = process.argv.slice(2).join(' ')

  console.log('🔍 Checking for PR on current branch...')

  const prInfo = await getPRInfo()

  if (!prInfo) {
    console.error('❌ No PR found for current branch')
    console.error(
      'Please create a PR first or switch to a branch with an existing PR',
    )
    process.exit(1)
  }

  const config = await loadConfig()
  console.log(`🔗 PR URL: ${prInfo.url}`)
  console.log(`📋 Target branch: ${prInfo.targetBranch}`)
  console.log(`🌿 Current branch: ${prInfo.currentBranch}`)
  console.log(`🤖 Using ${config.agent.toUpperCase()} for AI assistance`)

  let prompt = `Write a PR description following these steps:
1. Look for pull_request_template.md in .github directory (use Glob pattern: ".github/**" to find it)
2. If template exists, read it and use it as the structure for the PR description
3. Analyze the changes between the target branch (${prInfo.targetBranch}) and current branch (${prInfo.currentBranch})
4. Fill in the template sections based on the actual changes made
5. Write a concise description that reviewers can understand at a glance
6. Update the PR description:
   - Save the formatted description to a temporary file
   - Use GitHub CLI with --body-file flag to update from the file
   - Delete the temporary file`

  // Add additional context if provided
  if (additionalPrompt) {
    console.log(`📝 Additional context: ${additionalPrompt}`)
    prompt += `

Additional context from user:
${additionalPrompt}

Please incorporate this additional context into the PR description where relevant.`
  }

  try {
    await executeAICommand(prompt)
    console.log('✅ PR description updated successfully!')
  } catch {
    console.error('❌ Failed to update PR description')
    process.exit(1)
  }
}

main()
