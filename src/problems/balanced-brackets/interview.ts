// balanced-brackets — which rungs to know cold, and the drills
//
// Converted from docs/deep/balanced-brackets_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `**Memorise cold: the stack version, and the three failure modes by name.** The code is eight lines
and you should be able to write it without thinking, but writing it is not what is being assessed —
plenty of candidates produce the loop and then hand over a function that returns \`True\` for \`(\`.

> **In an interview.** Say the failure modes *before* you write the loop: "there are three ways this
> fails — a closer with an **empty** stack, a closer that **mismatches** the top, and a **non-empty**
> stack at the end" — then point at the line handling each as you write it. That one sentence covers
> the two checks everyone gets right and the two they forget, and it hands you your own test set for
> free: \`)\`, \`(]\`, and \`(\`. The follow-up is almost always "now do it in constant space", which is the
> counter — and the right answer includes its limitation, not just its code.

**Memorise second: the counter, together with the assumption that makes it legal.** It is five lines
and it comes up constantly as a follow-up — "what if there were only round brackets, could you do
better on space?" — and the answer is yes, O(1), with a depth that must never go negative and must
end at zero. The reason to hold it in recall rather than derive it is that its *limitation* is the
better half of the answer: being able to say immediately that a counter cannot detect \`(]\` because an
integer stores depth but not identity shows you understand what the stack was buying, which is a
strictly more interesting thing to demonstrate than the eight-line loop.

**Understand but do not drill: repeated replace.** Its value is entirely in the observation that it
is an expensive simulation of popping, which is a good thirty seconds of an interview and a bad five
minutes. Mention it, price it at O(n²) against the stated 10⁴ length, note that a deeply nested
string forces about n/2 full rescans, and move to the stack. Do not write it out.

---`
