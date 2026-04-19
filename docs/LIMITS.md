# Tool Limits

The honest downsides of every tool in this stack. Read before debugging unexpected behavior.

---

## context-mode (MCP)

**What it breaks:**
- Intercepts WebFetch and Bash — raw output never enters context. If a task genuinely needs raw output (e.g., piping a command into another), you have to bypass it manually with Bash mutations.
- Sandboxed data is local to the session. Loses everything on `/clear` — call `ctx_stats(reset: true)` after clearing.
- FTS5 search is keyword-based. Semantic/fuzzy queries return nothing if exact terms don't match.

**When it hurts you:**
- Debugging an MCP tool itself — context-mode may intercept the very tool you're trying to inspect.
- Very short sessions where indexing overhead exceeds benefit.

---

## context7 (MCP)

**What it breaks:**
- Injects docs **directly into context window** — bypasses context-mode's sandbox. Each fetch costs ~2–5k tokens.
- Cloud-dependent. If context7.com is down, tool silently returns nothing — Claude falls back to training knowledge without warning.
- Library index coverage is curated, not exhaustive. Niche, private, or very new libraries won't be found. No error — just no results.
- Docs may lag bleeding-edge releases by days.

**When it hurts you:**
- Working with internal APIs, proprietary SDKs, or company-specific libraries — useless.
- Token-sensitive sessions — every doc fetch adds to your context budget.

---

## repomix (MCP)

**What it breaks:**
- Dumps entire repo into context — no sandbox. On large repos (>200 files) this can consume most of your 200k context window in one call, leaving little room for conversation.
- `--compress` helps but relies on Tree-sitter parsing — unsupported languages fall back to raw dump.
- Respects `.gitignore` but not always `.repomixignore` if not configured. May accidentally include build artifacts.

**When it hurts you:**
- Calling it on a large monorepo — instant context overflow.
- Using it repeatedly in the same session — context fills up fast with no way to evict the snapshot.

---

## code-review-graph (MCP)

**What it breaks:**
- Graph must be built per-project (`code-review-graph build`) before any tool works. Cold repo = useless server.
- Scoped to 6 tools by design (see `.mcp.json`). If you need other tools (e.g., `list_flows_tool`, `find_large_functions_tool`), edit `--tools` in `.mcp.json`.
- `build` can be slow on large repos — Tree-sitter parsing is CPU-intensive.
- Graph goes stale if you make large changes without running `update`. Tools return outdated structural info.

**When it hurts you:**
- Jumping into a new client repo without running `build` first — all 6 tools return errors.
- Repos with heavy generated code (e.g., Prisma client, protobuf output) — graph bloats with noise.

---

## caveman (skill)

**What it breaks:**
- Compresses responses — if a step-by-step sequence is critical (multi-command setup, security config), caveman fragments can cause misread order. Auto-Clarity rule handles this but isn't perfect.
- Wenyan modes (Chinese classical) are for extreme compression only — other users on the repo won't understand Claude's output.

**When it hurts you:**
- Sharing session output with teammates — caveman prose looks unprofessional in PRs or docs.
- Onboarding new users to the repo — tell them to run `/caveman` themselves, don't leave it on by default.

---

## git-profile (skill)

**What it breaks:**
- Sets `user.name` + `user.email` locally only. Does NOT switch GitHub auth for push/pull — still need `gh auth switch` separately.
- If you forget to set a profile in a new repo, commits go out under global gitconfig identity — no warning.

**When it hurts you:**
- Cloning a client repo and committing before running `/git-profile set` — wrong identity on commits. Git history is permanent.

---

## playwright-cli (skill)

**What it breaks:**
- CLI-based — no live browser introspection. Can't "look at" the current page state the way MCP can. If a test fails due to dynamic rendering, Claude has to re-run and infer from output, not inspect live DOM.
- `codegen` records interactions in a headed browser — requires a running app. If your local dev server isn't running, codegen fails.
- Default browser is Chrome (`channel: chrome`). Good CI parity — Chrome and Chromium behave nearly identically. If Chrome isn't installed on a machine, falls back to error — set `channel: chromium` for pure headless CI.
- Skill only teaches Claude the CLI workflow — actual Playwright must be installed in your project (`npm install -D @playwright/test`).

**When it hurts you:**
- Purely headless CI environment — headed browser launch fails. Use `--headless` flag or switch to Playwright MCP for that context.
- Complex dynamic SPAs where selector stability is poor — codegen records fragile selectors. Expect manual cleanup.

---

## General: MCP cold-start cost

Every MCP server (context7, repomix, code-review-graph) starts a new process on first call per session via `npx`. First call has ~2–5s latency. Not a bug — just npx downloading/caching on first run.

Fix: run `npm install -g repomix @upstash/context7-mcp` to cache globally and eliminate cold-start delay.
