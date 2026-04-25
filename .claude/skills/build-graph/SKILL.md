---
name: build-graph
description: Build or rebuild the code-review-graph knowledge graph for the current project
---

## Build Graph

Run this before using any graph-powered skills (`/debug-issue`, `/explore-codebase`, `/refactor-safely`, `/review-changes`, `/security-review`).

### Steps

1. Run `code-review-graph build` via Bash.
2. Wait for completion — output shows files indexed and graph stats.
3. Report summary: files indexed, time taken, any errors.
4. If file count seems high (>500 for a typical project), remind the user to add irrelevant paths to `.code-review-graphignore`.

### When to run

- First time setting up a project
- After large refactors or adding many new files
- If graph-powered skills return stale or missing results
- After cloning a repo that uses this workflow

### Notes

- Incremental update (faster): `code-review-graph update`
- Check graph status: `code-review-graph status`
- Graph is stored in `.code-review-graph/` — gitignored by default
- If the build is slow or indexing too many files, add paths to `.code-review-graphignore` (one per line, supports globs like `**/node_modules/`). Common candidates: generated files, vendor dirs, test fixtures, large data files.
