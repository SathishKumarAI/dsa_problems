// reverse-string — approach 3 — Push onto a stack, then pop
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
  rung: "stack-of-characters",
  title: "Push onto a stack, then pop",
  idea: `*Prepending is expensive because it copies everything collected so far — is there a container where
adding and removing are both cheap?* A stack. Push every character on, pop them all off: last in,
first out **is** reversed order, and both operations touch one element. This fixes the previous rung's
quadratic rebuild — **\`n\` copies of an average of \`n/2\` characters** — by never copying the collection
at all.`,
  intuition: `> **Intuition.** A spring-loaded plate dispenser in a canteen. Load the plates in order — \`h\`, \`e\`,
> \`l\`, \`l\`, \`o\` — each pushing the rest down. Take them back off and the last one loaded is the first
> available, so they come out \`o\`, \`l\`, \`l\`, \`e\`, \`h\`. The reversal is not computed; it is a
> **property of the container**, and the code's only job is to load and unload.`,
  worked: `**Push phase** (stack shown bottom-to-top):

| step | pushed | stack |
|---|---|---|
| 1 | \`'h'\` | \`[h]\` |
| 2 | \`'e'\` | \`[h, e]\` |
| 3 | \`'l'\` | \`[h, e, l]\` |
| 4 | \`'l'\` | \`[h, e, l, l]\` |
| 5 | \`'o'\` | \`[h, e, l, l, o]\` |

**Pop phase:**

| step | popped | stack after | \`out\` |
|---|---|---|---|
| 1 | \`'o'\` | \`[h, e, l, l]\` | \`"o"\` |
| 2 | \`'l'\` | \`[h, e, l]\` | \`"ol"\` |
| 3 | \`'l'\` | \`[h, e]\` | \`"oll"\` |
| 4 | \`'e'\` | \`[h]\` | \`"olle"\` |
| 5 | \`'h'\` | \`[]\` | \`"olleh"\` |

✅ \`"olleh"\` in ten constant-time operations rather than ten character copies.

Now read the popped column on its own: \`o, l, l, e, h\` — the input from index 4 down to index 0. The
stack never reordered anything; it just **remembered the input backwards**. That observation is the
next approach.`,
  code: `def reverse_string_stack(s: str) -> str:
    box: list[str] = []
    for c in s:
        box.append(c)
    out: list[str] = []
    while box:
        out.append(box.pop())     # pop() from the end is O(1); pop(0) would be O(n)
    return "".join(out)           # one allocation, instead of one per character`,
  mistake: `> **Watch out.** Draining the stack while iterating it: \`for c in box: out.append(box.pop())\`. The
> misconception is that a \`for\` loop tracks the list. It tracks an **index**, which advances while the
> list underneath shrinks — so they meet in the middle and the loop ends with half the characters
> missing.

On \`"hello"\` it returns \`'oll'\`; on \`"abcd"\`, \`'dc'\`. The rule is absolute: **never change the length
of a container you are iterating over.** Use \`while box:\` and let emptiness be the loop's business.

The neighbouring slip is \`box.pop(0)\` — taking from the front is first-in-first-out, so it returns
\`'hello'\` unchanged, and costs \`O(n)\` per removal because every remaining element shifts down. One
wrong argument turns a linear stack into a quadratic queue that also gives the wrong answer.`,
  cost: `**Time \`O(n)\`** — \`n\` pushes and \`n\` pops, each touching one element, plus one \`join\` pass. **Space
\`O(n)\`** — the stack holds a full copy of the input and the output list holds another.

Use it when the reversal is a by-product of something that genuinely needs a stack: bracket matching,
an undo history, expression evaluation. On its own it is over-equipped, and the next rung says why.
The transferable move is noticing *"I built a data structure to recover information I already had"* —
the same recognition that upgrades the stack solution in backspace-string-compare to a counter.

---`,
}
