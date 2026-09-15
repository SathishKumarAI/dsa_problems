// intersection-of-arrays — approach 1 — Cross off with used flags.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "cross-off-with-used-flags",
  title: "Cross off with used flags",
  idea: `*How do I know whether a value on the left has a partner on the right?* Scan the right-hand array
looking for it. *And how do I stop one copy on the right from answering for three copies on the left?*
Mark each right-hand element the moment it is claimed, and never claim it twice. This is the baseline,
and the flags are not an optimisation — they are what makes it *correct*.`,
  intuition: `Two rows of tokens on a table. You pick up a token from the left row and walk along the right row
looking for a token with the same number on it that has not already been turned face-down. Find one,
turn it face-down, and put a matching token in the answer pile. Find none, and the left token is
discarded. The face-down markers are the whole trick: without them, a single \`2\` on the right would
pair with every \`2\` on the left, and the answer would report more copies than the right side actually
holds.

This is the rung that makes the minimum rule visible as a *physical* constraint — you run out of
tokens — rather than as a formula. Every later rung is a cheaper way of running out.`,
  worked: `Input: \`nums1 = [4, 9, 5]\`, \`nums2 = [9, 4, 9, 8, 4]\` — the same pair traced through every approach in
this document. The expected answer is \`[4, 9]\`: the right side holds two 9s, but the left side holds
only one, so \`min(1, 2) = 1\`.

\`used\` starts as five \`False\` flags, one per element of \`nums2\`.

| Left value | Walk along \`nums2\` | Result | \`used\` after | Answer |
|---|---|---|---|---|
| 4 | j=0: 9, no. j=1: **4, unclaimed** | claim index 1 | \`[F, T, F, F, F]\` | \`[4]\` |
| 9 | j=0: **9, unclaimed** | claim index 0 | \`[T, T, F, F, F]\` | \`[4, 9]\` |
| 5 | j=0 claimed, j=1 claimed, j=2: 9 no, j=3: 8 no, j=4: 4 no | no partner | unchanged | \`[4, 9]\` |

Eight element inspections. The second 9 at index 2 and the second 4 at index 4 were never claimed,
because the left side ran out of demand for them — that is \`min(1, 2) = 1\` happening physically.
Sorted for a canonical result: \`[4, 9]\`. Neither input array was modified; only the separate flag
array was written to.`,
  code: `def intersection_of_arrays_cross_off_with_flags(nums1: list[int], nums2: list[int]) -> list[int]:
    used = [False] * len(nums2)  # without this, one right-hand copy answers for many left ones
    out: list[int] = []
    for x in nums1:
        for j in range(len(nums2)):
            if not used[j] and nums2[j] == x:
                used[j] = True
                out.append(x)
                break  # one partner per left element, then stop looking
    out.sort()
    return out`,
  mistake: `Dropping the \`break\`. Without it, the inner loop keeps going after a successful claim and finds the
*other* copies of the same value, claiming them too. On \`nums1 = [4, 9, 5]\` against
\`nums2 = [9, 4, 9, 8, 4]\`, the left-hand \`4\` would claim both right-hand 4s and the answer would be
\`[4, 4, 9]\` — more copies than the left side ever asked for. The rule is one partner per left element;
\`break\` is what enforces it.

The subtler version is dropping the \`used\` array entirely and testing only \`nums2[j] == x\`. That is
the membership-versus-counting confusion made concrete: on \`nums1 = [1, 1, 1]\` against
\`nums2 = [1, 1]\` it returns \`[1, 1, 1]\` — three copies from a right side that only holds two.`,
  cost: `**Time O(n × m), space O(m)** for the flags, where n and m are the two array lengths. The time is the
nested walk: every element of \`nums1\` triggers a scan of up to all of \`nums2\`, and nothing learned on
one left element is carried to the next. The space is one boolean per element of \`nums2\` — note that
this is O(m), *not* O(1), which is worth saying out loud because it is easy to mis-file this rung as
"the no-memory one".

Use it when both arrays are tiny, when the elements are not hashable and not orderable so neither of
the two structural tricks applies, or — its real job here — as an unimpeachable oracle to cross-check
the faster versions against, which is exactly what it does in the stress test at the bottom of this
file.

---`,
}
