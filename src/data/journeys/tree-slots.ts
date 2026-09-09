// Level-order slots: the one way a tree arrives at a derived journey.
//
// A tree is a row of tokens read as full heap indexing — the node at i has
// children at 2i+1 and 2i+2 — with "." for an absent node, which is the
// notation the problems' own examples use ([3, 9, 20, null, null, 15, 7]).
// The row IS the drawing, so nothing is laid out by hand, and a binary heap
// uses the same view unchanged.
//
// Owns the token vocabulary and the walks every tree journey needs. Owns no
// frames and no narration: those belong to the journey.

import type { ChipRole } from "../../engine/types.ts"

export const GAP = "."

/** Is there a node in slot i? */
export const present = (slots: string[], i: number) =>
  i >= 0 && i < slots.length && slots[i] !== GAP

/** Level-order tokens → the slot array the tree view draws. */
export const asSlots = (nums: string[]) =>
  nums.map((v) => (v === GAP ? null : (Number(v) as number | string)))

/** A node may not hang off an absent parent, and every token is a number. */
export const wellFormed = (nums: string[]) => {
  if (!nums.every((v) => v === GAP || Number.isInteger(Number(v)))) return false
  for (let i = 1; i < nums.length; i++)
    if (nums[i] !== GAP && nums[Math.floor((i - 1) / 2)] === GAP) return false
  return true
}

/** The slots holding a node, in level order — i.e. the real nodes. */
export const liveSlots = (nums: string[]) =>
  nums.map((_, i) => i).filter((i) => present(nums, i))

/** Slot indices grouped by depth, top to bottom and left to right within a row. */
export function levelsOf(nums: string[]) {
  const out: number[][] = []
  let row = present(nums, 0) ? [0] : []
  while (row.length) {
    out.push(row)
    row = row.flatMap((i) =>
      [2 * i + 1, 2 * i + 2].filter((c) => present(nums, c))
    )
  }
  return out
}

/** Marks for the tree view, built from a per-slot decision. */
export const marksOf = (
  n: number,
  pick: (i: number) => ChipRole | undefined
) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < n; i++) {
    const r = pick(i)
    if (r) marks[i] = r
  }
  return marks
}
