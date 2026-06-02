#!/usr/bin/env python3
"""
Fetch all open review comments from the current branch's PR/MR.

Usage:
    python3 fetch_pr_comments.py

Auto-detects platform from git remote and current PR/MR from the active branch.

Output: JSON array of comment objects, each with the same fields as fetch_comment.py:
    platform, comment_id, discussion_id (GitLab), comment_type, body,
    path, line, diff_hunk, pull_number, owner, repo, mr_project (GitLab),
    comment_url
"""

import json
import re
import subprocess
import sys


def run(cmd, exit_on_error=True):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0 and exit_on_error:
        print(f"Error running: {cmd}", file=sys.stderr)
        print(result.stderr, file=sys.stderr)
        sys.exit(1)
    return result.stdout.strip(), result.returncode


# ── GitHub ───────────────────────────────────────────────────────────────────

def fetch_github_comments():
    # Get current PR info
    pr_json, rc = run("gh pr view --json number,url,headRefName,baseRefName", exit_on_error=False)
    if rc != 0:
        print("No open PR found for the current branch.", file=sys.stderr)
        sys.exit(1)

    pr = json.loads(pr_json)
    pr_number = pr["number"]
    pr_url = pr["url"]

    # Extract owner/repo from PR URL
    m = re.match(r"https://github\.com/([^/]+)/([^/]+)/pull/", pr_url)
    if not m:
        print(f"Cannot parse PR URL: {pr_url}", file=sys.stderr)
        sys.exit(1)
    owner, repo = m.group(1), m.group(2)

    # Use GraphQL to get review threads with resolved status
    graphql_query = """
query($owner: String!, $repo: String!, $number: Int!) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      reviewThreads(first: 100) {
        nodes {
          isResolved
          id
          comments(first: 10) {
            nodes {
              databaseId
              body
              path
              line
              originalLine
              diffHunk
              url
            }
          }
        }
      }
    }
  }
}
"""
    gql_cmd = (
        f"gh api graphql "
        f"-f query='{graphql_query}' "
        f"-f owner='{owner}' "
        f"-f repo='{repo}' "
        f"-F number={pr_number}"
    )
    gql_out, _ = run(gql_cmd)
    gql_data = json.loads(gql_out)

    threads = (
        gql_data.get("data", {})
        .get("repository", {})
        .get("pullRequest", {})
        .get("reviewThreads", {})
        .get("nodes", [])
    )

    results = []
    for thread in threads:
        if thread.get("isResolved"):
            continue
        comments = thread.get("comments", {}).get("nodes", [])
        if not comments:
            continue
        # Take the first (root) comment of each unresolved thread
        c = comments[0]
        results.append({
            "platform": "github",
            "comment_id": str(c["databaseId"]),
            "comment_type": "review",
            "body": c.get("body", ""),
            "path": c.get("path"),
            "line": c.get("line") or c.get("originalLine"),
            "diff_hunk": c.get("diffHunk"),
            "pull_number": str(pr_number),
            "owner": owner,
            "repo": repo,
            "comment_url": c.get("url", ""),
        })

    # Also fetch general PR-level (issue) comments
    issue_comments_raw, _ = run(
        f"gh api /repos/{owner}/{repo}/issues/{pr_number}/comments"
    )
    issue_comments = json.loads(issue_comments_raw)
    for c in issue_comments:
        # Skip bot comments and comments from the PR author that aren't review requests
        results.append({
            "platform": "github",
            "comment_id": str(c["id"]),
            "comment_type": "issue",
            "body": c.get("body", ""),
            "path": None,
            "line": None,
            "diff_hunk": None,
            "pull_number": str(pr_number),
            "owner": owner,
            "repo": repo,
            "comment_url": c.get("html_url", ""),
        })

    return results


# ── GitLab ───────────────────────────────────────────────────────────────────

def fetch_gitlab_comments():
    # Get current MR info
    mr_json, rc = run("glab mr view --output json", exit_on_error=False)
    if rc != 0:
        print("No open MR found for the current branch.", file=sys.stderr)
        sys.exit(1)

    mr = json.loads(mr_json)
    mr_iid = str(mr.get("iid") or mr.get("number", ""))
    mr_web_url = mr.get("web_url", "")

    # Extract namespace/project from MR URL
    m = re.match(r"https://([^/]+)/(.+)/-/merge_requests/", mr_web_url)
    if not m:
        print(f"Cannot parse MR URL: {mr_web_url}", file=sys.stderr)
        sys.exit(1)
    namespace_project = m.group(2)
    encoded = namespace_project.replace("/", "%2F")
    parts = namespace_project.rsplit("/", 1)
    owner = parts[0] if len(parts) == 2 else namespace_project
    repo = parts[1] if len(parts) == 2 else ""

    # Fetch all discussions
    discussions_raw, _ = run(
        f'glab api "projects/{encoded}/merge_requests/{mr_iid}/discussions"'
    )
    discussions = json.loads(discussions_raw)

    results = []
    for discussion in discussions:
        # Skip resolved discussions
        if discussion.get("resolved"):
            continue
        notes = discussion.get("notes", [])
        if not notes:
            continue
        # Take the first note of each unresolved discussion
        note = notes[0]
        if note.get("system"):
            continue
        pos = note.get("position") or {}
        results.append({
            "platform": "gitlab",
            "comment_id": str(note["id"]),
            "discussion_id": discussion["id"],
            "comment_type": "note",
            "body": note.get("body", ""),
            "path": pos.get("new_path") or pos.get("old_path"),
            "line": pos.get("new_line") or pos.get("old_line"),
            "diff_hunk": None,
            "pull_number": mr_iid,
            "owner": owner,
            "repo": repo,
            "mr_project": encoded,
            "comment_url": note.get("noteable_url", mr_web_url),
        })

    return results


# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    # Detect platform from git remote
    remote_url, rc = run("git remote get-url origin", exit_on_error=False)
    if rc != 0:
        print("Cannot determine git remote origin.", file=sys.stderr)
        sys.exit(1)

    if "github.com" in remote_url:
        comments = fetch_github_comments()
    elif "gitlab" in remote_url:
        comments = fetch_gitlab_comments()
    else:
        print(
            "Unsupported platform. Remote URL must contain github.com or gitlab.",
            file=sys.stderr,
        )
        sys.exit(1)

    print(json.dumps(comments, indent=2))


if __name__ == "__main__":
    main()
