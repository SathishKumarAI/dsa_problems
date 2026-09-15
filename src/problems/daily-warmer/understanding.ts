// daily-warmer — "Understanding the Problem", and the constraints table.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

import type { Unlock } from "../../content/types.ts"

export const understanding = `You are given a list of daily temperatures, one number per day, in calendar order. For each day you
must report **how many days you would have to wait before a strictly warmer day arrives**. If no
later day is ever warmer, that day's answer is \`0\`. The output is a list the same length as the
input — one waiting time per day, not a single number.

Two details decide everything. The answer is a **distance**, not a temperature: for day 2 in the
example below the answer is \`4\` because the warmer day is at index 6, not \`76\` because that is how
warm it gets. And "warmer" means **strictly** warmer — a day of exactly the same temperature does not
end your wait.

**The core question is: for each day, where is the first later day that beats it?** The naive
approach is slow because it answers that question by walking forward from every single day until it
finds something warmer, and a long run of gently cooling days makes every one of those walks scan
nearly the whole remaining list.

That question — *where is the first later element greater than this one* — has a name. It is **next
greater element**, and this problem is that question with the answer reported as a gap between
indices instead of as a value. Recognising it is the whole game, because the technique that answers
it is a **monotonic stack**, and the same technique with the comparison or the direction flipped
answers an entire family: next greater, next smaller, previous greater, previous smaller, stock span,
and — the hardest member — largest rectangle in a histogram.

Note what the problem does **not** give you: the temperatures are in no particular order, and sorting
them would destroy the problem outright, since the answer is about *when* a day occurs relative to
another. Every technique below earns its speed from the order of the walk, never from ordering the
data.

The worked example used in every section below is the statement's own:

\`\`\`
temps = [73, 74, 75, 71, 69, 72, 76, 73]
answer = [ 1,  1,  4,  2,  1,  1,  0,  0]
\`\`\`

---`

export const unlocks: Unlock[] = [
    {
        "constraint": "`1 <= temperatures.length <= 10^5`",
        "what": "**This is the constraint that prices out the brute force.** At n = 10⁵ a quadratic scan is 10¹⁰ operations in the worst case — a strictly decreasing series, where every day scans the entire remainder and finds nothing. That is not \"slow\", it is hours. Linear is not a nicety here, it is the only thing that finishes. The lower bound also means the list is never empty, so `n = 1` is a real input and its answer is `[0]`."
    },
    {
        "constraint": "`30 <= temperatures[i] <= 100`",
        "what": "A small, bounded range of values — only 71 distinct temperatures exist. This matters in two ways. First, it guarantees **ties are common**, which is what makes the strict-versus-non-strict comparison a live bug rather than a theoretical one; a tie-free test set will not catch it. Second, it is the constraint that would unlock a counting-style solution if one were wanted, though none is needed once the pass is already linear."
    },
    {
        "constraint": "a day with no warmer day ahead answers 0",
        "what": "**This is what lets the stack simply be abandoned at the end.** Anything still waiting when the input runs out never gets resolved, and `0` is exactly the value the answer array was initialised with — so the \"drain the stack\" step that other monotonic-stack problems need is, here, no step at all. Compare largest-rectangle, where the leftovers *are* answers and must be flushed with a sentinel."
    }
]
