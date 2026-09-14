// backspace-compare — approach 2 — Type it out, trimming with a slice.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "rebuild-the-text-by-slicing",
  title: "Type it out, trimming with a slice",
  idea: `*The recursion opens a call frame per deletion and copies both strings each time — can the same cancel
rule run in a flat loop over one string at a time?* Yes: walk the keystrokes forward, appending
letters to a growing text and trimming the last character whenever a \`'#'\` arrives. This fixes the
recursion's weakness — **call depth, and re-scanning both strings for every single backspace** — by
touching one string per pass with no recursion at all.`,
  intuition: `> **Intuition.** Actually typing into the box. You hold the text so far; a letter goes on the end, a
> backspace takes one off the end. There is no lookahead and no cleverness — the code is a
> transcription of what the text editor does, which is why it is the first version most people
> believe on sight. What it hides is that in an immutable-string language, "take one off the end"
> builds a brand-new string every time.`,
  worked: `\`s = "abc##d"\`:

| \`i\` | \`ch\` | \`out\` before | \`out\` after |
|---|---|---|---|
| 0 | \`'a'\` | \`""\` | \`"a"\` |
| 1 | \`'b'\` | \`"a"\` | \`"ab"\` |
| 2 | \`'c'\` | \`"ab"\` | \`"abc"\` |
| 3 | \`'#'\` | \`"abc"\` | \`"ab"\` |
| 4 | \`'#'\` | \`"ab"\` | \`"a"\` |
| 5 | \`'d'\` | \`"a"\` | \`"ad"\` |

\`t = "ad#d"\`:

| \`i\` | \`ch\` | \`out\` before | \`out\` after |
|---|---|---|---|
| 0 | \`'a'\` | \`""\` | \`"a"\` |
| 1 | \`'d'\` | \`"a"\` | \`"ad"\` |
| 2 | \`'#'\` | \`"ad"\` | \`"a"\` |
| 3 | \`'d'\` | \`"a"\` | \`"ad"\` |

\`"ad" == "ad"\` → **true** ✅

Read the \`out\` column of the first table and the waste is visible: \`'b'\` and \`'c'\` were written and
then thrown away, and \`"abc"\` was rebuilt as \`"ab"\` and then as \`"a"\`. **Every character here was
touched at least twice.**`,
  code: `def backspace_compare_slicing(s: str, t: str) -> bool:
    typed: list[str] = []
    for text in (s, t):
        out = ""
        for ch in text:
            if ch == HASH:
                out = out[:-1]        # slicing an empty string is a silent no-op in Python
            else:
                out = out + ch
        typed.append(out)
    return typed[0] == typed[1]`,
  mistake: `> **Watch out.** Declaring \`out = ""\` **outside** the \`for text in (s, t)\` loop. The misconception is
> that \`typed.append(out)\` "captures" the text and starts fresh — it does not; the next string keeps
> typing into the same box, so the second text is the first one with more keystrokes appended.

Measured on the worked example it returns \`False\`: \`s\` finishes as \`"ad"\`, then \`t\`'s keystrokes are
appended to it, giving \`"adad"\`, and \`"ad" != "adad"\`. It returns \`False\` on \`"ab#c"\` / \`"ad#c"\` and on
\`"#a"\` / \`"a"\` too — in fact it returns \`False\` on essentially every \`true\` case, which at least makes
it easy to spot. Scoping a per-iteration accumulator inside the loop is the fix, and it is worth
noticing that the bug is invisible in the diff and obvious in the trace.

There is also a **language trap** hiding in the correct version. \`out[:-1]\` on an empty string is
\`""\` in Python — a silent no-op, which happens to be exactly the rule for a leading \`'#'\`. The same
line written in Java as \`out.substring(0, out.length() - 1)\` throws
\`StringIndexOutOfBoundsException\`. The Python version is correct by luck; the next rung states the
rule outright with an explicit guard, which is better.`,
  cost: `**Time \`O(n² + m²)\`** — each \`'#'\` rebuilds the entire text so far, so text typed and deleted
repeatedly costs quadratic work for a linear number of keystrokes. **Space \`O(n + m)\`** — both
finished texts, plus a discarded intermediate at each step.

Never ship it. It earns its rung because it makes one thing concrete that the recursion obscured: the
algorithm here is already linear in *keystrokes*, and all the cost is in the **container**. That
framing is what makes the fix obvious.

---`,
}
