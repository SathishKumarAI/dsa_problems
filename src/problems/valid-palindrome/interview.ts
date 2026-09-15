// valid-palindrome — which rungs to know cold, and the drills
//
// Converted from docs/deep/valid-palindrome_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `**Know cold: the two-pointer version.** In interview terms this is a one-approach problem, and the
in-place skipping walk is the approach. Write it without hesitating, get all three details right on
the first pass — skip before comparing, guard both inner loops with \`i < j\`, lowercase both sides —
and be ready to say in one sentence why an all-punctuation input returns \`true\` rather than
crashing or returning \`false\`. The follow-ups are predictable: "what if one character may be
deleted?" (the \`valid-palindrome-ii\` variant, which forks into two sub-checks at the first
mismatch) and "what if this were a linked list?" (you lose random access from the back, so you
reverse the second half or use fast and slow pointers). Both are only reachable if the base version
is automatic.

**Know as your opening line: clean-then-reverse.** Say it in the first twenty seconds — "the
obvious version builds a filtered copy and compares it to its reverse; that is linear time, but it
allocates two extra strings and cannot exit early" — and then improve it. Naming the baseline
together with the specific thing wrong with it is what makes the optimisation read as reasoning
rather than recall. It is also the version you should usually ship in production code, and saying
*that* out loud counts in your favour, not against you.

---`
