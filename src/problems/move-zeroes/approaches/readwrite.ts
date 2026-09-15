// move-zeroes — approach 2 — A reader and a writer (optimal)
//
// Converted from docs/deep/move-zeroes_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "readwrite",
  title: "A reader and a writer (optimal)",
  idea: `*The copy exists only so that kept values can be laid down consecutively from the front — but the
front of the original array is being freed up as I walk past it. Can I lay them down there
instead?* Yes. Use two indices on the same array: a **reader** that visits every position in turn,
and a **writer** that marks where the next kept value belongs. Whenever the reader finds a non-zero
value, write it at the writer's position and advance the writer. When the reader finishes, fill
everything from the writer to the end with zeroes. This fixes the previous approach's exact
weakness — the allocated helper list and the copy-back pass — by making the destination be the
array itself.

The one thing that makes it safe is not obvious and is worth stating explicitly: **the writer can
never get ahead of the reader.** The writer advances only when the reader advances *and* the value
was kept, so it moves at most as fast, which means every slot the writer overwrites has already
been read. No data is ever destroyed before it is used.`,
  intuition: `A reader and a writer walking the same row of boxes at different speeds. The reader looks in every
box. The writer trails behind and only steps forward when the reader hands it something worth
keeping. The gap between them is exactly the number of zeroes the reader has walked past so far —
so if the reader has seen three zeroes, the writer is three boxes back, and the next kept value goes
three boxes earlier than where it was found. When the reader falls off the end, the writer is
standing at the boundary: everything behind it is the answer's front half, everything from it
onward is the space the zeroes have to fill.`,
  worked: `Input: \`nums = [0, 1, 0, 3, 12]\` — the same array approach 1 rebuilt.

**Pass one — compact the kept values forward:**

| \`read\` | Value | Action | \`write\` after | Array state |
|---|---|---|---|---|
| start | — | — | 0 | \`[0, 1, 0, 3, 12]\` |
| 0 | \`0\` | zero — skip; writer stays at 0 | 0 | \`[0, 1, 0, 3, 12]\` |
| 1 | \`1\` | write \`1\` at index 0; writer advances | 1 | \`[1, 1, 0, 3, 12]\` |
| 2 | \`0\` | zero — skip; writer stays at 1 | 1 | \`[1, 1, 0, 3, 12]\` |
| 3 | \`3\` | write \`3\` at index 1; writer advances | 2 | \`[1, 3, 0, 3, 12]\` |
| 4 | \`12\` | write \`12\` at index 2; writer advances | 3 | \`[1, 3, 12, 3, 12]\` |

**Pass two — zero-fill the tail from \`write = 3\` onward:**

| Write | Array state |
|---|---|
| \`nums[3] = 0\` | \`[1, 3, 12, 0, 12]\` |
| \`nums[4] = 0\` | \`[1, 3, 12, 0, 0]\` |

Five reads, three writes in the first pass, two in the second — and not a single byte allocated. The
gap is visible at every row: after \`read = 2\` the reader has passed two zeroes and the writer is
exactly two positions behind it.

Look at the state after \`read = 4\`: \`[1, 3, 12, 3, 12]\`. The invariant says indices \`0..2\` are the
kept values in order — \`1, 3, 12\` ✓ — and says nothing at all about indices \`3\` and \`4\`, which hold
leftovers. The second pass overwrites precisely that undefined region.`,
  code: `def move_zeroes_read_write(nums: list[int]) -> list[int]:
    write = 0
    for read in range(len(nums)):
        if nums[read] != 0:
            nums[write] = nums[read]
            write += 1
    for i in range(write, len(nums)):  # write now marks the start of the zero tail
        nums[i] = 0
    return nums`,
  mistake: `Forgetting the second loop entirely, or starting it in the wrong place. Without the zero-fill,
\`[0, 1, 0, 3, 12]\` comes back as \`[1, 3, 12, 3, 12]\` — the front is perfect and the tail is the
garbage the invariant deliberately says nothing about. It is an easy omission to make because the
first loop *feels* finished: every kept value is where it belongs.

The variant that is harder to spot is starting the fill at the wrong index, typically
\`range(write + 1, len(nums))\` (off by one, leaving a stale value at index \`write\`) or
\`range(len(nums) - zeros, len(nums))\` with a separately counted \`zeros\`. The second one is correct
but redundant, and redundant bookkeeping is where bugs live: \`write\` *already is* the count of kept
values, so \`n - write\` is already the count of zeroes. The rule to carry: **the writer's final
position is the boundary — do not recompute what the walk already told you.**`,
  cost: `**Time O(n), space O(1).** Two linear passes over the array — the compaction and the zero-fill —
with a constant amount of work at each position, so about n reads and at most n writes. Space is two
integers; nothing is allocated regardless of how large the input is.

This is the version to write by default. It is as fast as anything else, it allocates nothing, and
its structure generalises immediately: change the test \`nums[read] != 0\` to \`nums[read] != val\` and
you have solved \`remove-element\`; change it to \`nums[read] != nums[write - 1]\` and you have solved
\`remove-duplicates-from-sorted-array\`. The skeleton — reader visits everything, writer marks the
frontier of the answer, gap equals the count of discarded items — is one of the most reused shapes
in array work.

---`,
  notes: [
    { title: "the invariant, in prose", body: `Stated in words, because the code is six lines and the reason it works is not visible in them:

**Everything before the writer is a kept value, in order.** At every moment of the loop, indices
\`0 .. write-1\` hold exactly the non-zero values the reader has seen so far, in exactly the order it
saw them — no zeroes among them, none out of sequence, none missing. That single sentence is the
whole correctness argument, and it decomposes into the two things the problem asks for:

- *No zeroes among them* is why the final zero-fill is correct. If every slot before \`write\` is
  guaranteed non-zero, then the zeroes that belong in the answer are exactly the slots from \`write\`
  to the end — and there are exactly the right number of them, because \`write\` counts the kept
  values and \`n - write\` is therefore the count of zeroes.
- *In the order it saw them* is why relative order is preserved. Values are written in strictly
  increasing writer positions, in the order the reader encountered them, so their relative order in
  the output is the order of the reads, which is the order of the input.

Check that the loop preserves it. Before any iteration with \`write = w\`, indices \`0..w-1\` hold the
kept values seen so far. If the reader finds a zero, nothing is written and \`w\` does not change, so
the statement is trivially still true. If the reader finds a non-zero value, that value is written
at index \`w\` — extending the kept run by exactly one, in the correct position — and \`w\` becomes
\`w+1\`, so the statement is true again with the new writer. It holds at the start (\`write = 0\`, and
the claim about indices \`0..-1\` is vacuous), and it survives every step, so it holds when the reader
finishes. At that point \`0..write-1\` is the complete list of kept values in order, and the tail is
free.

The half of the invariant that the code does *not* maintain is worth naming too, because it is what
makes people uneasy the first time they read this: **the region from \`write\` to \`read\` is garbage.**
Those slots hold stale copies of values that have already been written to their proper homes. The
worked example below shows the array passing through \`[1, 3, 12, 3, 12]\` — a state in which \`3\` and
\`12\` each appear twice. That is not a bug; those duplicates are in the doomed region, and the
zero-fill pass is what collects them.` },
  ],
}
