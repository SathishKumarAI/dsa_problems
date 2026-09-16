// The journey, on the problem's own page.
//
// It used to be a ROUTE. "Build it up" navigated to `#/journey/<slug>`, which
// is a different page with its own header, its own back link and its own
// scroll position — so working a problem meant leaving the thing you were
// reading, and coming back put you at the top of it. Everything about one
// problem is supposed to be in one place; the journey was the last thing that
// was not.
//
// WHY A BOUNDED BOX AND NOT AN INLINE SECTION. The journey's whole mechanism is
// that the stage owns its height and the regions inside it scroll — that is how
// the transport stays put instead of riding the page (U1, spec 1.1). Dropped
// into a scrolling document it would be a scroll box inside a scroll box, which
// is the exact defect the audit fixed once already. So it gets a height of its
// own: 78svh here, the whole display in fullscreen.
//
// Fullscreen is the REAL one — `requestFullscreen` on this container, not a
// z-index that covers the app. The difference matters on a laptop: the browser
// chrome goes too, which is the point of asking for it.
//
// The route still exists. Deep links (`?act=&step=`) and the sidebar's Continue
// both go there, and neither should stop working because the problem page
// learned to host the same component.
import { Suspense, lazy, useEffect, useRef, useState } from "react"
import { MaximizeIcon, MinimizeIcon, RouteIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Lazily, and only when a reader asks for it. The journey pulls the engine,
// the panels and the FLIP machinery; a problem page that imported all of it up
// front would undo the code split B22 measured (673 kB → 400 + lazy).
const JourneyPage = lazy(() =>
  import("@/features/journey/journey-page").then((m) => ({
    default: m.JourneyPage,
  }))
)

export function JourneyEmbed({
  slug,
  earned,
  acts,
  onClose,
}: {
  slug: string
  earned: number
  acts: number
  onClose: () => void
}) {
  const box = useRef<HTMLDivElement>(null)
  const [full, setFull] = useState(false)

  // the browser owns this state — Esc leaves fullscreen without telling us, so
  // the flag is read back from the document rather than assumed
  useEffect(() => {
    const sync = () => setFull(document.fullscreenElement === box.current)
    document.addEventListener("fullscreenchange", sync)
    return () => document.removeEventListener("fullscreenchange", sync)
  }, [])

  const toggleFull = () => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void box.current?.requestFullscreen?.()
  }

  return (
    <div
      ref={box}
      data-journey-embed=""
      className={cn(
        "flex flex-col gap-2 rounded-xl border bg-background",
        // 78svh: tall enough for the stage and its transport, short enough
        // that the page it sits in is still visibly a page
        full ? "h-screen rounded-none p-4" : "h-[78svh] p-3"
      )}
    >
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-meta font-semibold text-foreground">
          <RouteIcon className="size-3.5 shrink-0 text-chart-1" aria-hidden />
          Building it up
        </span>
        <span className="font-mono text-meta text-dim tabular-nums">
          {earned}/{acts}
        </span>
        <span className="ml-auto flex items-center gap-1">
          <Button
            size="icon-sm"
            variant="ghost"
            className="size-11 text-muted-foreground lg:size-8"
            aria-label={full ? "leave full screen" : "full screen"}
            title={full ? "leave full screen" : "full screen"}
            onClick={toggleFull}
          >
            {full ? <MinimizeIcon /> : <MaximizeIcon />}
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            className="size-11 text-muted-foreground lg:size-8"
            aria-label="close the journey"
            title="close the journey — the page is still under it"
            onClick={() => {
              if (document.fullscreenElement) void document.exitFullscreen()
              onClose()
            }}
          >
            <XIcon />
          </Button>
        </span>
      </div>

      {/* `min-h-0`: the journey is `h-full` and this is the flex child that
          bounds it. Without it the child's min-content height wins and the
          whole thing grows until the transport rides the page again. */}
      <div className="min-h-0 flex-1">
        <Suspense
          fallback={
            <p className="p-6 text-ui text-muted-foreground">
              loading the journey…
            </p>
          }
        >
          <JourneyPage slug={slug} embedded />
        </Suspense>
      </div>
    </div>
  )
}
