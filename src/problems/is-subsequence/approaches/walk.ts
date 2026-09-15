// is-subsequence — approach 2 — Two cursors, one pass.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "walk",
  title: "Two cursors, one pass",
  idea: `*The per-letter hunt keeps a resume pointer, a sentinel and a nested loop just to remember where
it got to in the text — can the text be walked only once, with the position kept for free?* Yes.
Turn the loop inside out: instead of driving the pattern and searching the text, drive the **text**
and let the pattern's cursor advance whenever the current text character happens to be the one the
pattern is waiting for. The resume pointer becomes the loop variable, the sentinel disappears, and
the nested loop collapses into a single \`if\`.`,
  intuition: `> **Intuition.** A queue of people filing past a bouncer holding a guest list. Everyone in the
> queue is looked at exactly once and nobody is called back; the bouncer ticks the **next** name on
> the list only when the person walking past happens to be that name, and waves everyone else
> through. If the queue empties with every name ticked, the answer is yes.
>
> Two cursors, then — but unlike the rest of this family, walking **two different sequences**. The
> text cursor sweeps \`t\` one character per step and never goes back; the pattern cursor sits on the
> character still being waited for and moves only when the text hands it a match. The gap between
> them is exactly the number of text characters thrown away.

> **Why it works.** Greed is safe here by an **exchange argument**. Suppose some successful matching
> skips the occurrence of the needed character at position \`j\` and uses a later one at \`j' > j\`.
> Rewrite it to use \`j\` instead: everything still to be matched now has the whole of \`t[j+1..]\` to
> work with, which is a *superset* of \`t[j'+1..]\`, so nothing that used to fit can stop fitting.
> Any winning matching can therefore be rewritten into the earliest-match one — so if an answer
> exists at all, the greedy sweep finds it, and a single forward pass with **no backtracking** is
> complete rather than merely plausible.`,
  worked: `Input: \`s = "abc"\`, \`t = "ahbgdc"\`.

| Step | Text cursor \`j\` (char) | Pattern cursor \`i\` | Waiting for \`s[i]\` | Match? | \`i\` after |
|---|---|---|---|---|---|
| 1 | 0 (\`a\`) | 0 | \`a\` | yes | 1 |
| 2 | 1 (\`h\`) | 1 | \`b\` | no | 1 |
| 3 | 2 (\`b\`) | 1 | \`b\` | yes | 2 |
| 4 | 3 (\`g\`) | 2 | \`c\` | no | 2 |
| 5 | 4 (\`d\`) | 2 | \`c\` | no | 2 |
| 6 | 5 (\`c\`) | 2 | \`c\` | yes | 3 |

The text is exhausted with \`i = 3 = len(s)\`, so every character of the pattern was placed in
order: \`True\`. Six steps, one per character of \`t\`, and the pattern cursor moved three times — the
gap of three is exactly the \`h\`, \`g\` and \`d\` that were skipped.

Run the same trace with \`s = "axc"\` and the only change is step 3: the pattern is waiting for \`x\`,
the \`b\` is not it, and \`i\` stays at 1 forever. The loop still finishes — it always reads all of \`t\`
— and ends with \`i = 1 ≠ 3\`, so \`False\`.`,
  code: `def is_subsequence_two_pointers(s: str, t: str) -> bool:
    i = 0
    for ch in t:
        if i < len(s) and s[i] == ch:  # the i < len(s) guard is what ends the walk
            i += 1
    return i == len(s)`,
  mistake: `> **Watch out.** The misconception is that \`i < len(s)\` is a **defensive** check — belt-and-braces,
> droppable once the logic is right. It is not defensive, it is the **termination condition**: the
> moment the pattern is fully matched, \`i\` equals \`len(s)\` and \`s[i]\` is off the end of the string.

Drop the guard and the function works perfectly whenever the last match lands on the last character
of \`t\`, and crashes otherwise. Measured: \`s = "abc"\`, \`t = "abc"\` returns **\`True\`**; \`s = "abc"\`,
\`t = "abcd"\` raises **\`IndexError: string index out of range\`**. That is the worst kind of bug — the
one whose obvious test case passes.

> **Watch out.** The second misconception is that the early exit and the final verdict are the
> **same expression**, so the \`return\` can simply be moved inside the loop. \`i == len(s)\` is a claim
> about the completed walk; asked early, it is a claim about nothing.

Returning \`True\` the moment \`i\` reaches \`len(s)\` is a legitimate speed-up. Writing it as
\`return i == len(s)\` *inside* the loop is not: on the worked example below it returns **\`False\`** at
the first character, because a pattern that is not yet complete gets reported as one that never will
be. And the empty pattern must still answer \`True\` without entering the loop at all, which the
version above gets for free — \`i\` starts at \`0\`, \`len(s)\` is \`0\`, and \`0 == 0\`.`,
  cost: `**Time** \`O(|t|)\`, **space** \`O(1)\`. Every character of the text is examined exactly once and does
a single comparison; the pattern cursor only ever moves forward, never more than \`|s|\` times in
total, so it contributes nothing extra. Space is one integer.

This is the right answer for the question as asked, and for any single-query version of it. Where
it stops being right is the follow-up an interviewer will reach for: *one fixed text, and a stream
of ten thousand different patterns to check against it.* Now \`O(|t|)\` per query is the bottleneck.

The fix is to preprocess the text once — for every position and every one of the \`26\` letters, store
the index of that letter's next occurrence at or after that position. Each query then walks only its
own pattern, jumping straight to the next occurrence, at \`O(|s|)\` (or \`O(|s| log |t|)\` if you keep
per-letter position lists and binary-search them instead of a full table). The build is
\`O(26 · |t|)\`, paid once. That trade — pay a lot once so each of many queries is cheap — is the
actual lesson hiding behind an easy problem.

---`,
}
