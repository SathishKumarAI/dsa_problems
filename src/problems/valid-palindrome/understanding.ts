// valid-palindrome — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/valid-palindrome_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

export const understanding = `You are handed a string. Throw away everything that is not a letter or a digit, treat upper and
lower case as the same thing, and say whether what is left reads identically forwards and
backwards. \`"A man, a plan, a canal: Panama"\` becomes \`amanaplanacanalpanama\`, which does, so the
answer is true.

**The core question is: does the k-th surviving character from the front match the k-th surviving
character from the back, for every k?** That is a question about *pairs of positions*, and the
naive approach answers it by first building a whole second string — a cleaned, lowercased copy —
and then building a *third* one, its reverse, before comparing anything. It is not slow in the
big-O sense, and it is worth being honest about that: it is O(n) time, the same as the best answer.
What it wastes is memory and early exits. It allocates two copies of a string that can be 200,000
characters long, and it reads every character of the input even when the very first and very last
letters already disagree.

The constraints, and what each one buys:

| Constraint | What it unlocks |
|---|---|
| \`1 <= s.length <= 2 * 10^5\` | Linear time is both required and sufficient. It also guarantees the string is never empty, so index \`0\` and index \`len(s) - 1\` always exist and no special-casing of an empty input is needed. |
| The string may hold letters, digits, spaces and punctuation | Filtering is *part of the problem*, not something a preprocessing step is entitled to hide. The whole difficulty of the fast version is doing the filter and the comparison in the same walk. |
| A string with no alphanumeric characters at all is an **empty palindrome** — true | The degenerate case has a defined answer, and it is \`true\`, not \`false\` and not a crash. Any version whose pointers cross before a single comparison happens must fall through to \`true\`. |
| Case is not part of the comparison | \`'A'\` and \`'a'\` are the same character. Both sides must be normalised, every time — folding one side and not the other is the most common way to get this wrong on an input the examples never cover. |

There is one more thing that unlocks the optimisation, and it is not a constraint on the input at
all — it is a property of the *question*. A palindrome check is a statement about mirrored pairs:
the first kept character against the last, the second against the second-to-last, inward until you
meet in the middle. Nothing in that statement requires the kept characters to exist as a
contiguous string. You only need to be able to find the *next* kept character from either end on
demand, and a pointer that skips forward over punctuation does exactly that. The cleaned copy is
convenience, never necessity.

---`
