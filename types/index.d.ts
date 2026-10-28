/** One load of a skill, as the status line and /skills-used show it. */
export type Use = {
  /** ISO time the engine expanded it. */
  at: string
  /** The skill's name, without the slash. */
  skill: string
  /** Where its words come from, in the engine's SkillSource words. */
  source: string
  /** The installed plugin it came from, if any. */
  plugin?: string
}

declare module 'claude-code' {
  interface PluginState {
    'skill-status': { uses: Shaped<Use[]> }
  }
}
