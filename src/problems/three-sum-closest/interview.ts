// three-sum-closest — which rungs to know cold, and the drills
//
// Converted from docs/deep/three-sum-closest_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `**Know cold: the two-pointer sweep with the early exit.** It is the expected answer and it is short.
What must be automatic is the strict \`while lo < hi\` (equal pointers would use one position twice),
the seed being a real triple rather than \`0\` or an infinity, and the move rule being driven by the
**sign** of \`s − target\` with no exact-hit branch except the return.

**Know cold: how this differs from 3Sum.** Being able to state the three differences — no
duplicate-skipping, a separately tracked best, an early return instead of a recorded hit — is worth
more than the code, because the interviewer is watching to see whether you pattern-match or read. A
candidate who ports 3Sum's skip loops in and then debugs them has failed the actual test.

**Understand but do not drill: the cubic brute force, the pruned version, and the binary search.** The
brute force earns ten seconds as the reference and the price quote. The pruned version earns one
sentence — *"sorting makes the inner loop monotone, so the two sums bracketing the target are the only
candidates"* — because that sentence is what makes the two-pointer move rule obvious afterwards. The
binary search is worth recognising if an interviewer proposes it, and worth being able to say why the
pointer sweep beats it: it restarts for every pair rather than carrying what it learned.

---`
