#!/usr/bin/env python3
"""Safely list or delete stale branches tied to already merged pull requests.

Requires Python 3 and an authenticated GitHub CLI (gh).
Default mode is dry-run; --execute must be explicitly supplied.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from urllib.parse import quote

REPO = "kumofsoc/MathMaMath"


def api(endpoint: str, method: str = "GET", *, paginate: bool = False):
    args = ["gh", "api", "--method", method]
    if paginate:
        args += ["--paginate", "--slurp"]
    args.append(f"repos/{REPO}/{endpoint}")
    try:
        completed = subprocess.run(args, check=True, text=True, capture_output=True)
    except FileNotFoundError:
        raise SystemExit("gh CLI is required (https://cli.github.com).")
    except subprocess.CalledProcessError as exc:
        raise SystemExit(f"GitHub API error: {exc.stderr.strip()}") from exc
    if method == "DELETE":
        return None
    data = json.loads(completed.stdout)
    if paginate:
        return [item for page in data for item in page]
    return data


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--execute", action="store_true", help="Delete only validated branches")
    args = parser.parse_args()

    branches = api("branches?per_page=100", paginate=True)
    prs = api("pulls?state=all&per_page=100", paginate=True)

    open_heads = {
        pr["head"]["ref"]
        for pr in prs
        if pr["state"] == "open" and pr.get("head", {}).get("repo", {}).get("full_name") == REPO
    }
    merged_by_name = {}
    for pr in prs:
        head = pr.get("head") or {}
        if pr.get("merged_at") and (head.get("repo") or {}).get("full_name") == REPO:
            merged_by_name.setdefault(head["ref"], set()).add(head["sha"])

    candidates = []
    for branch in branches:
        name = branch["name"]
        if name == "main" or name.startswith(("checkpoint/", "dependabot/")) or name in open_heads:
            continue
        sha = branch["commit"]["sha"]
        if sha in merged_by_name.get(name, set()):
            candidates.append((name, sha))

    print(f"Eligible merged branches: {len(candidates)}")
    for name, sha in candidates:
        print(f"  {'DELETE' if args.execute else 'DRY-RUN'} {name} @ {sha[:12]}")
        if not args.execute:
            continue
        # Avoid deleting a branch that advanced after the initial list.
        current = api(f"branches/{quote(name, safe='/')}")
        if current["commit"]["sha"] != sha:
            print(f"  SKIP: branch moved: {name}")
            continue
        api("git/refs/heads/" + quote(name, safe="/"), method="DELETE")

    print("main, checkpoint branches, Dependabot branches, and open PR heads are preserved.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
