// remove-element — which rungs to know cold, and the drills
//
// Converted from docs/deep/remove-element_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `**Know cold: the reader/writer pass, and the question that comes before it.** The loop is five lines
and you should be able to write it without hesitating, including the fact that the writer advances
*only* inside the \`if\` and that \`write\` is what you return. Its real value is that it is a template:
remove-duplicates-from-sorted-array, move-zeroes, partition-by-predicate and C++'s \`std::remove\` are
all this loop with the predicate changed — and \`std::remove\` returning a new end rather than
shrinking the container is the same contract as returning \`k\` here, which is a nice thing to be able
to point at. The question that comes first is **"does the order of the survivors matter?"** Ask it
before writing anything; it is the difference between this loop and the swap-with-the-last version,
and asking it unprompted is worth more than either implementation.

**Know the swap-with-the-last variant well enough to describe it.** Front cursor and back cursor;
when the front finds a \`val\`, overwrite it with the back cursor's value and pull the back cursor in;
the number of writes becomes proportional to the number of removals rather than to the array. Be
precise about its precondition — it scrambles the survivors' order, so it is legal only when the
contract does not pin that order — and about when it wins: removals rare, writes expensive. You do
not need to code it under pressure, but naming it and its precondition is the answer to "can you do
better?".

**Understand but do not drill: delete-and-shift, the filtered copy, and the counting pass.**
Delete-and-shift is worth twenty seconds as the baseline plus one sentence on why it is quadratic,
and the "cursor must not advance after a deletion" trap inside it is a genuinely useful thing to
have noticed. The filtered copy is what you would actually ship when in-place is not required, and
it is the oracle you check the clever version against. The counting pass is worth knowing only so
you can explain why it is redundant *here* and not redundant when the destination has to be sized
in advance — that distinction is the interesting part, not the code.

---`
