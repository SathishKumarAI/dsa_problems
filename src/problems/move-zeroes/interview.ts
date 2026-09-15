// move-zeroes — which rungs to know cold, and the drills
//
// Converted from docs/deep/move-zeroes_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `**Know cold: the reader/writer walk, in whichever of its two forms you prefer.** This is the
answer. Write it without hesitating, remember the zero-fill if you took the copying form, and state
the invariant before you write the loop — "everything before the writer is a kept value, in order".
That sentence is what tells the interviewer you can rederive the code rather than recall it, and it
is also the sentence that makes the second pass obviously correct instead of obviously bolted on.
Being able to compare the two forms by *write count* rather than by "one pass versus two" is the
detail that reads as senior.

**Know as your opening line: filter into a copy.** Say it in fifteen seconds — "the obvious version
collects the non-zeroes, pads with zeroes, and copies back; linear time, but it allocates a second
array and writes everything twice" — then improve it. It costs nothing to state and it turns the
in-place version into a decision you made rather than a trick you knew. Be ready for the Python
gotcha buried in it: \`nums = kept\` does not modify the caller's list, \`nums[:] = kept\` does.

**Understand but do not drill: the swap-with-the-end version.** Not because it is subtle, but
because knowing *why it is wrong* is worth more than the correct answers. It is the first thing many
people reach for, it produces zeroes at the back, and it silently destroys relative order. Being
able to name it and reject it in one sentence — "that scrambles the kept values, and the problem
says their order is preserved" — shows you read the constraints rather than pattern-matched the
title.

---`
