// same-tree — which rungs to know cold, and the drills
//
// Converted from docs/deep/same-tree_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `**Know cold:** the lockstep recursion, and the *order* of its three cases. Being able to say "the
structural checks come first because they are what make \`p.val\` legal" is a stronger signal than the
code itself.

**Know the trap:** that a values-only serialisation is wrong, and the one-line counterexample
\`[1,2]\` versus \`[1,null,2]\`. If you propose serialising, propose it with the null markers and say why
in the same breath.

> **In an interview.** The natural follow-ups are all the same function wearing different clothes:
> *is this tree symmetric?* is this walk with the pairs crossed — \`(a.left, b.right)\` and
> \`(a.right, b.left)\`; *is \`s\` a subtree of \`t\`?* is this function called at every node of \`t\`; *do
> these two trees have the same shape regardless of values?* is this function with the value test
> removed. Say that out loud — recognising that a problem is this one in disguise is most of the
> answer.`
