# git-pr-ai

## 1.11.0

### Minor Changes

- 9f2acf4: feat: add branch name selection with multiple AI-generated options
  - Generate 3 branch name options instead of single suggestion
  - Support both JIRA, custom prompt, and git diff based generation
  - Allow users to select from multiple naming alternatives
  - Maintain backward compatibility with legacy single branch name format

- 9cc2834: feat: add ai-commit command

## 1.10.0

### Minor Changes

- e20bf5d: feat: add cursor agent support

## 1.9.14

### Patch Changes

- 9c937b6: fix: resolve Gemini CLI prompt argument error in create-branch command

  Fixed "Not enough arguments following: p" error when using Gemini agent with create-branch command. The issue was caused by using `gemini -p` flag without providing the required argument value. Changed to use stdin input directly, which is natively supported by Gemini CLI and consistent with Claude CLI usage.

## 1.9.13

### Patch Changes

- 2f67077: fix: ai output format

## 1.9.12

### Patch Changes

- 236e67d: fix: post note format in gitlab

## 1.9.11

### Patch Changes

- 259fc83: refactor: use npm check updates for versions

## 1.9.10

### Patch Changes

- 19090f3: feat: structured pr reviews with comments

## 1.9.9

### Patch Changes

- 0c6c23f: refactor: remove unused createLanguageSystemPrompt function

## 1.9.8

### Patch Changes

- 4c642d2: feat: add version upgrade checker

## 1.9.7

### Patch Changes

- 0a047e0: allow jira url as input

## 1.9.6

### Patch Changes

- acea9fb: fix: check existing pr open only
- e787dd7: refactor: restructure open pr module

## 1.9.5

### Patch Changes

- 77977b3: fix: gitlab mr update command syntax

## 1.9.4

### Patch Changes

- 770217f: feat: include reviewed prs in summary

## 1.9.3

### Patch Changes

- 238ed30: refactor: ai executor
- a2078a0: feat: add yolo mode support

## 1.9.2

### Patch Changes

- 84435bb: feat: add language config support
- 926c7c9: refactor: improve template reading

## 1.9.1

### Patch Changes

- 820e6ab: fix(weekly-summary): filter by current user

## 1.9.0

### Minor Changes

- b34c89e: feat: add git weekly-summary cli

## 1.8.5

### Patch Changes

- 851df85: refactor: import update-pr-desc and pr-review prompts

## 1.8.4

### Patch Changes

- 289168a: refactor: improve pr prompts
- fa91b9c: fix: gitlab command quotes

## 1.8.3

### Patch Changes

- 39a5980: feat: add commitlint branch conversion

## 1.8.2

### Patch Changes

- 498d65f: improve PR description prompt

## 1.8.1

### Patch Changes

- ae5c152: fix: jira pattern support alphanumeric keys
- 06ba77d: feat: improve Jira ticket ID resolution efficiency

## 1.8.0

### Minor Changes

- 41e5d35: Add `git take-issue` cli
- 75ac865: Implement plan-issue Command for AI-Powered Jira Implementation Plans

### Patch Changes

- 6b04067: Fix create-branch fail

## 1.7.2

### Patch Changes

- 17c9f56: ora and AI command conflic

## 1.7.1

### Patch Changes

- a46affb: chore: add step to copy README to cli package in release workflow

## 1.7.0

### Minor Changes

- 228821a: feat: add GitLab CLI support and improve multi-platform compatibility
  - Add support for GitLab CLI commands with new JSON flag format
  - Streamline PR retrieval and update CLI command structure
  - Improve PR description update flow and review prompts
  - Enhance documentation for multi-platform support and AI features

## 1.6.0

### Minor Changes

- 8ebf9dc: - Refactor to pnpm workspace monorepo
  - Add Docusaurus documentation site

## 1.5.1

### Patch Changes

- 3fff024: Enhance user feedback with ora spinners and refined console messages
- bc9717e: Add custom prompt branch generation

## 1.5.0

### Minor Changes

- 527e577: Consolidate config commands
- 048a19b: Add create branch command

### Patch Changes

- 98ad6f5: fix: remove duplicate branch renaming messages in create-branch command

  Remove redundant "Renaming branch" message to avoid duplication with "Generated branch name" message, providing cleaner output when using the --move option.

## 1.4.1

### Patch Changes

- 890c21f: Add --jira option to manually specify JIRA ticket ID in open-pr command
  - Users can now specify JIRA ticket ID manually with `git open-pr --jira PROJ-123`
  - Falls back to automatic extraction from branch name if --jira option is not provided
  - Updated help documentation and README with usage examples

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
