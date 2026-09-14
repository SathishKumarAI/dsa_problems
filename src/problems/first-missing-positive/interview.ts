// first-missing-positive — which rungs to know cold, and the drills.
//
// Which two or three to have in recall, and why the rest are for understanding
// rather than for typing out under time.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

export const interview = `**Know cold: cyclic placement, and the boolean table.** This question exists to test exactly that
pair. Open with the boolean table — it is linear, it is obviously correct, and describing it proves
you have already deduced the n+1 bound and classified everything outside 1..n as noise. Then say the
sentence that gets you the rest of the way: *"the table has n+1 slots and the array has n, indexed by
the same numbers, so I can use the array as its own table by putting each value v into slot v−1."*
Write it, and then be ready for the two questions that always follow. First: **why is the nested while
loop not quadratic?** (every swap settles one value permanently, there are at most n values, so at most
n swaps happen across the whole run). Second: **what happens on duplicates?** (the guard compares the
destination's contents to the value being placed; without it, \`[1, 1]\` hangs forever). Being unable to
answer either one turns a correct solution into a memorised one, and the interviewer can tell.

**Worth having ready: the hash set.** Four lines, and it is what you would actually ship. Name it in
ten seconds, then say precisely what disqualifies it — not speed, but O(n) memory spent on values the
bound already ruled out.

**Understand but do not drill: the candidate scan and the sort.** The candidate scan's whole value is
that stating it forces you to say the n+1 bound in your first thirty seconds, and that it makes an
unimpeachable oracle for the stress test below. The sort deserves one dismissive sentence about paying
n log n for an ordering the answer never reads — dismissing it for the right reason is what shows you
are choosing rather than pattern-matching.

---`
