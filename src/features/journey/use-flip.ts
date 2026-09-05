// FLIP morph for keyed elements: after every commit, elements with a data-k
// that moved animate from their previous box; newcomers scale-fade in. This
// is what makes a re-render feel like motion instead of teleporting —
// states morph, they don't blink. Honors prefers-reduced-motion and the
// motion preference. Owns nothing about what the elements are.

import { useLayoutEffect, useRef } from "react"
import type { RefObject } from "react"
import { usePrefs } from "@/lib/store"

const SCALE = { calm: 0.6, normal: 1, cinematic: 1.8, off: 0 }

export function useFlip(
  ref: RefObject<HTMLElement | null>,
  dep: unknown,
  stepDelay = 1100
) {
  const prev = useRef(new Map<string, DOMRect>())
  const { motion } = usePrefs()

  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return
    const els = root.querySelectorAll<HTMLElement>("[data-k]")
    const now = new Map<string, DOMRect>()
    els.forEach((el) => now.set(el.dataset.k!, el.getBoundingClientRect()))
    const before = prev.current
    prev.current = now

    const reduce =
      typeof matchMedia === "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches
    const scale = reduce ? 0 : SCALE[motion]
    if (!scale || !Element.prototype.animate) return
    const duration = Math.max(80, Math.min(280, stepDelay * 0.4)) * scale

    els.forEach((el) => {
      const k = el.dataset.k!
      const to = now.get(k)!
      const from = before.get(k)
      if (!from) {
        el.animate(
          [
            { opacity: 0, transform: "scale(0.6)" },
            { opacity: 1, transform: "none" },
          ],
          { duration, easing: "ease-out" }
        )
        return
      }
      const dx = from.left - to.left
      const dy = from.top - to.top
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return
      el.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }],
        { duration, easing: "cubic-bezier(.2,.7,.2,1)" }
      )
    })
  }, [ref, dep, motion, stepDelay])
}
