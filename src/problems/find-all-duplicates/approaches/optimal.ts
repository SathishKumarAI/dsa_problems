// find-all-duplicates — approach 5 — Encode the flag in the sign, in place.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "optimal",
  title: "Encode the flag in the sign, in place",
  idea: `*The flag table has exactly n+1 slots and the input has exactly n. Both are indexed by the same
values. Why are there two of them?* Because a \`True\`/\`False\` needs somewhere to live — but each
number in the input already has an unused bit: its sign. Every value is positive, so a negative
number at slot \`v - 1\` can mean "the value v has been seen", while the magnitude still holds the
original number. This fixes the flag table's weakness, the fresh allocation, and drops the extra
space to O(1). The price is that the input is destroyed.`,
  intuition: `Same row of pigeonholes as before, except now you are writing the tokens *on the array itself*. To
record "I have seen the value v", walk to slot v−1 and flip that number negative. The number living
there is not lost: minus seven is still a seven, you just have to read it with an absolute value. So
every number in the array carries two independent pieces of information at once — its magnitude is
the original data, its sign is a flag about a *different* value. When you arrive at a slot whose
number is already negative, some earlier element claimed it, and the value you are holding is the
second copy.

The one thing that trips people up: the cursor may walk onto a slot that an earlier step already
negated. That is expected, not a bug — take the absolute value first and the original number comes
straight back.`,
  worked: `Input: \`nums = [4, 3, 2, 7, 8, 2, 3, 1]\`. This is the real trace, with the array's state shown after
every mutation.

| i | value read (\`nums[i]\`) | magnitude \`v\` | target slot \`v−1\` | what was there | action | array after |
|---|---|---|---|---|---|---|
| 0 | 4 | 4 | 3 | 7 (positive) | negate slot 3 | \`[4, 3, 2, -7, 8, 2, 3, 1]\` |
| 1 | 3 | 3 | 2 | 2 (positive) | negate slot 2 | \`[4, 3, -2, -7, 8, 2, 3, 1]\` |
| 2 | **−2** | 2 | 1 | 3 (positive) | negate slot 1 | \`[4, -3, -2, -7, 8, 2, 3, 1]\` |
| 3 | **−7** | 7 | 6 | 3 (positive) | negate slot 6 | \`[4, -3, -2, -7, 8, 2, -3, 1]\` |
| 4 | 8 | 8 | 7 | 1 (positive) | negate slot 7 | \`[4, -3, -2, -7, 8, 2, -3, -1]\` |
| 5 | 2 | 2 | 1 | **−3 (negative)** | duplicate → collect \`2\` | unchanged |
| 6 | **−3** | 3 | 2 | **−2 (negative)** | duplicate → collect \`3\` | unchanged |
| 7 | **−1** | 1 | 0 | 4 (positive) | negate slot 0 | \`[-4, -3, -2, -7, 8, 2, -3, -1]\` |

Answer \`[2, 3]\`. Look at rows 2, 3, 6 and 7: the cursor read a number a *previous* step had already
flipped. \`abs()\` recovered 2, 7, 3 and 1 exactly, which is the whole reason the trick works. The
array left behind is garbage to the caller — six of eight signs flipped — and the answer cost one
integer of extra state.`,
  code: `def find_all_duplicates_sign_flip(nums: list[int]) -> list[int]:
    """Destroys nums: every visited slot is negated."""
    out: list[int] = []
    for x in nums:
        at = abs(x) - 1  # the magnitude survives the marking, so read it back with abs
        if nums[at] < 0:
            out.append(abs(x))
        else:
            nums[at] = -nums[at]
    return out`,
  mistake: `Writing \`at = x - 1\` instead of \`at = abs(x) - 1\`. On the first few elements this looks fine, because
nothing has been flipped yet — and then the cursor walks onto a slot an earlier step negated, \`x\` is
\`-2\`, and \`at\` becomes \`-3\`. Python does not complain: index −3 is a legal index counted from the end
of the list. The code cheerfully flips the wrong slot, and the answer is wrong on some inputs and
right on others depending on where the collisions land. In C or Java the same bug is an
out-of-bounds access and at least announces itself.

The mirror-image mistake is appending \`x\` instead of \`abs(x)\` to the answer. When a duplicate happens
to be read from a slot that was already flipped, you report \`-3\` instead of \`3\`.`,
  cost: `**Time O(n), space O(1).** One pass over n elements with a constant amount of work at each step — one
absolute value, one array read, at most one array write. The only extra memory is the loop variable;
the answer list is required output, not bookkeeping.

Use it when the O(1)-space follow-up is actually being asked, when the array is large enough that a
second n-sized allocation matters (memory bandwidth, an embedded target, a hot inner loop), and when
you have either confirmed the caller is done with the array or you are prepared to repair it
afterwards. Do not reach for it as a default just because it is the cleverest thing in the file — the
flag table is the same asymptotic cost, is easier to read, and is safe.

---`,
  notes: [
    { title: "the cost of mutation — who it hurts, and can it be undone", body: `This rung and the flag table produce the same answer at the same asymptotic speed. The only
difference is that this one writes over the caller's data, so the difference is not about the
algorithm, it is about the contract.

Who gets hurt:

- **A caller that still needs the array.** If it is a field on an object, a slice of a larger buffer,
  or something used again three lines later, it has been silently corrupted. Nothing throws; the next
  reader just sees negative numbers where the data used to be.
- **A concurrent reader.** If any other thread can see this array, this function is a data race and a
  correctness bug regardless of locking discipline, because it writes to nearly every slot. The
  flag-table version is safe to run from ten threads at once on the same input; this one is not.
- **A shared, cached, or memory-mapped array.** Writing may be genuinely illegal (a read-only mapping
  faults) or expensive (a copy-on-write page is now dirty).

**Can it be undone?** Yes, and cheaply. The transformation here is *pure sign flipping*, and flipping
a sign twice restores the number, so one extra pass — \`for i in range(len(nums)): nums[i] =
abs(nums[i])\` — restores the array exactly, because the input was promised to be all positive to
begin with. That adds O(n) time and keeps O(1) space. If the caller needs their array back, the
honest version is: do the work, then repair.

What matters is *what kind* of mutation it is. Nothing here is ever moved — only signs change — so
the positions, and therefore the order, survive untouched. That is a real advantage over the
swap-based in-place tricks used in \`first-missing-positive\` and \`missing-number\`, where the
permutation genuinely scrambles the input and undoing it would cost more bookkeeping than the trick
saves.

The rule worth carrying: **if you mutate the input, say so in the signature, the docstring, or the
function name.** Half the production bugs caused by this pattern are not in the algorithm; they are
in a caller who read the name \`find_duplicates\` and had no reason to suspect it was a writer.` },
  ],
}
