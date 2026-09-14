// fruit-baskets — "Understanding the Problem", and the constraints table.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

import type { Unlock } from "../../content/types.ts"

export const understanding = `You are walking along a row of fruit trees, carrying two baskets. Each tree gives you exactly one
fruit, and each basket holds exactly one **kind** of fruit — as many as you like, but all the same
kind. You start at a tree of your choosing, take the fruit from every tree you pass, and you must
stop the moment a tree offers a third kind, because there is no basket free for it. How many fruits
can you carry away at best?

The baskets are a costume. Strip them off and the question is:

> **What is the longest run of neighbouring trees holding at most two distinct values?**

That is the whole problem, and recognising it is most of the work. The general form is
**at-most-\`K\`-distinct**, and this is the \`K = 2\` version with a nice picture attached. If you can
solve it for two you can solve it for any \`K\` by changing one number.

**The core question:** for each position, how far back can a run start and still contain no more
than two distinct kinds? The naive approach is slow because it answers that question from scratch at
every starting tree, re-walking a run its predecessor has just walked — and those runs overlap almost
completely.

> **Watch out.** The misconception that sinks people here is thinking a kind **leaves** the window
> when one of its fruits slides out the back. It does not. A kind leaves the window when its **count**
> reaches zero. The window \`[1, 2, 1]\` still holds kind \`1\` after the leftmost \`1\` is dropped — there
> is another one further in — and code that removes the kind on the first departure will happily
> certify a three-kind window as legal.

The worked example used in every section below is the statement's third one, chosen because it is
the only one that exercises the corner case:

\`\`\`
fruits = [1, 2, 3, 2, 2]        answer: 4   (the run 2, 3, 2, 2)
\`\`\`

The trap it sets: when the \`3\` arrives at index 2, the window must let go of the \`1\` — and the
answer that survives starts at index 1, *not* at index 3. A solution that restarts just after the
offending tree returns \`3\` and looks plausible.

---`

export const unlocks: Unlock[] = [
    {
        "constraint": "`1 <= fruits.length <= 10^5`",
        "what": "A hundred thousand trees, so an `O(n²)` restart-per-start scan is up to 10¹⁰ steps. **This is the constraint that rules out brute force.** The row is never empty, so the answer is always at least `1` and there is no empty-input branch."
    },
    {
        "constraint": "`0 <= kind < fruits.length`",
        "what": "The kinds are **unbounded in value** but bounded in count: there could be 10⁵ different kinds, and a kind can be any number in that range. This is the constraint that forbids a fixed-size array of counters — you need a **hash map**, unlike the fixed 26-slot tally that a lowercase-letters problem would allow."
    },
    {
        "constraint": "the run must be **contiguous**",
        "what": "You cannot skip a tree and continue. This is what makes it a *window* problem rather than a selection problem — the answer is an interval, so it has a left edge and a right edge and nothing else."
    },
    {
        "constraint": "at most **two** distinct kinds",
        "what": "The rule is **local**: whether a window is legal depends only on what is inside it, never on what came before. That locality is what lets a single window slide along and carry its own verdict."
    },
    {
        "constraint": "repeats do not count against the limit",
        "what": "`[1,1,1,2,2]` is five fruits and only two kinds. **This is the constraint that forces counts rather than a set of present kinds** — you must know *how many* of each kind are inside, not merely which kinds are inside."
    }
]
