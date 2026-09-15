// remove-element — the sections the format has no field for
//
// Converted from docs/deep/remove-element_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

import type { Note } from "../../content/types.ts"

export const notes: Note[] = [
  { title: "The reader/writer family", body: `This problem, remove-duplicates-sorted, is-subsequence and merge-sorted-array are one idea in four
costumes. **A reader walks the input; a writer marks where the next kept value belongs; and the gap
between the two cursors is exactly what has been dropped.** This problem is the family's cleanest
statement of it: the reader visits all \`n\` positions, the writer advances only on a value that is
not \`val\`, the gap \`read + 1 − write\` is literally the number of copies of \`val\` passed so far, and
the writer's final position is the length of the answer — no separate counter, which is precisely
what Approach 4 deleted from Approach 3.

Where the family's usual rule bends, elsewhere in this set:

- **is-subsequence** keeps two cursors but they walk **two different sequences**, not one array.
  Nothing is written; the "writer" is a position in the pattern, marking how much of it has been
  matched, and its final position is a completeness check rather than a truncation point.
- **merge-sorted-array** must walk **backwards**, with its writer *ahead* of its reader rather than
  behind it, because writing forwards would overwrite values of the destination array it has not
  read yet. It gets away with it because that array has spare room at the back.

Forwards is safe here for the reason it is unsafe there: the writer can never have placed more
values than the reader has examined, so it is always at or behind the reader, and every cell it
stamps on has already been consumed.

One more bend belongs to this problem specifically. If the contract did **not** pin the survivors'
order, the reader/writer pair could be replaced by a different two-pointer scheme entirely: one
cursor from the front, one from the back, and whenever the front cursor finds a \`val\`, overwrite it
with the value from the back cursor and pull the back cursor in. The number of writes then depends
on the number of *removals*, not on the number of *survivors* — which is a genuine win when
removals are rare. **That trick is legal only because nobody is watching the order.** This variant
watches the order, so it is off the table here; LeetCode's version does not, so there it is the
standard answer. The first question to ask is which contract you are under.

---` },
]
