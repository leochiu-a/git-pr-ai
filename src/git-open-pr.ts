import { execSync } from "child_process";

function getCurrentBranch() {
  return execSync("git branch --show-current", {
    encoding: "utf8",
  }).trim();
}

function extractJiraTicket(branchName: string) {
  const jiraPattern = /([A-Z][A-Z0-9]*\-\d+)/;
  const match = branchName.match(jiraPattern);

  if (!match) {
    console.error("❌ Unable to extract JIRA ticket number from branch name");
    console.error("Branch name should contain format like KB2C-123");
    process.exit(1);
  }

  return match[1];
}

function checkGitHubCLI() {
  try {
    execSync("gh --version", { stdio: "ignore" });
  } catch (error) {
    console.error("❌ Please install GitHub CLI (gh) first");
    console.error("Installation: https://cli.github.com/");
    process.exit(1);
  }

  try {
    execSync("gh auth status", { stdio: "ignore" });
  } catch (error) {
    console.error("❌ Please authenticate with GitHub CLI first");
    console.error("Run: gh auth login");
    process.exit(1);
  }
}

function createPullRequest(title: string, branch: string) {
  console.log("🚀 Creating Pull Request...");
  execSync(
    `gh pr create --title "${title}" --base main --head ${branch} --web`,
    { encoding: "utf8" }
  );

  console.log("✅ Pull Request created successfully!");
}

function main() {
  try {
    const currentBranch = getCurrentBranch();
    const jiraTicket = extractJiraTicket(currentBranch);
    console.log(`Branch: ${currentBranch} | JIRA: ${jiraTicket}`);

    checkGitHubCLI();

    const prTitle = `[${jiraTicket}] ${currentBranch}`;
    createPullRequest(prTitle, currentBranch);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error:", errorMessage);
    process.exit(1);
  }
}

main();
