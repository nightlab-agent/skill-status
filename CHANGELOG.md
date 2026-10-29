# Changelog

The form is Keep a Changelog; versions follow SemVer.

## [Unreleased]

## 0.1.9 - 2026-10-29 - moved to prompt-state

### Changed
- Moved to prompt-state: its 0.2.0 shows the skill loaded last beside what Claude Code is doing, has
  `/skills-used`, and adds a `skills` option to turn the skill half off. The README here now says so and
  gives prompt-state's install line. The code is unchanged and gets no more changes.

## 0.1.8 - 2026-10-29 - two plugins' skills with one name are two skills

### Fixed
- Two loads within a minute were taken for one when their names ended the same, so `beta:review` loaded
  after `alpha:review` was dropped. A load is now known by its plugin and name together (`alpha:review`,
  `beta:review`; a skill of your own by its bare name), both when the engine notes it and when the Skill tool
  does. The status line shows that full name and counts distinct skills by it. Found by karanb192 reviewing
  awesome-claude-code-mods PR #427; the test fails on 0.1.7.

### Changed
- README rewritten in plain words: what you see, what each hook does and changes, what is not yet seen on a
  real screen; no version history there; the kit paragraph is gone.
- The release script's version check reads four files; the README carries no version line now.
- `tsconfig.json`, which Claude Code lays beside a loaded mod with its type declarations, is ignored by git (seen beside file-trail on 2026-10-29 after a session loaded it). `tests/typecheck.sh` tells tsc to ignore such an untracked file: tsc 7.0.2 stopped on it with error TS5112.

## 0.1.7 - 2026-10-28 - the README names the kit

### Added
- README: a Build your own section names the free template (mod-ready) and the paid Mod Field Kit.

## 0.1.6 - 2026-10-28 - the release script type-checks

### Changed
- The release script runs the plugin directory checklist (`tests/checklist.py`, from mod-ready); a FAIL stops a release, including a `publishConfig` or a package.json repository that is not the plugin's own GitHub repo.
- `tests/typecheck.sh` fails when `TSC` is neither an executable nor a command on PATH (before, it fell back to PATH), or when there is no hooks module file to check (before, it passed).
- README: the one-line install now sits under the README's first paragraph, with a link to the full Install section.
- package.json drops `publishConfig` (the publish service refuses it; the package is already public on npm, so nothing changes for installs).
- The release script type-checks the hooks module, its tests and the state contract with `tsc --noEmit` against the
  engine's own declarations (`tests/typecheck.sh`, the compiler options the declarations' header gives a hooks module).
  No `tsc` or no declarations fails the release script; it never skips.

### Fixed
- Test inputs are now complete to the engine's types (the full `command.run` shape the tests left out). No behaviour change.

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
- The release script's version check reads `package.json` too (five files).

## 0.1.1 - 2026-10-28

### Fixed
- On a host where another plugin's hook runs first and sends `skill.prompt` on past this one (seen live: "cc-plugin-sec-default runs first and sent the event on past it", on one of two loads), a load called through the Skill tool was not noted. It is now also noted at `tool.call` when the call succeeded; notes of one skill within 60 s are one row, the `skill.prompt` one kept. A typed `/name` that is passed by is still unseen.
- 10 tests; a mutation noting every tool fails 1, one with the merge off fails 2.

## 0.1.0 - 2026-10-28

### Added
- A `skill.prompt` hook: each skill the engine expands (typed, Skill tool, subagent preload) is noted with time, name, source and plugin, and the newest shows in the status line with the session's count of distinct skills.
- `/skills-used`: every load this session, oldest first.
- 6 tests; a mutation dropping the status call fails 2, one changing the skill's text fails 2.
