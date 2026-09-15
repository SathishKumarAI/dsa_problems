// reverse-string — approach 5 — Two pointers swapping inward (optimal)
//
// Converted from docs/deep/reverse-string_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "optimal",
  title: "Two pointers swapping inward (optimal)",
  idea: `*Every approach so far writes the answer somewhere new — but the characters do not need somewhere new,
they need to trade places. Can the input hold its own answer?* Yes. Position \`i\` and position
\`n-1-i\` are each other's destinations, so they swap. This fixes the backward copy's last cost — **a
second buffer the size of the input** — and halves the loop, because one swap settles two characters.`,
  intuition: `> **Intuition.** Two people at opposite ends of a row of numbered seats swap with each other, then
> each steps one seat inward and swaps with whoever is now opposite. After every swap two seats are
> permanently correct and everything outside the pair is finished — so the pair only travels to the
> **middle**, not across. On an odd-length row they end up on the *same* seat, and that person is
> already where they belong: their mirror is themselves.`,
  worked: `Working on \`chars = ['h','e','l','l','o']\`:

| iteration | \`i\` | \`j\` | \`i < j\`? | swap | \`chars\` after |
|---|---|---|---|---|---|
| 1 | 0 | 4 | yes | \`'h'\` ⇄ \`'o'\` | \`['o','e','l','l','h']\` |
| 2 | 1 | 3 | yes | \`'e'\` ⇄ \`'l'\` | \`['o','l','l','e','h']\` |
| 3 | 2 | 2 | **no** — stop | — | \`['o','l','l','e','h']\` |

✅ \`"olleh"\` in **two** swaps, no buffer, and the middle \`'l'\` at index 2 never touched — it is its own
mirror. Every other approach above performed five writes into somewhere new; this one performed four
writes into the input it was given.`,
  code: `def reverse_string_two_pointers(s: str) -> str:
    chars = list(s)                                  # Python str is immutable; the buffer must be mutable
    i, j = 0, len(chars) - 1
    while i < j:                                     # MEET, not cross: an odd middle is its own mirror
        chars[i], chars[j] = chars[j], chars[i]      # the right side is built before either write
        i += 1
        j -= 1
    return "".join(chars)`,
  mistake: `> **Watch out.** Writing the swap as two plain assignments without a temporary. The misconception is
> that \`a = b; b = a\` exchanges them — the first line **destroys** the value the second line needs, so
> the pair ends up holding two copies of the right-hand character.

\`\`\`python
chars[i] = chars[j]
chars[j] = chars[i]     # BUG: chars[i] was overwritten on the line above
\`\`\`

On \`"hello"\` it returns \`'olllo'\`; on \`"abcd"\`, \`'dccd'\`. Python's tuple form is safe because the
right-hand side is fully evaluated before either assignment, but the moment you translate to Java or
C++ you need the explicit \`char tmp = chars[i];\`. The temporary is not bookkeeping — it *is* the swap.

One thing that is **not** a bug despite being widely warned about: \`while i <= j\`. On an odd length it
swaps the middle character with itself, a wasted instruction and nothing more; on an even length the
indices cross without ever being equal. Verified: \`"hello"\` → \`'olleh'\`, \`"abcd"\` → \`'dcba'\`. Prefer
\`<\` because it says what you mean, but do not hunt for a correctness bug that is not there.`,
  cost: `**Time \`O(n)\`** — the loop runs \`⌊n/2⌋\` times with constant work per iteration; half the iterations of
every other approach here, though the same class. **Space \`O(1)\`** beyond the buffer holding the
answer: two indices and a temporary. (The \`list(s)\` and \`"".join(...)\` are an artefact of Python
strings being immutable — Java's signature is \`void reverseString(char[] s)\` and C++'s \`std::string\`
is already mutable, so both are genuinely in place.)

> **In an interview.** This is the answer to ship, and the one to write first if you write only one.
> Say the loop condition and its reason in the same breath: \`while i < j\`, because on an odd length
> the middle character is its own mirror. Expect the real question to be about cost, not code — so
> volunteer that \`out = c + out\` in a loop is \`O(n²)\` in Python and Java, and that a list plus
> \`"".join\` (or a \`StringBuilder\`) is the linear fix. That is what the problem is actually screening
> for.

Its importance is out of proportion to this problem: **reverse a sub-range in place** is the primitive
rotate-array uses three times (reverse all, reverse the first \`k\`, reverse the rest) and that
next-permutation uses to flip a descending tail into an ascending one.

---`,
}
