import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Use } from '../types'

// skill-status: which skill was loaded last, in the status line, and every
// skill this session loaded, on /skills-used
// (anthropics/claude-code#16078: "no persistent indicator showing which skill is active").
//
// One hook, `skill.prompt`: the engine raises it each time it expands a skill
// for the model, whether the person typed `/name`, Claude called the Skill
// tool, or a subagent preloads it. A skill that was refused never gets there,
// so what shows is what the model really read. The newest skill shows in the
// status line with the session's count; /skills-used lists every load.
//
// 0.1.1: on a host where another plugin's hook runs first and sends
// `skill.prompt` on past this one (seen live 2026-10-28: "cc-plugin-sec-default
// runs first and sent the event on past it"), a load called through the Skill
// tool is still noted at `tool.call`, when the call succeeded. A load noted at
// both within SAME_LOAD_MS is one row, the `skill.prompt` one kept. A typed
// `/name` that is passed by has no second door and stays unseen.
//
// DESIGN NOTE, deliberately narrow: it passes the skill's text on unchanged,
// never denies, never reads a skill's file, never touches the network, writes
// no file. Every failure of its own is swallowed: an indicator that breaks a
// skill would be worse than none.

const COMMAND = 'skills-used'
/** Loads kept in the session's state. */
export const KEEP = 200
/** Notes of one skill this close together are one load. */
export const SAME_LOAD_MS = 60_000
/** Where a load noted only at the Skill tool call says it came from. */
export const VIA_TOOL = 'Skill tool'

// Change the tag when Use's fields change: it declines what an earlier version stored.
const uses = atom({ plugin: 'skill-status', key: 'uses' } as const, [] as Use[], { shape: 'uses-1' })

/** `skill: commit (3 this session)`: the newest load, and how many distinct skills. */
export const statusOf = (all: Use[]) => {
  const last = all.at(-1)
  if (!last) return undefined
  const count = new Set(all.map(x => x.skill)).size
  return `skill: ${last.skill} (${count} this session)`.slice(0, 80)
}

const bare = (name: string) => name.slice(name.lastIndexOf(':') + 1)

/** Adds one note to the list: a second note of the newest skill within SAME_LOAD_MS is the same load. */
export const noteLoad = (all: Use[], use: Use): Use[] => {
  const last = all.at(-1)
  if (last && bare(last.skill) === bare(use.skill) && Math.abs(Date.parse(use.at) - Date.parse(last.at)) <= SAME_LOAD_MS) {
    // the engine's own note says more (its source, its plugin); a tool note never replaces it
    return last.source === VIA_TOOL && use.source !== VIA_TOOL ? [...all.slice(0, -1), use] : all
  }
  return [...all, use].slice(-KEEP)
}

const hms = (iso: string) => {
  const t = new Date(iso)
  return [t.getHours(), t.getMinutes(), t.getSeconds()].map(n => String(n).padStart(2, '0')).join(':')
}

/** The /skills-used answer: one line per load, oldest first; times local to the machine. */
export const listText = (all: Use[]) => {
  if (all.length === 0) return 'No skill loaded yet in this session.'
  const names = new Set(all.map(x => x.skill)).size
  const lines = all.map(x => {
    const from = x.plugin ? `plugin ${x.plugin}` : x.source
    return `${hms(x.at)}  ${x.skill}  (${from})`
  })
  return [`${all.length} loads of ${names} skills this session:`, ...lines].join('\n')
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    try {
      await $.command.register({ name: COMMAND, description: 'List the skills this session loaded, with times and where each came from' })
    } catch {
      // a surface with no commands; the status line goes on
    }
    return next(e)
  })

  on('command.run', { command: COMMAND }, async $ => ({ text: listText(await read($, uses)) }))

  on('skill.prompt', async ($, e, next) => {
    const r = await next(e)
    try {
      const use: Use = {
        at: new Date().toISOString(),
        skill: e.skill,
        source: String(e.source),
        ...(e.pluginName ? { plugin: e.pluginName } : {}),
      }
      const all = await update($, uses, xs => noteLoad(xs, use))
      try {
        $.ui.status(statusOf(all))
      } catch {
        // a surface with no status line
      }
    } catch {
      // the indicator misses one load; the skill's text is untouched
    }
    return r
  })

  on('tool.call', async ($, e, next) => {
    const r = await next(e)
    if (e.tool !== 'Skill' || r.deny !== undefined || r.isError === true) return r
    try {
      const name = (e as unknown as Record<string, unknown>).skill
      if (typeof name !== 'string' || !name) return r
      const use: Use = { at: new Date().toISOString(), skill: name.replace(/^\//, ''), source: VIA_TOOL }
      const all = await update($, uses, xs => noteLoad(xs, use))
      try {
        $.ui.status(statusOf(all))
      } catch {
        // a surface with no status line
      }
    } catch {
      // the indicator misses one load; the call's result is untouched
    }
    return r
  })
}
