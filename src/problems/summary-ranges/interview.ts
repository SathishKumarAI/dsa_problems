// summary-ranges — which rungs to know cold, and the drills
//
// Converted from docs/deep/summary-ranges_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `**Know cold — the anchor walk.** Seven lines, one pass, no allocation and no empty-array guard. You
should be able to write it without pausing over the inner loop's bound, and to say why the nesting is
still linear: the inner drift advances the *same* index the outer loop uses.

> **In an interview.** Lead with the invariant before writing anything: *"the array is sorted and
> distinct, so a consecutive run is exactly a block where \`nums[i] - i\` is constant — I will walk it
> and emit on each break."* Then say the two edge cases out loud before being asked: the empty array
> returns \`[]\`, and a run of length one prints bare rather than \`"x->x"\`. Those two sentences are
> what the interviewer is listening for; the code is the easy part.

**Know cold — the \`value - index\` invariant.** Not the bucketing code, the **fact**. It is the
sentence that explains why the anchor walk works, and it generalises: looking for a quantity that is
constant within a group and changes between groups turns grouping problems into scans, and it
reappears in longest-consecutive-sequence and in several subarray problems.

**Understand, do not memorize — collect the break points.** Worth being able to explain because its
failure mode is the most transferable lesson here: any loop that emits on a transition needs
something to flush the final group. Name that trap once and you will avoid it in half a dozen other
problems.

**Understand, do not memorize — split into run lists.** It is the right answer to a neighbouring
question ("return the runs themselves"), and the clearest illustration that storing members you will
not print is waste. As an answer to *this* problem it is a strictly heavier anchor walk.

**Understand, do not memorize — paint the number line.** Nothing to recall, one thing to recognise:
some costs follow the **span** rather than the length. Naming that and rejecting the technique on the
\`±2^31\` bound is a better answer than never having considered it.

---`
