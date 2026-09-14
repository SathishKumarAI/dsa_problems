// right-side-view — which rungs to know cold, and the drills
//
// Converted from docs/deep/right-side-view_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `**Know cold:** the right-first depth-first walk, and the reason \`depth == len(out)\` means "a new
level". That one comparison is the transferable idea.

**Know well enough to write first:** the breadth-first version, because its correctness is obvious
and it makes a better opening move. Then offer the depth-first version when asked about memory.

**Know the counterexample:** \`[1, 2, 3, 4]\` answers \`[1, 3, 4]\`, and walking down \`root.right\`
answers \`[1, 3]\`. Produce it yourself — it is the difference between "rightmost on the level" and
"the right child", and it is the entire point of the problem.

> **In an interview.** State the memory trade honestly rather than claiming one version is simply
> better: breadth-first holds the widest level, depth-first holds the height, and which is smaller is
> a fact about the tree. Expect a variant — the left side view (mirror the two calls), the bottom-left
> value, or the first node at each level — and note that all three are this walk with the order or the
> comparison changed.`
