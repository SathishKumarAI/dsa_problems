// remove-duplicates-sorted — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/remove-duplicates-sorted_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `The principle every step of this problem chases is *phrase the test in terms of the answer you are
building, not the input you are reading*. The question "is this value new?" sounds like it needs
the whole history — every value kept so far, held in a set or re-scanned in a list — and that is
the version that costs either memory or a second loop. Sortedness demolishes it: in a
non-decreasing array all equal values sit in one unbroken run, so a repeat is always shoulder to
shoulder with its twin and the entire history compresses into a single remembered value, *the last
one kept*. The distinct-copy version already exploits that and is linear, but it keeps the answer
somewhere else, paying an array's worth of memory to hold values that already exist a few slots
away in the input. The reader/writer pair cashes that in by noticing that the survivors are always
a prefix of what has been read, so the destination slot is always behind the reader and writing
back can never destroy anything unread: the second array vanishes, the required length falls out
of the writer's final position instead of needing a separate count, and nothing is allocated. The
habit that makes it work is the one that pays a dividend later — because the comparison is written
against \`nums[write - 1]\`, the output's tail, the follow-up that permits two copies of each value
is a change from \`write - 1\` to \`write - 2\` and nothing else, while the version phrased against the
input's neighbour has to be rebuilt from scratch. Test the answer, not the input.

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
      "Build a distinct copy",
      "O(n)",
      "O(n)",
      "Linear and obviously correct, but allocates an array to hold values it already has",
      "The original must stay intact, the input is a stream, or you need a trustworthy oracle"
    ],
    [
      "Reader and writer, in place",
      "O(n)",
      "O(1)",
      "Same single pass, but the answer is written back over the input, so the tail becomes rubbish",
      "Always, when in-place is permitted — the intended answer"
    ]
  ]
}
