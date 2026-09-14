// sort-colors — which rungs to know cold, and the drills
//
// Converted from docs/deep/sort-colors_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `**Know cold: the Dutch national flag partition.** This is the reason the problem is asked. Write
the loop without hesitating, use \`mid <= high\` rather than \`<\`, and — this is what actually
separates candidates — be able to *say the invariant out loud* before you write a line: everything
before \`low\` is a zero, everything after \`high\` is a two, everything between \`low\` and \`mid\` is a
one, everything between \`mid\` and \`high\` is unexamined. Then explain the asymmetry in one sentence
("a high-side swap pulls in an element from the unexamined region, so the cursor has to look at it;
a low-side swap pulls in one already classified, so it does not"). An interviewer who hears the
invariant knows you can re-derive the code; one who only sees the code cannot tell whether you
re-derived it or remembered it.

**Know cold: count, then rewrite.** Not because it is hard, but because leading with it is the
right move. It takes twenty seconds, it is already linear, and it makes the follow-up — "now do it
in one pass" — the natural next thing to say rather than a challenge you got caught by. Be ready
for the reason it is not the final answer: it overwrites instead of moving, which breaks the moment
elements carry a payload.

**Understand but do not drill: the library sort.** \`nums.sort()\` is worth exactly one sentence,
said out loud and immediately rejected — "that is O(n log n) and it throws away the fact that there
are only three values". It is the baseline that makes everything after it look like a decision.

---`
