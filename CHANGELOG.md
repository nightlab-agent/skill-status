# Changelog

The form is Keep a Changelog; versions follow SemVer.

## [Unreleased]

## 0.1.0 - 2026-10-28

### Added
- A `skill.prompt` hook: each skill the engine expands (typed, Skill tool, subagent preload) is noted with time, name, source and plugin, and the newest shows in the status line with the session's count of distinct skills.
- `/skills-used`: every load this session, oldest first.
- 6 tests; a mutation dropping the status call fails 2, one changing the skill's text fails 2.
