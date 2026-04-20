# Claude Code Environment

A structured Claude Code workspace that enforces an **Opus-plans, Sonnet-executes** workflow.

## How It Works

| Role | Model | Responsibility |
|------|-------|----------------|
| Worker | Sonnet 4.6 | Executes tasks — writes code, edits files, runs tools |
| Advisor | Opus 4.7 | Architects plans, reviews when worker is blocked |

The workflow:
1. You give a task
2. Sonnet calls Opus for a detailed plan
3. Sonnet presents the plan to you for approval
4. You approve → Sonnet executes step by step
5. Sonnet blocked → Opus re-plans → you approve again
6. You reject the re-plan → Opus finds a different strategy

---

## Setup (First Time)

Run this in any project directory:

```bash
npx claude-workflow-kit
```

That's it. The command:
- Copies `.claude/`, `CLAUDE.md`, `.mcp.json`, and setup scripts into your project
- Merges `.gitignore` entries
- Installs all MCP servers (context-mode, code-review-graph, playwright-cli)

Then open the project in Claude Code:

```bash
claude .
```

The advisor is pre-configured to **Opus** in `.claude/settings.json` — no manual setup needed.

> **Re-install / update:** `npx claude-workflow-kit --force` to overwrite existing files.

---

## What's in This Repo

```
.
├── CLAUDE.md                  # Workflow rules auto-loaded by Claude Code
├── README.md                  # This file
├── CONTRIBUTING.md            # How to contribute
├── package.json               # npm package (enables npx claude-code-workflow)
├── bin/
│   └── init.js                # npx entry point — copies files + installs MCP servers
├── setup.sh                   # MCP install script (Mac/Linux)
├── setup.ps1                  # MCP install script (Windows)
├── .mcp.json                  # MCP server config (context-mode, context7, repomix, code-review-graph)
├── .gitignore
├── .gitignore-template        # Entries merged into user projects by npx command
├── assets/
│   └── social-preview.png
├── docs/
│   ├── SETUP.md               # Install guide for each tool
│   ├── TOOLKIT.md             # What each tool does and why
│   ├── DECISIONS.md           # Architecture decision log
│   ├── LIMITS.md              # Known limits and failure modes
│   └── WATCHLIST.md           # Tools under evaluation
└── .claude/
    ├── settings.json          # Project-scoped Claude Code settings
    ├── settings.local.json.example
    ├── mcp-wrappers/          # Cross-platform npx wrappers
    └── skills/                # Slash commands (caveman, debrief, git-profile, playwright-cli…)
```

---

## Rules Summary (from CLAUDE.md)

- **Plan before acting** — Opus plans, you approve, then Sonnet executes
- **Execute strictly** — no scope creep, no improvisation
- **Escalate when blocked** — Sonnet stops and consults Opus after 2 failed attempts
- **Surface plan changes** — revised plans are always shown to you for approval
- **No silent decisions** — ambiguity gets a question, not an assumption

---

## Why This Workflow — The 4D Framework

This environment is built around the **4D Framework for AI Fluency** (Dakan & Feller). Each rule in `CLAUDE.md` maps to one of the four competencies:

| D | What it means | Where it lives in this workflow |
|---|---|---|
| **Delegation** | Deciding what humans vs AI should do | Opus architects, Sonnet executes, *you* approve — roles are explicit and never blurred |
| **Description** | Communicating clearly with AI | Rule 5: no silent decisions, ambiguity gets a question not an assumption |
| **Discernment** | Critically evaluating AI output | Rules 1 & 4: every plan is shown to you before execution; plan changes need re-approval |
| **Diligence** | Using AI responsibly and transparently | Rule 6: Sonnet flags whether it's drawing from verified source or training knowledge |

> Note: Description and Diligence are primarily *human* competencies. The rules above support them — but the user is accountable for prompting clearly and for the final output.

---

## Contributing

This is a template. Fork it, adapt the `CLAUDE.md` rules to your team's workflow, and commit your changes.
Keep `.claude/settings.local.json` out of git (it's already in `.gitignore`) — that's where personal preferences live.
