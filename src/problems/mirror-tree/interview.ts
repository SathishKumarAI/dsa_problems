// mirror-tree — which rungs to know cold, and the drills
//
// Converted from docs/deep/mirror-tree_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `**Know cold:** the crossed-pair recursion. Three lines, and the reasoning — *symmetry is a property of
a pair, so the recursion takes two arguments* — is the part worth saying before the code.

**Know the counterexample:** \`[1, 1, 1, 1, null, 1]\`. If you propose comparing values in any flattened
form, this tree refutes it in one line, and being the person who produces it is better than being the
person it is produced against.

**Understand, do not memorise:** the mirror-and-compare composition, worth one sentence as "symmetric
means equal to its own reflection", and the level version, worth mentioning only with its holes.

> **In an interview.** Say the crossing out loud: "left's left against right's right". Expect the
> follow-up "now do it without recursion" — that is approach 4, and it is a two-minute rewrite once
> the pair is the unit. If asked to compare **two** trees for being mirrors of each other rather than
> one tree for symmetry, it is the same \`mirror(a, b)\` helper called on the two roots, which is a
> pleasant thing to notice out loud.`
