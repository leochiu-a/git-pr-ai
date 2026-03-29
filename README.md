# Git PR AI

[![npm version](https://img.shields.io/npm/v/git-pr-ai.svg)](https://www.npmjs.com/package/git-pr-ai)
[![npm downloads](https://img.shields.io/npm/dt/git-pr-ai.svg)](https://www.npmjs.com/package/git-pr-ai)

`git-pr-ai` streamlines GitHub/GitLab Pull Requests with AI-powered automation. Use it as **CLI commands** in your terminal, or as **AI Agent Skills** that let Claude Code, Codex, and other agents handle the work for you — from branch creation and smart commits to code reviews and PR descriptions.

**[Read the Docs](https://leochiu-a.github.io/git-pr-ai)**

## Key Features

- **AI-Powered Intelligence**: Harness Claude Code, Gemini AI, Cursor Agent, or Codex to transform mundane git tasks into intelligent, context-aware workflows that understand your code and intentions.
- **Smart JIRA Integration**: Seamlessly bridge your project management and development workflow with automated branch creation and context extraction from tickets.
- **Flexible Workflow**: Use CLI commands for direct control, or AI Agent Skills for natural language interaction — the same powerful features, two ways to access them.
- **Zero-Friction Setup**: From installation to first PR in under 5 minutes - because your time is better spent coding, not configuring tools.

## Prerequisites

The following setup applies to both CLI and Skills usage.

- **Platform CLI**: Install and authenticate either GitHub CLI (`gh`) or GitLab CLI (`glab`).
  - GitHub: [Install GitHub CLI](https://cli.github.com/) and run `gh auth login`
  - GitLab: [Install GitLab CLI](https://gitlab.com/gitlab-org/cli) and run `glab auth login`
- **AI Provider**: Depending on your preference, set up access for one of the following AI providers:
  - [Claude Code](https://console.anthropic.com/dashboard) - Anthropic's AI assistant
  - [Gemini CLI](https://geminicli.com/) - Google's AI assistant
  - [Cursor Agent CLI](https://cursor.com/cli) - Cursor's AI assistant
  - [Codex CLI](https://developers.openai.com/codex/cli/) - Codex's AI assistant
  - Need help choosing? Read the [AI Providers guide](https://leochiu-a.github.io/git-pr-ai/introduction/ai-providers).

### Platform & AI Provider Support

| Platform | Claude Code | Gemini CLI | Cursor CLI | Codex CLI |
| -------- | :---------: | :--------: | :--------: | :-------: |
| GitHub   |     ✅      |     ✅     |     ✅     |    ✅     |
| GitLab   |     ✅      |     ✅     |     ✅     |    ✅     |

All combinations of platforms and AI providers are fully supported!

## Installation

```bash
pnpm add -g git-pr-ai
```

## Getting Started: CLI

After installing `git-pr-ai`, the CLI registers a suite of `git` subcommands (e.g., `git pr-ai`, `git create-branch`, `git pr-review`) so you can run everything directly from your terminal.

1.  **Configure the tool** (required for git-pr-ai to fetch JIRA data):

    ```bash
    # Set up your preferred AI provider (see AI Providers guide for options)
    git pr-ai config
    ```

2.  **Create a branch from a JIRA Ticket**:

    ```bash
    # Automatically generates semantic branch names from JIRA tickets
    git create-branch --jira PROJ-123
    ```

    _No more inconsistent branch names or forgetting ticket details. Just paste your JIRA ID and get perfectly formatted branches every time._

3.  **Create AI-powered Commits**:

    ```bash
    # AI-generated commit messages based on your changes
    git ai-commit
    ```

    _No more generic commit messages. AI analyzes your changes and suggests 3 meaningful commit messages following conventional commit format. Pick the one that fits best!_

    ```bash
    # Provide extra context for the commit message
    git ai-commit "explain why the change was needed"
    ```

    ```bash
    # Include a JIRA ticket in the commit message
    git ai-commit --jira
    ```

4.  **Create a Pull Request**:

    ```bash
    # One-command PR creation with intelligent title formatting
    git open-pr
    ```

    _Transform your workflow from "commit → switch to browser → fill forms → copy URLs" to just "commit → one command → done!"_

5.  **Update PR Description with AI**:

    ```bash
    # AI-powered PR descriptions that explain what changed and why
    git update-pr-desc
    ```

    _Never write another boring "fix bug" description. Get detailed, context-aware PR descriptions that help reviewers understand your changes instantly._

6.  **Review PR with AI**:

    ```bash
    # Instant AI code review with improvement suggestions
    git pr-review
    ```

    _Think of it as having a senior developer review your code 24/7. Catch bugs early, improve code quality, and learn best practices automatically._

7.  **Generate Weekly Summary**:

    ```bash
    # AI-generated weekly summaries for standups and reviews
    git weekly-summary
    ```

    _Stop scrambling to remember what you worked on this week. Get AI-generated summaries that highlight your impact and achievements automatically._

## Getting Started: AI Agent Skills

Prefer natural language over CLI commands? Install the skills and let your AI agent (Claude Code, Codex, etc.) handle the work:

```bash
npx skills add https://github.com/leochiu-a/git-pr-ai
```

The following skills are included:

| Skill                                                        | Description                                                                            |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| [`git-pr-workflow`](.claude/skills/git-pr-workflow/SKILL.md) | Full PR lifecycle: create branch, commit, open PR, update description, and code review |
| [`update-pr-desc`](.claude/skills/update-pr-desc/SKILL.md)   | AI-generate and apply a PR/MR description from the diff                                |
| [`code-review`](.claude/skills/code-review/SKILL.md)         | AI code review for a PR/MR: analyze the diff and post inline review comments           |
| [`fix-pr-comment`](.claude/skills/fix-pr-comment/SKILL.md)   | Fix a PR review comment, commit the change, and reply with the commit hash             |

Once installed, just describe what you want in natural language:

- "start workflow for PROJ-123"
- "update pr desc"
- "review pr" or "review this PR"
- "fix this comment https://github.com/owner/repo/pull/1#discussion_r123"

## Documentation

Want to learn more about detailed configurations and features?

Please refer to our **[full documentation](https://leochiu-a.github.io/git-pr-ai)**.
