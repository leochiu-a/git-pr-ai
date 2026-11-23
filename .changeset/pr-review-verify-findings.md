---
"git-pr-ai": minor
---

feat(skill): `pr-review` verifies findings and builds reviews safely

The review reads the PR description, `CLAUDE.md` / `AGENTS.md`, existing comments, and surrounding code, then checks each finding against the head commit and drops anything it cannot confirm. Comment anchors are checked against the diff before submitting, and the review payload is built with `jq` instead of hand-escaped JSON. It accepts a PR/MR URL or number, skips closed or draft PRs and heads it already reviewed, and uses `suggestion` blocks for small fixes.
