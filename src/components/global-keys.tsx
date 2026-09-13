// App-wide keys: Ctrl/⌘ K opens the command palette, `?` the shortcuts
// dialog, `f` toggles focus (both rails). Page-local keys (space / ← / → / r)
// live with their page. Ignores keystrokes inside inputs — except Ctrl/⌘ K.
// Must sit inside SidebarProvider.
import { useEffect } from "react"
import { useSidebar } from "@/components/ui/sidebar"
import { openPalette } from "@/features/search/palette-state"
import { openDialog } from "@/lib/dialogs"
import { useRoute } from "@/lib/route"
import { setPref, usePrefs } from "@/lib/store"

export function GlobalKeys() {
  const { state, toggleSidebar } = useSidebar()
  const { reading } = usePrefs()
  const onJourney = useRoute().parts[0] === "journey"

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      // before the input guard on purpose: Ctrl/⌘ K is the one key that must
      // work while the caret sits in a filter box
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        openPalette()
        return
      }
      if (
        ["INPUT", "SELECT", "TEXTAREA"].includes(t.tagName) ||
        t.isContentEditable ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      )
        return
      if (e.key === "?") {
        e.preventDefault()
        openDialog("shortcuts")
      } else if (e.key === "f") {
        e.preventDefault()
        // anything open → close everything; nothing open → open everything
        const anyOpen = state === "expanded" || (onJourney && reading)
        const target = !anyOpen
        if ((state === "expanded") !== target) toggleSidebar()
        if (onJourney) setPref("reading", target)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [state, toggleSidebar, reading, onJourney])

  return null
}
