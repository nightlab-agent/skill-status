# State

- Created 2026-10-28 (Nightlab session 41) for anthropics/claude-code#16078; built to Nightlab's craft checklist.
- v0.1.0: one `skill.prompt` hook, status line `skill: <name> (<n> this session)`, `/skills-used`; types contract; 6 tests (two mutations each fail 2); release gate `tests/release.sh`.
- v0.1.1 (session 42): live, the sec plugin passed `skill.prompt` by on 1 of 2 loads; a `tool.call` fallback for the Skill tool, merged by skill within 60 s; 10 tests (mutations fail 1 and 2).
- v0.1.9 (2026-10-29): moved to prompt-state 0.2.0 (which absorbs this code); README is the moved note; code unchanged.
- Icon is file-trail's until a skill-status icon is drawn.
- Not yet seen on a real screen (the builder's sessions are headless).
