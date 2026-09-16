// The journey, on the problem's own page.
//
// It used to be a ROUTE. "Build it up" navigated to `#/journey/<slug>`, which
// is a different page with its own header, its own back link and its own
// scroll position — so working a problem meant leaving the thing you were
// reading, and coming back put you at the top of it. Everything about one
// problem is supposed to be in one place; the journey was the last thing that
// was not.
//
// WHY FULLSCREEN IS THE MODE, not a button on a box. Measured inline at 88svh
// in a 632px viewport: the act stepper wrapped to two rows, the journey's own
// chrome took 155px, and the stage — which at the story act is deliberately
// empty — was a 320px hole in the middle of a document. The component owns a
// canvas by design; a letterbox is the worst of both, too small for the journey
// and too large to sit politely in a page. So the gesture that opens it asks
// for the display, and LEAVING the display leaves the journey: you land back on
// the problem page at the same scroll position, with the walkthrough in the
// band where it was. The inline box survives only as the fallback for a browser
// that refuses fullscreen.
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
  openFull = false,
}: {
  /** ask for the whole display as the journey opens. Measured at 632px of
   *  viewport: inline, the journey's own chrome takes 195px and the STAGE —
   *  the thing you came to watch — is left with 217. The canvas is not a
   *  luxury for this component, so the gesture that opens it asks for one. */
  openFull?: boolean
  slug: string
  earned: number
  acts: number
  onClose: () => void
}) {
  const box = useRef<HTMLDivElement>(null)
  const [full, setFull] = useState(false)
  const asked = useRef(false)
  const wasFull = useRef(false)

  // The browser owns this state — Esc leaves fullscreen without telling us, so
  // it is read back from the document rather than assumed.
  //
  // And leaving fullscreen CLOSES the journey, which is the decision this
  // component is built around: fullscreen is the mode, not a bigger version of
  // a box. Esc therefore does what it looks like it does — puts you back on the
  // page you were reading — instead of dropping you into a cramped letterbox
  // you then have to dismiss a second time.
  useEffect(() => {
    const sync = () => {
      const now = document.fullscreenElement === box.current
      setFull(now)
      if (!now && wasFull.current) onClose()
      wasFull.current = now
    }
    document.addEventListener("fullscreenchange", sync)
    return () => document.removeEventListener("fullscreenchange", sync)
  }, [onClose])

  // once, on mount, and only when the caller asked: `requestFullscreen` needs
  // a user gesture, and the click that mounted this component is one. A
  // rejected promise is not an error worth showing — the inline box is a
  // perfectly good fallback and the control is right there.
  useEffect(() => {
    if (!openFull || asked.current) return
    asked.current = true
    void box.current?.requestFullscreen?.().catch(() => {})
  }, [openFull])

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
        // 88svh inline. Measured at 78: the journey's chrome took 195px and
        // the stage was left 217 — the component is a canvas and a letterbox
        // does it no favours, which is why the gesture asks for fullscreen.
        full ? "h-screen rounded-none p-4" : "h-[88svh] p-3"
      )}
    >
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-meta font-semibold text-foreground">
          <RouteIcon className="size-3.5 shrink-0 text-dim" aria-hidden />
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
            aria-label={full ? "back to the page" : "full screen"}
            title={
              full ? "back to the page — your progress is saved" : "full screen"
            }
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
