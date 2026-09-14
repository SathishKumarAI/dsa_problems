// Which lines of two rungs' code actually differ.
//
// Owns the comparison and nothing else: no markup, no language choice, no
// selection state. `approach-compare.tsx` renders what this returns.
//
// The point of the comparator is that two approaches to one problem usually
// share their opening and their answer and differ only in the middle — the
// visited set and Floyd's pair agree on `def has_cycle(head) -> bool:` and on
// `return True`, and disagree about everything between. Printing two whole
// snippets makes the reader find that themselves; marking it is the feature.
//
// ponytail: multiset membership, not an LCS. A line is "shared" when the other
// side has one like it left over, so a line that MOVED reads as shared rather
// than as a delete plus an insert — which is the right answer for reading two
// sibling algorithms, and the wrong one for reviewing an edit. If this is ever
// pointed at two versions of the SAME function, swap in a real LCS diff.

/** a line's comparison form: leading indent is layout, trailing space is noise */
const norm = (s: string) => s.trim()

/**
 * `true` at index i = line i of `a` has no counterpart left in `b`, so it is
 * part of what makes this rung different. Blank lines are never marked: an
 * extra blank is spacing, not an idea.
 */
export function differingLines(a: string, b: string): boolean[] {
  const left = a.split("\n")
  const pool = new Map<string, number>()
  for (const line of b.split("\n")) {
    const k = norm(line)
    pool.set(k, (pool.get(k) ?? 0) + 1)
  }
  return left.map((line) => {
    const k = norm(line)
    if (!k) return false
    const left_ = pool.get(k) ?? 0
    if (left_ > 0) {
      pool.set(k, left_ - 1)
      return false
    }
    return true
  })
}

/** how much of `a` is unique to it, 0–1 — the headline the comparator quotes */
export function divergence(a: string, b: string): number {
  const marks = differingLines(a, b).filter((_, i) => a.split("\n")[i].trim())
  return marks.length ? marks.filter(Boolean).length / marks.length : 0
}
