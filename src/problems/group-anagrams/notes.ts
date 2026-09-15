// group-anagrams — the sections the format has no field for.
//
// Kept in document order rather than dropped — a section naming the sibling
// problems that use the same move, an aside under the comparison table.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

import type { Note } from "../../content/types.ts"

export const notes: Note[] = [
  { title: "Comparison", body: `All three additionally pay \`O(n · k log n)\` to order the output, which at \`k <= 100\` is often the
dominant term. That cost belongs to the output format, not to the grouping.

---` },
]
