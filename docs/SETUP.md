# Setup Guide

How to configure each tool in this repo on a new machine. Read TOOLKIT.md first to understand what each tool does and why it exists.

---

## 1. context-mode (MCP server)

Sandboxes tool output so raw data never floods the context window.

**Install:**
```bash
# Requires Node.js
npx @mksglu/context-mode install
```

Or follow the manual config at [mksglu/context-mode](https://github.com/mksglu/context-mode).

**Verify:** Start a Claude Code session. You should see PreToolUse hook guidance on Bash/WebFetch calls.

**Scope:** Global (applies to all Claude Code sessions on this machine).

---

## 2. context7 (MCP server)

Fetches version-specific library docs at generation time — no hallucinated APIs.

**Install:** None — runs via `npx`. Node.js required.

**Already configured in `.mcp.json`** — Claude calls it automatically.

**Usage:** Add `use context7` to any prompt when you want precise docs:
```
How do I set up Next.js 15 middleware? use context7
Show me Prisma's upsert API. use context7
```

**Scope:** Cloud service (Upstash-hosted). Requires internet. No local data stored.

---

## 3. repomix (MCP server)

Packs a repo into one AI-optimized file for full-codebase questions.

**Install:** None — runs via `npx`. Node.js required.

**Already configured in `.mcp.json`** — Claude calls it automatically via MCP when needed.

**Manual use (in any repo):**
```bash
npx repomix                        # pack current repo
npx repomix --compress             # Tree-sitter compression — fewer tokens, same structure
npx repomix --token-count-tree     # check token size before packing
```

**When to use vs code-review-graph:**
- repomix → small repo, architecture questions, onboarding ("explain this whole project")
- code-review-graph → large repo, targeted review, change impact

**Scope:** MCP config in `.mcp.json` (project-scoped). No build step — works anywhere with Node.js.

---

## 4. code-review-graph (MCP server)

Builds a structural map of a codebase for token-efficient code reviews.

**Install:**

```bash
# Python 3.10+ required
pip install code-review-graph
```

> On Windows without pipx, `pip install` puts the CLI on PATH via the Python Scripts directory.

**Configure for Claude Code (already done in this repo's `.mcp.json`):**

```json
{
  "mcpServers": {
    "code-review-graph": {
      "command": "code-review-graph",
      "args": [
        "serve",
        "--tools",
        "get_minimal_context_tool,get_review_context_tool,get_impact_radius_tool,query_graph_tool,detect_changes_tool,semantic_search_nodes_tool"
      ],
      "type": "stdio"
    }
  }
}
```

This is scoped to 6 review tools. All 28 are available — edit `--tools` to expand.

**Per-project usage (run this in each repo you want to review, NOT in this config repo):**

```bash
cd /path/to/your-project
code-review-graph build       # first time — parses full codebase
code-review-graph update      # subsequent runs — incremental update
```

Restart Claude Code after `build`. The graph is stored in `.code-review-graph/` inside that repo (gitignored).

**Scope:** MCP config lives in `.mcp.json` here (project-scoped). The graph itself lives per-project.

**Do NOT run `code-review-graph install`** — it adds always-on hooks to `settings.json` that conflict with the "code-review only" intent. The `.mcp.json` config in this repo is already correct.

---

## 5. playwright-cli (skill)

Token-efficient browser testing — Claude writes and runs Playwright tests via CLI, no accessibility tree in context.

**Install:**
```bash
npm install -g @playwright/cli@latest
playwright-cli install --skills   # drops skill into .claude/skills/ automatically
```

**Already installed** in this repo's `.claude/skills/playwright-cli/`.

**Usage — just ask Claude naturally:**
```
Write E2E tests for the login flow at http://localhost:3000
Run the test suite and fix any failures
Record interactions on https://myapp.com and generate a spec file
```

**Config:** `.playwright/cli.config.json` — auto-created on install. Default browser: Chrome (set manually, see `.playwright/cli.config.json`).

**Scope:** Global CLI install + per-repo skill file. Run `playwright-cli install --skills` in each project repo.

---

## 6. Skills (slash commands)

Skills activate when you invoke `/skill-name`. No install needed — committed to the repo and load automatically. They live in `.claude/commands/` (legacy) or `.claude/skills/` (modern — playwright-cli uses this).

| Command | What it does |
|---|---|
| `/caveman` | Compresses Claude responses ~75% — "stop caveman" to exit |
| `/git-profile` | Set/show/clear per-repo git identity (local user.name + user.email) |
| `/debrief` | End-of-session communication retrospective |

---

## Advisor model

`.claude/settings.json` sets `"advisorModel": "opus"` — Claude Code uses Opus for `advisor()` calls automatically. No manual setup needed.

---

## Checklist for new cloners

- [ ] Node.js installed (required for context-mode, context7, repomix, playwright-cli)
- [ ] Python 3.10+ installed — `pip install code-review-graph`
- [ ] Install context-mode — `npx @mksglu/context-mode install`
- [ ] Install playwright-cli — `npm install -g @playwright/cli@latest && playwright-cli install --skills`
- [ ] Restart Claude Code to pick up `.mcp.json` (context7, repomix, code-review-graph load automatically)
- [ ] In each project you want to review: `cd <project> && code-review-graph build`
- [ ] Slash command skills (caveman, git-profile, debrief) load automatically — no install needed
