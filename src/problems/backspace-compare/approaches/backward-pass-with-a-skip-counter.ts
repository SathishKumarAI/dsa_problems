// backspace-compare — approach 4 — Read backwards with a debt counter.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "backward-pass-with-a-skip-counter",
  title: "Read backwards with a debt counter",
  idea: `*The stack pushes every letter before it can know whether that letter lives — can the reading order be
changed so each character is decidable on sight?* Read right to left. Then the \`'#'\` arrives
**before** its victim, so a counter of deletions still owed is enough: a \`'#'\` raises the debt, a
letter with debt outstanding pays one off and dies, a letter with no debt survives. This fixes the
stack's weakness — **work it later undoes** — and nothing is ever pushed only to be popped.`,
  intuition: `> **Intuition.** Reading a bank statement from the bottom up. You see the withdrawals before the
> deposits they cancel, so by the time you reach a deposit you already know whether it has been spent.
> The number you carry is a **debt**: how many surviving characters are still owed to backspaces you
> have already passed. Every character you meet is judged immediately and finally — there is no
> pending state, no undo, and nothing to revisit.`,
  worked: `\`s = "abc##d"\`, read from index 5 down to 0:

| \`i\` | \`ch\` | debt before | debt after | verdict | survivors so far (reverse order) |
|---|---|---|---|---|---|
| 5 | \`'d'\` | 0 | 0 | **survives** | \`['d']\` |
| 4 | \`'#'\` | 0 | 1 | debt +1 | \`['d']\` |
| 3 | \`'#'\` | 1 | 2 | debt +1 | \`['d']\` |
| 2 | \`'c'\` | 2 | 1 | dies, pays one | \`['d']\` |
| 1 | \`'b'\` | 1 | 0 | dies, pays one | \`['d']\` |
| 0 | \`'a'\` | 0 | 0 | **survives** | \`['d','a']\` |

\`t = "ad#d"\`, read from index 3 down to 0:

| \`i\` | \`ch\` | debt before | debt after | verdict | survivors so far |
|---|---|---|---|---|---|
| 3 | \`'d'\` | 0 | 0 | **survives** | \`['d']\` |
| 2 | \`'#'\` | 0 | 1 | debt +1 | \`['d']\` |
| 1 | \`'d'\` | 1 | 0 | dies, pays one | \`['d']\` |
| 0 | \`'a'\` | 0 | 0 | **survives** | \`['d','a']\` |

\`['d','a'] == ['d','a']\` → **true** ✅ Both lists are in reverse order, and both consistently so, which
is why they can be compared directly without reversing either.

Rows \`i=4\` and \`i=3\` of the first table are the run of hashes, and the debt climbing to \`2\` is the
whole point: a flag would have stopped at "yes, delete something".`,
  code: `def backspace_compare_backward_pass(s: str, t: str) -> bool:
    survivors: list[list[str]] = []
    for text in (s, t):
        out: list[str] = []
        skip = 0
        for i in range(len(text) - 1, -1, -1):
            if text[i] == HASH:
                skip += 1             # a COUNTER, not a flag: a run of hashes owes that many
            elif skip > 0:
                skip -= 1
            else:
                out.append(text[i])
        survivors.append(out)
    return survivors[0] == survivors[1]`,
  mistake: `> **Watch out.** Using a boolean flag instead of a counter — \`skip = True\` on a \`'#'\`, \`skip = False\`
> on the next letter. The misconception is that a backspace is a *state* ("the next character dies")
> rather than a *quantity*. A boolean cannot hold "two characters are owed", so a **run of hashes
> deletes only one character**.

Measured on the worked example it returns \`False\`. Traced: reading \`"abc##d"\` backwards, \`'d'\`
survives, the first \`'#'\` sets the flag, the second \`'#'\` sets the already-set flag (the second
deletion is lost), \`'c'\` clears the flag and dies, and then \`'b'\` and \`'a'\` both **survive** — giving
\`"abd"\` instead of \`"ad"\`, against \`t\`'s correct \`"ad"\`.

It also mis-handles over-deletion in the other direction: on \`s = "ab##"\`, \`t = "a"\` it returns \`True\`
where the answer is \`False\`, because only one of the two trailing hashes was honoured, leaving \`"a"\`.
And on \`s = "abcdef#####g"\`, \`t = "ag"\` it returns \`False\`. Note that it is **correct** on
\`"ab#c"\` / \`"ad#c"\`, which has no run — testing without a run of hashes cannot catch this.`,
  cost: `**Time \`O(n + m)\`** — one pass per string, one decision per character, and no character is ever
revisited. **Space \`O(n + m)\`** — the two survivor lists.

Its asymptotic cost matches the stack, so on paper it is not an improvement — and that is exactly why
it matters. The gain is not the complexity class but the **idea**: a counter replaced a container
because the reading direction made each decision final. Keep that idea and drop the lists, and the
next rung is what remains.

---`,
  notes: [
    { title: "why it works", body: `> **Why it works.** The claim is that \`skip\` — the count of unpaid hashes seen so far, reading right
> to left from the end — is **complete information** about whether the next character survives. Why:
> the editor's rule is that a \`'#'\` deletes the nearest surviving character to its *left*. So for a
> character at position \`i\`, whether it survives depends entirely on the hashes at positions \`> i\` and
> the characters between them — that is, entirely on the suffix you have **already read**. Reading
> backwards, the suffix is exactly your history, so no future input can change a verdict you have
> issued.
>
> Contrast the forward direction. There, the fate of the character at \`i\` depends on the hashes at
> positions \`> i\` — the part you have **not read yet**. That is why every forward approach must keep
> the character around provisionally: not because it is written badly, but because the information
> needed to decide has not arrived. The stack is not a poor choice for a forward pass; it is the
> *right* choice, and the forward pass is the wrong direction.
>
> The debt must be a **counter and not a flag**, because \`skip\` has to represent "three characters are
> still owed", and that is exactly what a run of hashes produces. The clamp \`elif skip > 0\` is the
> other half: a letter met with no debt outstanding survives, which is what makes a leading \`'#'\`
> harmless — its debt is simply never collected.
>
> The general lesson: **when a rule refers to what comes after, try walking the other way.** Here it
> turns an undo-heavy container into a single integer.` },
  ],
}
