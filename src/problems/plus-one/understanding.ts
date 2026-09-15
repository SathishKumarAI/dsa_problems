// plus-one — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/plus-one_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

import type { Unlock } from "../../content/types.ts"

export const understanding = `Someone has taken a number apart. Instead of a single value you get a list holding one decimal digit
per slot, written the way you would write it on paper — most significant first — so \`[1, 9, 9]\` is
one hundred and ninety-nine. Add one to that number and hand the answer back in the same taken-apart
form.

**The core question:** which digits actually change when you add one, and does the answer need more
room than the input had? The obvious move is to glue the digits back into a number, add one, and
take it apart again. That is not slow. It is **unsafe** — the number may have a hundred digits, and
no fixed-width integer type in Java, C++, Go or Rust holds a hundred-digit number.

That is where this problem is usually misread, so it is worth naming the misconception outright.

> **Watch out.** The thought you are about to have is *"the array is just an awkward way of writing
> an \`int\`, so my first job is to turn it back into one."* It is the other way round. The **array**
> is the real representation, and the \`int\` is the thing that cannot hold it. In Python the naive
> version is genuinely correct — Python integers grow without limit — so a Python solver can pass
> every test and never discover what the problem is about.

The ladder below is therefore not mainly a ladder of speed. It is a ladder of **width independence**
first, and then of doing the addition with less state and fewer passes.

### The constraints, and what each one unlocks

The worked example below is the statement's third — chosen because it is the only one that exercises
a carry that **travels and then stops**, which is the behaviour the later rungs are built around:

\`\`\`
digits = [1, 9, 9]        answer: [2, 0, 0]   (199 + 1 = 200)
\`\`\`

\`[9, 9, 9] -> [1, 0, 0, 0]\` is the other shape to hold in your head. It appears in the "Common
mistake" sections because it is where four of the five rungs break when they break.
### Shared scaffolding

One decision recurs in three rungs: what the answer looks like when the carry escapes the front. It
is lifted to a single named helper so there is exactly one place to change it.

\`\`\`python
def all_nines_answer(length: int) -> list[int]:
    """The answer when every digit was a 9: a leading 1 and \`length\` zeros."""
    return [1] + [0] * length
\`\`\`

---`

export const unlocks: Unlock[] = [
  {
    "constraint": "`1 <= digits.length <= 100`",
    "what": "Never empty, so `digits[-1]` is always a real slot and no rung needs an empty-input branch. But a hundred digits is roughly a 333-bit number, and the largest unsigned 64-bit integer is 20 digits. **This is what kills Approach 1 outside Python** — measured below, nineteen nines already overflows a signed 64-bit accumulator."
  },
  {
    "constraint": "`0 <= digits[i] <= 9`",
    "what": "One decimal digit per slot, so a digit plus one is at most 10 and **the carry out of any column is 0 or 1, never more**. That is why every rung can hold a single flag instead of an arbitrary number, and why `total // 10` is always 0 or 1."
  },
  {
    "constraint": "no leading zeros, except that `[0]` is a legal way to write zero",
    "what": "The input is a canonical spelling and the output must be one too. `[0, 1, 0, 0]` is not an acceptable way to write one hundred, which is why the growing case prepends exactly one `1` rather than padding."
  },
  {
    "constraint": "a carry out of the leading digit makes the answer exactly one digit longer",
    "what": "**This unlocks the last two rungs.** Growth is not arbitrary: the answer is the same length or one longer; it is longer only when every digit was a 9; and in that case it is always a `1` followed by that many zeros. Knowing the only growing case in closed form is what lets Approach 4 decide it before the loop and Approach 5 recognise it by falling off the front."
  },
  {
    "constraint": "we add one to a **non-negative** number",
    "what": "No borrow, no sign, no subtraction. The entire problem is one direction of carry."
  }
]
