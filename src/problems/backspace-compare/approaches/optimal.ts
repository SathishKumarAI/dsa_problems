// backspace-compare — approach 5 — Two backward cursors, constant space (optimal).
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "optimal",
  title: "Two backward cursors, constant space (optimal)",
  idea: `*Every rung so far builds both finished texts in full — up to 400 characters of memory to produce one
bit — and none can stop early when the very first survivors already disagree. Do the texts need to
exist at all?* No. Run two independent backward walks in lockstep, each skipping its own debts, and
compare survivors as they surface. This fixes the previous rung's last weakness — **storing two full
texts to answer a boolean** — and adds early exit for free.`,
  intuition: `> **Intuition.** Two people proof-reading the same paragraph from the end, each with their own copy
> and their own pencil. Each scans back to the next word that actually counts, they hold it up, and
> they compare. If the words differ they stop immediately; if one of them runs out of paragraph while
> the other still has a word, the texts had different lengths and they stop too. Nothing is written
> down, ever — the only state is where each finger is.`,
  worked: `\`s = "abc##d"\`, \`t = "ad#d"\`. Both cursors start at the last index owing nothing.

| round | start \`i\`, \`j\` | what \`prev_survivor\` consumes in \`s\` | what it consumes in \`t\` | lands at | compare |
|---|---|---|---|---|---|
| 1 | \`i=5\`, \`j=3\` | \`i=5\` \`'d'\` survives at once | \`j=3\` \`'d'\` survives at once | \`i=5\`, \`j=3\` | \`'d'\` vs \`'d'\` — **match** |
| 2 | \`i=4\`, \`j=2\` | \`i=4\` \`'#'\` debt→1; \`i=3\` \`'#'\` debt→2; \`i=2\` \`'c'\` dies (2→1); \`i=1\` \`'b'\` dies (1→0); \`i=0\` \`'a'\` **survives** | \`j=2\` \`'#'\` debt→1; \`j=1\` \`'d'\` dies (1→0); \`j=0\` \`'a'\` **survives** | \`i=0\`, \`j=0\` | \`'a'\` vs \`'a'\` — **match** |
| 3 | \`i=-1\`, \`j=-1\` | loop condition \`i >= 0 or j >= 0\` is false | | — | both ran out together → **true** ✅ |

Round 2 is the entire lesson. On the \`s\` side, one call to \`prev_survivor\` consumed **five** indices —
two hashes and the two characters they killed, then the survivor — before returning. A version that
stepped once per round would have compared \`'c'\` against something, and \`'c'\` does not exist in the
finished text. The two sides consumed different numbers of indices (five and three) in the same round,
which is fine and expected: the rounds are counted in *survivors*, not in characters.

Note also that the two finished texts were never built. The only state at any moment is \`i\`, \`j\` and
one \`skip\` inside the helper.`,
  code: `HASH = "#"


def prev_survivor(text: str, i: int) -> int:
    """Walk left from \`i\` to the next character that survives; -1 if there is none.

    The whole constant-space trick lives here: reading right to left, a '#'
    arrives BEFORE its victim, so \`skip\` is a debt counter and every character
    can be judged on sight. A run of hashes raises the debt by that many, and
    the loop must consume the WHOLE run before it can return.
    """
    skip = 0
    while i >= 0:
        if text[i] == HASH:
            skip += 1
            i -= 1
        elif skip > 0:                # this character pays off one pending delete and dies
            skip -= 1
            i -= 1
        else:
            return i                  # owes nothing: it survives
    return -1


def backspace_compare_two_cursors(s: str, t: str) -> bool:
    i, j = len(s) - 1, len(t) - 1
    while i >= 0 or j >= 0:
        i = prev_survivor(s, i)
        j = prev_survivor(t, j)
        if i >= 0 and j >= 0:
            if s[i] != t[j]:
                return False
        elif i >= 0 or j >= 0:
            # one side ran out of survivors while the other still has one
            return False
        i -= 1
        j -= 1
    return True`,
  mistake: `> **Watch out.** Omitting the \`elif i >= 0 or j >= 0: return False\` branch. The misconception is that
> comparing the survivors is enough — it checks that the texts *agree where they overlap*, and says
> nothing about one being longer. Without it, a shorter text that is a suffix of the longer one
> compares equal.

Measured on \`s = "c"\`, \`t = "ac"\`: it returns \`True\` where the answer is \`False\`. Round 1 matches
\`'c'\` against \`'c'\`; in round 2, \`s\` has fallen off the front while \`t\` still has \`'a'\`, and with the
branch missing the loop simply steps both cursors past the end and reports success. It returns \`True\`
on \`s = "ab##"\`, \`t = "a"\` for the same reason.

The other classic is the one the helper exists to prevent: writing the skip logic as \`if\` rather than
\`while\`, so a \`'#'\` is handled once per round instead of consuming its whole run. Measured on the
worked example that returns \`False\`, and on \`s = "abcdef#####g"\`, \`t = "ag"\` it also returns \`False\` —
in both cases the cursor stops on a condemned character and compares it. Keeping the walk in one named
function with one loop is the cheapest way to never write that bug.`,
  cost: `**Time \`O(n + m)\`** — each index of each string is visited exactly once across all rounds, because
\`prev_survivor\` only ever moves its cursor left and never revisits. The early return on a mismatch
often finishes far sooner. **Space \`O(1)\`** — \`i\`, \`j\` and one \`skip\` inside the helper; nothing
allocated scales with the input.

> **In an interview.** Say the direction insight before writing a line: *"reading forwards, a
> character's fate depends on keystrokes that have not arrived yet, which is why a stack has to push
> things it later pops — so I will read backwards, where the \`'#'\` comes first and a counter decides
> each character on sight."* That sentence is the whole interview. Write the stack version if you need
> a warm-up, price it at \`O(n + m)\` space, and then do this one. Expect two follow-ups: *"why a
> counter and not a boolean?"* (a run of hashes owes more than one) and *"what if the strings have
> different lengths after deletion?"* (the \`elif\` branch — say it out loud, because it is the part
> most candidates leave out and it is the only thing standing between \`"c"\` and \`"ac"\` comparing
> equal).

---`,
  notes: [
    { title: "why it works", body: `> **Why it works.** Two guarantees, and both come from the direction of travel.
>
> **1. Each survivor is final when it surfaces.** By the argument in approach 4, a character's fate
> depends only on the suffix already read, so \`prev_survivor\` returning index \`i\` is a permanent
> verdict: \`text[i]\` *is* the next character of the finished text, reading from the end. That means
> comparing the two surfaced characters is comparing the finished texts one position at a time, from
> the back — which is a valid equality test, since two strings are equal exactly when they are equal
> read backwards.
>
> **2. The termination test catches length mismatches.** Each round advances both walks by exactly
> one survivor. If both cursors fall off the front in the same round, both texts ran out together, so
> they had the same length and every compared pair matched — \`true\`. If exactly one still has a
> survivor, one text is longer, so they differ — \`false\`, and no further comparison is needed. That
> is what the \`elif i >= 0 or j >= 0\` branch is for, and dropping it is the classic bug below.
>
> **The fiddly part is consuming a whole run of hashes before comparing.** \`prev_survivor\` must loop
> until the debt is paid in full, not step once. If it returns after handling a single \`'#'\`, the
> cursor is left sitting on a character that is already condemned, and it gets compared. This is where
> every off-by-one in this problem lives, and lifting the walk into its own named function is the
> cheapest defence: the loop has one job and one exit condition, stated once and used twice.` },
  ],
}
