// sorted-squares — which rungs to know cold, and the drills
//
// Converted from docs/deep/sorted-squares_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `**Know cold: two pointers from the ends, filling backwards.** This is the answer the question
exists to extract. Write it without hesitating, and lead with the reason rather than the code:
"squaring folds the array around zero, so the largest square is always at one end or the other,
which means I can fill the output from the back." That sentence is the whole solution, and stating
it first turns the code into a transcription. Be ready for the two follow-ups: *why backwards and
not forwards?* (the ends give you the maximum cheaply and the minimum not at all) and *what happens
when the pointers meet?* (the loop is driven by output position, so exactly n elements are emitted
and the meeting point is handled without a special case).

**Know as your opening line: square, then sort.** One sentence, said out loud in the first fifteen
seconds — "the obvious version squares everything and sorts, which is n log n and throws away the
fact that the input was sorted" — and then improve it. It costs nothing and it frames everything
after as a decision. It is also the version to reach for if the interviewer ever says "assume the
input might not be sorted", which is a plausible follow-up precisely because it removes the
load-bearing constraint.

**Understand but do not drill: split at zero and merge.** Its value is entirely as the reasoning
step in the middle. Being able to say "squaring leaves two sorted runs facing each other, so this is
a merge" is what makes the two-pointer version sound derived rather than memorised — but you would
not write it, because the ends-inward version does the same merge with less code and no drains. Know
the idea; write the shorter one.

---`
