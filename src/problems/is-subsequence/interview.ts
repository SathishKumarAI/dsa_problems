// is-subsequence — which rungs to know cold, and the drills.
//
// Which two or three to have in recall, and why the rest are for understanding
// rather than for typing out under time.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

export const interview = `> **In an interview.** Say the exchange argument **before** the code, unprompted: *"taking the
> earliest match is never worse, because it leaves strictly more of the text for everything still to
> be matched."* One sentence, and it is what separates understanding from recital. Then expect the
> real question, which on this problem is always the follow-up: **"now I hand you one fixed text and
> ten thousand patterns."** Answer with precomputed next-occurrence — \`26 × |t|\` entries, \`O(|s|)\`
> per query — and name the binary-search variant that trades a smaller table for a \`log\` factor.

**Know cold — the two-cursor pass and the exchange argument under it.** Four lines you should be
able to write without thinking, \`i < len(s)\` guard included; that guard is the single most common
way this gets broken under pressure. You do not need to code the next-occurrence table live, but you
should be able to describe its shape, its build cost, and the per-query cost it buys.

**Understand but do not drill: the per-letter search.** Say it in the first fifteen seconds to show
you have read the definition correctly, name the trap in it out loud — *if I restarted each search
at the beginning of the text I would let two pattern letters match the same text position, and
\`"aa"\` would look like a subsequence of \`"ab"\`* — and then collapse it into the one-pass version.
Naming that trap is worth more than the code itself, because it is the thing that separates
understanding the definition from having memorised a loop.

---`
