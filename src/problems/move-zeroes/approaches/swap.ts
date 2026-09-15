// move-zeroes — approach 3 — The same walk, swapping instead of writing
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
  rung: "swap",
  title: "The same walk, swapping instead of writing",
  idea: `*The two-pass version writes every kept value forward and then goes back to fill the tail with
zeroes. But the slot the kept value came from is now free, and I know exactly what belongs there —
a zero, because that is what was sitting at the writer's position. Can I put it back in the same
move?* Yes: instead of copying \`nums[read]\` to \`nums[write]\`, **swap** them. The zero that was
waiting at the writer's position travels out to the reader's position, which is where a zero
belongs. When the reader finishes, the tail is already all zeroes and the second pass disappears.

This is not a complexity improvement — it is the same O(n)/O(1) walk, and it fixes nothing the
previous approach got wrong. What it changes is the *number of writes*, and it is included because
the trade-off runs in an interesting direction.`,
  intuition: `Same reader and writer, same row of boxes, but now they trade rather than copy. Every time the
reader finds something worth keeping, the two of them exchange box contents: the kept value moves
back to the writer's box, and whatever was in the writer's box — always a zero, or the value itself
when the two are standing on the same box — moves out to the reader's. Nothing is ever destroyed,
so there is no tail left to clean up afterwards. The invariant is the same one as before, with a
stronger second half: everything before the writer is a kept value in order, **and everything from
the writer to the reader is a zero.**`,
  worked: `Input: \`nums = [0, 1, 0, 3, 12]\` — the same array once more.

| \`read\` | Action | \`write\` after | Array state |
|---|---|---|---|
| start | — | 0 | \`[0, 1, 0, 3, 12]\` |
| 0 | value is \`0\` — skip; writer stays at 0 | 0 | \`[0, 1, 0, 3, 12]\` |
| 1 | swap indices 1 and 0; writer advances | 1 | \`[1, 0, 0, 3, 12]\` |
| 2 | value is \`0\` — skip; writer stays at 1 | 1 | \`[1, 0, 0, 3, 12]\` |
| 3 | swap indices 3 and 1; writer advances | 2 | \`[1, 3, 0, 0, 12]\` |
| 4 | swap indices 4 and 2; writer advances | 3 | \`[1, 3, 12, 0, 0]\` |

One pass, five reads, three swaps, and the array is finished the moment the reader falls off the
end — no second loop. Compare row by row with approach 2: that version passed through the
intermediate state \`[1, 3, 12, 3, 12]\` and needed a cleanup pass; this one is a valid answer at
every step where the reader has consumed a prefix.

Counting actual writes for this input: approach 2 does 3 writes then 2 more in the fill = 5.
Approach 3 does 3 swaps = 6 writes. On this input the swap version is *worse*. Now count for
\`[1, 2, 3, 4, 0]\`, where zeroes are rare: approach 2 does 4 forward writes (each of them a value
written to the slot it already occupies) plus 1 fill = 5; approach 3 does 4 swaps = 8 writes, all of
them self-swaps. And for \`[0, 0, 0, 0, 1]\`, where zeroes dominate: approach 2 does 1 write plus 4
fills = 5; approach 3 does 1 swap = 2 writes. **The swap version wins when zeroes are common and
loses when they are rare** — the opposite of what the "one pass beats two passes" framing suggests,
because the two-pass version's fill loop is bounded by the number of zeroes while its first loop
writes on every kept element.`,
  code: `def move_zeroes_swap(nums: list[int]) -> list[int]:
    write = 0
    for read in range(len(nums)):
        if nums[read] != 0:
            nums[write], nums[read] = nums[read], nums[write]  # the zero goes back to read
            write += 1
    return nums`,
  mistake: `Reaching for the swap as a way to move *zeroes* rather than kept values — the version that, on
finding a zero, swaps it with the element at the end of the array and shrinks the end:

\`\`\`python
end = len(nums) - 1
read = 0
while read <= end:
    if nums[read] == 0:
        nums[read], nums[end] = nums[end], nums[read]   # WRONG: destroys relative order
        end -= 1
    else:
        read += 1
\`\`\`

It does put all the zeroes at the back. It also scrambles everything else: on \`[0, 1, 0, 3, 12]\` it
returns \`[12, 1, 3, 0, 0]\`, because the \`12\` was teleported from the end of the array to the front.
This is the exact trap the "keep the relative order" constraint exists to set. A swap is only safe
here when the two indices are the reader and the writer, because that pair moves strictly forward
and never jumps a kept value over another kept value.`,
  cost: `**Time O(n), space O(1).** One linear pass with a constant amount of work per element. The
asymptotic cost is identical to approach 2; the constant differs, and as the worked example counted,
it differs in both directions depending on the input: at most \`n\` writes when zeroes dominate, up to
\`2n\` when they are rare (every kept value is swapped with itself).

Use it when zeroes are known to be common — the swap does one exchange per *kept* element and no
cleanup, so an array that is mostly zeroes costs almost nothing — or when the single-pass structure
matters for some other reason, such as streaming the array through a cache exactly once. Prefer
approach 2 when zeroes are rare or unknown, and when you want the version whose two halves can each
be read and verified on their own. In an interview either is a complete answer; being able to say
*why* you would pick one over the other is the part that is actually being assessed.

---`,
}
