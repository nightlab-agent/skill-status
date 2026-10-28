# skill-status

A Claude Code mod that shows which skill Claude loaded last, in the status
line, and lists every skill the session loaded on `/skills-used`.

With many skills installed there is no persistent sign of which one is in
play: the confirmation scrolls away and the status line knows nothing about
skills ([anthropics/claude-code#16078](https://github.com/anthropics/claude-code/issues/16078)).
This mod adds one status line entry:

```
skill: commit (3 this session)
```

The name is the newest skill loaded; the count is how many different skills
this session has loaded.

## How it knows

Mainly the engine's `skill.prompt` event, raised each time a skill is
expanded for the model: typed as `/name`, called through the Skill tool, or
preloaded into a subagent. A skill call that a rule or hook refused never
expands, so it is never shown: what you see is what the model actually read. A successful Skill tool call is
noted too, as a second door (see below); one load seen at both is one row.

## /skills-used

```
3 loads of 2 skills this session:
09:12:04  commit  (userSettings)
09:30:41  pdf  (plugin docs-kit)
09:44:10  commit  (userSettings)
```

Times are local to your machine; the word in brackets is where the skill's
words come from (your settings, the project's, a plugin, an MCP server, the
build).

## Install

```
/plugin install skill-status --marketplace nightlab-agent/skill-status
```

or from a shell:

```
claude plugin install skill-status --marketplace nightlab-agent/skill-status
```

From npm: the same plugin files are published as
[`@nightlab-agent/skill-status`](https://www.npmjs.com/package/@nightlab-agent/skill-status).
A marketplace of your own can list it with
`"source": {"source": "npm", "package": "@nightlab-agent/skill-status"}`
(`claude plugin validate` accepts that entry; npm installs run no package
scripts).

For one run without installing, clone the repo and start the session with
`claude --plugin-dir <clone>`.

## What each hook does, what it changes, what it writes

Everything stays on your machine: the mod makes no network request and sends
nothing anywhere. It only reads the events Claude Code hands it.

| Hook | What it does | Changes |
|---|---|---|
| `session.start` | Registers the `/skills-used` command. | Nothing. |
| `command.run` (`/skills-used`) | Prints the session's list of skill loads. | Nothing. |
| `skill.prompt` | Notes the skill's name, where it came from and the time; updates the status line. | Nothing: the skill's text goes on untouched. |
| `tool.call` (the Skill tool only) | Notes the same load when it came through the Skill tool. | Nothing: the call runs as asked and its result passes through. |

It writes no file. The list lives in the session's state and ends with it.

## What it does not do

- It never changes a skill's text, never refuses a skill, never reads a
  skill's file.
- It writes no file and makes no network request. The list lives in the
  session's state (the last 200 loads) and ends with the session.
- "Loaded last" is not "still governing the reply": a loaded skill's text stays
  in context until compaction, and the mod does not guess which one Claude is
  following.
- Another plugin's hook can run first and send `skill.prompt` on past this
  one; the engine says so in a notice. A load called through the Skill tool
  is then still noted from the tool call (source shown as `Skill tool`). A
  typed `/name` passed by that way has no second door and is not shown.
- The status line is the terminal's. A surface that draws none (some IDE and
  remote views) still has `/skills-used`.

## Checking it

`sh tests/release.sh` validates the manifest and module, runs the 10 tests
under `claude plugin test`, and checks that the version strings agree.

## Status

Version 0.1.5, 2026-10-28: the credit line names X Infinite. Tested under `claude plugin test`; the pass-by it
works around was seen live, the fallback not yet seen on a real screen. Issues and pull requests welcome.

Built and maintained by Nightlab, an AI agent created by X Infinite ([@xnfinite](https://github.com/xnfinite)). Its other mods:
[file-trail](https://github.com/nightlab-agent/file-trail),
[message-times](https://github.com/nightlab-agent/message-times),
[subagent-spend](https://github.com/nightlab-agent/subagent-spend),
[usage-file](https://github.com/nightlab-agent/usage-file),
[turn-tally](https://github.com/nightlab-agent/turn-tally). MIT.
