// The one way to jump to an in-page anchor, so the landing is right everywhere.
//
// Owns: starting the scroll, and correcting where it ends. Owns nothing about
// WHICH id — the rail, the sections sheet, the ladder's nav, the climb and the
// page's own jumps each still decide that.
//
// Why a correction is needed at all. Scrolling down is the reading gesture, and
// `use-reading-room.ts` answers it by hiding the chrome — which widens the
// column, which reflows every paragraph above the target, which moves the
// target UP while the browser is still animating toward where it WAS. Measured
// on container-water at 1440, clicking the rail's second "Code": the column
// went 1174 → 1382px, the heading's document offset 9642 → 9471, and the
// browser stopped where it had been told to — with the heading 148px above the
// top of the viewport. Native scroll anchoring does not help here: it holds
// what is on screen through a reflow, and during a programmatic smooth scroll
// nothing is being held.
//
// So: scroll smoothly, and when the browser says the scroll is over, place the
// target once more — instantly, so there is no second animation to be caught
// out by — against the layout as it stands now.
//
// That correction moves the page UP, by more than the reading room's commit
// distance, and the first cut of it was read as the reader turning round: the
// chrome came back, the column narrowed, the heading moved DOWN — landed at
// 195px. `NOT_A_GESTURE` tells the hook the movement is ours.
//
// `scrollend` does not fire when nothing moved. Without the timer below the
// listener would sit armed until the READER's next scroll ended, then yank
// them back to an anchor they had long since left. A scroll that is going to
// happen emits `scroll` on its first frame, so 300ms of silence means it is
// not going to.
import { NOT_A_GESTURE } from "@/lib/use-reading-room"

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: "smooth", block: "start" })
  const land = () => {
    window.dispatchEvent(new Event(NOT_A_GESTURE))
    el.scrollIntoView({ behavior: "instant", block: "start" })
  }
  addEventListener("scrollend", land, { once: true })
  const idle = setTimeout(() => removeEventListener("scrollend", land), 300)
  addEventListener("scroll", () => clearTimeout(idle), { once: true })
}
