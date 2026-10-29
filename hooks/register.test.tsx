import { expect, test } from 'claude-code/testing'
import type { TestBody } from 'claude-code/testing'

// What the engine stamps on a typed command: the person at the composer.
const RUN = { origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 100 } } as const

import { identityOf, KEEP, listText, noteLoad, statusOf } from './register'

// Each test stands for the engine beneath the plugin: it answers
// `skill.prompt` with the skill's text, records `$.ui.status`, and reads what
// the plugin returned. Nothing touches the real file system.

type On = Parameters<TestBody>[1]

const world = (on: On, opts: { statusFails?: boolean; deny?: RegExp; errorOn?: RegExp } = {}) => {
  const statuses: (string | undefined)[] = []
  on('skill.prompt', (_, e) => ({ text: e.text }))
  on('ui.status', (_, e) => {
    if (opts.statusFails) throw new Error('no status line here')
    statuses.push(e.text)
    return { value: undefined }
  })
  on('command.register', () => ({ value: { command: 'skills-used' } }))
  on('tool.call', (_, e) => {
    const t = JSON.stringify(e)
    if (opts.deny?.test(t)) return { deny: 'blocked by a rule' }
    if (opts.errorOn?.test(t)) return { result: 'Unknown skill.', isError: true }
    return { result: {} }
  })
  return { statuses }
}

test('a loaded skill shows in the status line, its text passed on unchanged', async ($, on) => {
  const { statuses } = world(on)
  const r = await $.skill.prompt({ skill: 'commit', text: 'Write the commit.', source: 'userSettings' })
  expect(r.text).toBe('Write the commit.')
  expect(statuses.at(-1)).toBe('skill: commit (1 this session)')
})

test('the count is of distinct skills, the name of the newest load', async ($, on) => {
  const { statuses } = world(on)
  await $.skill.prompt({ skill: 'commit', text: 'a', source: 'userSettings' })
  await $.skill.prompt({ skill: 'review', text: 'b', source: 'projectSettings' })
  await $.skill.prompt({ skill: 'commit', text: 'c', source: 'userSettings' })
  expect(statuses.at(-1)).toBe('skill: commit (2 this session)')
})

test('/skills-used lists every load with where it came from, and says so before any', async ($, on) => {
  world(on)
  const empty = await $.command.run({ command: 'skills-used', args: '', ...RUN })
  expect(empty.text).toBe('No skill loaded yet in this session.')
  await $.skill.prompt({ skill: 'commit', text: 'a', source: 'userSettings' })
  await $.skill.prompt({ skill: 'pdf', text: 'b', source: 'plugin', pluginName: 'docs-kit' })
  const r = await $.command.run({ command: 'skills-used', args: '', ...RUN })
  expect(r.text).toContain('2 loads of 2 skills this session:')
  expect(r.text).toContain('commit  (userSettings)')
  expect(r.text).toContain('pdf  (plugin docs-kit)')
})

test('a surface with no status line still gets the skill text and the list', async ($, on) => {
  world(on, { statusFails: true })
  const r = await $.skill.prompt({ skill: 'commit', text: 'Write the commit.', source: 'userSettings' })
  expect(r.text).toBe('Write the commit.')
  const list = await $.command.run({ command: 'skills-used', args: '', ...RUN })
  expect(list.text).toContain('1 loads of 1 skills')
})

test('statusOf is empty with no loads, and cut to 80 characters', () => {
  expect(statusOf([])).toBe(undefined)
  const long = statusOf([{ at: '2026-10-28T09:00:00Z', skill: 'x'.repeat(120), source: 'userSettings' }])
  expect(long!.length).toBe(80)
})

test('listText keeps the order of loads, oldest first', () => {
  const text = listText([
    { at: '2026-10-28T09:00:00Z', skill: 'first', source: 'built-in' },
    { at: '2026-10-28T09:01:00Z', skill: 'second', source: 'mcp' },
  ])
  expect(text.indexOf('first')).toBeLessThan(text.indexOf('second'))
  expect(KEEP).toBe(200)
})

test('a Skill tool call the engine passed by is still noted (0.1.1)', async ($, on) => {
  const { statuses } = world(on)
  await $.tool.call({ tool: 'Skill', skill: 'icm-ops:icm-verifier', args: 'check' })
  expect(statuses.at(-1)).toBe('skill: icm-ops:icm-verifier (1 this session)')
  const r = await $.command.run({ command: 'skills-used', args: '', ...RUN })
  expect(r.text).toContain('icm-ops:icm-verifier  (Skill tool)')
})

test('one load seen both ways is one row, the engine note kept', async ($, on) => {
  world(on)
  await $.skill.prompt({ skill: 'icm-verifier', text: 'a', source: 'plugin', pluginName: 'icm-ops' })
  await $.tool.call({ tool: 'Skill', skill: 'icm-ops:icm-verifier' })
  const r = await $.command.run({ command: 'skills-used', args: '', ...RUN })
  expect(r.text).toContain('1 loads of 1 skills')
  expect(r.text).toContain('icm-verifier  (plugin icm-ops)')
})

test('a refused or failed Skill call and other tools are not noted', async ($, on) => {
  world(on, { deny: /secret/, errorOn: /nosuch/ })
  await $.tool.call({ tool: 'Skill', skill: 'secret' })
  await $.tool.call({ tool: 'Skill', skill: 'nosuch' })
  await $.tool.call({ tool: 'Bash', command: 'ls' })
  const r = await $.command.run({ command: 'skills-used', args: '', ...RUN })
  expect(r.text).toBe('No skill loaded yet in this session.')
})

test('noteLoad: a tool note is replaced by a later engine note, and loads a minute apart stay two', () => {
  const tool = { at: '2026-10-28T09:00:00Z', skill: 'p:x', source: 'Skill tool' }
  const eng = { at: '2026-10-28T09:00:01Z', skill: 'x', source: 'plugin', plugin: 'p' }
  expect(noteLoad([tool], eng)).toEqual([eng])
  expect(noteLoad([eng], { ...tool, at: '2026-10-28T09:00:02Z' })).toEqual([eng])
  const later = { ...eng, at: '2026-10-28T09:01:02Z' }
  expect(noteLoad([eng], later).length).toBe(2)
})

test('two plugins\' skills with one name, loaded within a minute, are two loads of two skills', async ($, on) => {
  const { statuses } = world(on)
  await $.skill.prompt({ skill: 'review', text: 'a', source: 'plugin', pluginName: 'alpha' })
  await $.skill.prompt({ skill: 'review', text: 'b', source: 'plugin', pluginName: 'beta' })
  expect(statuses.at(-1)).toBe('skill: beta:review (2 this session)')
  const r = await $.command.run({ command: 'skills-used', args: '', ...RUN })
  expect(r.text).toContain('2 loads of 2 skills')
  expect(r.text).toContain('review  (plugin alpha)')
  expect(r.text).toContain('review  (plugin beta)')
  // the same two through the Skill tool
  await $.tool.call({ tool: 'Skill', skill: 'alpha:review' })
  await $.tool.call({ tool: 'Skill', skill: 'beta:review' })
  const again = await $.command.run({ command: 'skills-used', args: '', ...RUN })
  expect(again.text).toContain('4 loads of 2 skills')
})

test('noteLoad: beta:review 30 seconds after alpha:review stays a load of its own; the same skill twice is one', () => {
  const alpha = { at: '2026-10-29T09:00:00Z', skill: 'alpha:review', source: 'Skill tool' }
  const beta = { at: '2026-10-29T09:00:30Z', skill: 'beta:review', source: 'Skill tool' }
  expect(noteLoad([alpha], beta)).toEqual([alpha, beta])
  // control: the engine's note of alpha's review, 30 seconds after the tool note, is the same load
  const alphaEngine = { at: '2026-10-29T09:00:30Z', skill: 'review', source: 'plugin', plugin: 'alpha' }
  expect(noteLoad([alpha], alphaEngine)).toEqual([alphaEngine])
  expect(identityOf(alphaEngine)).toBe('alpha:review')
  expect(identityOf({ at: '', skill: 'alpha:review', source: 'plugin', plugin: 'alpha' })).toBe('alpha:review')
  expect(identityOf({ at: '', skill: 'commit', source: 'userSettings' })).toBe('commit')
})
