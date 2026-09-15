// boats-to-save — which rungs to know cold, and the drills.
//
// Which two or three to have in recall, and why the rest are for understanding
// rather than for typing out under time.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

export const interview = `**Memorise cold — sort plus two converging pointers.** This is the expected answer and it is five
lines; you should be able to write it without pausing over \`i <= j\`. But writing it is the easy half.

**Memorise cold — the exchange argument.** A greedy that you cannot justify is indistinguishable from
a guess, and this is the problem where interviewers ask. Practise saying it in three sentences: the
heaviest person is boarding regardless; if the lightest cannot join them, nobody can; if the lightest
can, pairing them there never blocks a pairing that mattered, because every other candidate is heavier
and harder to place. Add the counter-example that kills the obvious alternative — pairing from the
light end returns \`3\` on \`[1, 1, 2, 2]\` with limit \`3\`, where \`2\` is achievable — and you have
demonstrated you know *why* rather than *that*.

> **In an interview.** Say this, in this order. *"Sort the weights, then put one index at the lightest
> person and one at the heaviest. Each round launches exactly one boat for the heaviest person still
> waiting; if the lightest fits beside them they board too and the light index advances. That is
> \`O(n log n)\` for the sort and \`O(1)\` extra space."* Then justify it before you are asked, because
> this is the problem where they ask: *"The heaviest person is boarding regardless, so the only
> question is whether the lightest can join. If they cannot, nobody can. If they can, using them here
> never blocks a pairing that mattered, because every other candidate is heavier and harder to place
> later."* Two follow-ups are near-certain. **"What if a boat holds three?"** — the greedy dies, this
> becomes bin packing, and the honest answer is that no simple exchange argument survives; a bitmask
> search works for tiny \`n\`. **"The weights are bounded — can you drop the sort?"** — yes, count into
> buckets for \`O(n + limit)\`, then note that at \`limit = 30000\` the table can dwarf the crowd, so the
> sort usually still wins.

**Understand but do not memorise — the bucket count.** Worth recognising, because "small bounded
integers, so count instead of sort" is a move you will need elsewhere (sort-colors, anagram checks,
character frequency). Worth rejecting here, out loud, on the grounds that the table is sized by the
limit and not the crowd — naming a technique and correctly declining it is a stronger signal than not
knowing it exists.

**Understand but do not memorise — the exact subset search.** Nothing to recall beyond the shape:
bitmask over subsets, one transition per boatload. Its value is that it tells you where the boundary
is. Change "two per boat" to "three per boat" and the greedy dies, this becomes bin packing, and the
bitmask is suddenly the *only* thing you have — which is exactly the follow-up question an
interviewer reaches for.

**Understand but do not memorise — the rescan and the queue.** They are steps in the argument rather
than destinations. Their lesson is that a correct rule can still be slow, and that the bottleneck
moves when you fix things: first the searching is the cost, then the removing is, and only when both
are gone does the sort become the whole bill.

---`
