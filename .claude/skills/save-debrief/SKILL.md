---
name: save-debrief
description: Extract debrief findings and save as feedback memory for future sessions
allowed-tools: [Write, Edit, Read]
---

This skill captures generic learnings from the most recent /debrief output and saves them to the feedback memory system.

## Steps

1. **Review the debrief** — Look at the "Next Steps" section from the most recent /debrief output.
2. **Extract the generic pattern** — Identify what's truly transferable across sessions, not just specific to this one. Ask the user to confirm.
3. **Create feedback memory** — Save the pattern with bidirectional guidance (what Claude should do, what user should do).
4. **Update MEMORY.md** — Add a pointer to the new memory file.

## Pattern Template

Use this structure for the feedback memory:

```
---
name: [memory name]
description: [one-line hook for future relevance]
type: feedback
---

[Generic statement of the learning]

**Why:** [The reason or motivation — what incident or constraint drove this?]

**How to apply:**
- **Claude:** [Specific behavior change when this situation arises]
- **User:** [Specific behavior change when this situation arises]

Example: [Concrete example from this session]
```

## Notes

- Keep the name and description concise and generic (not session-specific)
- Include both Claude and user guidance — this is bidirectional learning
- Example should cite the specific incident from the debrief
- Do NOT save session-specific details; extract the pattern

When done, report the memory filename and summary.
