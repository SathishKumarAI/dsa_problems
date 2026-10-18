// The one way to jump to an in-page anchor, so the landing is right everywhere.
//
// Owns: starting the scroll, and correcting where it ends. Owns nothing about
// WHICH id — the rail, the sections sheet, the ladder's nav, the climb and the
// page's own jumps each still decide that.
//
// Why a correction is needed at all. A jump reflows the page it is jumping
// through — a section opening, an image settling, a code block measuring itself
// — which moves the target while the browser is still animating toward where it
// WAS. Measured on container-water at 1440 under the old chrome-hiding gesture:
// the heading's document offset went 9642 → 9471 and the browser stopped where
// it had been told to, leaving the heading 148px ABOVE the viewport. Native
// scroll anchoring does not help: it holds what is on screen through a reflow,
// and during a programmatic smooth scroll nothing is being held.
//
// So: scroll smoothly, and when the browser says the scroll is over, place the
// target once more — instantly, so there is no second animation to be caught
// out by — against the layout as it stands now.
//
// `scrollend` does not fire when nothing moved. Without the timer below the
// listener would sit armed until the READER's next scroll ended, then yank
// them back to an anchor they had long since left. A scroll that is going to
// happen emits `scroll` on its first frame, so 300ms of silence means it is
// not going to.

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: "smooth", block: "start" })
  const land = () => el.scrollIntoView({ behavior: "instant", block: "start" })
  addEventListener("scrollend", land, { once: true })
  const idle = setTimeout(() => removeEventListener("scrollend", land), 300)
  addEventListener("scroll", () => clearTimeout(idle), { once: true })
}
