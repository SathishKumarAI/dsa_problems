// The frame every figure on a reading page sits in.
//
// This file owns the SPACE a drawing takes and the way out of it. It does not
// own what is drawn — `constraint-figure.tsx` does, and anything else that
// wants a frame passes its own children.
//
// The problem it solves, stated as the reader hits it: a figure is worth
// looking at and is not worth losing your place in a paragraph for. A bound
// drawn as five bars is four screen-inches in the middle of a sentence about
// why the bound matters, and on a laptop that pushes the sentence off the
// screen. The answer is NOT a fixed box — a fixed box pads the two-bar figures
// and squashes the six-bar ones, which is the look of a template rather than a
// drawing of this particular bound.
//
// So: the figure takes the height its own content asks for, up to a cap
// (`--figure-inline`, `--figure-inline-tall` from `lg` up). Only a figure that
// exceeds the cap is cut, and a cut one says so — a fade at the bottom and a
// button that opens it at full size over the page. Nothing is hidden without
// a visible way to see it.
//
// What this deliberately does NOT do:
//   * scroll inside itself — a scroll region nested in a reading flow steals
//     the wheel and loses the reader's place
//   * animate the cap — the cap is layout, and layout that moves while you
//     read is the feedback loop `CLAUDE.md` already paid for once
import { useEffect, useId, useRef, useState } from "react"
import { Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

/**
 * Is the content taller than the box drawing it?
 *
 * Measured, never assumed: the same figure is short on a wide viewport and cut
 * on a phone, and the count of bars is not the height (a label can wrap). A
 * `ResizeObserver` on the inner element covers both the first paint and every
 * reflow after it — including the one the reading-room feature causes when it
 * widens the column.
 */
function useClipped(ref: React.RefObject<HTMLElement | null>) {
  const [clipped, setClipped] = useState(false)
  useEffect(() => {
    const box = ref.current
    if (!box) return
    const read = () => setClipped(box.scrollHeight > box.clientHeight + 1)
    const observer = new ResizeObserver(read)
    observer.observe(box)
    // the child, too: the box's own height is capped, so a figure growing
    // inside it never changes the box and would not fire the observer
    if (box.firstElementChild) observer.observe(box.firstElementChild)
    return () => observer.disconnect()
  }, [ref])
  return clipped
}

export function FigureFrame({
  label,
  caption,
  children,
  className,
}: {
  /** what this is a drawing OF — the dialog's title, and the frame's label */
  label: string
  /** one sentence under the label in the dialog, where there is room for it */
  caption?: string
  children: React.ReactNode
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const clipped = useClipped(box)
  const id = useId()

  return (
    <figure className={cn("flex flex-col gap-1.5", className)} data-figure>
      <div className="flex items-baseline justify-between gap-2">
        <figcaption
          id={id}
          className="text-meta tracking-wide text-dim uppercase"
        >
          {label}
        </figcaption>
        {/* ALWAYS offered, not only when the figure is cut. A reader who wants
            the drawing bigger wants it bigger whether or not it fits — and a
            control that appears and disappears with the viewport is a control
            nobody learns. */}
        <Button
          variant="ghost"
          size="sm"
          // 44px on a phone, back to the compact size where there is a
          // mouse. The touch-floor gate caught this at 28px on
          // subarray-sum-k: a control small enough to miss is a control
          // a reader decides is broken.
          className="-my-1 h-auto min-h-11 gap-1.5 px-2 py-1 text-meta text-muted-foreground lg:min-h-7"
          onClick={() => setOpen(true)}
          aria-label={`${label} — open at full size`}
        >
          <Maximize2 className="size-3" aria-hidden />
          full size
        </Button>
      </div>
      <div
        ref={box}
        data-figure-body
        data-clipped={clipped ? "" : undefined}
        // The cap is a MAX, so a figure shorter than it keeps its own height
        // and nothing is padded to a common size.
        className={cn(
          "max-h-(--figure-inline) overflow-hidden lg:max-h-(--figure-inline-tall)",
          // a cut figure says it is cut: the last rows fade rather than being
          // sliced through, which is the difference between "there is more"
          // and "this component is broken"
          clipped &&
            "[mask-image:linear-gradient(to_bottom,black_calc(100%-3rem),transparent)]"
        )}
      >
        {children}
      </div>
      {clipped && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="self-start text-meta text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          more of this figure — open it full size
        </button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        {/* Nearly the whole viewport, and scrollable, because "full size" has
            to mean the figure is never cut a second time. */}
        <DialogContent className="max-h-[92svh] w-[min(96vw,var(--container-page))] max-w-[96vw] overflow-y-auto sm:max-w-[min(96vw,var(--container-page))]">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            {caption && <DialogDescription>{caption}</DialogDescription>}
          </DialogHeader>
          <div data-figure-full>{children}</div>
        </DialogContent>
      </Dialog>
    </figure>
  )
}
