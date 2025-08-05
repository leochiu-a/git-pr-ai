import { writeFileSync, existsSync } from "fs";
import { join } from "path";
import { select } from "@inquirer/prompts";
import { GitPrAiConfig } from "../config.js";

const CONFIG_FILENAME = ".git-pr-ai.json";

async function promptAgentSelection(): Promise<"claude" | "gemini"> {
  const answer = await select({
    message: "🤖 Which AI agent would you like to use?",
    choices: [
      {
        name: "Claude (Anthropic)",
        value: "claude" as const,
      },
      {
        name: "Gemini (Google)",
        value: "gemini" as const,
      },
    ],
  });

  return answer;
}

async function initConfig(force: boolean = false) {
  const configPath = join(process.cwd(), CONFIG_FILENAME);

  if (existsSync(configPath) && !force) {
    console.log(`⚠️ ${CONFIG_FILENAME} already exists in current directory.`);
    console.log("Use --force to overwrite the existing configuration.");
    return;
  }

  const selectedAgent = await promptAgentSelection();

  const config: GitPrAiConfig = {
    agent: selectedAgent,
  };

  try {
    writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`\n✅ ${CONFIG_FILENAME} created successfully!`);
    console.log(`🎯 Selected AI agent: ${selectedAgent}`);
    console.log("\nConfiguration options:");
    console.log(
      '- agent: "claude" | "gemini" - Choose AI agent for PR operations'
    );
    console.log("\nEnvironment variables:");
    console.log(
      "- GIT_PR_AI_AGENT: Override agent setting via environment variable"
    );
  } catch (error) {
    console.error(`❌ Failed to create ${CONFIG_FILENAME}:`, error);
    process.exit(1);
  }
}

async function main() {
  try {
    await initConfig();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error:", errorMessage);
    process.exit(1);
  }
}

main();
