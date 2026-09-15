// valid-palindrome — approach 1 — Clean, then reverse
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
  rung: "clean",
  title: "Clean, then reverse",
  idea: `*How do I compare a string to its own reverse when punctuation and capitals are in the way?*
Remove them first. Walk the input once, keep only the alphanumeric characters, lowercase each one
as you keep it, and you now hold a string in which the question is trivially askable. *And how do I
ask it?* Build the reverse of that cleaned string and check the two for equality. This is the
baseline: it separates the two jobs — filtering and comparing — into two passes that never have to
think about each other.`,
  intuition: `Think of transcribing a noisy handwritten line onto a fresh sheet, copying only the letters and
digits and writing every one in lower case. Now you have a clean line, and you hold it up to a
mirror: if the reflection reads the same as the original, it is a palindrome. The strength of this
picture is that each job is simple on its own and nearly impossible to get subtly wrong. The
weakness is visible in the picture too — you needed a fresh sheet, and then you needed the mirror
image written out as well, so you are holding three versions of a line you are going to look at
once.`,
  worked: `Input: \`s = "Ab, ba!"\` — the same input is traced through every approach in this document. Its
characters sit at these indices:

| index | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|---|
| char | \`A\` | \`b\` | \`,\` | (space) | \`b\` | \`a\` | \`!\` |

**Pass one — build the cleaned list:**

| Reading index | Char | \`isalnum()\`? | \`cleaned\` after this step |
|---|---|---|---|
| 0 | \`A\` | yes | \`['a']\` |
| 1 | \`b\` | yes | \`['a', 'b']\` |
| 2 | \`,\` | no | \`['a', 'b']\` (unchanged) |
| 3 | (space) | no | \`['a', 'b']\` (unchanged) |
| 4 | \`b\` | yes | \`['a', 'b', 'b']\` |
| 5 | \`a\` | yes | \`['a', 'b', 'b', 'a']\` |
| 6 | \`!\` | no | \`['a', 'b', 'b', 'a']\` (unchanged) |

**Pass two — build the reverse and compare:**

\`\`\`
cleaned       = ['a', 'b', 'b', 'a']
cleaned[::-1] = ['a', 'b', 'b', 'a']     <- a second list of the same size
equal?        = True
\`\`\`

Seven reads, one four-element list allocated, one more four-element list allocated for the
reverse, then a four-element comparison. Eight list slots of storage to answer a question about a
seven-character input — and that ratio holds at every size, so a 200,000-character input costs two
extra structures of roughly that length.`,
  code: `def valid_palindrome_clean_then_reverse(s: str) -> bool:
    cleaned: list[str] = [c.lower() for c in s if c.isalnum()]
    return cleaned == cleaned[::-1]  # [::-1] builds a second list of the same size`,
  mistake: `Writing the filter as a *negative* test — \`if c != ' '\`, dropping spaces but keeping punctuation.
\`"A man, a plan, a canal: Panama"\` then keeps the commas and the colon, the comparison fails, and a
textbook palindrome is reported as false. The rule to carry is that **the filter must be a positive
test for what you keep (\`isalnum\`), never a list of what you drop**, because the drop list is
always incomplete — there is no end to the punctuation you did not think of.

The quieter sibling of that bug is forgetting \`.lower()\`. \`"Aa"\` then compares \`'A'\` against \`'a'\`,
finds them different, and returns false for a string that is plainly a palindrome under the stated
rules. Here the lowercasing happens inside the comprehension, at the moment a character is kept,
which is the safest place for it: one site, unmissable.`,
  cost: `**Time O(n), space O(n).** The time is two linear passes — one to filter, one to compare — plus the
cost of materialising the reverse, which is itself linear. The space is the real story: the cleaned
copy holds up to n characters and the reversed copy holds the same again, so peak extra memory is
about 2n.

Use it when clarity beats everything, when the cleaned string is needed for something else anyway
(you are about to index into it, hash it, or log it), or as a reference implementation to check a
clever version against — which is exactly its role in the test script at the bottom of this file.
In real production code this two-line version is very often the correct engineering answer; the
optimisation below matters when n is large or the check sits in a hot loop.

---`,
}
