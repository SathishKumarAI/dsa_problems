// plus-one — approach 1 — Build the number, add one, split it back
//
// Converted from docs/deep/plus-one_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "build-the-number-add-one-split-it-back",
  title: "Build the number, add one, split it back",
  idea: `*What does "add one to this number" mean?* Literally that — fold the digits into the value they
spell, add one, peel the digits back off with repeated division by ten. It reads like the definition
of the problem, which is exactly why nearly everyone writes it first.`,
  intuition: `> **Intuition.** The digit array is a number in a **box** with the lid off. This approach closes the
> lid, does ordinary arithmetic, and opens it again. Folding is the reading you already do in your
> head — "times ten, plus the next digit" — and unfolding is its mirror: \`% 10\` shakes the last
> digit loose, \`// 10\` throws it away. The peeling half produces digits least significant first, so
> the final act is a flip. The arithmetic is honest; the danger is the box, because in most
> languages the box has a fixed size.`,
  worked: `\`digits = [1, 9, 9]\`. Folding, one column at a time:

| digit read | \`value\` before | \`value * 10 + digit\` |
|---|---|---|
| \`1\` | \`0\` | \`1\` |
| \`9\` | \`1\` | \`19\` |
| \`9\` | \`19\` | \`199\` |

Add one: \`value = 200\`. Peeling, least significant first:

| step | \`value\` | \`value % 10\` | \`out\` after | \`value // 10\` |
|---|---|---|---|---|
| 1 | \`200\` | \`0\` | \`[0]\` | \`20\` |
| 2 | \`20\` | \`0\` | \`[0, 0]\` | \`2\` |
| 3 | \`2\` | \`2\` | \`[0, 0, 2]\` | \`0\` |

\`value\` is 0, so the loop stops. \`out\` is \`[0, 0, 2]\` — backwards. Reverse: \`[2, 0, 0]\`.`,
  code: `def plus_one_build_integer(digits: list[int]) -> list[int]:
    value = 0
    for d in digits:
        value = value * 10 + d
    value += 1
    out: list[int] = []
    while value > 0:
        out.append(value % 10)
        value //= 10
    out.reverse()  # peeled least-significant first, so flip it back
    return out`,
  mistake: `> **Watch out.** The misconception is that the peeling loop produces the answer. It produces the
> answer **backwards**, necessarily — division always hands you the rightmost digit — and nothing in
> the code looks wrong without the flip.

Running the version without \`out.reverse()\` on \`[1, 9, 9]\` returns \`[0, 0, 2]\`. Two, not two
hundred. It survives any palindromic test — \`[1, 2, 1]\` becomes \`[1, 2, 2]\` either way — which is how
it reaches a hidden test alive.

The larger mistake is not a Python mistake at all, and it is why this rung is in the document:
**writing it in a language with fixed-width integers.** Simulating a wrapping 64-bit signed
accumulator gives, measured:

| input | accumulator after folding and \`+ 1\` | digits it then peels off |
|---|---|---|
| nineteen \`9\`s | \`-8446744073709551616\` | \`[]\` — \`while value > 0\` never runs |
| twenty \`9\`s | \`7766279631452241920\` | \`[7, 7, 6, 6, 2, 7, 9, 6, 3, 1, 4, 5, …]\` |
| one hundred \`9\`s | \`0\` | \`[]\` |

Nineteen nines is already past the end: the accumulator has gone negative, the peel loop does not
execute once, and the function returns an empty array. Twenty nines wraps positive and returns twenty
digits of confident nonsense. A hundred nines lands exactly on zero. None throw; all are wrong; the
constraints permit all three.`,
  cost: `**Time \`O(n)\`, space \`O(n)\`** in Python. Time is one folding pass and one peeling pass, both linear in
the digit count — though with unbounded integers the multiply-accumulate on an n-digit value is not
truly constant-time, so the honest bound approaches \`O(n²)\` for large \`n\`. Space is the output list
plus the big integer itself, both proportional to \`n\`.

Use it when the value is known to fit and you want the shortest code — a three-digit product code in
a script, say. In an interview, name it and reject it on the width argument; rejecting a technique
for the right reason reads better than never having considered it.

---`,
}
