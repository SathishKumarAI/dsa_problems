// container-water — which rungs to know cold, and the drills.
//
// Which two or three to have in recall, and why the rest are for understanding
// rather than for typing out under time.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

export const interview = `**Memorise cold: the two-pointer sweep — and the exchange argument with it.** The code is six lines
and you will write it in under a minute; that is not what is being tested. What is being tested is
whether you can answer "how do you know the best pair isn't one you skipped?" without hand-waving.
The answer has two moving parts and both must be said: any skipped pair is *strictly narrower*, and
its height is *still capped by the wall you are about to discard*, so it is strictly worse than
something already measured. Practise saying that in two sentences. Practise it more than you
practise the code.

**Worth having ready as a second answer: brute force**, priced out loud at O(n²) and 10¹⁰ operations
against the stated constraint of 10⁵ elements, in the first thirty seconds. Naming the baseline and
its cost is how you show the optimisation is a decision rather than a memorised trick. Beyond that,
do not drill it.

**Understand but do not memorise: the tie case and the off-by-one.** Know that equal heights let you
move either pointer, know that the width is \`j − i\` and not \`j − i + 1\`, and know that the very first
(widest) container must be measured before any pointer moves. Those three details are where working
implementations actually break, and an interviewer who watches you get them right without comment has
learned more than one who hears you recite the complexity.

---`
