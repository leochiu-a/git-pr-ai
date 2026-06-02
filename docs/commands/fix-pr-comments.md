# git fix-pr-comments

Resolve PR/MR review comments with AI. Fetches a comment (or all open comments on the current PR/MR), applies the code fix, commits, pushes, and replies with the commit hash.

## Usage

```bash
git fix-pr-comments [commentUrl]
```

- **Default** (no URL): Fetches all open review comments on the current PR/MR and fixes them in sequence
- **URL**: Fixes a single review comment by GitHub/GitLab URL

## Options

| Option   | Description                                                                   |
| -------- | ----------------------------------------------------------------------------- |
| `--yolo` | Keep interactive AI session, but pass YOLO/skip-permission behavior to AI CLI |

## Features

- **Two Modes**: Fix one comment by URL, or batch-fix all open comments on the current PR/MR
- **AI-Powered Fixes**: Uses your configured AI provider (see [AI Providers](../introduction/ai-providers)) to understand and resolve each comment
- **Inline & General Comments**: Handles both inline (file/line) and PR-level comments
- **Commit, Push, Reply**: Commits each fix, pushes, and replies to the comment referencing the commit
- **Multi-Platform**: Works with both GitHub and GitLab

This command shares a single source of truth with the [`fix-pr-comments`](https://github.com/leochiu-a/git-pr-ai/blob/main/.claude/skills/fix-pr-comments/SKILL.md) skill — both use the same workflow, platform references, and helper scripts.

## Examples

```bash
# Fix all open review comments on the current PR/MR
git fix-pr-comments

# Fix a specific GitHub PR review comment
git fix-pr-comments https://github.com/owner/repo/pull/1#discussion_r123

# Fix a specific GitLab MR comment
git fix-pr-comments https://gitlab.com/owner/repo/-/merge_requests/1#note_456

# Fewer permission prompts
git fix-pr-comments --yolo
```

## Prerequisites

- GitHub CLI (`gh`) or GitLab CLI (`glab`) installed and authenticated
- `python3` available to run the helper scripts
- An AI agent configured (run `git pr-ai config`)
