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
//   prefs             object     speed, code tab, motion, reading column open

import { useSyncExternalStore } from "react"

const PREFIX = "dsa:"
const listeners = new Map<string, Set<() => void>>()
const cache = new Map<string, unknown>()

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
} as const

export interface Prefs {
  speed: number // slider 1..100
  codeTab: string // pseudo | python | java | cpp
  motion: "calm" | "normal" | "cinematic" | "off"
  reading: boolean // journey page: reading column open (false = icon rail)
}
export const DEFAULT_PREFS: Prefs = {
  speed: 50,
  codeTab: "pseudo",
  motion: "normal",
  reading: true,
}

// merged over the defaults so a pref added later reads as its default, not undefined
export const usePrefs = (): Prefs => ({
  ...DEFAULT_PREFS,
  ...useStored<Partial<Prefs>>(K.prefs, DEFAULT_PREFS),
})
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
