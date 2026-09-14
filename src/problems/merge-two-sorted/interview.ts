// merge-two-sorted — which rungs to know cold, and the drills
//
// Converted from docs/deep/merge-two-sorted_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `> **In an interview.** Say the licence before the code: *"both lists are sorted, so the smallest node
> left anywhere is always one of the two fronts — I never have to look past them."* Then write the
> dummy-head loop, and narrate the dummy as you allocate it: *"this is so the first attach isn't a
> special case."* The follow-up is almost always **"what if there were k lists?"** — answer that the
> same loop becomes a min-heap over the k fronts, \`O(N log k)\`, or pairwise merging with this exact
> function as the subroutine. The other standard follow-up, **"do it recursively"**, is one sentence:
> the smaller head owns the position, the recursion owns the rest.

**Memorize cold — the dummy-head loop.** Six lines, and it is a building block rather than a
destination: merge-sort a linked list, merge k sorted lists, and "flatten these sorted streams" all
bottom out in exactly this loop. The two details easy to drop under pressure and expensive to debug are
\`tail = tail.next\` and the final \`tail.next = a or b\`; drill until both are reflex.

**Memorize cold — the dummy-head pattern itself, separately from this problem.** The sentinel that
removes the "first element is special" branch shows up in remove-nth-from-end, remove-list-elements,
partition-list, and every list problem where the head itself might be deleted or replaced. Knowing
*why* you reach for it — "so that a pointer to the end always exists" — is worth more than knowing this
one function.

**Worth understanding, not memorizing — the recursive merge.** Genuinely worth being able to write,
both as an answer to "can you do it recursively?" and because it is the clearest statement of the key
insight. But it is short enough to derive on the spot once you can say "the smaller head owns the
position, the recursion owns the rest" — so memorize the sentence, not the code.

**Not worth memorizing — collect-and-sort.** One sentence in the interview, zero flashcards. Its only
job is to let you say what the sortedness is buying you before you spend it.

---`
