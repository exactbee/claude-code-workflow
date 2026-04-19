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
