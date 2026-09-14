// valid-palindrome — approach 2 — Two pointers that skip in place (optimal)
//
// Converted from docs/deep/valid-palindrome_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "ends",
  title: "Two pointers that skip in place (optimal)",
  idea: `*The cleaned copy exists only so that position k and position n−1−k line up — but if I could find
the next kept character from each end on demand, I would never need to build it. Can I?* Yes. Put
one index at the front and one at the back of the **original** string. Before comparing, walk each
index inward past anything that is not alphanumeric. Then compare the two characters, case-folded.
This fixes the exact weakness of the cleaned version — the two allocated copies and the inability
to stop early — by making the filter something the cursors do while they walk, rather than a pass
that has to finish first.`,
  intuition: `Two readers start at opposite ends of the same line and walk toward each other. Each is under
orders to ignore anything that is not a letter or a digit, so when a reader lands on a comma it
simply takes another step without saying anything. Only when *both* readers are standing on real
characters do they call them out and check that they match. A mismatch ends the exercise
immediately. When the two readers meet or pass each other, every mirrored pair has been checked and
the string is a palindrome. The thing to hold on to is that **skipping is not failing** — a comma
is not a mismatch, it is a non-event, and conflating the two is the bug this problem is built to
catch.

The promise the loop keeps, stated in prose: *every mirrored pair of kept characters lying strictly
outside the current \`i..j\` window has already been compared and found equal.* That is why falling
out of the loop means \`true\`, and why the all-punctuation input — where the pointers cross before a
single comparison happens — is \`true\` as well: the set of pairs checked is empty, and every member
of an empty set agrees.`,
  worked: `Input: \`s = "Ab, ba!"\` — the same string as above, the same index layout.

| Step | Action | \`i\` | \`j\` | Compared | Result |
|---|---|---|---|---|---|
| start | — | 0 (\`A\`) | 6 (\`!\`) | — | — |
| skip | \`s[6] = '!'\` is not alphanumeric, so \`j\` retreats | 0 (\`A\`) | 5 (\`a\`) | — | — |
| 1 | compare | 0 (\`A\`) | 5 (\`a\`) | \`'a'\` vs \`'a'\` | match → \`i → 1\`, \`j → 4\` |
| 2 | compare | 1 (\`b\`) | 4 (\`b\`) | \`'b'\` vs \`'b'\` | match → \`i → 2\`, \`j → 3\` |
| skip | \`s[2] = ','\` is not alphanumeric, so \`i\` advances to 3 — and now \`i < j\` is false, so the skip loop stops right there | 3 (space) | 3 (space) | — | — |
| 3 | compare | 3 (space) | 3 (space) | \`' '\` vs \`' '\` | equal (it is the same character) → \`i → 4\`, \`j → 2\` |
| end | \`i = 4\`, \`j = 2\`, so \`i < j\` fails | 4 | 2 | — | loop exits → **\`true\`** |

Three comparisons, one skip on each side, two integers of storage, and the input string never
copied. Step 3 is worth staring at: because the inner skip loops are guarded by \`i < j\`, they stop
the moment the pointers land on each other, which means the final comparison can be a
*non-alphanumeric character against itself*. That is always equal, so it is harmless — and it is
precisely why the guard must be there. Remove \`i < j\` from the inner loops and on an input with no
letters at all \`i\` runs straight past \`j\`, off the end of the string, and into an index error.

Compare the totals with approach 1: it read all 7 characters and allocated 8 list slots; this reads
7 characters and allocates nothing. And on an input like \`"ab"\`, where the first and last characters
already disagree, this version returns after a single comparison while the cleaned version must
still filter the entire string before it can compare anything at all.`,
  code: `def valid_palindrome_two_pointers(s: str) -> bool:
    i, j = 0, len(s) - 1
    while i < j:
        while i < j and not s[i].isalnum():  # the i < j guard stops i overrunning j
            i += 1
        while i < j and not s[j].isalnum():
            j -= 1
        if s[i].lower() != s[j].lower():  # fold case on BOTH sides, not one
            return False
        i += 1
        j -= 1
    return True`,
  mistake: `Comparing before skipping. Written this way round:

\`\`\`python
while i < j:
    if s[i].lower() != s[j].lower():        # WRONG: runs before the skip loops
        return False
    while i < j and not s[i].isalnum():
        i += 1
    ...
\`\`\`

the very first thing the code does on \`"Ab, ba!"\` is compare \`'a'\` against \`'!'\`, find them
different, and return \`false\` for a perfectly good palindrome. **Punctuation is not a mismatch, it
is something to step over**, and the order of the two operations inside the loop body is what
encodes that. Skip first, compare second.

The second bug in the same family is dropping the \`i < j\` guard from the inner skip loops. On
\`".,;:!?-"\` — a legal input whose answer is \`true\` — the first skip loop finds nothing alphanumeric
anywhere, walks \`i\` clean off the end of the string, and raises an index error instead of returning
\`true\`. The guard is what makes the all-punctuation case work; it is not decoration.`,
  cost: `**Time O(n), space O(1).** Each pointer only ever moves inward and the loop ends when they meet, so
across the whole run the two of them take at most n steps between them and every character is
examined a constant number of times. Space is two integers — no cleaned string, no reversed string,
nothing that grows with the input.

This is the right choice whenever the input is large, whenever the check sits in a hot path, or
whenever the environment is memory-constrained. It is also the version to write in an interview,
because it demonstrates the transferable idea: **a filter does not have to be its own pass — a
cursor can skip while it walks.** That same move is what makes \`is-subsequence\`,
\`backspace-compare\` and \`remove-element\` work, and it is worth considerably more than this
particular problem.

---`,
}
