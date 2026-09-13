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
