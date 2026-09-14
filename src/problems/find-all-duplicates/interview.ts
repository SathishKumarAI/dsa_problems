// find-all-duplicates — which rungs to know cold, and the drills.
//
// Which two or three to have in recall, and why the rest are for understanding
// rather than for typing out under time.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

export const interview = `**Know cold: the sign-flip in-place version, and the flag-per-value table.** Those two are the
matched pair this question exists to test. The flag table is what you say first — it is obviously
correct, it is linear, and stating it proves you have spotted the \`1 <= nums[i] <= n\` constraint. The
sign flip is what you say when the interviewer asks for constant space, and the sentence that earns
the point is *"every value is positive and every value is a valid index, so the sign of \`nums[v-1]\`
is a free bit I can use as the flag."* Be ready for the two follow-ups that always come: *what if
values could be negative?* (the trick dies; you need the flag table or an offset scheme) and *can you
give me my array back?* (yes — one pass of \`abs\`, because sign flipping is its own inverse).

**Worth having ready as the opener: the hash map.** Not because it is impressive, but because it is
the honest general answer and naming it takes ten seconds. It is also the version you would actually
ship when the value range is not guaranteed by a type system.

**Understand but do not drill: the pair scan and the sort.** The pair scan's entire value is as the
baseline you name in the first thirty seconds and as the oracle you cross-check against — it plays
exactly that role in the script below. The sort is worth one sentence ("n log n, and it moves the
caller's data for an ordering the answer does not need"), because dismissing it for the right reason
shows you are choosing rather than pattern-matching.

---`
