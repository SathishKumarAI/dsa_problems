// Chrome that gets out of the way while you read, and comes back when you
// look for it.
//
// The problem page is a long document with navigation on both sides of it: the
// app sidebar at 256px on the left, the contents rail at 288px on the right.
// Both are how you MOVE, and neither is anything you need while you are
// reading a paragraph — but they cost 544px of a 1440px screen for the entire
// length of the page, and the reader had no way to say "not now" except two
// deliberate clicks they then had to undo.
//
// The gesture people already make says it for them. Scrolling DOWN is reading;
// scrolling UP is looking for something. So down hides the chrome and up
// brings it back, which means the controls appear exactly when a hand is
// already moving toward them.
//
// WHY THIS IS NOT ON UNDER `prefers-reduced-motion`. Both columns animate their
// width, and the reduced-motion override in `index.css` zeroes every duration
// app-wide — so with it on, this feature is not a calm slide but the reading
// column teleporting sideways every time the scroll direction changes. A
// motion feature whose whole value is the animation is switched OFF rather
// than shipped without it.
import { useEffect, useRef, useState } from "react"

/** below this, chrome is always shown: the top of a page is where you orient */
const TOP_ZONE = 120

// HYSTERESIS, AND IT IS THE WHOLE DIFFERENCE BETWEEN THIS HELPING AND HURTING.
//
// The first cut flipped on any 8px movement, which is not a gesture — it is a
// trackpad settling, or the small nudge UP that a reader makes to re-read the
// line they just finished. Reading a hard paragraph is down, up, down, up, and
// every one of those flips brought the chrome back and sent it away again.
// Measured on the pilot: each flip moved the text 32px sideways and rewrapped
// it. The feature was moving the line the reader was looking at, which is a
// worse crime than the clutter it was removing.
//
// So direction is not read per event. Movement ACCUMULATES in one direction and
// only a sustained run counts — a good half-screen down to commit to reading,
// and a shorter but still deliberate run up to ask for the controls back.
// Asymmetric on purpose: getting chrome back must feel immediate, losing it
// must feel earned. A re-read nudge now does exactly nothing.
const COMMIT_DOWN = 140
const COMMIT_UP = 90

export interface ReadingRoom {
  /** true while the reader is moving DOWN through the document */
  reading: boolean
  /** put the chrome back — for a control that was just asked to open */
  reveal: () => void
}

/**
 * Whether the reader is moving down the page.
 *
 * Deliberately NOT a scroll position. Position tells you where you are, which
 * says nothing about what you want; direction is the intent, and it is the
 * only thing either caller acts on.
 */
export function useReadingRoom(enabled = true): ReadingRoom {
  const [reading, setReading] = useState(false)
  const last = useRef(0)
  // the listener reads this to avoid re-subscribing on every state flip
  const now = useRef(false)

  useEffect(() => {
    if (!enabled) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    last.current = window.scrollY
    let queued = false
    // how far the reader has travelled in the CURRENT direction, reset the
    // moment they turn round
    let run = 0

    const measure = () => {
      queued = false
      const y = window.scrollY
      const dy = y - last.current
      last.current = y
      if (dy === 0) return

      // The top zone wins over everything. Without it, arriving at a page
      // mid-gesture — a browser restoring a scroll position, an anchor jump —
      // can leave the chrome hidden at the very top, where the only thing a
      // reader wants IS the chrome.
      if (y <= TOP_ZONE) {
        run = 0
        if (now.current) {
          now.current = false
          setReading(false)
        }
        return
      }

      // turning round starts the run over, so a nudge never adds to the
      // travel that came before it
      run = Math.sign(run) === Math.sign(dy) ? run + dy : dy
      const next = run > COMMIT_DOWN ? true : run < -COMMIT_UP ? false : null
      if (next !== null && next !== now.current) {
        now.current = next
        run = 0
        setReading(next)
      }
    }

    // rAF, not the scroll event: a trackpad fires scroll far faster than the
    // screen refreshes, and this reads layout. Passive, because nothing here
    // ever calls preventDefault and a non-passive listener blocks the scroll
    // it is measuring.
    const onScroll = () => {
      if (queued) return
      queued = true
      requestAnimationFrame(measure)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [enabled])

  // A control that was just asked to OPEN must win over the gesture. Without
  // this, clicking the sidebar trigger mid-scroll opens a sidebar that this
  // hook is still holding shut, and the button reads as broken.
  const reveal = () => {
    now.current = false
    last.current = window.scrollY
    setReading(false)
  }

  return { reading: enabled && reading, reveal }
}
