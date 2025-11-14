---
'git-pr-ai': minor
'@git-pr-ai/docs': patch
---

Add per-command model configuration support. Users can now specify different AI models for each command in the configuration file, allowing fine-grained control over performance vs. cost trade-offs.

Example configuration:
```json
{
  "agent": "claude",
  "model": {
    "createBranch": { "claude": "haiku" },
    "prReview": { "claude": "sonnet" }
  }
}
```

This feature enables:
- Command-specific model selection (e.g., use fast models for branch naming, powerful models for PR reviews)
- Multi-agent model preparation (configure models for different agents without switching)
- Backward compatibility (existing configs continue to work without changes)
