// remove-list-elements — which rungs to know cold, and the drills
//
// Converted from docs/deep/remove-list-elements_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `> **In an interview.** Lead with the two traps before any code: *"unlinking is done by the
> predecessor, so the head needs either its own loop or a fake node in front of it — and after a
> removal I must not advance, because the node that slid into the gap has not been checked yet."*
> Then write Approach 5 with the dummy from the start. The follow-ups are predictable: **"what if
> every node matches?"** — \`dummy.next\` ends as \`None\` and that is the answer, no branch — and
> **"can you do it recursively?"** — three lines, and one frame per node, which \`10^4\` forbids.

**Memorize cold — the dummy node pattern.** \`dummy = ListNode(0, head)\`, work from \`dummy\`, \`return
dummy.next\`. Three tokens that delete an entire class of bug from every list problem which can touch
the head. This problem is the purest drill for it, because here the head can need *several* removals
in a row — and it is the same reflex that ends *remove-nth-from-end* and *swap-pairs*.

**Memorize cold — do not advance after a removal.** This is the more transferable of the two and the
one candidates more often get wrong, because "advance at the end of the loop" is what loops do.
Measured, advancing unconditionally returns \`[1, 7, 2]\` on the worked example — right except where
two matches are adjacent, which the statement's first example never tests. The rule shows up again in
\`remove-duplicates-sorted\`, in every in-place array filter, and as iterator invalidation in C++ and
Java.

**Worth understanding, not memorizing — the recursive version.** Have it as a second answer for its
elegance: each node reports what its predecessor should point at, so neither the head case nor the
don't-advance rule exists. Then name the frame-per-node cost immediately. The three lines are a good
signal; claiming \`O(1)\` space for them is a bad one.

**Worth understanding, not memorizing — strip-the-head-then-walk.** Know it, because it is the right
answer when the extra node is genuinely unavailable, and know *why* it loses: two copies of the same
predicate, and the head copy is the one that gets forgotten when the rule changes. It is the cleanest
small example of "smaller surface area beats equal complexity".

**Not worth memorizing — restart-the-scan and rebuild.** Name them both in a sentence each and reject
them: restarting is redundant because a deleted node cannot come back; rebuilding hands the caller a
different list. Keep one fact from the first, though, because it contradicts the obvious guess: a
list of *nothing but matches* is its **best** case (0 inner steps — the head strip does everything),
and its worst shape is survivors first with the matches at the end.

---`
