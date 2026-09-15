// merge-sorted-array — which rungs to know cold, and the drills
//
// Converted from docs/deep/merge-sorted-array_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `> **In an interview.** Write the forward merge first, then say the one sentence the whole question
> is about: *"I cannot do that in place forwards, because the first write lands on \`a[0]\`, which is
> a live value — but the free room is at the back, so I will walk backwards instead."* Then
> volunteer the invariant before being asked: *"the write cursor stays strictly right of \`a\`'s read
> cursor, and the gap is exactly the number of \`b\`'s values already placed."* The push-back is
> always one of three: **why \`m + n − 1\`**, **why the \`i >= 0\` guard**, and **why loop on \`j\` alone**
> — have all three ready.

**Know cold — the backward two-pointer merge, and the forward scratch merge it comes from.** They
are a matched pair and the interview is about the step between them. Write the forward merge without
thinking; it is the merge step of merge sort and it recurs in a dozen other questions. Get three
things right under pressure: initialise \`write\` to \`m + n − 1\`, guard the comparison with \`i >= 0\`,
and loop on \`j >= 0\` rather than on both cursors so the drain handles itself.

**Understand but do not drill: append-and-sort, insert-one-at-a-time, and the prefix copy.**
Append-and-sort is worth thirty seconds at the start as the honest baseline and is genuinely what
you would ship for small inputs; naming it and then naming what it wastes shows judgement rather
than ignorance. Insert-one-at-a-time is worth knowing only so you can recognise it as insertion
sort's inner step and say why it is quadratic. The prefix copy is the most interesting of the
three, because it is the answer to the follow-up "what if the spare room were at the *front*
instead?" — at which point the backward walk stops working and \`O(m)\` extra memory becomes the
real floor.

---`
