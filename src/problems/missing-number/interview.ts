// missing-number — which rungs to know cold, and the drills
//
// Converted from docs/deep/missing-number_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `**Know cold: the XOR fold, and the sum.** They are the same idea — an invariant of the complete set
compared against the array — and the interview is usually about producing one, then the other, then
saying why the second is safer. Derive the sum first, because n(n+1)/2 is easy to state and
obviously correct, then volunteer the overflow problem yourself rather than waiting to be asked: *"at
n = 10⁵ the total is about 5 × 10⁹, which does not fit in a 32-bit int."* Then give XOR and say the
one sentence that carries it: *"every present number appears once as an index and once as a value, so
it cancels; the missing one appears only as an index."* Get the seed right — \`acc\` starts at n,
because index n does not exist — and be ready for the follow-up family: *two numbers missing?* (one
accumulator cannot separate two unknowns; go back to a table, or split by a differing bit) and *values
not distinct?* (both arithmetic rungs collapse).

**Worth naming in ten seconds: the flag table.** It is the version that survives the generalisations
the arithmetic ones do not, and mentioning it shows you know the arithmetic trick has a domain rather
than being magic.

**Understand but do not drill here: sorting, and the in-place placement.** Sorting is the baseline
worth one sentence of dismissal. The placement rung deserves more attention than its usefulness on
*this* problem justifies, because it is the exact machinery \`first-missing-positive\` is built on — but
study it there, where it is the intended answer, not here, where it destroys the caller's array to
achieve what one subtraction achieves without touching it.

---`
