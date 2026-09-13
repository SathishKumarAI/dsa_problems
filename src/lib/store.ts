// Every localStorage key the app owns, behind one useSyncExternalStore
// store. Owns: reading/writing/subscribing. Owns no policy — who may
// advance `unlocked:` is decided in features/journey/use-journey.ts.
//
// Keys (all prefixed "dsa:"):
//   solved            string[]   problem ids marked solved
//   unlocked:<slug>   number     acts earned on a journey (progressive disclosure)
//   quizzes:<slug>    string[]   act keys whose quiz was passed
//   xp                number     total XP
//   activity-days     string[]   ISO days with any activity (streak source)
//   scorecard:<slug>  object[]   last 50 challenge runs
//   prefs             object     speed, code tab, motion, reduced motion, rails,
//                                problem panel, drawer, problem-list filters,
//                                recent palette picks
//   spoilers          boolean    learner opted out of pattern-name masking

import { useSyncExternalStore } from "react"

const PREFIX = "dsa:"
const listeners = new Map<string, Set<() => void>>()
const cache = new Map<string, unknown>()

// A single version counter for readers that depend on *several* keys at once
// (the pattern mask reads one per journey). Subscribing to each key would
// mean a hook per journey inside a loop, which the rules of hooks forbid.
let version = 0
const anyListeners = new Set<() => void>()
const bump = () => {
  version++
  anyListeners.forEach((l) => l())
}

function read<T>(key: string, fallback: T): T {
  if (cache.has(key)) return cache.get(key) as T
  let v: T = fallback
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw !== null) v = JSON.parse(raw) as T
  } catch {
    v = fallback
  }
  cache.set(key, v)
  return v
}

export function getStored<T>(key: string, fallback: T): T {
  return read(key, fallback)
}

export function setStored<T>(key: string, value: T) {
  cache.set(key, value)
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // storage full or unavailable — the in-memory cache still drives the UI
  }
  listeners.get(key)?.forEach((l) => l())
  bump()
}

export function updateStored<T>(key: string, fallback: T, fn: (v: T) => T) {
  setStored(key, fn(read(key, fallback)))
}

export function removeStored(key: string) {
  cache.delete(key)
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    // ignore
  }
  listeners.get(key)?.forEach((l) => l())
  bump()
}

/** re-render on any write to the store; pair it with the plain getters */
export function useStoreVersion(): number {
  return useSyncExternalStore(
    (l) => {
      anyListeners.add(l)
      return () => anyListeners.delete(l)
    },
    () => version,
    () => 0
  )
}

// ---------- whole-store moves (settings dialog) ----------

const ownKeys = () => {
  const out: string[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith(PREFIX)) out.push(k.slice(PREFIX.length))
    }
  } catch {
    // no storage — nothing to list
  }
  return out
}

export function exportProgress(): Record<string, unknown> {
  return Object.fromEntries(
    ownKeys()
      .filter((k) => k !== K.prefs) // preferences are per device
      .map((k) => [k, read(k, null)])
  )
}

// returns how many keys were written; throws on a non-object
export function importProgress(obj: Record<string, unknown>): number {
  if (!obj || typeof obj !== "object" || Array.isArray(obj))
    throw new Error("bad")
  let n = 0
  for (const [k, v] of Object.entries(obj)) {
    if (k === K.prefs) continue
    setStored(k, v)
    n++
  }
  return n
}

export function resetProgress() {
  for (const k of ownKeys()) if (k !== K.prefs) removeStored(k)
}

export function useStored<T>(key: string, fallback: T): T {
  return useSyncExternalStore(
    (l) => {
      const set = listeners.get(key) ?? new Set()
      set.add(l)
      listeners.set(key, set)
      return () => set.delete(l)
    },
    () => read(key, fallback),
    () => fallback
  )
}

// ---------- the keys, named once ----------

export const K = {
  solved: "solved",
  unlocked: (slug: string) => `unlocked:${slug}`,
  quizzes: (slug: string) => `quizzes:${slug}`,
  xp: "xp",
  days: "activity-days",
  scorecard: (slug: string) => `scorecard:${slug}`,
  prefs: "prefs",
  spoilers: "spoilers",
} as const

export interface Prefs {
  speed: number // slider 1..100
  codeTab: string // pseudo | python | java | cpp
  motion: "calm" | "normal" | "cinematic" | "off"
  // The in-app reduced-motion override. Separate from `motion`, which only
  // sizes the FLIP travel: this one also stops every CSS transition, via a
  // class on <body> that index.css reads.
  reduceMotion: boolean
  reading: boolean // journey page: reading column open (false = icon rail)
  // journey page: which sections of the problem panel are open. null = the
  // learner has never touched it, so the act decides (R3).
  problemSections: string[] | null
  drawer: boolean // journey page (>= lg): the test-case drawer is open (R4)
  // Problem-list filters. Here rather than in their own key because they are
  // per-device settings, not progress: `prefs` is the one key export/import
  // skips. Flat, not nested — usePrefs merges one level deep, so a nested
  // object stored today would shadow a field added tomorrow.
  filterQuery: string
  filterLevel: "all" | "easy" | "medium" | "hard"
  filterState: "all" | "unsolved" | "solved"
  // command palette: keys of the last few picks ("p:<id>" | "j:<slug>")
  recentSearch: string[]
}
export const DEFAULT_PREFS: Prefs = {
  speed: 50,
  codeTab: "pseudo",
  motion: "normal",
  reduceMotion: false,
  reading: true,
  problemSections: null,
  drawer: false,
  filterQuery: "",
  filterLevel: "all",
  filterState: "all",
  recentSearch: [],
}

// merged over the defaults so a pref added later reads as its default, not undefined
export const usePrefs = (): Prefs => {
  const p = {
    ...DEFAULT_PREFS,
    ...useStored<Partial<Prefs>>(K.prefs, DEFAULT_PREFS),
  }
  // One switch, not two. reduceMotion forces the motion dial to off for every
  // consumer, so use-flip and the algorithms page honour the override without
  // having to know it exists.
  return p.reduceMotion ? { ...p, motion: "off" } : p
}
export const setPref = <P extends keyof Prefs>(k: P, v: Prefs[P]) =>
  updateStored(K.prefs, DEFAULT_PREFS, (p) => ({ ...p, [k]: v }))

export function awardXP(n: number) {
  updateStored(K.xp, 0, (x) => x + n)
}

export function recordActivity() {
  const today = new Date().toISOString().slice(0, 10)
  updateStored<string[]>(K.days, [], (d) =>
    d.includes(today) ? d : [...d, today]
  )
}

// consecutive days ending today (or yesterday, so a streak survives until midnight)
export function streakOf(days: string[]): number {
  const set = new Set(days)
  let d = new Date()
  const iso = () => d.toISOString().slice(0, 10)
  if (!set.has(iso())) d = new Date(d.getTime() - 864e5)
  let n = 0
  while (set.has(iso())) {
    n++
    d = new Date(d.getTime() - 864e5)
  }
  return n
}
