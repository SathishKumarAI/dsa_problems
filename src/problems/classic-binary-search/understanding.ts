// classic-binary-search — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/classic-binary-search_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

import type { Unlock } from "../../content/types.ts"

export const understanding = `You are handed a shelf of numbered tickets, already in order, smallest on the left. Someone names a
number. Tell them which slot it is in, or tell them it is not on the shelf.

That is the whole statement, and it is deceptively small. The reason this problem is the first rung
of an entire pattern is not that it is hard — it is that it is the **smallest problem in which the
loop's contract is the entire difficulty**. Nobody has ever failed to understand "look at the middle
and throw away half". People fail at \`mid + 1\` versus \`mid\`, at \`<\` versus \`<=\`, and at what \`lo\`
means once the loop has stopped. Those three failures are the subject of this document.

**The core question:** not "where is the target" but **"which half of what remains can I discard
without looking inside it?"** The naive approach is slow because it never asks that question at all
— it treats an ordered shelf as an unordered bag and reads every ticket, throwing away the one
promise the input makes.

### The loop contract — read this before any code

Every binary search in this pattern is one of two shapes, and almost every bug in the family is
someone writing half of one and half of the other. Pick a contract, state it, keep it.

| | **Inclusive** \`[lo, hi]\` | **Converging** \`[lo, hi]\` |
|---|---|---|
| What the range means | every index from \`lo\` to \`hi\` is still a candidate | the answer is somewhere in \`lo..hi\`; shrink to one survivor |
| Loop test | \`while lo <= hi\` | \`while lo < hi\` |
| On "answer is strictly right" | \`lo = mid + 1\` | \`lo = mid + 1\` |
| On "answer is at or left of mid" | \`hi = mid - 1\` | \`hi = mid\` |
| Loop ends when | the range is **empty**: \`lo == hi + 1\` | the range is **one index**: \`lo == hi\` |
| Answer read from | a \`return\` inside the loop, or \`lo\` | \`nums[lo]\`, then verified |
| Probes when nothing is found | ⌊log₂n⌋ + 1 | exactly ⌈log₂n⌉ |

Two rules make the table safe to use, and they are not interchangeable:

- **Inclusive form: both moves must skip \`mid\`.** You have just compared \`nums[mid]\` to the target
  and learned everything \`mid\` can tell you. Leaving \`mid\` inside the range means re-asking a
  question you have already answered, and on a two-element range that is an infinite loop.
- **Converging form: exactly one side skips \`mid\`, and it must be \`lo\`.** \`hi = mid\` deliberately
  keeps \`mid\` as a candidate — that is the point, it is how the survivor can *be* \`mid\`. So the other
  branch has to make strict progress, or nothing shrinks.

> **Watch out.** The two mixings are the two classic failures, and they fail in opposite ways.
> \`while lo <= hi\` paired with \`hi = mid\` **never terminates** on a range where \`mid == lo == hi\`.
> \`while lo < hi\` paired with \`hi = mid - 1\` **steps over the answer**, because the converging form
> never gets to re-examine \`mid\` and you just discarded it. If you can only remember one thing:
> \`<=\` goes with \`mid ± 1\`, \`<\` goes with \`hi = mid\`.

### The midpoint, plainly

Write \`mid = lo + (hi - lo) // 2\`, not \`(lo + hi) // 2\`. Here is the actual reason, without the
folklore:

- **In Python the two are always the same number.** Python integers do not overflow; there is no
  value of \`lo\` and \`hi\` for which they differ. In Python this is a style choice and nothing more.
- **In Java and C++ they differ**, because \`int\` is 32 bits and wraps. This repo ships all three
  languages for every problem, so the habit has to survive the translation. With \`lo\` and \`hi\` both
  at \`1073741824\` (2³⁰), Java computes \`(lo + hi) / 2\` as **−1073741824** — a negative index, and an
  \`ArrayIndexOutOfBoundsException\` one line later. \`lo + (hi - lo) / 2\` returns \`1073741824\`. With
  \`lo = 1000000000, hi = 2000000000\` the naive form gives **−647483648**; the safe form gives
  \`1500000000\`. (Those three numbers are simulated 32-bit arithmetic, run, not recited.)
- **For this problem it cannot happen**, because \`hi <= 9999\`. It is a real bug in real code — it
  lived in the JDK's own \`Arrays.binarySearch\` for nine years — but on an array of 10⁴ elements it
  is theatre. Write the safe form because it costs nothing and because the same fingers will one day
  binary-search a range of file offsets, not because this input can trigger it.

The repo is consistent with itself here: the Java in \`first-last-position.ts\` already writes
\`lo + (hi - lo) / 2\` while the Python in this problem writes \`(lo + hi) // 2\`, and both are correct
for the reasons above. The documents below use \`lo + (hi - lo) // 2\` everywhere so the shape is one
shape.

### The worked example used in every section below

\`\`\`
nums = [-3, 0, 4, 9, 12]
\`\`\`

Two targets are traced through every approach, because this problem has two answers and only one of
them is interesting:

| target | answer | why it is in the trace |
|---|---|---|
| \`9\` | \`3\` | the hit — the easy path everyone gets right |
| \`2\` | \`-1\` | the miss — it sits between \`0\` and \`4\`, so the range must empty out and **the exit state is the only thing that can report it** |

---`

export const unlocks: Unlock[] = [
  {
    "constraint": "`1 <= nums.length <= 10^4`",
    "what": "Ten thousand. **This constraint does not rule out the linear scan** — 10⁴ comparisons is microseconds, and a scan would pass. The log bound here is a *stated requirement*, not a performance necessity, which makes this the rare problem where you must write the fast version because you were told to, not because you measured. The array is also never empty, so `nums[0]` is always safe."
  },
  {
    "constraint": "`-10^4 <= nums[i], target <= 10^4`",
    "what": "Values fit an `int` in any language with room to spare. More usefully: indices run to at most 9999, so `lo + hi <= 19998`, and **the famous midpoint overflow cannot happen here.** That matters — it means writing the overflow-safe midpoint in this problem is a *habit*, not a fix, and you should know which it is."
  },
  {
    "constraint": "sorted ascending",
    "what": "**This is the constraint that makes halving legal.** Everything below follows from it and nothing works without it. One unsorted element and every rung past the first is wrong."
  },
  {
    "constraint": "every value is distinct",
    "what": "The answer is unique, so \"an index holding the target\" and \"the index of the target\" are the same phrase. **Delete this promise and the problem splits in two** — which is exactly what `first-last-position` is."
  },
  {
    "constraint": "return `-1` when the target is absent",
    "what": "The loop must end in a state that can *distinguish* \"absent\" from \"found\", and the two contracts below do that differently: one returns from inside the loop, the other reads the answer off the exit position."
  },
  {
    "constraint": "\"Must run in `O(log n)`\"",
    "what": "The linear scan is excluded by fiat. Say so out loud and move on."
  }
]
