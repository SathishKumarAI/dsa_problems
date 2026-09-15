// zero-matrix — which rungs to know cold, and the drills
//
// Converted from docs/deep/zero-matrix_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `**Know cold: the marks-in-the-first-row-and-column version.** An answer that stops at marker arrays
stops one question early. What must be automatic is not the code but the ordering, and the two
sentences that justify it: a mark lives in the line it describes, so it cannot lie; and the marking
pass destroys exactly one fact, which is why it is read first.

**Know cold: the decide-then-apply discipline, and the false start it corrects.** Open with it. *"The
naive sweep writes into the grid it is reading, so it starts reacting to its own output — watch it
turn this 4 × 4 into all zeros"* is thirty seconds that proves you understand the semantics, and every
rung afterwards becomes an answer to a question you have already framed. The two marker sets are the
honest first implementation; write them quickly, then improve.

**Understand but do not drill: the copy.** Its job is to make the read/write separation obvious and to
be the reference the fast versions are checked against — which is exactly what it does in the script
below. Say it, price its memory against the grid it duplicates, move on. Ten seconds.

---`
