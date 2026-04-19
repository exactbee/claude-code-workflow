# Toolkit Registry

All integrations active in this repo — MCP servers, skills, slash commands, subagents, and hooks.

---

## MCP Servers

### context-mode
- **Repo:** [mksglu/context-mode](https://github.com/mksglu/context-mode)
- **Trigger:** Automatic via PreToolUse hook — blocks WebFetch/Bash for large output, routes to ctx_* tools
- **Token impact:** Up to ~98% reduction on raw tool output (data stays in local sandbox)
- **Key tools:** `ctx_batch_execute`, `ctx_execute`, `ctx_execute_file`, `ctx_search`, `ctx_fetch_and_index`
- **Why:** Prevents large command output (logs, API responses, file reads) from flooding the context window
- **Revisit if:** A task genuinely needs raw output in context — can bypass per-call with Bash for mutations

### context7
- **Repo:** [upstash/context7](https://github.com/upstash/context7) — 53.1k stars
- **Trigger:** On-demand — Claude calls it when library docs needed. Add `use context7` to your prompt to hint it.
- **Token impact:** Adds ~2–5k tokens per doc fetch directly into context (not sandboxed by context-mode)
- **Key tools:** `resolve-library-id`, `query-docs`
- **Why:** Version-specific, curated docs injected at generation time. Eliminates hallucinated APIs and deprecated method bugs. Sweet spot: mainstream fullstack stack (React, Next.js, Node, Prisma, Supabase etc.)
- **Revisit if:** Working with niche/private libraries — Context7 won't have them and fails silently

### repomix
- **Repo:** [yamadashy/repomix](https://github.com/yamadashy/repomix) — 23.7k stars
- **Trigger:** On-demand via MCP — Claude calls it when full codebase snapshot needed
- **Token impact:** Varies by repo size — use `--compress` flag to reduce via Tree-sitter. Check with `npx repomix --token-count-tree` before running on large repos.
- **Key capability:** Packs entire repo into one AI-optimized file. Respects `.gitignore`. Detects secrets via Secretlint.
- **Why:** Complements code-review-graph — CRG navigates selectively, repomix snapshots everything. Use for architecture questions, onboarding, cross-cutting analysis on small/medium repos (<50 files ideal).
- **Revisit if:** Repo grows large (>200 files) — switch fully to CRG at that point

### code-review-graph
- **Repo:** [tirth8205/code-review-graph](https://github.com/tirth8205/code-review-graph)
- **Trigger:** Manual — run `code-review-graph build` in a repo before a review session, then Claude uses tools automatically
- **Token impact:** Up to 6.8× fewer tokens on reviews (reads structural map, not full files)
- **Key tools (scoped to 6):** `get_minimal_context_tool`, `get_review_context_tool`, `get_impact_radius_tool`, `query_graph_tool`, `detect_changes_tool`, `semantic_search_nodes_tool`
- **Why:** Builds a persistent Tree-sitter graph of a codebase so Claude reads only what matters for a review
- **Revisit if:** You want more tools (28 available) — edit `--tools` args in `.mcp.json`

---

## Skills (Slash Commands + CLI)

### playwright-cli
- **Repo:** [microsoft/playwright-cli](https://github.com/microsoft/playwright-cli) — 8.8k stars
- **Trigger:** Automatic — skill installed in `.claude/skills/playwright-cli/`. Claude uses it when asked to write/run/debug tests.
- **Token impact:** Low — page data never enters context. CLI output only.
- **Key capabilities:** Test generation via `codegen`, run/debug suites, request mocking, session management, traces, video recording
- **Why:** Microsoft's own recommendation over Playwright MCP for coding agents. MCP loads full accessibility trees into context (~10k tokens). CLI keeps page data out entirely.
- **Revisit if:** You need live autonomous browser control (scraping, self-healing tests) — switch to Playwright MCP then.

## Skills (Slash Commands)

Skills live in `.claude/commands/` (legacy) or `.claude/skills/` (modern) and are invoked via `/skill-name`. Both locations are auto-loaded. If a skill and command share a name, the skill takes precedence.

### /caveman
- **File:** `.claude/commands/caveman.md`
- **Source:** [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman)
- **Trigger:** Manual — invoke `/caveman` to activate, "stop caveman" / "normal mode" to deactivate
- **Token impact:** ~65–75% reduction on output tokens
- **Modes:** `lite` / `full` (default) / `ultra` / `wenyan-*`
- **Why:** Compresses all Claude responses to caveman-style prose. Complements context-mode (which saves input) by saving output.
- **Revisit if:** Conflicts with auto-clarity requirements (security warnings, destructive ops — caveman already handles these via Auto-Clarity rule)

### /git-profile
- **File:** `.claude/commands/git-profile.md`
- **Trigger:** Manual — `/git-profile` (show) · `/git-profile set` (configure) · `/git-profile clear` (reset)
- **Token impact:** Neutral
- **Why:** Sets local `user.name` + `user.email` per repo for multi-client workflows. Commits go out under right alias without touching global gitconfig. Pair with `gh auth switch` for full account isolation.
- **Revisit if:** Using `includeIf` in global `~/.gitconfig` instead (directory-based auto-switching)

### /debrief
- **File:** `.claude/skills/debrief/SKILL.md`
- **Trigger:** Manual — invoke `/debrief` at session end
- **Token impact:** Neutral
- **Why:** Communication retrospective — surfaces where user and Claude failed each other. Evidence-bound, symmetric, under 400 words.
- **Revisit if:** Session patterns are already well-understood and retrospectives stop surfacing new signal

---

## Subagents

Spawned via the `Agent` tool. Each starts cold with no session context.

| Agent | Use when |
|---|---|
| `claude-code-guide` | Questions about Claude Code CLI, MCP, API, SDK features |
| `Explore` | Open-ended codebase exploration spanning multiple files |
| `Plan` | Designing implementation strategy before execution |
| `general-purpose` | Multi-step research, keyword/file searches across unknown territory |
| `Haiku` (Rule 7) | Bulk mechanical work only — mass renames, log parsing, CSV extraction |

---

## Token Savings Stack

How the tools interact when all active:

```
[Tool Output] ──context-mode──▶ [Context Window] ──caveman──▶ [Response]
   ~98% saved on input                              ~70% saved on output
```

Combined effect: a session processing large data files with concise replies uses a fraction of the tokens of a default session.
