// `cn` — clsx to build the class list, tailwind-merge to resolve conflicts.
//
// The scale in `index.css` is six NAMED steps (`text-meta` … `text-display`),
// and tailwind-merge cannot tell a named font size from a named colour: both
// are `text-<word>`. Left to itself it files `text-meta` under colour, so
// `cn("text-display", "text-chart-3")` returned `text-chart-3` alone and the
// size was silently deleted. Measured 2026-09-09: the bars in the algorithm
// visualizer rendered at 16px inheriting, not the 12px the class asked for,
// and the answer panel's `text-display` never applied at all.
//
// Teaching the merger the six names fixes every such call at once, and is why
// the sub-scale `text-[10px]` literals could be removed rather than moved.
import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["meta", "ui", "body", "narration", "title", "display"] },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
