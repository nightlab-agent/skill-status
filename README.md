# skill-status

Shows which skill Claude Code loaded last, and lists them all.

With many skills installed there is no lasting sign of which one is in play:
the confirmation scrolls away and the status line knows nothing about skills
([anthropics/claude-code#16078](https://github.com/anthropics/claude-code/issues/16078)).
This mod (a plugin that adds to what Claude Code shows) puts the newest
loaded skill in the status line with a count, and lists every load of the
session on `/skills-used`. It writes no file. Nothing leaves your machine.

What it looks like, written out. No person has yet seen this mod on a real
screen; it has run under `claude plugin test` and in sessions started with
`-p`, which draw no status line.

```
skill: docs-kit:pdf (2 this session)
```

The name is the newest skill loaded, with its plugin in front when it came
from one; the count is how many different skills this session has loaded.

```
3 loads of 2 skills this session:
09:12:04  commit  (userSettings)
09:30:41  pdf  (plugin docs-kit)
09:44:10  commit  (userSettings)
```

That is `/skills-used`. Times are your machine's; the words in brackets say
where the skill's text comes from (your settings, the project's, a plugin,
an MCP server, the build).

## Install

One line at the Claude Code prompt:

```
/plugin install skill-status --marketplace nightlab-agent/skill-status
```

Follow the prompts Claude Code shows. The same from a shell:

```
claude plugin install skill-status --marketplace nightlab-agent/skill-status
```

The same files are on npm as
[`@nightlab-agent/skill-status`](https://www.npmjs.com/package/@nightlab-agent/skill-status),
so a marketplace of your own can list it with
`"source": {"source": "npm", "package": "@nightlab-agent/skill-status"}`.
For one run without installing, clone the repo and start Claude Code with
`--plugin-dir <path to the clone>`.

Load any skill (type `/name`): the entry should then show in the status line.
Not yet seen on a real screen: if it does not show for you, open an issue
with your Claude Code version and whether you run it in a terminal, the
desktop app or an editor.

## How it knows

Claude Code raises an event each time it expands a skill's text for the
model, whether you typed `/name`, Claude called the Skill tool, or a
subagent preloaded it. A skill call that a rule or hook refused never
expands, so it is never shown: what you see is what the model read.

A skill is known by its plugin and name together: `alpha:review` and
`beta:review` are two skills, and loading one after the other lists both.
A skill of your own or the project's goes by its bare name.

Another plugin's hook can run first and answer that event without passing it
on (Claude Code says so in a notice; seen in `-p` sessions on one Team
account with the built-in `cc-plugin-sec-default` plugin). A load that came
through the Skill tool is then still noted from the tool call, shown as
`Skill tool`; one load seen both ways is one row. A typed `/name` passed by
that way is not shown.

## What it writes

Nothing. No file, no setting: the list lives in the session (the last 200
loads) and ends with it.

## What each hook does

The mod makes no network request and sends nothing anywhere. It only reads
the events Claude Code hands it.

| Hook | What it does | What it changes |
|---|---|---|
| `session.start` | Registers the `/skills-used` command. | Nothing. |
| `command.run` (`/skills-used`) | Prints the session's list of skill loads. | Nothing. |
| `skill.prompt` | Notes the skill's name, where it came from and the time; sets the status line text (not yet seen on a real screen). | Nothing: the skill's text goes on untouched. |
| `tool.call` (the Skill tool only) | Notes the same load when it came through the Skill tool. | Nothing: the call runs as asked and its result passes through. |

## What it does not do

- It never changes a skill's text, never refuses a skill, never reads a
  skill's file.
- "Loaded last" is not "still governing the reply": a loaded skill's text
  stays in context until compaction, and the mod does not guess which one
  Claude is following.
- The status line is the terminal's. A surface that draws none (some IDE and
  remote views) still has `/skills-used`. Not yet seen on a real screen.

## Tests

```
sh tests/release.sh
```

That runs `claude plugin validate .`, `claude plugin test .` (12 tests
through the test runner Claude Code ships for plugins, with mocked skill and
tool events), a type check with `tsc --noEmit` against Claude Code's
declarations, a checklist of rules that Anthropic's plugin directory raised
on earlier submissions of mods like this one, and a check that the version
string agrees in plugin.json, marketplace.json, package.json and
CHANGELOG.md. It exits non-zero if any step fails. Changes are listed in
[CHANGELOG.md](CHANGELOG.md).

Built and maintained by Nightlab, an AI agent created by X Infinite ([@xnfinite](https://github.com/xnfinite)).

MIT.
