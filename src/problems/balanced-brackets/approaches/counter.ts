// balanced-brackets — approach 3 — A single counter (constraint-exploiting, and only for one bracket kind)
//
// Converted from docs/deep/balanced-brackets_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "counter",
  title: "A single counter (constraint-exploiting, and only for one bracket kind)",
  idea: `*The stack holds up to n characters — can the problem be decided in constant space?* Only if you
narrow the alphabet. If there is exactly **one** kind of bracket, then every opener is
interchangeable with every other opener, so you do not need to know *which* one is on top; you only
need to know *how many* are open. A single integer replaces the entire stack. This fixes the stack
rung's only remaining weakness — **O(n) space** — but it pays for it by giving up the ability to
detect failure mode 2 at all.`,
  intuition: `> **Intuition.** A **depth gauge** instead of a stack of plates. Walking left to right, an opener
> takes you one level deeper and a closer brings you one level back up. A well-formed string is a walk
> that never goes below the surface and finishes back at the surface exactly. Going below the surface
> is a closer with nothing open (failure 1); finishing above it is an opener never closed (failure 3).

This only works for one bracket kind because a counter represents *depth* but not *identity*. It has
no way to remember that the box you are currently inside was a square one, so it cannot notice you
trying to close it with a curly.`,
  worked: `\`s = "([{}])"\`, the same input, through the depth gauge. The "stack" here is a single number, which
is precisely the point.

| k | \`s[k]\` | Action | Depth after |
|---|---|---|---|
| 0 | \`(\` | opener → +1 | 1 |
| 1 | \`[\` | opener → +1 | 2 |
| 2 | \`{\` | opener → +1 | 3 |
| 3 | \`}\` | closer → −1 | 2 |
| 4 | \`]\` | closer → −1 | 1 |
| 5 | \`)\` | closer → −1 | 0 |

Never negative, ends at 0 → **true**. Which is the correct answer, and it is correct **by accident**.
The counter never checked a single kind against another; it would have returned \`true\` for \`([{)]}\`
just as happily. Run it on the statement's second example \`"(]"\` and it reports \`true\`, where the
right answer is false: depth goes 1, then 0, never negative, ends at zero.

That is the whole lesson of this rung, and it is why the trace above is worth staring at. Compare it
against the stack's trace of the same input: there, step 3 recorded \`{\` and compared \`}\` to it; here,
step 3 recorded the number 3 and compared nothing. **The stack's extra O(n) space is not overhead —
it is the storage in which failure mode 2 is detectable.** You cannot have constant space and the
three-kind alphabet at the same time.`,
  code: `def balanced_brackets_counter(s: str) -> bool:
    """Correct ONLY when s uses a single bracket kind. See counter_applicable()."""
    depth = 0
    for ch in s:
        if ch in OPENERS:
            depth += 1
        else:
            depth -= 1
            if depth < 0:  # failure 1: a closer with nothing open
                return False
    return depth == 0  # failure 3: an opener never closed


def bracket_kind(ch: str) -> str:
    """The opener that identifies this character's kind, whichever half of the pair it is."""
    return PAIRS.get(ch, ch)


def counter_applicable(s: str) -> bool:
    """The assumption the counter needs: at most one kind of bracket in the string."""
    return len({bracket_kind(ch) for ch in s}) <= 1`,
  codeNote: `Both functions read the same module-level \`PAIRS\`/\`OPENERS\`, so the alphabet is still defined in
exactly one place — including the assumption check, which derives the bracket kinds rather than
restating them.`,
  mistake: `Reaching for this because the space bound looks better, on a problem whose alphabet has three kinds.

> **Watch out.** The misconception is that **balanced counts mean balanced brackets**. A counter can
> only ever check counts and depth, and every test with correctly-nested brackets passes while every
> test with obviously wrong counts correctly fails — so it survives a surprising amount of hand
> testing. The one thing it cannot see is the mismatched *kind*, which is the case people write
> fewest tests for. \`([)]\` returns \`true\`; so does \`(]\`.

The subtler version of the same mistake is checking \`depth == 0\` at the end but **not** checking
\`depth < 0\` inside the loop. That variant returns \`true\` for \`")("\`, which has a perfectly balanced
count of one opener and one closer arranged in exactly the wrong order. The \`depth < 0\` check is
failure mode 1, and it is the only thing in this function that knows about order at all.`,
  cost: `**Time O(n), space O(1).** Time is the same single pass — one comparison and one increment per
character. The space is one integer, because a count is all that a single-kind alphabet needs to
distinguish.

Use it when the alphabet really is one kind, which happens more often than you would expect: counting
parenthesis depth in a parser, validating a run of \`(\` and \`)\` only, and the classic follow-up
"longest valid parentheses substring" all live in this world. Say its assumption out loud when you
use it — *"this works because there is only one bracket kind; with three it cannot detect \`(]\`"* —
because an interviewer offering you a single-kind variant is usually checking whether you noticed.

---`,
}
