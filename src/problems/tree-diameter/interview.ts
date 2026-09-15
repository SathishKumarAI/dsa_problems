// tree-diameter — which rungs to know cold, and the drills
//
// Converted from docs/deep/tree-diameter_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `**Know cold:** the one-pass version, and the reframing that produces it. If you can say "every path
bends at exactly one node, so I will try every node as the bend" before writing anything, the code
follows and you have shown the idea rather than a memorised routine. Be ready to state precisely why
the returned value differs from the recorded one.

**Understand, do not memorise:** the quadratic version — it is the thing your interviewer wants you
to improve on, so write it only as a stepping stone — and the cached version, worth one sentence as
the obvious fix that the one-pass makes unnecessary. The iterative rung is your answer to "what if
the tree is a chain of ten thousand?".

> **In an interview.** Volunteer a tree where the diameter misses the root, because it proves you
> understand the trap: \`[1, 2, null, 3, 4, 5, 6, 7]\` answers \`4\` while any through-the-root solution
> says \`3\`. Expect the follow-ups — *return the path, not its length* (keep a parent pointer or
> rebuild by descending the reaches), and *maximum path sum* (the same skeleton, with negative arms
> clamped to zero).`
