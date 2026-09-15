// product-except-self — which rungs to know cold, and the drills
//
// Converted from docs/deep/product-except-self_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `> **In an interview.** Say the structural sentence before writing anything: *"everything except \`i\` is
> everything left of \`i\` times everything right of \`i\`, so nothing ever has to be divided out."* Draw
> \`left\` and \`right\` as two arrays, show each is read exactly once, then collapse them on the board
> into the output plus one scalar. The follow-up is always **"what does a zero do to your solution?"**
> — and the answer is the best line you have: *nothing, because nothing is ever undone, only
> accumulated.* Have the division approach's three-branch zero patch ready as the contrast.

**Memorize cold — the prefix/folded-suffix version.** The expected answer, eight lines, and the lines
are order-sensitive in a way that punishes half-memorisation. Drill the invariant rather than the
code: *\`out[i]\` holds everything before \`i\`, so write it before folding \`nums[i]\` in.* If you can say
that sentence you can rederive both loops, backward one included, under pressure.

**Memorize cold — the two-prefix-array version.** Not as a fallback but as the *explanation*.
Starting from the compressed version and justifying it backwards is much harder, and it reads as
memorised rather than understood.

**Understand but do not memorize — the division approach.** Thirty valuable seconds: state it, state
that it is linear, then state why the problem forbids it and what a zero does to it. Naming the
shortcut *and* its failure mode is what demonstrates you understand why the constraint exists. Do not
submit it — the statement rules it out, and doing it anyway reads as not having read the question.

**Understand but do not memorize — brute force.** Ten seconds to name and reject on the \`10^5\` bound.
Its real use is as the oracle in the test suite, where its obviousness is the entire point.

---`

export const fluent = `The folded solution is nine lines and every one of its bugs is an ordering bug, so these drills are
about order rather than about ideas.

**1. Trace the forward pass on \`[1, 2, 3, 4]\` with a pencil, writing both columns.** Store, then
extend.
*Done when:* you wrote \`out = [1, 1, 2, 6]\` and can say why \`out[3]\` is \`6\` and not \`24\`. If you got
\`[1, 2, 6, 24]\`, you updated before you stored — go straight to drill 2.

**2. Swap the two lines on purpose.** Put \`running *= nums[i]\` before \`out[i] = running\`.
*Done when:* you have seen every answer come back as the product of the **whole** array, and can
name the one word that broke: *strictly*.

**3. Write the two-array version first, then fold it, without looking.** Two arrays, then one.
*Done when:* the fold felt mechanical rather than clever — the second array was never anything but a
running value read once, so it did not need to exist.

**4. Break the backward range.** Change \`range(n - 1, -1, -1)\` to \`range(n - 1, 0, -1)\` and run it.
*Done when:* you have seen exactly one wrong answer, at index \`0\`, and understand why an off-by-one
at a loop *bound* produces a single wrong slot rather than a crash. These are the hardest bugs to see
in a code review.

**5. Reach for division, then talk yourself out of it in three sentences.** Total, divided by each
element.
*Done when:* you can say (a) it dies on a zero, (b) one zero and two zeros need different answers, so
it is three branches not two, and (c) the split never divides, so it never needs any of them.

**6. Ask what the 32-bit promise is actually for.** Run the all-twos table from the script.
*Done when:* you can say that \`O(n)\` counts multiplications, that multiplication is only \`O(1)\` while
the numbers fit in a machine word, and — the part almost nobody notices — that at \`n = 10^5\` the
constraint forces nearly every element of a legal input to be \`1\`, \`-1\` or \`0\`.

**The one sentence worth keeping a month from now:** *everything except \`i\` is everything left of \`i\`
times everything right of \`i\`, and both are running products* — and its shadow: *write before you
update, in both directions.*

---`
