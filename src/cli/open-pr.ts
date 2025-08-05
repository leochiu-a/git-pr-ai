import { $ } from 'zx';
import { getCurrentBranch, extractJiraTicket, checkGitHubCLI, getDefaultBranch } from '../utils.js';

async function createPullRequest(title: string, branch: string, baseBranch: string) {
  console.log("🚀 Creating Pull Request...");
  await $`gh pr create --title ${title} --base ${baseBranch} --head ${branch} --web`;
  console.log("✅ Pull Request created successfully!");
}

async function main() {
  try {
    const currentBranch = await getCurrentBranch();
    const jiraTicket = extractJiraTicket(currentBranch);
    console.log(`Branch: ${currentBranch} | JIRA: ${jiraTicket}`);

    await checkGitHubCLI();
    const baseBranch = await getDefaultBranch();

    const prTitle = `[${jiraTicket}] ${currentBranch}`;
    await createPullRequest(prTitle, currentBranch, baseBranch);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error:", errorMessage);
    process.exit(1);
  }
}

main();
