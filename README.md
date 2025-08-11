# 🚀 Git PR AI

[![npm version](https://img.shields.io/npm/v/git-pr-ai.svg)](https://www.npmjs.com/package/git-pr-ai)
[![npm downloads](https://img.shields.io/npm/dt/git-pr-ai.svg)](https://www.npmjs.com/package/git-pr-ai)

A CLI tool that empowers developers to create GitHub Pull Requests faster and more efficiently with the help of AI.

---

**[Read the Docs](https://leochiu-a.github.io/git-pr-ai/intro)**

`git-pr-ai` is a command-line tool designed to streamline the process of creating GitHub Pull Requests from JIRA tickets. By leveraging the power of AI, it can automatically generate branch names, PR descriptions, and even assist with code reviews, allowing you to focus on what truly matters: writing high-quality code.

## ✨ Key Features

- **🤖 AI-Powered Assistance**: Utilizes powerful AI models (Claude Code or Gemini) to automatically generate PR descriptions and review code.
- **🎫 JIRA Integration**: Directly create git branches with standardized names from JIRA tickets.
- **⚙️ Simplified Workflow**: Consolidates multiple git commands into single, easy-to-remember commands.
- **🚀 Quick Start**: Get up and running with just a few simple installation and setup steps.

## 📦 Installation

```bash
pnpm add -g git-pr-ai
```

## 📋 Prerequisites

Before you begin, please ensure you have completed the following setup:

- **Platform CLI**: Install and authenticate either GitHub CLI (`gh`) or GitLab CLI (`glab`).
  - GitHub: [Install GitHub CLI](https://cli.github.com/) and run `gh auth login`
  - GitLab: [Install GitLab CLI](https://gitlab.com/gitlab-org/cli) and run `glab auth login`
- **AI Provider**: Depending on your preference, set up access for either [Claude Code](https://console.anthropic.com/dashboard) or [Gemini CLI](https://ai.google.dev/tutorials/gemini_cli_quickstart).

## 🚀 Quick Start

1.  **Configure the tool** (required for git-pr-ai to fetch JIRA data):

    ```bash
    # Set up your preferred AI provider (Claude or Gemini)
    git pr-ai config
    ```

2.  **Create a branch from a JIRA Ticket**:

    ```bash
    # Generates branch name following commitlint conventions from JIRA ticket ID (e.g., PROJ-123)
    git create-branch --jira PROJ-123
    ```

3.  **Create a Pull Request**:

    ```bash
    # Automatically fetches JIRA ID and title, then initiates the PR creation process
    git open-pr
    ```

4.  **Update PR Description with AI**:

    ```bash
    # Directly updates the PR description using AI analysis of your code changes
    git update-pr-desc
    ```

5.  **Review PR with AI**:
    ```bash
    # Uses AI to review code and provide feedback
    git pr-review
    ```

## 📚 Documentation

Want to learn more about detailed configurations and features?

Please refer to our **[full documentation](https://leochiu-a.github.io/git-pr-ai/intro)**.
