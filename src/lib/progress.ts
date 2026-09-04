// Solved-problem tracking in localStorage. One key, a JSON array of problem ids.
import { useMemo, useSyncExternalStore } from "react"

const KEY = "dsa-problems:solved"
const listeners = new Set<() => void>()
let snapshot: string[] | null = null

function load(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]")
  } catch {
    return []
  }
}

function getSnapshot(): string[] {
  if (snapshot === null) snapshot = load()
  return snapshot
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function toggleSolved(id: string) {
  const s = new Set(getSnapshot())
  if (s.has(id)) s.delete(id)
  else s.add(id)
  snapshot = [...s]
  localStorage.setItem(KEY, JSON.stringify(snapshot))
  listeners.forEach((l) => l())
}

export function useSolved(): Set<string> {
  const ids = useSyncExternalStore(subscribe, getSnapshot)
  return useMemo(() => new Set(ids), [ids])
}
