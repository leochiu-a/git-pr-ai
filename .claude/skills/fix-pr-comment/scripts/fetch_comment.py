#!/usr/bin/env python3
"""
Fetch PR/MR comment details from GitHub or GitLab.

Usage:
    python3 fetch_comment.py "<comment_url>"

Output JSON fields:
    platform       "github" | "gitlab"
    comment_id     numeric ID of the comment/note
    discussion_id  (GitLab only) discussion thread ID for replying
    comment_type   "review" | "issue"  (GitHub)
                   "note"              (GitLab)
    body           comment text
    path           file path (inline comments only, else null)
    line           line number (inline comments only, else null)
    diff_hunk      surrounding diff context (inline comments only, else null)
    pull_number    PR number (GitHub) / MR IID (GitLab)
    owner          owner/namespace (GitHub) / project namespace (GitLab)
    repo           repository name
    mr_project     (GitLab only) URL-encoded "namespace/repo" for API calls
"""

import json
import re
import subprocess
import sys


def run(cmd):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running: {cmd}", file=sys.stderr)
        print(result.stderr, file=sys.stderr)
        sys.exit(1)
    return result.stdout.strip()


# ── GitHub ──────────────────────────────────────────────────────────────────

def fetch_github(url):
    """
    Supported URL formats:
      https://github.com/{owner}/{repo}/pull/{number}#discussion_r{id}
      https://github.com/{owner}/{repo}/pull/{number}#issuecomment-{id}
    """
    m = re.match(r"https://github\.com/([^/]+)/([^/]+)/pull/(\d+)", url)
    if not m:
        print("Cannot parse GitHub URL", file=sys.stderr)
        sys.exit(1)

    owner, repo, pull_number = m.group(1), m.group(2), m.group(3)

    review_m = re.search(r"discussion_r(\d+)", url)
    issue_m = re.search(r"issuecomment-(\d+)", url)

    if review_m:
        comment_id = review_m.group(1)
        raw = run(
            f'gh api /repos/{owner}/{repo}/pulls/comments/{comment_id}'
        )
        data = json.loads(raw)
        return {
            "platform": "github",
            "comment_id": comment_id,
            "comment_type": "review",
            "body": data.get("body", ""),
            "path": data.get("path"),
            "line": data.get("line") or data.get("original_line"),
            "diff_hunk": data.get("diff_hunk"),
            "pull_number": pull_number,
            "owner": owner,
            "repo": repo,
        }
    elif issue_m:
        comment_id = issue_m.group(1)
        raw = run(
            f'gh api /repos/{owner}/{repo}/issues/comments/{comment_id}'
        )
        data = json.loads(raw)
        return {
            "platform": "github",
            "comment_id": comment_id,
            "comment_type": "issue",
            "body": data.get("body", ""),
            "path": None,
            "line": None,
            "diff_hunk": None,
            "pull_number": pull_number,
            "owner": owner,
            "repo": repo,
        }
    else:
        print("Cannot find comment ID in URL fragment", file=sys.stderr)
        sys.exit(1)


# ── GitLab ───────────────────────────────────────────────────────────────────

def fetch_gitlab(url):
    """
    Supported URL format:
      https://gitlab.{host}/{namespace}/{project}/-/merge_requests/{iid}#note_{id}
    """
    m = re.match(
        r"https://([^/]+)/(.+)/-/merge_requests/(\d+)(?:#note_(\d+))?",
        url,
    )
    if not m:
        print("Cannot parse GitLab URL", file=sys.stderr)
        sys.exit(1)

    host, namespace_project, mr_iid, note_id = (
        m.group(1), m.group(2), m.group(3), m.group(4)
    )
    encoded = namespace_project.replace("/", "%2F")
    parts = namespace_project.rsplit("/", 1)
    owner = parts[0] if len(parts) == 2 else namespace_project
    repo = parts[1] if len(parts) == 2 else ""

    if not note_id:
        # No specific note in URL — return MR-level info only
        return {
            "platform": "gitlab",
            "comment_id": None,
            "discussion_id": None,
            "comment_type": "note",
            "body": None,
            "path": None,
            "line": None,
            "diff_hunk": None,
            "pull_number": mr_iid,
            "owner": owner,
            "repo": repo,
            "mr_project": encoded,
        }

    # Find the discussion that contains this note
    raw = run(
        f'glab api "projects/{encoded}/merge_requests/{mr_iid}/discussions"'
    )
    discussions = json.loads(raw)

    for discussion in discussions:
        for note in discussion.get("notes", []):
            if str(note["id"]) == str(note_id):
                pos = note.get("position") or {}
                return {
                    "platform": "gitlab",
                    "comment_id": note_id,
                    "discussion_id": discussion["id"],
                    "comment_type": "note",
                    "body": note.get("body", ""),
                    "path": pos.get("new_path") or pos.get("old_path"),
                    "line": pos.get("new_line") or pos.get("old_line"),
                    "diff_hunk": None,  # GitLab doesn't expose diff_hunk per note
                    "pull_number": mr_iid,
                    "owner": owner,
                    "repo": repo,
                    "mr_project": encoded,
                }

    print(f"Note {note_id} not found in MR {mr_iid}", file=sys.stderr)
    sys.exit(1)


# ── Entry point ──────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) < 2:
        print("Usage: fetch_comment.py <comment_url>", file=sys.stderr)
        sys.exit(1)

    url = sys.argv[1]

    if "github.com" in url:
        result = fetch_github(url)
    elif "gitlab" in url:
        result = fetch_gitlab(url)
    else:
        print("Unsupported platform. URL must contain github.com or gitlab.", file=sys.stderr)
        sys.exit(1)

    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
