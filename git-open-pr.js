#!/usr/bin/env node

import { execSync } from "child_process";

function getCurrentBranch() {
  return execSync("git branch --show-current", {
    encoding: "utf8",
  }).trim();
}

function extractJiraTicket(branchName) {
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

function createPullRequest(title, branch) {
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
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Only run main() when this file is executed directly, not when imported as a module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };
