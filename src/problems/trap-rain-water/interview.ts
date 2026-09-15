// trap-rain-water — which rungs to know cold, and the drills
//
// Converted from docs/deep/trap-rain-water_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `**Memorise cold: the two-pointer version, and the column formula it is built on.** The formula
\`water(i) = min(left_max, right_max) − height[i]\` is the thing to say in the first thirty seconds,
because it converts a confusing picture into arithmetic and it is what every subsequent sentence
rests on. Then the pointer sweep, with the update-before-add ordering correct, \`left_max\` and
\`right_max\` seeded at 0, and the strict \`i < j\`. Most importantly, be able to answer "how can you
finalise that column without knowing the right maximum?" — the answer being that the bar under the
*other* pointer is taller, which proves a tall-enough wall exists on that side, so your own running
maximum is what is binding. That question is the entire interview for this problem.

**Memorise second: the prefix and suffix maxima version.** It is short, it is obviously correct, and
it is the safe thing to write if the two-pointer argument deserts you mid-whiteboard — better a
working O(n)/O(n) solution with a clean explanation than a mangled O(1) one. It also sets up the
natural follow-ups: "reduce the space" leads to the pointers, and "now the map is two-dimensional"
leads to the priority-queue variant, which is much closer to this version in spirit.

**Understand but do not drill: the brute force.** Its job is to make the column formula concrete and
to be the reference your stress test compares against. Say it, price it at O(n²) against the stated
n = 2 × 10⁴, and move up. Worth ten seconds, not ten minutes.

One more thing worth knowing about but not memorising: there is a monotonic-stack solution to this
problem that accumulates water in horizontal layers rather than vertical columns. It is O(n) time and
O(n) space, it is no better than either linear approach above, and its real value is that the same
stack technique solves neighbouring problems (largest rectangle in a histogram, next greater
element). If it comes up, recognise it; do not lead with it.

---`
