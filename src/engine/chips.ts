// Chip-row builder shared by every act's view(). Owns the mapping from index
// sets to ChipModel roles and the stable keys the UI morphs on.

import type { ChipModel, ChipRole } from "./types.ts"

export interface ChipOpts {
  focus?: Iterable<number>
  anchor?: Iterable<number>
  dim?: Iterable<number>
  answer?: Iterable<number>
  subs?: string[] | null // subscript per chip, e.g. original index after a sort
}

export function chipRow(
  values: (number | string)[],
  opts: ChipOpts = {}
): ChipModel[] {
  const focus = new Set(opts.focus ?? [])
  const anchor = new Set(opts.anchor ?? [])
  const dim = new Set(opts.dim ?? [])
  const answer = new Set(opts.answer ?? [])
  return values.map((value, i) => {
    const roles: ChipRole[] = []
    if (dim.has(i)) roles.push("dim")
    if (anchor.has(i)) roles.push("anchor")
    if (focus.has(i)) roles.push("focus")
    if (answer.has(i)) roles.push("answer")
    // sorted views key by their subscript so a chip keeps identity across the sort
    const key = opts.subs ? "s" + opts.subs[i] : "i" + i
    return { key, value, sub: opts.subs?.[i], roles }
  })
}

export const range = (n: number) => Array.from({ length: n }, (_, i) => i)
