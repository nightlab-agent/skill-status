# skill-status (front desk)

Nested ICM of a Nightlab bet. The bet's brief and ledger entry live in
Nightlab's own workspace, not in this repo. Read this, then `00-catalog/CATALOG.md`, then only what it
points to.

One hooks module, no dependencies: on every `skill.prompt` it passes the text
on unchanged, records time, skill, source and plugin, shows the newest in the
status line, and answers `/skills-used` with the list. Rules: never change or
refuse a skill, never read a skill's file, no network, no file written, a
failure of its own is swallowed and the skill's text returned untouched,
nothing public uses internal persona names. Kill date and falsifier: set on
placement, in Nightlab's ledger.
