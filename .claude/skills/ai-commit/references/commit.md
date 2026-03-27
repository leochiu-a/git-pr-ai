## Commit Message Instructions

Analyze the staged git diff and provide exactly 3 commit message options with different approaches:

1. Three commit messages following the format: `{type}: {description}`
   - Option 1: Most concise and direct description
   - Option 2: Alternative wording with more context
   - Option 3: Most detailed description

### Static Requirements

- Keep the description clear and concise (max 72 characters)
- Use imperative mood (e.g., "add feature" not "adds feature" or "added feature")
- Do not end the subject line with a period
- Provide 3 distinct options with different perspectives
- Focus on WHAT changed and WHY, not HOW

## Output Format

Respond with exactly this format:

```
OPTION_1: {first_generated_commit_message}
OPTION_2: {second_generated_commit_message}
OPTION_3: {third_generated_commit_message}
```

### Examples

```
OPTION_1: feat: add user authentication module
OPTION_2: feat: implement login and signup functionality
OPTION_3: feat: add JWT-based authentication system for users
```
