---
'git-pr-ai': minor
---

Improve the `git pr-ai config` flow with agent-specific model selection:
- choose the command via select prompt, pick which agent's model to configure, and enter the exact model name
- warn users that incorrect model names block command execution
- reuse a shared constant for command/model choices so future commands stay in sync
