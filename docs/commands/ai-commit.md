# git ai-commit

Generate AI-powered commit messages based on your actual code changes. The AI analyzes your git diff and generates **3 commit message options** following conventional commit format, allowing you to choose the one that best describes your changes.

## Usage

```bash
git ai-commit
```

## Features

- **AI-Powered Analysis**: Analyzes your git diff to understand what changed
- **3 Options to Choose**: Provides 3 different commit message options with varying levels of detail
- **Conventional Commits**: Follows commitlint conventional commit format
- **Smart Staging**: Automatically stages changes if nothing is staged yet
- **Context-Aware**: Generates messages that explain WHAT changed and WHY

## Examples

### With Staged Changes

```bash
# Stage your changes first
git add src/auth.ts src/login.ts

# Generate and select commit message
git ai-commit
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
# → Detects no staged changes
# → Analyzes all unstaged changes
# → Generates 3 commit message options
# → After selection, automatically stages all changes and creates commit
```

## Commit Message Types

The AI automatically selects the appropriate commit type based on your changes:

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
