// intersection-of-arrays — approach 2 — Sort both, then two cursors.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "sort-both-then-two-cursors",
  title: "Sort both, then two cursors",
  idea: `*The cross-off scan restarts at index 0 of the right array for every element of the left, re-reading
copies it has already claimed and skipped. What if both sides were in order, so neither cursor ever
had to go backwards?* Sort them. Then walk the two arrays together: equal values are a match and both
cursors advance; otherwise the cursor sitting on the smaller value advances, because in sorted order
that value can never be matched by anything still ahead on the other side. This fixes the cross-off
scan's exact weakness — the restarted inner walk — and it needs no used-flags at all, because
advancing past a matched pair is itself the claim.`,
  intuition: `Two queues of people, each queue lined up by ticket number, and you are comparing the two people at
the front. If their numbers match, you have found a pair — take it, and send both of them away. If
one number is smaller than the other, that person can never be matched: everyone remaining in the
other queue has a number at least as large as the one you are looking at now, so send the smaller
person away and look again. The queues only ever shrink, nobody is ever recalled, and when either
queue empties you are done.

The multiplicity rule falls out on its own here rather than being enforced by a flag. Three 1s on the
left against two on the right: the cursors pair off the first two, then the left cursor is sitting on
a third 1 while the right cursor has moved past its last one onto something larger — so the left
cursor advances unmatched. Two pairs taken, \`min(3, 2) = 2\`, with no counting anywhere.`,
  worked: `Input: \`nums1 = [4, 9, 5]\`, \`nums2 = [9, 4, 9, 8, 4]\`. Sorted: \`a = [4, 5, 9]\`, \`b = [4, 4, 8, 9, 9]\`.

| Step | i (a[i]) | j (b[j]) | Comparison | Action | Answer |
|---|---|---|---|---|---|
| 1 | 0 (4) | 0 (4) | equal | take \`4\`, advance both | \`[4]\` |
| 2 | 1 (5) | 1 (4) | 5 > 4 | the right 4 has no partner left — advance j | \`[4]\` |
| 3 | 1 (5) | 2 (8) | 5 < 8 | the left 5 has no partner left — advance i | \`[4]\` |
| 4 | 2 (9) | 2 (8) | 9 > 8 | advance j | \`[4]\` |
| 5 | 2 (9) | 3 (9) | equal | take \`9\`, advance both | \`[4, 9]\` |
| 6 | 3 — past the end | 4 (9) | — | \`a\` is exhausted, stop | \`[4, 9]\` |

Five comparisons and the answer arrives ascending for free — no final sort needed. The second 9 in \`b\`
at index 4 is simply never reached, which is \`min(1, 2) = 1\` again.

**Why this walk is linear even though it has a loop.** Every iteration of the \`while\` advances at
least one cursor — the equal case advances both, and each unequal case advances exactly one — and no
cursor ever moves backwards. So the total number of iterations is bounded by n + m. The loop's cost is
not the concern here; the sorts that precede it are.`,
  code: `def intersection_of_arrays_sort_two_cursors(nums1: list[int], nums2: list[int]) -> list[int]:
    a = sorted(nums1)  # COPIES — sorting in place would rearrange the caller's arrays
    b = sorted(nums2)
    i = j = 0
    out: list[int] = []
    while i < len(a) and j < len(b):
        if a[i] < b[j]:
            i += 1
        elif a[i] > b[j]:
            j += 1
        else:
            out.append(a[i])
            i += 1
            j += 1
    return out  # already ascending, because both inputs were`,
  mistake: `Advancing only one cursor on a match, or advancing the wrong one on a mismatch. Writing \`i += 1\` on a
match without the matching \`j += 1\` means the right-hand copy is never consumed, so three 1s on the
left against two on the right yields three matches instead of two — the same over-counting bug the
\`used\` flags existed to prevent, reappearing in a new disguise. And on a mismatch, advancing the
cursor on the *larger* value is worse than wrong: it can loop forever on some inputs, because the
smaller value stays put while the larger side runs past everything that could have matched it.

The reasoning to hold onto is the one that justifies the move: when \`a[i] < b[j]\`, every remaining
element of \`b\` is at least \`b[j]\`, which is already greater than \`a[i]\`, so \`a[i]\` has no possible
partner left and can be discarded. Sortedness is exactly what licenses that discard, and nothing else
does.`,
  cost: `**Time O(n log n + m log m), space O(n + m)** as written with copies — or O(log n) of sort stack if you
sort in place and accept the mutation. The time is dominated entirely by the two sorts; the merge walk
afterwards is a single linear pass and free by comparison.

This is the right choice when **both arrays are already sorted** — then the sorts vanish, the whole
thing is O(n + m) with O(1) extra space, and it beats every hash-based rung in this file on both axes.
It is also the right choice when the elements are orderable but not hashable, and when you need the
answer sorted anyway. Say this one out loud in an interview even though it is not the final answer,
because "are they sorted?" is a question the interviewer wants you to ask.

---`,
  notes: [
    { title: "the cost of mutation — who it hurts, and can it be undone", body: `This is the one rung in this file that can touch the caller's data, and whether it does is a choice
you make in one character. \`sorted(nums1)\` builds a copy and costs O(n) memory; \`nums1.sort()\` costs
nothing extra and **permutes the caller's array**. The Java and C++ versions of this approach in the
repo's problem data make exactly that choice explicitly — one clones first, the other sorts the
by-value parameter.

Who gets hurt when you sort in place:

- **A caller that still needs the array in its original order.** Every value is still present, but at
  a different position. A parallel array of labels indexed the same way, a previously computed index,
  a slice boundary — all silently wrong afterwards. Nothing throws.
- **A concurrent reader.** A sort writes across the whole array, and another thread reading it
  mid-sort sees a state where a value can appear twice or not at all. That is a data race no amount of
  careful reading on the other side repairs.
- **A read-only or shared buffer.** A read-only memory mapping faults; a copy-on-write page is
  dirtied; a caller who passed a view into a larger array has that larger array scrambled too.

**Can it be undone?** No, not without having recorded the original order — which means an O(n) copy,
which is precisely the memory the in-place sort was trying to save. A permutation is invertible in
principle and unrecoverable in practice unless you paid to remember it. This is why the code above
uses \`sorted()\`: if you are going to spend O(n) memory anyway, spend it visibly on a copy rather than
invisibly on the caller's correctness.

Everything from Approach 3 onward reads both inputs and writes to neither, which is one more reason
the counting family wins here.` },
  ],
}
