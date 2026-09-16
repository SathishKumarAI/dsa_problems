// Is the command palette open? A three-line external store, for the same
// reason lib/dialogs.ts is one: the key handler (components/global-keys.tsx),
// the visible trigger and the dialog itself must agree without prop drilling.
// Separate from lib/dialogs.ts because that enum is app chrome (settings /
// shortcuts / help) and this is a feature that owns its own state.

import { useSyncExternalStore } from "react"

let open = false
const listeners = new Set<() => void>()

function set(v: boolean) {
  open = v
  listeners.forEach((l) => l())
}

/** The key to press, named once. The sidebar's row and the palette's own
 *  trigger both print it, and two copies of a keyboard hint is how one of them
 *  ends up saying Ctrl on a Mac. Here rather than in the component module
 *  because a `.tsx` that also exports a constant breaks fast refresh. */
const MAC =
  typeof navigator !== "undefined" &&
  /Mac|iP(hone|ad|od)/.test(navigator.platform)
export const KEYHINT = MAC ? "⌘ K" : "Ctrl K"

export const openPalette = () => set(true)
export const closePalette = () => set(false)

export const usePaletteOpen = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => open,
    () => false
  )
