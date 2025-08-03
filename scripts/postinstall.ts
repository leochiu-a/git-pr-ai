#!/usr/bin/env node

import { execSync } from "child_process";

try {
  // Set up git alias
  const command = `git config --global alias.open-pr '!git-open-pr'`;

  execSync(command, { stdio: "inherit" });

  console.log('✅ Git alias "git open-pr" has been set up successfully!');
  console.log("You can now use: git open-pr");
} catch (error) {
  console.log("⚠️  Could not set up git alias automatically.");
  console.log("You can manually set it up with:");
  console.log("git config --global alias.open-pr '!git-open-pr'");
}
