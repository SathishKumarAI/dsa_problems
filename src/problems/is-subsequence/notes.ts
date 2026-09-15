// is-subsequence — the sections the format has no field for.
//
// Kept in document order rather than dropped — a section naming the sibling
// problems that use the same move, an aside under the comparison table.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

import type { Note } from "../../content/types.ts"

export const notes: Note[] = [
  { title: "The reader/writer family", body: `This problem sits with remove-duplicates-sorted, remove-element and merge-sorted-array in one
family: **a reader walks the input, a writer marks where the next kept value belongs, and the gap
between the two cursors is exactly what has been dropped.** In the compaction problems the writer
literally writes; here it does not, and that is the interesting difference.

**This is the one that walks two different sequences rather than one array.** The reader sweeps
\`t\` and the pattern cursor \`i\` plays the writer's part: it marks the boundary between the part of
\`s\` already satisfied and the part still waiting, it only advances when something is "kept", and
its final position is the answer — not a length to truncate at, but a completeness check,
\`i == len(s)\`. The gap is still meaningful in the same way: \`j + 1 − i\` counts the characters of
\`t\` that were discarded. And the same safety property holds for the same reason — the pattern
cursor can never overtake the text cursor, because it only moves on a step that the text cursor is
also taking.

The other place the family's rule bends is **merge-sorted-array**, which must walk **backwards**:
its writer starts to the right of its reader, because writing forwards would overwrite values it
has not read yet. Here forwards is safe because nothing is written at all.

---` },
]
