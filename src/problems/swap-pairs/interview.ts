// swap-pairs — which rungs to know cold, and the drills
//
// Converted from docs/deep/swap-pairs_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `> **In an interview.** Say the requirement back before writing anything: *"the nodes have to move —
> swapping values would print the same and be the wrong answer, because anything holding a pointer
> into the list would still see the old order."* Then say the structural fact: *"a swap rewrites three
> links, and the third belongs to the node before the pair — and the first pair has no such node, so
> I'll put a dummy in front of the head."* Write Approach 5. The two follow-ups are always the same:
> **"what about an odd length?"** — the guard tests \`prev.next\` *and* \`prev.next.next\`, so a lone tail
> ends the loop untouched — and **"can you do it recursively?"** — yes, four lines, \`n/2\` frames, and
> \`head.next = swap(second.next)\` must come before \`second.next = head\`.

**Memorize cold — the dummy node pattern.** \`dummy = ListNode(0, head)\`, work from \`dummy\`, \`return
dummy.next\`. Three tokens that delete a whole class of bug from every list problem which can touch the
head. This problem, *remove-nth-from-end* and *remove-list-elements* are three drills on the same
reflex; get it once and all three become single loops.

**Memorize cold — the four-name grip and the assignment order.** \`prev\`, \`first\`, \`second\`, and the
node after the pair. \`first.next = second.next\` **first**, then \`second.next = first\`, then
\`prev.next = second\`, then \`prev = first\`. Reversing the first two makes \`first\` point at itself and
the function **hangs** — measured, on a five-node list. The transferable discipline is the one from
\`reverse-list\`: read a pointer before you overwrite it, or save it in a local.

**Memorize cold enough to say out loud — why the value swap is disqualified.** One sentence, the
one in the callout above. It costs ten seconds, it proves you read the requirement rather than
pattern-matched the title, and it is the single most common way candidates get this problem marked
wrong while producing the right printout.

**Worth understanding, not memorizing — the recursion.** Have it as your second answer. Its value is
that "swap the first two and trust the rest" is checkable by a reader in a way the loop is not, and
being able to name its \`n/2\` frames unprompted is a stronger signal than the code alone.

**Not worth memorizing — the node array.** Name it, cost it at \`O(n)\` space, and say why it is
wasteful in one clause: it buys a copy of the structure to look one node ahead, and the pair already
points there. Keep the trap, though — forgetting to set the **last** node's \`next\` builds a cycle on
even lengths and is invisible on odd ones.

---`
