// merge-sorted-array — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/merge-sorted-array_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

import type { Unlock } from "../../content/types.ts"

export const understanding = `Two shelves of books, each shelf already in order. The first shelf is longer than it needs to
be — its left end holds \`m\` books and its right end is \`n\` slots of **empty space** you are welcome
to use. The second shelf holds \`n\` books. Reshelve everything onto the first shelf, still in order,
without wheeling in a third shelf to sort on.

That empty space at the right-hand end is not incidental. It is the whole problem.

**The core question is: at each output position, which of the two lists offers the next value?**
Answering it is easy — compare the two front values and take the smaller. What makes the problem
interesting is *where to put the answer*. The obvious approach, filling \`a\` from index 0 forward,
destroys itself: the very first write to \`a[0]\` lands on one of \`a\`'s own live values, and that
value has not been placed yet. So the naive fix is to save a copy of \`a\` first, and now you are
allocating exactly the memory the problem told you not to.

### The constraints, and what each one unlocks

The middle row deserves saying twice, plainly: **the only reason the good answer walks backwards
is that the free space is at the back.** If the padding were at the front, the good answer would
walk forwards. The technique is not "merging goes backwards"; it is "write into the space you
actually have, and travel in whichever direction keeps the write cursor away from unread data".

---`

export const unlocks: Unlock[] = [
  {
    "constraint": "`0 <= m, n <= 200` and `1 <= m + n`",
    "what": "The input is tiny, so *every* approach here passes a judge — even the quadratic one. That is a warning, not a licence: this problem is graded on technique, and the only thing separating the rungs is how much memory and motion they waste. It also means `m = 0` and `n = 0` are both real inputs that the code must survive."
  },
  {
    "constraint": "`a`'s first `m` values and all `n` of `b`'s are each already sorted",
    "what": "This is what makes a *merge* possible at all. Each comparison places one value permanently, so the whole job is linear — whereas throwing both halves at a sort pays a log factor to rediscover ordering the input already handed you."
  },
  {
    "constraint": "**the last `n` slots of `a` are padding you may overwrite**",
    "what": "The load-bearing one, and the reason this problem exists. **Merging backwards is only legal because the first array has spare room at the end.** Start the write cursor on the last slot and every write lands on either padding or a cell whose value has already been read and placed. Fill forwards and the first write clobbers a value still waiting its turn. Take the spare room away — imagine `a` were exactly `m` long — and there is no in-place answer at all."
  },
  {
    "constraint": "`m = 0` and `n = 0` are both legal",
    "what": "`n = 0` must leave `a` alone and not read `b` at all; `m = 0` means `a` is nothing but padding, so the read cursor into `a` starts at `-1` and must never be dereferenced. In Python `a[-1]` is the *last* element rather than an error, so this bug does not crash — it silently produces a wrong answer."
  },
  {
    "constraint": "values may repeat, within one array and across both",
    "what": "Equal values are interchangeable integers, so ties may break either way without changing the output. That is why one approach can compare with `>` and another with `<=` and both are right."
  }
]
