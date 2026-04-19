# Architecture Decision Log

Every meaningful choice made in building this environment, and why.
New contributors: read this before changing anything in `CLAUDE.md` or `.claude/settings.json`.

---

## D-001 — Soft enforcement over hooks

**Decision:** Workflow rules live in `CLAUDE.md` only. No `UserPromptSubmit` hooks to gate execution.

**Why:** Hooks add complexity and can misfire — a hook that blocks the wrong prompt breaks the session for everyone who clones the repo. CLAUDE.md gives ~95% compliance with zero setup friction. Hard enforcement is an optimization, not a starting point.

**Revisit if:** Compliance proves unreliable in practice and the plan-first rule is regularly skipped.

---

## D-002 — No hardcoded model version in settings.json

**Decision:** `settings.json` has no `model` field. Claude Code uses its default.

**Why:** Hardcoding `claude-sonnet-4-6` means every model release requires a manual update across every clone. Using the default means Anthropic's recommended model is always used automatically.

**Revisit if:** A specific model version is needed for reproducibility (e.g., a research or audit context).

---

## D-003 — Advisor model persisted as "opus" alias, not a version ID

**Decision:** `settings.json` sets `"advisorModel": "opus"` (alias), not `"claude-opus-4-7"` (version ID).

**Why:** Same reason as D-002 — the alias tracks Anthropic's latest Opus automatically. Version IDs go stale.

**Revisit if:** A specific Opus version is needed for consistency across a team.

---

## D-004 — Rule 6: Flag Your Source (Diligence gap from 4D Framework)

**Decision:** Added a rule requiring Sonnet to explicitly flag whether a claim is verified (from session) or from training knowledge.

**Why:** The 4D Framework audit revealed that Diligence — responsible, transparent AI use — had no enforcement mechanism. Without this rule, Sonnet could present stale training knowledge as verified fact and the user would act on it without knowing the risk.

**Revisit if:** It creates too much noise on obvious facts (e.g., flagging that Python uses indentation).

---

## D-005 — Three-tier model approach scoped to bulk work only

**Decision:** Haiku subagents are used ONLY for bulk mechanical coding and data analysis tasks. Small tasks are handled by Sonnet inline.

**Why:** Haiku subagents start cold with no session context. For a small task, the briefing overhead costs more in tokens than the cheaper model saves. The savings only materialize when the task is large in volume but simple in reasoning (mass renames, log parsing, CSV extraction). Using Haiku for small tasks would make every interaction slower and more expensive — the opposite of the intent.

**Revisit if:** Claude Code adds a native model-switching mechanism that avoids the cold-start briefing cost.

---

## D-006 — code-review-graph scoped to 6 tools, not all 28

**Decision:** `.mcp.json` uses `--tools` to restrict code-review-graph to 6 tools: `get_minimal_context_tool`, `get_review_context_tool`, `get_impact_radius_tool`, `query_graph_tool`, `detect_changes_tool`, `semantic_search_nodes_tool`.

**Why:** User intent was "code reviews only, not always." Loading all 28 tool schemas on every session adds token overhead regardless of whether a review is happening. 6 tools cover the full review workflow. The rest are navigation/analysis extras that can be re-enabled via `--tools` in `.mcp.json` if needed.

**Revisit if:** Workflow expands beyond reviews — e.g., `find_large_functions_tool` for refactor sessions.

---

## D-007 — Playwright CLI + Skills over Playwright MCP

**Decision:** Using `playwright-cli` (skill-based) instead of `playwright-mcp` (MCP server) for browser testing.

**Why:** Microsoft's own docs recommend CLI + Skills for coding agents: MCP loads full accessibility trees into context (~10k tokens per interaction). CLI keeps page data out of the LLM entirely — Claude writes and runs shell commands instead of introspecting live DOM. For a fullstack developer writing test suites (not doing autonomous scraping), CLI is the right fit.

**Revisit if:** Use case shifts to autonomous browser control, self-healing tests, or exploratory automation — those benefit from MCP's persistent browser state.

---

## D-008 — SETUP.md and LIMITS.md as mandatory baseline docs

**Decision:** Every tool in this repo must have an entry in both SETUP.md (how to install) and LIMITS.md (what it breaks and when it hurts you).

**Why:** This repo is a baseline cloned into new projects. Without install instructions, new users have to reverse-engineer tool configs. Without documented limits, they'll hit silent failures (e.g., context7 returning nothing for unlisted libraries, code-review-graph failing on un-built repos) with no diagnosis path. TOOLKIT.md covers the "what and why" — SETUP + LIMITS cover the "how and when not to."

**Revisit if:** Docs fall out of sync with actual tool behavior — then they become worse than no docs.

---

## D-009 — debrief moved from commands/ to skills/debrief/SKILL.md

**Decision:** Restored deleted `debrief.md` to `.claude/skills/debrief/SKILL.md` instead of `.claude/commands/debrief.md`.

**Why:** Official Claude Code docs confirm commands/ and skills/ are equivalent — custom commands have been merged into skills. skills/ is the modern format and supports directory structure for supporting files. Since playwright-cli also dropped its skill into `.claude/skills/`, consolidating there keeps the structure consistent.

**Revisit if:** A tool requires flat `.claude/commands/` format for compatibility (none known currently).
