---
"git-pr-ai": patch
---

fix: resolve Gemini CLI prompt argument error in create-branch command

Fixed "Not enough arguments following: p" error when using Gemini agent with create-branch command. The issue was caused by using `gemini -p` flag without providing the required argument value. Changed to use stdin input directly, which is natively supported by Gemini CLI and consistent with Claude CLI usage.
