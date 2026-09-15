// plus-one — which rungs to know cold, and the drills
//
// Converted from docs/deep/plus-one_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `**Know cold — walk from the back with an early return.** Five lines, no carry variable, no post-loop
condition to keep in sync with the loop.

> **In an interview.** Say the width argument before you write anything: *"the digits are in an array
> because the value may not fit an \`int\`, so I will not rebuild the number."* Then write the walk.
> The follow-up is always \`[9, 9, 9]\` — answer it before it is asked: the loop exhausts, every digit
> is already \`0\`, and the final line prepends the \`1\`. The second follow-up is usually "now add two
> arbitrary-length numbers", which is why the next rung is also worth recall.

**Know cold — the general carry loop (Approach 3).** Not for this problem, where Approach 5 beats it,
but because it is the body of add-two-numbers, add-binary, add-strings and multiply-strings with only
the operands changed. If you know only the early-return trick, that follow-up leaves you with nothing
to build on.

**Know how to name and reject — build the integer.** Ten seconds. Correctly rejecting a technique on
a constraint is a stronger signal than not having considered it.

**Understand, do not memorize — reverse, carry, reverse back.** Worth explaining because it makes the
case for the decrementing index by contrast, and because the reversed layout is right when aligning
two operands of different lengths. Here it is two passes and a copy you do not need.

**Understand, do not memorize — special-case all nines.** Its value is the observation, not the code:
exactly one input shape has an answer longer than its input, and you know that answer in closed form.
Carry the observation; write Approach 5.

---`
