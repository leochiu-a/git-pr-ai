# Configuration

Git PR AI Tool works out of the box with sensible defaults, but you can customize it to fit your specific workflow and requirements.

## Quick Configuration

Run the configuration command to set up the tool interactively:

```bash
git pr-ai config
```

This command will guide you through:

- Choosing your preferred AI provider (Claude or Gemini)
- Setting up JIRA integration (optional)
- Creating the configuration file

## Configuration File

The configuration is stored in `~/.git-pr-ai/.git-pr-ai.json`. Here's an example:

```json
{
  "agent": "claude",
  "jira": {
    "baseUrl": "https://your-company.atlassian.net",
    "email": "your-email@company.com",
    "apiToken": "your-jira-api-token"
  }
}
```

## Configuration Options

### AI Provider (`agent`)

Choose your preferred AI provider:

```json
{
  "agent": "claude" // or "gemini"
}
```

**Available options:**

- `"claude"` (default): Uses Claude Code for AI assistance
- `"gemini"`: Uses Gemini CLI for AI assistance

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

- Use Claude as the default AI provider (if available)
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

## Security Considerations

- **API Tokens**: Store JIRA API tokens securely
- **File Permissions**: Ensure configuration files are not world-readable
- **Environment Variables**: Be cautious with API tokens in shell history
