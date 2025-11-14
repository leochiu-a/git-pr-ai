# Configuration

Git PR AI Tool works out of the box with sensible defaults, but you can customize it to fit your specific workflow and requirements.

## Quick Configuration

Run the configuration command to set up the tool interactively:

```bash
git pr-ai config
```

This command will guide you through:

- Choosing your preferred AI provider (Claude, Gemini, Cursor Agent, or Codex)
- Setting up JIRA integration (optional)
- Creating the configuration file

## Configuration File

The configuration is stored in `~/.git-pr-ai/.git-pr-ai.json`. Here's an example with `agent` and `model`:

```json
{
  "agent": "claude",
  "model": {
    "createBranch": {
      "claude": "haiku"
    },
    "prReview": {
      "claude": "sonnet"
    }
  },
  "jira": {
    "baseUrl": "https://your-company.atlassian.net",
    "email": "your-email@company.com",
    "apiToken": "your-jira-api-token"
  }
}
```

## Setting `agent` and `model`

### AI Provider (`agent`)

Choose your preferred AI provider:

```json
{
  "agent": "claude" // or "gemini", "cursor-agent", "codex"
}
```

**Available options:**

- `"claude"` (default): Uses Claude Code for AI assistance
- `"gemini"`: Uses Gemini CLI for AI assistance
- `"cursor-agent"`: Uses Cursor Agent CLI for AI assistance
- `"codex"`: Uses Codex CLI for AI assistance

Need help picking or installing one? See the [AI Providers guide](./introduction/ai-providers).

### AI Model Configuration (`model`)

Customize which AI model each command uses. This allows fine-grained control over performance vs. cost trade-offs for different operations.

```json
{
  "agent": "claude",
  "model": {
    "createBranch": {
      "claude": "haiku",
      "gemini": "gemini-2.5-flash"
    },
    "aiCommit": {
      "claude": "haiku"
    },
    "prReview": {
      "claude": "sonnet"
    },
    "updatePrDesc": {
      "claude": "sonnet"
    },
    "planIssue": {
      "claude": "sonnet"
    },
    "takeIssue": {
      "claude": "sonnet"
    }
  }
}
```

**How it works:**

1. The `agent` field determines which CLI tool to use globally
2. For each command, you can specify model preferences per agent
3. The tool uses the model specified for the current `agent`
4. If no model is specified for a command, the CLI's default model is used

**Available commands:**

Each command supports the following agent names: `claude`, `gemini`, `cursor-agent`, `codex`

- `createBranch`: Branch name generation (`git-create-branch`)
- `aiCommit`: Commit message generation (`git-ai-commit`)
- `prReview`: Pull request review (`git-pr-review`)
- `updatePrDesc`: PR description updates (`git-update-pr-desc`)
- `planIssue`: Issue planning and optimization (`git-plan-issue`)
- `takeIssue`: Issue implementation (`git-take-issue`)

**Configuration structure:**

```json
{
  "model": {
    "<commandName>": {
      "claude": "<model-for-claude>",
      "gemini": "<model-for-gemini>",
      "cursor-agent": "<model-for-cursor>",
      "codex": "<model-for-codex>"
    }
  }
}
```

### JIRA Integration (`jira`)

Configure JIRA integration for automatic ticket fetching:

```json
{
  "jira": {
    "baseUrl": "https://your-company.atlassian.net",
    "email": "your-email@company.com",
    "apiToken": "your-jira-api-token"
  }
}
```

**Required fields:**

- `baseUrl`: Your JIRA instance URL
- `email`: Your JIRA account email
- `apiToken`: Your JIRA API token

## Setting Up JIRA Integration

### 1. Get Your JIRA API Token

1. Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click "Create API token"
3. Enter a label (e.g., "Git PR AI Tool")
4. Copy the generated token

### 2. Find Your JIRA Base URL

Your JIRA base URL is typically in the format:

- `https://your-company.atlassian.net` (Cloud)

### 3. Configure the Tool

Run the configuration command and provide your JIRA details:

```bash
git pr-ai config
```

Or manually edit the configuration file at `~/.git-pr-ai/.git-pr-ai.json`.

## Default Behavior

Without configuration, the tool will:

- Use Claude as the default AI provider (if available). Switch to Gemini, Cursor Agent, or Codex anytime by running `git pr-ai config`.
- Skip JIRA integration (use branch names for PR titles)
- Work with basic GitHub integration only

## Configuration File Location

The configuration file is stored in:

```
~/.git-pr-ai/.git-pr-ai.json
```

On different systems:

- **macOS/Linux**: `/Users/username/.git-pr-ai/.git-pr-ai.json`
- **Windows**: `C:\Users\username\.git-pr-ai\.git-pr-ai.json`
