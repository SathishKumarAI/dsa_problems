// reverse-string — which rungs to know cold, and the drills
//
// Converted from docs/deep/reverse-string_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `**Know cold: the two-pointer inward swap.** Four lines, the expected answer, and reused constantly.
What must be automatic is the loop condition and its reason, and the fact that most languages need an
explicit temporary. Being able to write "reverse \`s[a..b]\` in place" as a helper without thinking is
what makes rotate-array a five-line problem and next-permutation a ten-line one.

**Know cold: the cost of string concatenation in your language.** This is the actual lesson, and it is
worth more than the code. Interviewers ask this problem partly to see whether a candidate notices; one
who volunteers it has answered a question that was never going to be asked directly.

**Understand but do not drill: the recursion, the prepend loop and the stack.** Each exists to make one
cost visible — recursion that slices copies, prepending rebuilds, a container can recover ordering you
already had — and each takes ten seconds to name and price. Do not write them out. The backward copy
is the one of the three to keep in reach, because it is what you use when the input is read-only, and
in Python it collapses to \`s[::-1]\`.

---`
