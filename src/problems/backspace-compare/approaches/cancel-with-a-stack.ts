// backspace-compare — approach 3 — Cancel with a stack.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "cancel-with-a-stack",
  title: "Cancel with a stack",
  idea: `*Rebuilding the whole prefix on every backspace is the cost — is there a container where removing the
last element is cheap?* A stack. Push every letter; on \`'#'\`, pop one if there is one. A pop from an
empty stack is simply ignored, which is exactly what a backspace on empty text does. This fixes the
slicing rung's weakness: **\`O(n)\` work per backspace instead of \`O(1)\`.**`,
  intuition: `> **Intuition.** A spike file — the spike on a café counter that receipts get impaled on. A letter
> goes on the spike; a backspace lifts the top receipt off. Nothing below the top is ever disturbed,
> so each keystroke costs one operation regardless of how much is already there. The empty-spike case
> is a rule rather than an accident: reaching for a receipt that is not there simply does nothing.`,
  worked: `\`s = "abc##d"\`:

| \`i\` | \`ch\` | action | stack before | stack after |
|---|---|---|---|---|
| 0 | \`'a'\` | push | \`[]\` | \`['a']\` |
| 1 | \`'b'\` | push | \`['a']\` | \`['a','b']\` |
| 2 | \`'c'\` | push | \`['a','b']\` | \`['a','b','c']\` |
| 3 | \`'#'\` | pop | \`['a','b','c']\` | \`['a','b']\` |
| 4 | \`'#'\` | pop | \`['a','b']\` | \`['a']\` |
| 5 | \`'d'\` | push | \`['a']\` | \`['a','d']\` |

\`t = "ad#d"\`:

| \`i\` | \`ch\` | action | stack before | stack after |
|---|---|---|---|---|
| 0 | \`'a'\` | push | \`[]\` | \`['a']\` |
| 1 | \`'d'\` | push | \`['a']\` | \`['a','d']\` |
| 2 | \`'#'\` | pop | \`['a','d']\` | \`['a']\` |
| 3 | \`'d'\` | push | \`['a']\` | \`['a','d']\` |

\`['a','d'] == ['a','d']\` → **true** ✅

The run of two hashes is handled naturally — each one is one pop — and no character is ever copied.
But look at rows 1 through 4 of the first table: \`'b'\` and \`'c'\` were **pushed and then popped**. The
stack did work it later undid, because at the moment it met \`'b'\` it could not know \`'b'\` was doomed.
That is the reading-direction problem showing up as measurable waste, and it is what the next rung
removes.`,
  code: `def backspace_compare_stack(s: str, t: str) -> bool:
    typed: list[list[str]] = []
    for text in (s, t):
        keep: list[str] = []
        for ch in text:
            if ch == HASH:
                if keep:              # a backspace on empty text deletes nothing
                    keep.pop()
            else:
                keep.append(ch)
        typed.append(keep)
    return typed[0] == typed[1]`,
  mistake: `> **Watch out.** Popping without the \`if keep:\` guard. The misconception is that a \`'#'\` always has a
> victim — the constraints say explicitly that one with nothing typed before it is a **no-op, not an
> error**, and an unguarded \`pop()\` treats "nothing to delete" as "crash".

Measured on \`s = "#a"\`, \`t = "a"\`: \`IndexError: pop from empty list\`. Unlike the slicing rung, where
Python's \`out[:-1]\` silently did the right thing, a list pop is strict — which is a feature. The guard
is not defensive padding; it is the leading-\`'#'\` rule written down.`,
  cost: `**Time \`O(n + m)\`** — one push or one pop per keystroke, each touching a single element; the final
comparison is one pass. **Space \`O(n + m)\`** — both finished texts held in full.

This is a perfectly good answer and the one to write if the follow-up is never asked: it is short, it
is obviously correct, and its one edge case is stated explicitly in the code rather than relying on a
language quirk. It is also where the interesting question begins, because the trace above shows it
spending work it throws away — which is the opening the last two rungs exploit.

---`,
}
