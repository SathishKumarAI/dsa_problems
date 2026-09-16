// Where you just were.
//
// This app has one back affordance per page, hand-written, and each one points
// at the place the AUTHOR thought you came from: the journey trails back to
// its pattern, a problem trails back to its pattern, the pattern page trails
// home. That is a hierarchy, and a hierarchy is not a history — arrive at a
// journey from search, from the sidebar's Continue, or from a shared link, and
// every one of those trails sends you somewhere you have never been.
//
// The browser's own Back does the right thing and is invisible: a hash route
// leaves no button in the page, and on a laptop trackpad the gesture is easy
// to miss entirely. So the app keeps the one fact those trails cannot know —
// the route you were on before this one — and offers it as a real control.
//
// NOT localStorage. "Where you just were" is a fact about this tab in this
// sitting; restoring it a week later would be a control pointing at a page the
// reader has no memory of. `sessionStorage` is exactly the right lifetime, and
// the store's key discipline does not apply because nothing here is progress.
import { useSyncExternalStore } from "react"

const KEY = "patternsmith:trail"

export interface Stop {
  path: string
  label: string
}

/** most recent LAST, current stop included */
let trail: Stop[] = read()
const listeners = new Set<() => void>()

function read(): Stop[] {
  try {
    const raw = sessionStorage.getItem(KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []
    // A stored shape is input, not a promise. A half-written array here would
    // otherwise throw inside a render and take the shell down with it.
    return parsed.filter(
      (s): s is Stop =>
        !!s &&
        typeof (s as Stop).path === "string" &&
        typeof (s as Stop).label === "string"
    )
  } catch {
    // private mode, a disabled store, a quota — none of which is worth a
    // broken page for a convenience control
    return []
  }
}

function write() {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(trail))
  } catch {
    /* see read() */
  }
}

/**
 * Record that the reader is now here.
 *
 * Consecutive visits to the same path collapse: a query change (`?act=2`) is
 * the same page, and a "back" that walked a reader through five steps of their
 * own journey would be a worse control than no control.
 */
export function visited(path: string, label: string) {
  const top = trail[trail.length - 1]
  if (top?.path === path) {
    if (top.label === label) return
    // the label arrives after the chunk loads, so the stop is amended in place
    trail = [...trail.slice(0, -1), { path, label }]
  } else {
    trail = [...trail, { path, label }].slice(-10)
  }
  write()
  for (const l of listeners) l()
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => void listeners.delete(l)
}

/** the stop BEFORE this one, or null on the first page of a sitting */
export const previous = (): Stop | null =>
  trail.length > 1 ? trail[trail.length - 2] : null

let cached: Stop | null = previous()
const snapshot = () => {
  const now = previous()
  // useSyncExternalStore compares by identity, so a fresh object every call is
  // an infinite render. Only hand back a new one when it actually changed.
  if (now?.path !== cached?.path || now?.label !== cached?.label) cached = now
  return cached
}

/** the stop before this one, as a hook */
export const usePrevious = () =>
  useSyncExternalStore(subscribe, snapshot, () => null)
