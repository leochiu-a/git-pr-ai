# git ai-commit

Generate AI-powered commit messages based on your actual code changes. The AI analyzes your git diff and generates **3 commit message options** following conventional commit format, allowing you to choose the one that best describes your changes.

<iframe width="560" height="315" src="https://www.youtube.com/embed/mhOpvbq9OCc?si=y7aaKn37TzeZjl2_" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Usage

```bash
git ai-commit
```

```bash
git ai-commit "explain why the change was needed"
```

```bash
git ai-commit --jira
```

```bash
git ai-commit --jira PROJ-123
```

```bash
git ai-commit --non-interactive
```

## Features

- **AI-Powered Analysis**: Analyzes your git diff to understand what changed
- **3 Options to Choose**: Provides 3 different commit message options with varying levels of detail
- **Conventional Commits**: Follows commitlint conventional commit format
- **Commit Type Selection**: Choose the commit type before generating messages
- **Context-Aware**: Generates messages that explain WHAT changed and WHY
- **Optional Prompt**: Use a short prompt to add extra context for the AI
- **JIRA Shortcut (Optional)**: Skip AI and commit directly from a JIRA ticket

## Examples

### With Staged Changes

```bash
# Stage your changes first
git add src/auth.ts src/login.ts

# Generate and select commit message
git ai-commit
# → Select a commit type (feat/fix/etc.)
# → AI analyzes your changes and generates 3 options:
#   1. feat: add user authentication module
#   2. feat: implement login and signup functionality
#   3. feat: add JWT-based authentication system for users
# → Select your preferred message from the interactive menu
# → Commit is created automatically
```

### Without Staged Changes

```bash
# Make some changes without staging
# Edit multiple files...

# Run ai-commit directly
git ai-commit
# → Requires staged changes (errors if none are staged)
# → Select a commit type (feat/fix/etc.)
# → Generates 3 commit message options
# → After selection, creates commit from your staged changes
```

### With Additional Context

```bash
# Add context about why the change was needed
git ai-commit "align error handling with upstream API changes"
# → AI uses your context to craft more specific commit messages
```

### With JIRA Ticket

```bash
# Use JIRA ticket from branch name
git ai-commit --jira

# Provide a JIRA ticket ID or URL
git ai-commit --jira SL-1234
git ai-commit --jira https://your-company.atlassian.net/browse/SL-1234
```

When using `--jira`, the command skips AI and generates a commit message like:

```
<type>: [<jira-id>] <jira-title>

link: <jira-url>
```

If JIRA details cannot be fetched, the title falls back to the ticket key.
The `link:` line is included only when a JIRA base URL is available.

### Non-Interactive Mode

```bash
# Skip local select prompts and auto-use defaults
# Commit type is inferred from current branch prefix when possible
git ai-commit --non-interactive

# Specify commit type explicitly without prompt
git ai-commit --type fix --non-interactive

# CI alias
git ai-commit --ci
```

## Commit Message Types

You choose the commit type before message generation:

| Type       | Description              | Example                               |
| ---------- | ------------------------ | ------------------------------------- |
| `feat`     | New features             | feat: add user authentication         |
| `fix`      | Bug fixes                | fix: resolve login validation error   |
| `docs`     | Documentation changes    | docs: update API documentation        |
| `style`    | Formatting changes       | style: format code with prettier      |
| `refactor` | Code refactoring         | refactor: restructure auth module     |
| `perf`     | Performance improvements | perf: optimize database queries       |
| `test`     | Adding/updating tests    | test: add unit tests for auth service |
| `chore`    | Maintenance tasks        | chore: update dependencies            |
| `ci`       | CI/CD changes            | ci: add GitHub Actions workflow       |
| `build`    | Build system changes     | build: update webpack configuration   |
