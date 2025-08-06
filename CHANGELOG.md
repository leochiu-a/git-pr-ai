# git-pr-ai

## 1.4.0

### Minor Changes

- 0d5a128: - enhance PR description update process for GitHub CLI
  - update PR review instructions for GitHub CLI usage

- 894e1da: - feat: make JIRA ticket detection optional - tool now works without JIRA tickets
  - feat: add smart PR detection - opens existing PR instead of creating duplicates
  - feat: upgrade open-pr command to use commander for better CLI experience
  - improve: enhanced help text and examples for git-open-pr command

## 1.3.1

### Patch Changes

- f68b7a0: feat: implement git-pr-ai command for AI agent selection and configuration
  - Add new git-pr-ai command with AI agent selection functionality
  - Enhance configuration management with improved path handling
  - Update postinstall script to use zx for better command execution
  - Add commander for improved CLI command handling

- d14fe43: configure oxlint and prettier

## 1.3.0

### Minor Changes

- d4a1b54: Add support for gemini

## 1.2.1

### Patch Changes

- 67d786e: feat(cli): Automatically detect the default branch for PRs

## 1.2.0

### Minor Changes

- 6cabfa8: Introduced a new command git pr-review that utilizes AI to perform comprehensive code reviews on GitHub Pull Requests

## 1.1.0

### Minor Changes

- a64cbfa: Enhances the git update-pr-desc command to accept additional user context as command-line arguments

## 1.0.1

### Patch Changes

- 855ae25: fix workflow

## 1.0.0

### Major Changes

- 855ae25: Initial release
