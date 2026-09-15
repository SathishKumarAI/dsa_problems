// permutation-in-string — approach 3 — Carry one "how many letters currently agree" counter
//
// Converted from docs/deep/permutation-in-string_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "agree",
  title: "Carry one \"how many letters currently agree\" counter",
  idea: `*Two counts changed — how many of the twenty-six comparisons can their outcomes have changed?* Exactly
those two. So stop recomputing the verdict and start **maintaining** it: carry one integer for how many
of the 26 letters currently have \`have[i] == need[i]\`, and adjust it only for the two letters that
moved. The window matches when that integer reaches 26.

This fixes Approach 2's weakness: **it reads all 26 comparisons after a move that could only have
changed two of them.**`,
  intuition: `> **Intuition.** Picture twenty-six dials, one per letter, each either *settled* (the window has exactly
> the right number) or *off*. \`agree\` is simply how many dials are settled. When a letter enters, only
> its own dial can move — and it can move in only two ways: it was one short and has just landed on
> target (settle it, \`agree += 1\`), or it was exactly on target and has just overshot by one (unsettle
> it, \`agree -= 1\`). Any other transition leaves the dial as wrong as it already was. The mirror holds
> for the letter leaving. Two dials, four possible transitions, one integer to read.

> **Why it works.** The reason only two cases need testing per letter is that counts move by exactly
> one. A count arriving at \`need[i]\` from below can only have come from \`need[i] - 1\`, so the dial goes
> from off to settled. A count arriving at \`need[i] + 1\` can only have come from \`need[i]\`, so the dial
> goes from settled to off. A count that was already \`need[i] + 3\` and becomes \`need[i] + 4\` was off and
> stays off, and no update is needed. That is why the code tests \`== need[i]\` and \`== need[i] + 1\` on
> entry, and \`== need[i]\` and \`== need[i] - 1\` on exit, and nothing else. Drop either of the "it just
> stopped being right" branches and \`agree\` ratchets upward without ever coming back down.`,
  worked: `\`s1 = "ab"\`, \`s2 = "eidbaooo"\`. The first window is built directly, then each step adjusts. The \`Δ\`
columns show what the entering and leaving letters did to \`agree\`:

| step | enters | leaves | window | \`have\` (non-zero) | Δ enter | Δ leave | \`agree\` |
|---|---|---|---|---|---|---|---|
| initial | — | — | \`ei\` | \`{e: 1, i: 1}\` | — | — | 22 / 26 |
| \`right = 2\` | \`d\` | \`e\` | \`id\` | \`{d: 1, i: 1}\` | −1 | +1 | 22 / 26 |
| \`right = 3\` | \`b\` | \`i\` | \`db\` | \`{b: 1, d: 1}\` | +1 | +1 | 24 / 26 |
| \`right = 4\` | \`a\` | \`d\` | \`ba\` | \`{a: 1, b: 1}\` | +1 | +1 | **26 / 26** |
| \`right = 5\` | — | — | \`ba\` | — | — | — | test at top of loop → **return \`True\`** |

Read the initial row: 22 of 26 dials are settled before a single move, because 24 letters have count
zero in both \`need\` and \`have\` — only \`a\` and \`b\` (needed, absent) and \`e\` and \`i\` (present, unneeded)
are off. Each subsequent row nudges at most two dials.

> **Watch out.** The \`agree == ALPHABET\` test sits at the **top** of the loop, so the window that
> settles at \`right = 4\` is reported on the following iteration. That is deliberate: it also means a
> match in the *final* window is caught by the \`return agree == ALPHABET\` after the loop, when there is
> no next iteration to reach. Moving the test to the bottom of the loop body, or dropping the final
> return, loses a match that sits at the very end of \`s2\` — the test suite's \`s1 = "ab", s2 = "xyzab"\`
> case is there to catch exactly that.`,
  code: `def permutation_in_string_agreement_counter(s1: str, s2: str) -> bool:
    k = len(s1)
    if k > len(s2):
        return False
    need = tally(s1)
    have = tally(s2[:k])
    agree = sum(1 for i in range(ALPHABET) if need[i] == have[i])
    for right in range(k, len(s2)):
        if agree == ALPHABET:
            return True
        enter = slot(s2[right])
        have[enter] += 1
        if have[enter] == need[enter]:
            agree += 1
        elif have[enter] == need[enter] + 1:  # it was settled a moment ago; now it overshoots
            agree -= 1
        leave = slot(s2[right - k])
        have[leave] -= 1
        if have[leave] == need[leave]:
            agree += 1
        elif have[leave] == need[leave] - 1:  # it was settled a moment ago; now it undershoots
            agree -= 1
    return agree == ALPHABET  # catches a match in the final window`,
  mistake: `> **Watch out.** Writing only the \`== need[i]\` branch and omitting the "it just stopped being right"
> branch. The misconception is that \`agree\` counts **arrivals at the target** when it counts *dials
> currently settled* — a quantity that must be able to go down. Without the decrement, \`agree\` only
> ever rises, eventually reaching 26 on a window that matches nothing. Measured: on
> \`s1 = "ab", s2 = "eidboaoo"\` — the statement's own \`false\` example, where the \`a\` and \`b\` are present
> but never adjacent — it returns **\`True\`**. It still answers the statement's \`true\` example
> correctly, so the first test passes and the second fails, which is the worst possible ordering for
> noticing.`,
  cost: `**Time \`O(n)\`.** One pass to build the first window's tally, then one pass over the rest of \`s2\` doing
a bounded amount of work per step: two array updates and at most four integer comparisons. No step
reads more than two slots.

**Space \`O(1)\`.** Two fixed 26-slot arrays and two integers.

This is the one to write. Beyond being the fastest, it is the version that survives a change of
question: **find-all-anagrams is this exact machinery with the \`return True\` replaced by "record
\`right - k + 1\` and keep going"**. If you can write one, you can write the other by editing a single
line — which is worth saying out loud, because it is the follow-up interviewers reach for.

---`,
}
