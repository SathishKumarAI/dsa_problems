// Which app-level dialog is open (settings / shortcuts / help), as a tiny
// external store so the sidebar footer, the `?` key and the help icon can all
// open the same dialog without prop drilling. Owns no rendering; App mounts
// the dialogs once (components/app-dialogs.tsx).

import { useSyncExternalStore } from "react"

export type DialogName = "settings" | "shortcuts" | "help"

let open: DialogName | null = null
const listeners = new Set<() => void>()

export function openDialog(name: DialogName | null) {
  open = name
  listeners.forEach((l) => l())
}

export const useDialog = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => open,
    () => null
  )
