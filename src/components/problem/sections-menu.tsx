// "On this page", for every width the rail does not cover.
//
// The contents rail is `xl` and up. Below that it does not exist — so on a
// phone, where a problem page runs to roughly thirty screens, the page has no
// navigation at all: the only way to reach the approaches is to scroll past
// the statement, the checks, the hints and the walkthrough every time.
//
// This is the same list from the same array (`pageShapeOf().sections`), in a
// sheet. It cannot offer a section the page did not draw, for the same reason
// the rail cannot: there is one source.
//
// The trap this file exists downstream of: a bare `#id` href is a ROUTE change
// in a hash-routed app, so every entry here does `preventDefault()` and scrolls
// — exactly as `problem-closing.tsx`'s rail entries do. `scroll-padding-top`
// in `index.css` is what keeps the landing clear of the sticky bar.
import { useState } from "react"
import { ListIcon } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export interface SectionEntry {
  id: string
  text: string
}

export function SectionsMenu({
  sections,
  className,
}: {
  sections: SectionEntry[]
  className?: string
}) {
  const [open, setOpen] = useState(false)
  if (sections.length < 2) return null
  return (
    <>
      <button
        type="button"
        data-sections-menu
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={cn(
          // 44px on a phone, the compact size where there is a mouse — the
          // touch floor this repo's own gate enforces.
          "inline-flex min-h-11 items-center gap-1.5 rounded-md border px-2.5 text-meta text-muted-foreground transition-colors hover:border-edge/40 hover:text-foreground lg:min-h-7",
          className
        )}
      >
        <ListIcon className="size-3.5 shrink-0 text-dim" />
        on this page
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        {/* From the BOTTOM, because the control is in a bar at the top and a
            thumb is at the other end of the phone. */}
        <SheetContent side="bottom" className="max-h-[70svh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>On this page</SheetTitle>
          </SheetHeader>
          <nav aria-label="sections" className="flex flex-col p-4 pt-0">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  setOpen(false)
                  // after the sheet closes, so the scroll lands against the
                  // final layout rather than the one with the overlay on it
                  requestAnimationFrame(() =>
                    document
                      .getElementById(s.id)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" })
                  )
                }}
                className="flex min-h-11 items-center border-b border-border/40 text-ui text-muted-foreground last:border-b-0 hover:text-foreground"
              >
                {s.text}
              </a>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  )
}
