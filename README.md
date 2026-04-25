# Claude Code Workflow Kit

A structured Claude Code workspace that enforces an **Opus-plans, Sonnet-executes** workflow — with context protection, code graph navigation, and browser automation built in.

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

## Prerequisites

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **Python 3.10+** — [python.org](https://python.org)
- **Claude Code** — `npm install -g @anthropic-ai/claude-code`

---

## Setup

Run this in any project directory:

```bash
npx claude-workflow-kit
```

That's it. The command:
- Copies `.claude/`, `CLAUDE.md`, `.mcp.json`, and setup scripts into your project
- Merges `.gitignore` entries
- Installs MCP servers: **context-mode**, **code-review-graph**, **playwright-cli**

Then open the project in Claude Code:

```bash
claude .
```

The advisor is pre-configured to **Opus** in `.claude/settings.json` — no manual setup needed.

**Re-install / update:** `npx claude-workflow-kit --force` to overwrite existing files.

**If MCP installs fail:** `npx claude-workflow-kit --skip-mcp` copies files only. Then install manually:
```bash
npm install -g context-mode
pip install code-review-graph && code-review-graph install --platform claude-code
```

---

## Verify It Works

After running `npx claude-workflow-kit` and opening the project in Claude Code:

```
/context-mode:ctx-doctor    # all checks should show [x]
/context-mode:ctx-stats     # shows context savings for the session
```

Then build the code graph (required for code review tools):

```bash
code-review-graph build
```

---

## What You Get

### MCP Servers

| Server | What it does |
|--------|-------------|
| **context-mode** | Sandboxes tool output so large results never flood your context window — up to 98% reduction |
| **code-review-graph** | Builds a persistent map of your codebase so Claude reads only what matters — 6.8× fewer tokens on reviews |
| **context7** | Fetches up-to-date library docs on demand |
| **repomix** | Packs codebases into AI-optimized format for analysis |
| **playwright-cli** | Browser automation and UI testing |

### Slash Commands (Skills)

| Command | What it does |
|---------|-------------|
| `/caveman` | Ultra-compressed communication mode — ~75% fewer tokens |
| `/review-mood` | Set reviewer persona (strict / lenient / paranoid) for all reviews |
| `/review-changes` | Structured code review with change detection and impact analysis |
| `/debug-issue` | Systematic debugging using graph-powered code navigation |
| `/explore-codebase` | Navigate and understand codebase structure via the knowledge graph |
| `/refactor-safely` | Plan and execute safe refactoring using dependency analysis |
| `/debrief` | Communication retrospective — honest analysis of where session went wrong |
| `/save-debrief` | Extract debrief findings and save as feedback memory |
| `/git-profile` | Set or show a local git identity for the current repo |
| `/playwright-cli` | Automate browser interactions and generate Playwright tests |

---

## Rules Summary (from CLAUDE.md)

- **Plan before acting** — Opus plans, you approve, then Sonnet executes
- **Execute strictly** — no scope creep, no improvisation
- **Escalate when blocked** — Sonnet stops and consults Opus after 2 failed attempts
- **Surface plan changes** — revised plans are always shown to you for approval
- **No silent decisions** — ambiguity gets a question, not an assumption
- **Flag your source** — Sonnet distinguishes verified facts from training knowledge

---

## What's in This Repo

```
.
├── CLAUDE.md                  # Workflow rules auto-loaded by Claude Code
├── README.md                  # This file
├── CONTRIBUTING.md            # How to contribute
├── package.json               # npm package (enables npx claude-workflow-kit)
├── bin/
│   └── init.js                # npx entry point — copies files + installs MCP servers
├── setup.sh                   # MCP install script (Mac/Linux)
├── setup.ps1                  # MCP install script (Windows)
├── .mcp.json                  # MCP server config (context-mode, context7, repomix, code-review-graph)
├── .gitignore
├── .gitignore-template        # Entries merged into user projects by npx command
├── docs/
│   ├── SETUP.md               # Install guide for each tool
│   ├── TOOLKIT.md             # What each tool does and why
│   ├── DECISIONS.md           # Architecture decision log
│   ├── LIMITS.md              # Known limits and failure modes
│   └── WATCHLIST.md           # Tools under evaluation
└── .claude/
    ├── settings.json          # Project-scoped Claude Code settings
    ├── mcp-wrappers/          # Cross-platform npx wrappers for MCP servers
    └── skills/                # Slash commands (caveman, debrief, git-profile, playwright-cli…)
```

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
