import { $ } from "zx";
import { checkGitHubCLI } from "../utils.js";

async function checkForPR(): Promise<boolean> {
  try {
    const result = await $`gh pr status`;
    return !result.stdout.includes("There is no pull request associated");
  } catch (error) {
    return false;
  }
}

async function main() {
  await checkGitHubCLI();

  console.log("🔍 Checking for PR on current branch...");

  const hasPR = await checkForPR();

  if (!hasPR) {
    console.error("❌ No PR found for current branch");
    console.error(
      "Please create a PR first or switch to a branch with an existing PR"
    );
    process.exit(1);
  }

  console.log("✅ PR found! Updating description...");

  const prompt = `Write a PR description following these steps:
1. Check if there's a pull_request_template.md file and use it as the template if available
2. Analyze the changes in the current branch compared to the target branch
3. Write a concise description that reviewers can understand at a glance based on the template and changes
4. Update the PR description using gh cli`;

  try {
    await $({ stdio: 'inherit' })`claude ${prompt}`;
    console.log("✅ PR description updated successfully!");
  } catch (error) {
    console.error("❌ Failed to update PR description");
    process.exit(1);
  }
}

main();
