// sorted-pair-sum — which rungs to know cold, and the drills
//
// Converted from docs/deep/sorted-pair-sum_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `**Memorise cold: the two-pointer version, and the hash map.** Those two are a matched pair and the
interview is usually about knowing which one the input calls for. The hash map is the answer to
unsorted two-sum, which is the single most-asked warm-up in the business; the converging pointers
are the answer the moment someone adds "the array is sorted" or "use O(1) space", and being able
to state the exchange argument — *the sum at the ends is extremal, so one endpoint is provably
dead* — in two sentences is what separates "I memorised it" from "I understand it". Write both
without hesitation, get the \`i < j\` strict inequality right the first time, and be ready for the
follow-up "what if I asked for the values instead of the indices, and the array were not sorted?"
(answer: sorting destroys the indices, so either carry them along or use the map).

**Understand but do not drill: brute force.** Its value is entirely as a starting point and as an
oracle. Say it out loud in the first thirty seconds to establish the baseline and the quadratic
cost you are about to remove, use it to sanity-check your fast version on small inputs, and move
on. Nobody is hiring for it, but skipping straight to the clever answer without naming the
baseline reads as pattern-matching rather than reasoning.

---`

export const fluent = `1. **State the elimination out loud before writing the loop.** *"If the cheapest and the dearest
   together fall short, the cheapest cannot reach the target with anyone, so it is gone."* **Done
   when** you can say it without the array in front of you — that sentence is the algorithm, and
   the code is four lines of transcription.

2. **Hand-trace \`[1, 3, 6, 9]\` with \`target = 12\`, then with \`target = 100\`.** The second has no
   answer; watch the pointers meet. **Done when** you can say what \`while lo < hi\` is protecting
   against and why \`<=\` would be wrong here.

3. **Break the promise.** Shuffle the array so it is no longer sorted and run the two-pointer rung.
   It returns something, and it is wrong. **Done when** you can say exactly which line stops being
   true — the comparison no longer tells you anything about the values you have not seen — and why
   the hash rung does not care.

4. **Count, do not time.** Instrument both rungs on \`list(range(1, 10001))\` with the answer at the
   far end. **Done when** you have produced the \`49 995 000\` against \`9 999\` yourself.

5. **Do the siblings.** *Three Sum* is this loop with an outer element fixed — and the reason it is
   \`O(n²)\` and not \`O(n³)\`. *Container With Most Water* is the same two pointers with a different
   reason for moving (always discard the shorter wall). *Sort Colors* is two pointers converging
   with a third walking between them. **Done when** you can say, for each, what the comparison is
   and what one move eliminates.

6. **A month later, the one sentence that should come back:** *on sorted data, comparing the two
   ends tells you about everything in between, so one comparison can retire a whole row of the
   table.*`
