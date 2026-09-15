// rotate-array — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/rotate-array_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `Every step on this ladder chases one principle: **a value's destination never depended on the path it
took to get there, so stop moving it along that path.** The instinctive solution rotates by one, \`k\`
times, which is correct by pure composition and needs no insight at all — and it drags the value
belonging in slot 6 through slots 0 to 5 on the way, spending \`n · k\` writes to accomplish \`n\`
placements. The first real idea is that \`(i + k) % n\` names the destination outright, so a single
pass into a blank array places everything with no interference, because a blank array has no
occupants to displace; that is linear, and its entire cost is the blank array. Then comes a shift in
how the operation is *described* rather than computed: a rotation is not \`n\` independent address
calculations, it is two solid blocks trading places, and saying it that way both removes the
per-element arithmetic and puts the direction where a reader can see it instead of hiding it in a
modulo that can be written backwards without looking wrong. Both of those allocate, though, and the
follow-up forbids it — so the next move attacks the reason the copy was needed at all, which is that
a value has nowhere to go when its destination is occupied. Carry the displaced value with you and
one spare variable replaces the entire array; each chain closes back where it began, and the array is
rearranged with exactly one write per value, which is optimal. That rung also teaches what every
other rung hides: stepping by \`k\` around a ring of \`n\` does not necessarily visit everything, it
visits one of \`gcd(n, k)\` disjoint cycles, so the walk must be restarted — and a version trusting a
single chain silently leaves most of the array untouched on exactly the inputs nobody tests by hand.
Counting moves is the fix, and counting is also what gets written wrong under pressure, which is what
the last rung removes: return to the two-block description, and observe that reversing the whole
array puts both blocks on the correct side while damaging each one in a way that reversing it again
repairs. Three applications of one primitive, no counter, no \`gcd\`, no allocation. Shift repeatedly,
address directly, describe as blocks, follow the cycles, reverse three times — and running underneath
all five, the reduction that is not a detail: rotating by \`n\` changes nothing, so \`k % n\` is the real
rotation, and a version that skips it spins through pointless turns, returns the input unchanged, or
indexes off the end, depending only on which rung you happened to be standing on.

---`

export const comparison: Comparison = {
  "head": [
    "Approach",
    "Time",
    "Space",
    "Core trade-off",
    "Best used when"
  ],
  "rows": [
    [
      "One step at a time",
      "`O(n · k)`",
      "`O(1)`",
      "Needs no insight and no index arithmetic; pays by moving every value through every slot",
      "`k` is 1 or 2; as the baseline you name and reject"
    ],
    [
      "Copy into a second array",
      "`O(n)`",
      "`O(n)`",
      "Each destination computed directly, but it needs a blank array to write into",
      "A new array may be returned; the permutation is arbitrary, not a rotation"
    ],
    [
      "Cut and rejoin",
      "`O(n)`",
      "`O(n)`",
      "Says what a rotation *is*, so the direction is visible; still allocates both blocks",
      "Production code in a language with slices; clarity over memory"
    ],
    [
      "Cyclic replacements",
      "`O(n)`",
      "`O(1)`",
      "In place with exactly one write per value; you must count moves, because there are `gcd(n, k)` chains",
      "Writes are the bottleneck; the permutation is a bijection but not a rotation"
    ],
    [
      "**Three reversals**",
      "`O(n)`",
      "`O(1)`",
      "In place with one primitive applied three times; ~2 writes per value instead of 1",
      "The answer to the in-place follow-up, and the one to memorize"
    ]
  ]
}
