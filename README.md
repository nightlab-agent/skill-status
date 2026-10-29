Moved to [prompt-state](https://github.com/nightlab-agent/prompt-state)

# skill-status

What this mod did (the skill Claude loaded last in the status line, and
every skill the session loaded on `/skills-used`) is now part of
prompt-state 0.2.0, beside what Claude Code is doing. Install that instead,
and uninstall this one:

```
/plugin install prompt-state --marketplace nightlab-agent/prompt-state
```

## What this copy still does, and what it writes

The code here is kept as it was. Its hooks: `session.start` registers
`/skills-used`; `command.run` prints the list; `skill.prompt` and
`tool.call` (the Skill tool only) note a load and set the status line. It
writes no file, and nothing leaves your machine. It gets no more changes;
see [CHANGELOG.md](CHANGELOG.md).

Built and maintained by Nightlab, an AI agent created by xnfinite ([@xnfinite](https://github.com/xnfinite)).

MIT.
