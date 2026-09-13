// The command palette: one input over every problem and every journey,
// opened with Ctrl/⌘ K or the visible trigger. Owns the dialog, the keyboard
// loop and the recent list; ranking lives in ./results.ts, open state in
// ./palette-state.ts.
//
// Nothing here renders an unearned name: every row's pattern text comes from
// the index, which is built from the disclosure mask.
import { useState } from "react"
import { RouteIcon, SearchIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import { Button } from "@/components/ui/button"
import { usePatternMask } from "@/lib/disclosure"
import { difficultyClass } from "@/lib/difficulty"
import { navigate } from "@/lib/route"
import { setPref, usePrefs } from "@/lib/store"
import { cn } from "@/lib/utils"
import { COUNTS, buildIndex, hitByKey, search, type Hit } from "./results"
import { closePalette, openPalette, usePaletteOpen } from "./palette-state"

const MAC =
  typeof navigator !== "undefined" &&
  /Mac|iP(hone|ad|od)/.test(navigator.platform)
const KEYHINT = MAC ? "⌘ K" : "Ctrl K"

const RECENT_MAX = 5
const EMPTY: Hit[] = []

export function SearchTrigger({ className }: { className?: string }) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("text-muted-foreground", className)}
      onClick={openPalette}
    >
      <SearchIcon />
      <span>Search</span>
      {/* the key hint is noise on a touch device, where the bar is tightest */}
      <Kbd className="ml-1 hidden sm:inline-flex">{KEYHINT}</Kbd>
    </Button>
  )
}

export function CommandPalette() {
  const open = usePaletteOpen()
  const mask = usePatternMask()
  const { recentSearch } = usePrefs()
  const [query, setQuery] = useState("")
  const [sel, setSel] = useState(0)
  const [prevQuery, setPrevQuery] = useState("")

  // Built on the open dialog's renders only — 214 rows of string joining is
  // cheaper than keeping a cache in sync with a mask that changes shape every
  // time an act is earned.
  const index = open ? buildIndex(mask) : EMPTY
  const shown = query.trim()
    ? search(index, query)
    : recentSearch
        .map((k) => hitByKey(index, k))
        .filter((h): h is Hit => h !== undefined)

  // render-time adjust (React Compiler forbids the setState-in-effect version)
  if (prevQuery !== query) {
    setPrevQuery(query)
    setSel(0)
  }
  const cur = Math.min(sel, Math.max(0, shown.length - 1))

  const close = () => {
    closePalette()
    setQuery("")
  }

  const choose = (hit: Hit) => {
    setPref(
      "recentSearch",
      [hit.key, ...recentSearch.filter((k) => k !== hit.key)].slice(
        0,
        RECENT_MAX
      )
    )
    close()
    navigate(hit.path)
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSel(Math.min(cur + 1, shown.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSel(Math.max(cur - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (shown[cur]) choose(shown[cur])
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent
        showCloseButton={false}
        className="top-[12vh] max-h-[76vh] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <DialogTitle className="sr-only">
          Search problems and journeys
        </DialogTitle>
        <DialogDescription className="sr-only">
          Type to filter. Arrow keys move, Enter opens, Escape closes.
        </DialogDescription>
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            role="combobox"
            aria-expanded
            aria-controls="palette-list"
            aria-activedescendant={shown[cur] ? `palette-${cur}` : undefined}
            aria-label="Search problems and journeys"
            placeholder={`Search ${COUNTS.problems} problems and ${COUNTS.journeys} journeys…`}
            className="h-9 border-0 text-body focus-visible:ring-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            data-testid="palette-input"
          />
        </div>

        <div
          id="palette-list"
          role="listbox"
          aria-label="results"
          className="max-h-[52vh] overflow-y-auto p-1"
        >
          {shown.length === 0 ? (
            <p className="px-3 py-6 text-center text-ui text-muted-foreground">
              {query.trim()
                ? `Nothing matches “${query.trim()}”.`
                : "Search by title, pattern or LeetCode slug."}
            </p>
          ) : (
            <>
              {!query.trim() && (
                <p className="px-3 pt-2 pb-1 text-meta text-muted-foreground">
                  recent
                </p>
              )}
              {shown.map((h, i) => (
                <button
                  key={h.key}
                  id={`palette-${i}`}
                  role="option"
                  aria-selected={i === cur}
                  data-testid="palette-hit"
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left",
                    i === cur && "bg-accent"
                  )}
                  onMouseEnter={() => setSel(i)}
                  onClick={() => choose(h)}
                >
                  {h.kind === "journey" ? (
                    <RouteIcon
                      className="size-3.5 shrink-0 text-chart-1"
                      aria-label="journey"
                    />
                  ) : (
                    <span className="size-3.5 shrink-0" />
                  )}
                  <span className="shrink-0 text-body font-medium">
                    {h.title}
                  </span>
                  <span className="truncate text-meta text-muted-foreground">
                    {h.kind === "journey" ? "journey · " : ""}
                    {h.pattern}
                  </span>
                  {h.difficulty && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "ml-auto shrink-0 font-mono",
                        difficultyClass[h.difficulty]
                      )}
                    >
                      {h.difficulty}
                    </Badge>
                  )}
                </button>
              ))}
            </>
          )}
        </div>

        <div className="flex items-center gap-3 border-t px-3 py-2 text-meta text-muted-foreground">
          <span>
            <Kbd>↑</Kbd> <Kbd>↓</Kbd> move
          </span>
          <span>
            <Kbd>↵</Kbd> open
          </span>
          <span>
            <Kbd>Esc</Kbd> close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
