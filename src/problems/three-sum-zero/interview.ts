// three-sum-zero — which rungs to know cold, and the drills
//
// Converted from docs/deep/three-sum-zero_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `**Memorise cold: sort + converging pointers.** This is the expected answer, and it is not enough to
produce the shape — you must land the three dedup rules (skip an anchor equal to its predecessor;
after a hit move *both* pointers; then skip repeated values on both sides with an \`i < j\` guard)
and be ready to explain the exchange argument when asked "how do you know you didn't miss a
triple?". That question is asked almost every time. Being able to answer both halves — the pointer
skip and the anchor skip — separately and correctly is the actual bar.

**Memorise second: the anchor peel itself**, independent of how the inner pair search is done.
"Three-sum is two-sum with a loop around it" is the sentence that gets you to four-sum and k-sum on
the spot, and it is the follow-up an interviewer reaches for when you finish early. If you know the
peel, the generalisation is mechanical.

**Understand but do not drill: brute force, and the hash-per-anchor rung.** Brute force earns its
keep in the first thirty seconds — say it, price it at n³, move on — and later as a cross-check.
The hash rung is worth understanding because it is the honest answer when you are forbidden to
reorder the array, and because it makes clear that sorting here is bought for deduplication as much
as for speed. But given a sorted array, it is strictly dominated, and writing it as your final
answer invites the question "why are you carrying that set?"

---`

export const fluent = `1. **Say the reframing before writing anything.** *"Fix one value as the anchor; the other two have
   to sum to minus that value, which is two-sum on a sorted array."* **Done when** you can say it
   cold — it is the entire solution, and the code is transcription.

2. **Hand-trace \`[-1, 0, 1, 2, -1, -4]\`.** Four anchors, one of them skipped. **Done when** your
   table matches the one above row for row, including the skipped anchor and the reason for it.

3. **Delete the duplicate skips and run it.** Both of them, one at a time, and see which input each
   one was protecting against — the anchor skip fails on \`[-1, -1, 0, 1]\`, the partner skip on
   \`[-2, 0, 0, 2, 2]\`. **Done when** you can name the input that breaks each skip, rather than
   remembering that two skips exist.

4. **Move only one pointer after a hit** and watch it loop on the same pair. **Done when** you can
   say why both must move: the pair that just matched is used up, and leaving either end in place
   re-finds it.

5. **Do the siblings.** *Three Sum Closest* is this loop keeping the best distance instead of
   testing for zero — and it needs **no** duplicate skipping, because it returns a number rather
   than a set. *Four Sum* is one more anchor loop around this one. *Two Sum II* is the inner walk on
   its own. **Done when** you can say which of the three needs duplicate handling and why.

6. **A month later, the one sentence that should come back:** *fix one value and the rest is
   two-sum; sort first, because sorting buys both the pointer walk and cheap duplicate skipping.*`
