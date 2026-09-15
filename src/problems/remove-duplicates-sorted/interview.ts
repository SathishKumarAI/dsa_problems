// remove-duplicates-sorted — which rungs to know cold, and the drills
//
// Converted from docs/deep/remove-duplicates-sorted_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `**Know cold: the reader/writer pass.** It is the point of the question and the template for a whole
family — remove-element, move-zeroes, remove-duplicates-allowing-two, and every other "compact a
sequence in place" task is this loop with the \`if\` changed. Two things turn a memorised version
into an understood one, and interviewers probe both. Be able to say *why* one comparison is enough:
sorted ⇒ duplicates adjacent ⇒ the entire history compresses to the last kept value. And write the
comparison against \`nums[write - 1]\` rather than \`nums[read - 1]\`, so that when the inevitable
follow-up "now allow each value twice" arrives you change one character instead of rebuilding the
loop. Volunteering that the array beyond \`k\` is unspecified is a third, cheap signal that you have
read the contract rather than pattern-matched the shape.

**Understand but do not drill: the distinct copy.** Say it in the first twenty seconds to
establish the baseline and to show you have already spotted the adjacency trick, then name its
cost — O(n) memory the problem told you not to spend — and improve it. Afterwards its value is as
a reference to check the in-place version against on small inputs, which is precisely its job in
the script below. Nobody is hiring for it, but arriving at the good loop without naming the simple
one reads as recall rather than reasoning.

---`
