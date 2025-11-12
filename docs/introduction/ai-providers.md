# AI Providers

Git PR AI delegates all AI-powered features (branch naming, commit messages, PR descriptions, reviews, weekly summaries, etc.) to the CLI agent you have installed locally. Configuring the tool is as simple as choosing which AI CLI to call.

## Supported Agents

| Provider         | CLI Command    | Notes                                                                              |
| ---------------- | -------------- | ---------------------------------------------------------------------------------- |
| Claude Code      | `claude`       | Default agent. Requires Anthropic account with Claude Code access.                 |
| Gemini CLI       | `gemini`       | Install from geminicli.com and link your Google account.                           |
| Cursor Agent CLI | `cursor-agent` | Install from cursor.com/cli; run `cursor-agent auth` to link your account.         |
| Codex CLI        | `codex`        | Install from developers.openai.com/codex/cli and authenticate with your workspace. |

All commands work the same regardless of which provider you select.

## Choosing & Switching Providers

1. Install and authenticate at least one CLI from the list above (follow each vendor's installation guide).
2. Run `git pr-ai config` and pick your preferred provider when prompted (you can re-run the command anytime to switch).
3. The selection is saved in `~/.git-pr-ai/.git-pr-ai.json` under the `agent` key.

If no configuration exists, Git PR AI defaults to Claude Code and will ask you to install it before running AI-assisted commands.

## Installation Shortcuts

- Claude Code: [docs.anthropic.com/claude-code](https://docs.anthropic.com/en/docs/claude-code)
- Gemini CLI: [geminicli.com](https://geminicli.com/)
- Cursor Agent CLI: [cursor.com/cli](https://cursor.com/cli)
- Codex CLI: [developers.openai.com/codex/cli](https://developers.openai.com/codex/cli/)

After installing a CLI, verify it works by running the corresponding `--version` command (for example, `codex --version`).

## Feature Expectations

- **Parity**: Every AI-dependent command (plan issue, take issue, ai-commit, update PR description, pr-review, weekly summary, etc.) automatically uses the configured agent.
- **YOLO mode**: When commands expose `--yolo`, the flag maps to each agent's "force/skip prompt" behavior automatically.

If you install multiple providers, simply rerun `git pr-ai config` whenever you want to switch. No other changes are required.
