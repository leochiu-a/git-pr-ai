import { $ } from 'zx';

$.verbose = false;

export async function getDefaultBranch() {
  try {
    const result = await $`gh repo view --json defaultBranchRef`;
    const json = JSON.parse(result.stdout);
    if (json.defaultBranchRef && json.defaultBranchRef.name) {
      return json.defaultBranchRef.name;
    }
    return 'main';
  } catch (error) {
    console.warn("⚠️ Could not determine default branch via gh, falling back to 'main'");
    return 'main';
  }
}

export async function getCurrentBranch() {
  const result = await $`git branch --show-current`;
  return result.stdout.trim();
}

export function extractJiraTicket(branchName: string) {
  const jiraPattern = /([A-Z][A-Z0-9]*\-\d+)/;
  const match = branchName.match(jiraPattern);

  if (!match) {
    console.error("❌ Unable to extract JIRA ticket number from branch name");
    console.error("Branch name should contain format like KB2C-123");
    process.exit(1);
  }

  return match[1];
}

export async function checkGitHubCLI() {
  try {
    await $`gh --version`.quiet();
  } catch (error) {
    console.error("❌ Please install GitHub CLI (gh) first");
    console.error("Installation: https://cli.github.com/");
    process.exit(1);
  }

  try {
    const result = await $`gh auth status`.quiet();
    // Check if there's at least one authenticated account
    if (!result.stdout.includes('✓ Logged in to')) {
      throw new Error('No authenticated accounts found');
    }
  } catch (error) {
    // If no output captured, try alternative check
    try {
      await $`gh api user`.quiet();
    } catch (apiError) {
      console.error("❌ Please authenticate with GitHub CLI first");
      console.error("Run: gh auth login");
      process.exit(1);
    }
  }
}
