// reverse-string — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/reverse-string_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

import type { Unlock } from "../../content/types.ts"

export const understanding = `Given a string, hand back the same characters in the opposite order. \`"hello"\` becomes \`"olleh"\`.
There is no searching, no arithmetic, no condition to satisfy — the answer is fully determined before
you write a line.

So why does this deserve a document? Because **the obvious solutions are quietly quadratic**, and
nothing about them looks expensive. Three lines that read like an \`O(n)\` loop can do \`O(n²)\` work, and
the only way to know is to ask a question about your language that most people never ask.

**The core question: where does each character end up?** Position \`i\` ends up at position
\`n - 1 - i\`. That is the entire specification. What makes the naive approaches slow is not the
question but the answer's delivery: they **grow a new string**, and where strings are immutable,
growing one by a character copies every character already in it. Do that \`n\` times and you have
copied roughly \`n²/2\` characters to move \`n\`.

### The misconception: "appending in a loop is cheap"

> **Watch out.** Before you put a concatenation inside a loop, answer this: **is string concatenation
> in my language \`O(1)\` or \`O(n)\`?** Almost everyone assumes \`O(1)\` because the source line is short.
> It is almost always \`O(n)\`.

| Language | \`s = s + c\` in a loop | Why |
|---|---|---|
| Python | **\`O(n)\` per step** → \`O(n²)\` total, with one fragile exception | \`str\` is immutable; \`+\` allocates a new string and copies both sides. CPython mutates in place when the left operand's refcount is 1 — that never applies to \`c + s\`, survives few refactors, and is not part of the language |
| Java | **\`O(n)\` per step** | \`String\` is immutable. The fix is \`StringBuilder\`, whose \`append\` is amortised \`O(1)\` |
| C++ | amortised **\`O(1)\`** for \`s += c\`, **\`O(n)\`** for \`s = c + s\` | \`std::string\` keeps spare capacity at the end and doubles it — appending is cheap, prepending shifts everything |
| Go, Rust | \`O(n)\` for \`+\` on strings; amortised \`O(1)\` for \`strings.Builder\` / \`String::push\` | Same story: appending into a growable buffer is cheap, rebuilding an object is not |

The rule underneath every row: **appending to the end of a growable buffer is cheap; building a new
object each step is not; prepending is never cheap, because everything already there must move.** Two
of the five approaches below are quadratic, both for exactly that reason.

Measured here on CPython 3.12 — the prepend loop (\`out = c + out\`) against the two-pointer swap:

| \`n\` | prepend loop | two-pointer swap |
|---|---|---|
| 10 000 | 1.2 ms | 0.22 ms |
| 20 000 | 2.7 ms | 0.44 ms |
| 40 000 | 9.4 ms | 0.93 ms |
| 80 000 | 33.3 ms | 1.88 ms |

Double \`n\` and the swap doubles. Double \`n\` and the prepend loop roughly **triples to quadruples**.
That is quadratic growth showing itself, and \`10^5\` is a legal input size.

### The worked example, used in every section below

\`\`\`
s = "hello"        answer: "olleh"
\`\`\`

Five characters — an odd length, so the middle \`'l'\` at index 2 is the character that must stay
exactly where it is. Every approach below is judged partly on how it treats it.

---`

export const unlocks: Unlock[] = [
  {
    "constraint": "`0 <= s.length <= 10^5`",
    "what": "`10^5` is what turns \"quietly quadratic\" into \"actually too slow\": `n²/2` is `5 × 10^9` character copies. It also makes **the empty string legal**, which kills the recursive rung outright and forces every loop below to run zero times rather than once."
  },
  {
    "constraint": "characters are ordinary printable ASCII",
    "what": "**A permission slip you do not need.** Nothing depends on the alphabet, only on position — so no counting array, no character map, no case handling appears anywhere. Worth noticing: the *absence* of an alphabet trick is what leaves position-swapping as the only idea in play."
  },
  {
    "constraint": "an **odd** length leaves a middle character unpartnered",
    "what": "**The constraint that fixes the loop condition.** The middle character is its own mirror, so the loop stops when the indices *meet*, not after they cross."
  },
  {
    "constraint": "the input is a **mutable buffer** (`char[]`, `list`, `std::string`)",
    "what": "**The permission slip for the last rung.** Constant extra space exists only because the answer may be written over the input. An immutable `str` with no copy allowed puts `O(1)` out of reach."
  }
]
