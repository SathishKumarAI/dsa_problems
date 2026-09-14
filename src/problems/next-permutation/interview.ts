// next-permutation — which rungs to know cold, and the drills
//
// Converted from docs/deep/next-permutation_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `**Memorise cold — pivot, swap, reverse.** Ten lines, and the expected answer. Write it enough times
that the two comparison directions are automatic: \`>=\` in the pivot scan (so equal neighbours do not
stop it) and \`<=\` in the replacement scan (so an equal value is not chosen). Then rehearse
\`[3, 2, 1]\` out loud, because the wrap is what the interviewer probes and because explaining that it
needs *no* extra branch is the answer that shows you understand the structure rather than the steps.

**Memorise cold — the four observations, in order.** The descending suffix is already maximal, so the
first value below its successor is the pivot; the replacement is the smallest suffix value still
exceeding it; the suffix must then become minimal; and for a descending run, minimal is a reversal,
not a sort. If you can say those four sentences you can rebuild the code from scratch, and the fourth
one is what separates the linear answer from the \`O(n log n)\` one that most candidates hand in.

> **In an interview.** Say the four observations before you write anything. *"Scanning in from the
> right, the suffix is descending, and a descending run is already the largest arrangement of its
> values — so nothing there can grow. The first value below its successor is the pivot, and it is the
> only position that can change. Its replacement is the smallest suffix value still above it, which
> because the suffix descends is just the rightmost one above it. Then the suffix has to become as
> small as possible — and it is still descending after the swap, so that is a reversal, not a sort.
> \`O(n)\` time, \`O(1)\` space."* Then volunteer the wrap: **\`[3, 2, 1]\` has no pivot, so the tail is the
> whole array and the same reversal produces \`[1, 2, 3]\` — no special case.** Expect two follow-ups.
> **"Why \`>=\` in the pivot scan and \`<=\` in the replacement scan?"** — duplicates: equal neighbours
> must not stop the pivot scan, and swapping with an equal value would not increase anything. **"Now do
> the previous permutation"** — mirror every comparison: scan for the first value *greater* than its
> successor, swap with the largest suffix value still *below* it, and reverse as before.

**Understand but do not memorise — pivot plus sorting the tail.** Worth knowing as the version you
would fall back to if the invariant slipped your mind, and worth mentioning as a deliberate
comparison: "I could sort the tail, but it is already descending, so a reversal does it in \`O(n)\`" is a
better sentence than simply writing the reversal.

**Understand but do not memorise — the candidate search over all swaps.** No recall value, real
method value. When a greedy rule is not obvious, enumerate a small correct candidate set, look at
which candidates win, and let the pattern name the rule. That is how the pivot is *found* rather than
remembered, and it is a technique that transfers to problems where nobody has told you the answer.

**Understand but do not memorise — the full enumeration.** Nothing to recall except the factorial
number system, which is a nice trick with a narrow use. Its role here is to be the oracle: the
definition, written down, that everything faster is checked against.

---`
