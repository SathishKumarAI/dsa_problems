// remove-element — approach 5 — Reader and writer, self-writes skipped
//
// Converted from docs/deep/remove-element_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "optimal",
  title: "Reader and writer, self-writes skipped",
  idea: `*The reader/writer pass is optimal in reads and in allocation — but look at what it writes when
nothing matches.* Before the first copy of \`val\` turns up, the reader and writer sit on the same
index, and every "copy" is \`nums[i] = nums[i]\`: a write that changes nothing. If \`val\` never appears
at all — which the constraints permit and real inputs make common — the loop rewrites the entire
array with the values already sitting there, \`n\` pointless writes. *Can those be skipped?* Yes, with
one comparison: only copy when the cursors have actually parted.`,
  intuition: `Same two walkers, with one extra question asked before each copy: *have we separated yet?* While
the writer is still standing on the same box as the reader, there is nothing to move — the value is
already where it belongs — so just advance. The moment the first match is passed, the cursors part
and every subsequent copy is real. The gap is still exactly the number of matches passed, and it is
now doing double duty: it is both the count of what has been dropped and the flag that says whether
a copy is needed at all.`,
  worked: `Input: \`nums = [0, 1, 2, 2, 3, 0, 4, 2]\`, \`val = 2\`. The array states and the cursor positions are
identical to the previous approach — the only difference is which writes actually happen.

| Step | \`read\` (value) | \`write\` before | \`read == write\`? | Action | Array after | Gap |
|---|---|---|---|---|---|---|
| 1 | 0 (\`0\`) | 0 | yes | survivor, **no copy needed**, write → 1 | \`[0, 1, 2, 2, 3, 0, 4, 2]\` | 0 |
| 2 | 1 (\`1\`) | 1 | yes | survivor, **no copy needed**, write → 2 | \`[0, 1, 2, 2, 3, 0, 4, 2]\` | 0 |
| 3 | 2 (\`2\`) | 2 | — | match → skip; cursors now part | unchanged | 1 |
| 4 | 3 (\`2\`) | 2 | — | match → skip | unchanged | 2 |
| 5 | 4 (\`3\`) | 2 | no | copy \`nums[2] = 3\`, write → 3 | \`[0, 1, 3, 2, 3, 0, 4, 2]\` | 2 |
| 6 | 5 (\`0\`) | 3 | no | copy \`nums[3] = 0\`, write → 4 | \`[0, 1, 3, 0, 3, 0, 4, 2]\` | 2 |
| 7 | 6 (\`4\`) | 4 | no | copy \`nums[4] = 4\`, write → 5 | \`[0, 1, 3, 0, 4, 0, 4, 2]\` | 2 |
| 8 | 7 (\`2\`) | 5 | — | match → skip | unchanged | 3 |

Same answer, \`[0, 1, 3, 0, 4]\`, \`k = 5\` — but **three** writes instead of five. Steps 1 and 2 became
free. On the "nothing to remove" input, \`nums = [1, 2, 3]\` with \`val = 50\`, the difference is total:
the previous rung performs three writes, this one performs none and the pass degenerates into a pure
scan.`,
  code: `def remove_element_skip_self_write(nums: list[int], val: int) -> list[int]:
    write = 0
    for read in range(len(nums)):
        if nums[read] != val:
            if read != write:  # the pointers have not parted yet: nothing to move
                nums[write] = nums[read]
            write += 1
    return nums[:write]`,
  mistake: `Putting the \`write += 1\` inside the \`if read != write\` block. Then the writer only advances when a
copy actually happened, which means it never advances at all until the first match — so it stays at
0 through the whole prefix, and the moment the cursors are supposed to part they instead collapse:
every later survivor is written to index 0, and \`k\` comes back as the number of survivors *after*
the first match rather than the total. On the worked example it returns \`k = 3\` and a prefix of
\`[4]\`-ish garbage. The guard governs **the copy only**; the writer's advance belongs to the outer
\`if\`, because it means "a survivor has been placed", and a survivor that was already in the right
place has still been placed.

The second one is cosmetic but worth naming: writing the guard as \`if nums[read] != nums[write]\`
instead of \`if read != write\`. Comparing values rather than positions skips a copy whenever the two
cells happen to hold equal values, which on an array like \`[5, 2, 5]\` with \`val = 2\` skips a copy
that was genuinely needed. The question is "are these the same cell?", not "do these cells look
alike?".`,
  cost: `**Time O(n), space O(1).** Asymptotically identical to the previous rung: one pass, one comparison
per element. What changes is the constant — the number of writes drops from *(number of survivors)*
to *(number of survivors that appear after the first removal)*, which on the very common "\`val\` is
not present" input is zero. Space is two integers.

Take it whenever writes are more expensive than reads, which is more often than it sounds: memory
pages that would be dirtied for nothing, a copy-on-write buffer, a value type with a costly
assignment, or an array in a cache you would rather not invalidate. It costs one integer comparison
per survivor to find out. When writes are cheap and the code will be read more often than run, the
previous rung's plainer loop is the better trade — this is a constant-factor refinement, not a new
idea, and it should be labelled as one.

---`,
}
