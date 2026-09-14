// remove-element — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/remove-element_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

import type { Unlock } from "../../content/types.ts"

export const understanding = `You are given an array of numbers and one value. Throw away every occurrence of that value and
hand back what is left, in the order it appeared, working inside the array you were given rather
than building a second one. The answer is a **prefix**: the survivors packed at the front, plus a
count \`k\` of how many there are. Whatever sits in the array past position \`k\` is nobody's business
— the problem makes no promise about it, and you should not make one either.

**The core question is: where does each surviving value belong once the ones before it have been
removed?** The naive answer is to delete matches the way you would from a physical list — find one,
close the hole by sliding everything after it one place left, repeat — and that is slow because
closing the hole touches the entire remaining tail. An array of nothing but \`val\` closes \`n\` holes,
each costing up to \`n\` moves, which is quadratic work to produce an empty answer.

### The constraints, and what each one unlocks

The fourth row is the one to say out loud in an interview before writing anything: *does the order
of the survivors matter?* If it does, you are writing the reader/writer pass below. If it does not,
you can do better on writes, and the answer changes. Asking is the whole first move.

---`

export const unlocks: Unlock[] = [
  {
    "constraint": "`0 <= nums.length <= 100`",
    "what": "Tiny, so every approach here passes a judge — including the quadratic one. Treat that as a warning: this problem is graded on technique, not on the clock. It also means the **empty array is a legal input**, so the code must survive a loop that never runs."
  },
  {
    "constraint": "`0 <= nums[i] <= 50` and `0 <= val <= 100`",
    "what": "`val` can be a number that never appears in the array at all. That is not an exotic edge case, it is the *commonest* shape of input, and it is what motivates the last rung: a pass that removes nothing should not perform `n` writes."
  },
  {
    "constraint": "the answer is a prefix; the tail is unspecified",
    "what": "This is what makes writing back into the input legal at all. You are not required to leave anything sensible past position `k`, so the survivors may be stamped over cells the reader has already finished with."
  },
  {
    "constraint": "**the survivors keep their ORIGINAL relative order**",
    "what": "This is the constraint that *forbids* the trick you may have seen elsewhere. **Swapping a matched value with the last live element — the O(number-of-removals)-writes version — is only legal when the order of the kept values does not matter.** LeetCode accepts the survivors in any order, so there that trick is fair game. This variant pins the order deliberately, so that five different implementations can be compared against each other by value rather than by set. Both facts are worth holding: the trick exists, and the contract is what decides whether you may use it."
  },
  {
    "constraint": "an empty array is legal, and so is an array where every value is `val`",
    "what": "Both answer with nothing, so the code must be correct when the writer **never advances** and `k` comes back as `0`."
  }
]
