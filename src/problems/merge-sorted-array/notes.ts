// merge-sorted-array — the sections the format has no field for
//
// Converted from docs/deep/merge-sorted-array_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

import type { Note } from "../../content/types.ts"

export const notes: Note[] = [
  { title: "The reader/writer family", body: `This problem belongs with remove-duplicates-sorted, remove-element and is-subsequence: **a reader
walks the input, a writer marks where the next kept value belongs, and the gap between the two
cursors is exactly what has been dropped — or here, what has been inserted.** In the backward merge
the reader is \`i\`, walking \`a\`'s live values from the top down; the writer is \`w\`, marking the slot
the next value belongs in; and the gap \`w − i\` is precisely the number of \`b\`'s values already
placed. When that gap is zero the two cursors coincide and \`a\`'s remaining values are already home,
which is why the loop can stop as soon as \`b\` is spent.

**This is the one where the family's usual rule reverses.** Everywhere else the writer trails
*behind* the reader, and that is what makes overwriting safe: the writer only ever lands on cells
the reader has finished with. Here the writer is *ahead* of the reader, to the right of it, and
both of them travel right-to-left. The safety argument is the same one read in a mirror — the
writer never lands on a cell the reader still needs — but achieving it required reversing the
direction of the whole walk, and that was only possible because the spare room sits at the back.
It is the clearest illustration in the family that "reader behind writer" was never the rule; the
rule is *the write cursor must stay out of the unread region*, and which side that puts it on
depends on where the free space is.

The other bend in the family is **is-subsequence**, which keeps two cursors but walks two different
sequences instead of one array, and never writes at all.

---` },
]
