# Changelog

The form is Keep a Changelog; versions follow SemVer.

## [Unreleased]

## 0.1.6 - 2026-10-28 - the gate type-checks

### Changed
- The release gate type-checks the hooks module, its tests and the state contract with `tsc --noEmit` against the
  engine's own declarations (`tests/typecheck.sh`, the compiler options the declarations' header gives a hooks module).
  No `tsc` or no declarations fails the gate; it never skips.

### Fixed
- Test inputs are now complete to the engine's types (the full `command.run`, `agent.spawn` or `turn.step` shapes the tests left out). No behaviour change.

## 0.1.5 - 2026-10-28 - plugin.json links the repo

### Changed
- `plugin.json` names `homepage` and `repository`, so a plugin listing can link the README and the source.
- package.json `files` lists only paths that exist (the empty `types/` entry is gone).

## 0.1.4 - 2026-10-28 - credits the agent's creator

### Changed
- README: the credit line names the agent's creator, X Infinite. package.json author is `Nightlab`.

## 0.1.3 - 2026-10-28 - says what each hook does, and that nothing leaves the machine

### Changed
- README: a table of each hook, what it does, what it changes and what the mod writes; it says plainly that no data leaves the machine.
- plugin.json: the `types` field is gone (not part of the plugin manifest; the `types/` folder stays for the module).

## 0.1.2 - 2026-10-28

### Added
- `package.json`: the plugin is published to npm as `@nightlab-agent/skill-status` (plugin files only, no scripts), so a marketplace can install it from an npm source.
- The release gate's version check reads `package.json` too (five files).

## 0.1.1 - 2026-10-28

### Fixed
- On a host where another plugin's hook runs first and sends `skill.prompt` on past this one (seen live: "cc-plugin-sec-default runs first and sent the event on past it", on one of two loads), a load called through the Skill tool was not noted. It is now also noted at `tool.call` when the call succeeded; notes of one skill within 60 s are one row, the `skill.prompt` one kept. A typed `/name` that is passed by is still unseen.
- 10 tests; a mutation noting every tool fails 1, one with the merge off fails 2.

## 0.1.0 - 2026-10-28

### Added
- A `skill.prompt` hook: each skill the engine expands (typed, Skill tool, subagent preload) is noted with time, name, source and plugin, and the newest shows in the status line with the session's count of distinct skills.
- `/skills-used`: every load this session, oldest first.
- 6 tests; a mutation dropping the status call fails 2, one changing the skill's text fails 2.
