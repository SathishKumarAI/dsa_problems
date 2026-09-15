// backspace-compare — which rungs to know cold, and the drills.
//
// Which two or three to have in recall, and why the rest are for understanding
// rather than for typing out under time.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

export const interview = `**Know cold: the two backward cursors.** This problem exists for its constant-space follow-up, and an
answer that stops at the stack stops one question early. What must be automatic is the helper's loop
— consume the **whole** run of hashes before returning a survivor — and the length-mismatch branch,
which is the single most commonly omitted line in this problem and the only thing preventing \`"c"\` and
\`"ac"\` from comparing equal.

**Know cold: why backwards works and forwards does not.** *"Forwards, a character's fate depends on
keystrokes that have not happened yet; backwards, the \`'#'\` arrives first, so a debt counter decides
each character on sight."* Say that before writing anything. It is the transferable idea, it explains
every rung below it in one sentence, and it is what the question is screening for.

**Understand but do not drill: the recursion, the slicing version and the stack.** The stack is worth
being able to write quickly as a warm-up or a fallback — it is linear, obviously correct, and states
the leading-\`'#'\` rule explicitly with \`if keep:\` — but say its \`O(n + m)\` space out loud and then
improve on it. The recursion and the slicing version are each worth one sentence: the first to fix the
rule in your head, the second to locate the cost in the container rather than the logic.

---`
