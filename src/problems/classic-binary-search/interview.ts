// classic-binary-search — which rungs to know cold, and the drills
//
// Converted from docs/deep/classic-binary-search_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `> **In an interview.** Say the contract out loud before you write it: *"I'll keep an inclusive
> range \`[lo, hi]\` of indices that could still hold the target, loop while \`lo <= hi\`, and move
> past \`mid\` on both sides because \`mid\` has already been compared."* That single sentence
> pre-empts the two follow-ups you would otherwise get — "why \`mid + 1\`?" and "what does \`lo\` mean
> when the loop ends?" — and it signals that the off-by-ones are a decision you made rather than a
> thing you are hoping about. If asked to do it recursively, do it, but volunteer that it is
> \`O(log n)\` space.

**Memorize cold — the iterative inclusive search (Approach 3).** Five lines, and you should be able
to write them with your eyes closed, including \`hi = len(nums) - 1\` (not \`len(nums)\`) and both
\`mid ± 1\`. The follow-up to expect is *"what happens when the target is absent — what is \`lo\` at that
point?"* Answer: \`lo\` is one past \`hi\`, the range is empty, and — worth adding unprompted — \`lo\` is
sitting exactly on the insertion point, which is the next problem.

**Memorize cold — the converging form (Approach 4).** Not for this problem, where it is the weaker
choice, but because it is the skeleton of every boundary search you will be asked for. The two
things to have automatic: \`while lo < hi\`, and the asymmetry \`lo = mid + 1\` / \`hi = mid\`. If you find
yourself writing \`hi = mid - 1\` under a \`while lo < hi\`, stop — you have mixed the contracts and you
are about to step over the answer.

**Worth understanding, not memorizing — the recursion.** It is the same algorithm and most people
find it the clearest first explanation, so it is a fine thing to *say* while you write the loop. Just
do not offer it as your final answer without naming the stack cost, because an interviewer who asks
"and the space complexity?" is asking whether you noticed.

**Not worth memorizing — the linear scan.** But do name it and reject it, and reject it on the right
grounds: here the reason is the stated \`O(log n)\` requirement, not the input size, because 10⁴
elements would scan fine. Rejecting an approach for the *wrong* reason is a worse signal than not
rejecting it.

---`
