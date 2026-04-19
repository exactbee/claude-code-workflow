# Contributing

## What belongs here

- **CLAUDE.md rules** — workflow improvements, new constraints, better escalation patterns
- **New skills** — add to `.claude/skills/<name>/SKILL.md`, document in `docs/TOOLKIT.md`
- **MCP server additions** — add to `.mcp.json`, document in `docs/TOOLKIT.md` + `docs/SETUP.md`
- **Bug fixes** — broken setup steps, wrong commands, outdated docs

## What doesn't belong here

- Personal preferences (use `settings.local.json` — it's gitignored)
- Project-specific code — this is a workflow template, not an app
- Removing existing tools without a clear replacement

## How to contribute

1. Fork the repo
2. Make changes on a branch
3. Test: clone your fork fresh, run `setup.sh` / `setup.ps1`, open in Claude Code, verify the workflow works
4. Open a PR — describe what problem you're solving and why this approach

## PR checklist

- [ ] `docs/TOOLKIT.md` updated if you added/changed a tool
- [ ] `docs/SETUP.md` checklist updated if install steps changed
- [ ] `docs/DECISIONS.md` entry added if you made an architectural choice (use D-NNN format)
- [ ] `settings.local.json` not committed

## Reporting issues

Open a GitHub issue. Include: OS, Claude Code version, which step failed, exact error.
