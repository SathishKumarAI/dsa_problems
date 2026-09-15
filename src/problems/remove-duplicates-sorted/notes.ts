// remove-duplicates-sorted — the sections the format has no field for
//
// Converted from docs/deep/remove-duplicates-sorted_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

import type { Note } from "../../content/types.ts"

export const notes: Note[] = [
  { title: "The reader/writer family", body: `This problem, remove-element, is-subsequence and merge-sorted-array are one idea wearing four
costumes. **A reader walks the input; a writer marks where the next kept value belongs; and the
gap between the two cursors is precisely what has been dropped.** Here the reader visits all \`n\`
positions, the writer advances only on a value that is not a repeat, and at the end the gap
\`read + 1 − write\` is the number of duplicates discarded while \`write\` is the length of the answer
— no separate counter is needed, because the writer *was* the counter all along.

Where the family's usual rule bends, elsewhere in this set:

- **is-subsequence** keeps two cursors but they walk **two different sequences**, not one array.
  Nothing is written at all; the "writer" becomes a position in the pattern, and what it marks is
  how much of the pattern has been matched rather than where the next value goes.
- **merge-sorted-array** must walk **backwards**. Its writer starts to the *right* of its reader
  and has to stay there, because writing forwards would land on values of the first array that
  have not been read yet.

Forwards is safe here for the same reason it is unsafe there: the writer is always at or behind
the reader, so every cell it overwrites has already been consumed.

---` },
]
