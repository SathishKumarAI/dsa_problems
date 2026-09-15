// boats-to-save — approach 5 — Sort, then two converging pointers (optimal).
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "optimal",
  title: "Sort, then two converging pointers (optimal)",
  idea: `*If the queue is already sorted, do I need a queue at all?* No — two integers will do. Put one index
on the lightest person and one on the heaviest, and let each round launch exactly one boat for the
person at the heavy index. If the person at the light index fits beside them, advance the light index
too. Either way the heavy index steps back.

This fixes both remaining weaknesses at once — **the queue's \`O(n)\` removals** (nothing is removed;
an index moves) and **the bucket table's memory bill sized by the limit** (the state is now two
integers, no matter how large the limit is).`,
  intuition: `> **Intuition.** Two fingers on a sorted row of weights, one at each end, walking toward each other. The right finger
> points at the person whose boat is being launched right now; that always happens, which is why the
> right finger moves every single round and why the boat count is exactly the number of rounds. The
> left finger points at the cheapest possible companion, and it moves only when that companion actually
> boards. The fingers meeting is not a special case: when they land on the same person, that person's
> boat launches and the walk ends. Everything the earlier rungs computed with scans, queues and tables
> is now two comparisons of two array reads.

> **Why it works.** Two claims, and the exchange argument in Approach 2 supplies the first. *The
> decision is right*: \`order[j]\` is the heaviest person still waiting and \`order[i]\` the lightest, so
> pairing them when they fit is safe and sailing alone when they do not is forced — the sort is what
> makes "the ends of the range" and "the extremes of the crowd" the same thing, and the converging
> walk is what keeps that true after every round, because the untouched middle \`order[i..j]\` is exactly
> the set of people still waiting. *The count is right*: \`j\` decreases on every single round and never
> on any other occasion, so \`boats\` equals the number of rounds equals the number of people who
> boarded at the heavy end — one boat each, with a companion or without. Both indices move only
> inward, so the walk ends after at most \`n\` rounds.`,
  worked: `\`people = [3, 2, 2, 1]\`, \`limit = 3\`. Sorted, \`order = [1, 2, 2, 3]\`.

\`\`\`
order = [1, 2, 2, 3]
         ^        ^
         i        j
\`\`\`

| round | \`i\` | \`order[i]\` | \`j\` | \`order[j]\` | sum | vs limit 3 | what happens | next \`i\`, \`j\` | boats |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0 | 1 | 3 | 3 | 4 | too heavy | the lightest person alive cannot ride with the 3, so nobody can — it sails alone | 0, 2 | 1 |
| 2 | 0 | 1 | 2 | 2 | 3 | exactly the limit | they share; **both** indices move | 1, 1 | 2 |
| 3 | 1 | 2 | 1 | 2 | 4 | too heavy | the fingers are on the same person; that person sails alone | 1, 0 | **3** |

\`i\` is now past \`j\`, so the walk ends: **3 boats**. Three rounds, three boats, four people placed —
and the entire state at any moment was the two numbers \`i\` and \`j\`.`,
  code: `def boats_to_save_two_pointers(people: list[int], limit: int) -> int:
    order = sorted(people)
    i, j = 0, len(order) - 1
    boats = 0
    while i <= j:  # <=, not <: when both land on the same person, that person still needs a boat
        if fits_one_boat(order[i], order[j], limit):
            i += 1  # the lightest fits alongside the heaviest, so they share
        j -= 1      # the heaviest boards either way, so j always moves
        boats += 1
    return boats`,
  codeNote: `\`fits_one_boat\` is the shared rule from Approach 1 — every rung asks it the same question.`,
  mistake: `> **Watch out.** Writing \`while i < j\` instead of \`while i <= j\`. It is the natural thing to type — the two pointers
> are converging, so surely they stop when they meet — and it is wrong, because the person they meet on
> has not been carried yet. On the worked example it returns **2** instead of **3**; on a single-person
> crowd \`[1], limit = 1\` it returns **0** instead of **1**, which is the clearest possible statement of
> the bug: nobody crossed. The test for this in your head should be the one-person crowd, every time
> you write a converging loop — does the last survivor get handled?

A second, subtler slip is advancing \`i\` inside the \`if\` and then *also* advancing it at the bottom of
the loop, so a shared boat skips a person: that person is silently never carried and the count comes
out low.`,
  cost: `**Time \`O(n log n)\`, space \`O(1)\` beyond the sort.** The whole cost is the sort — the converging walk
itself is \`O(n)\`, because every round retires at least one person (the heavy index always moves) and
there are only n people to retire. The space claim deserves precision: the code above calls \`sorted()\`,
which builds a copy and is therefore \`O(n)\`; sort the caller's list in place with \`people.sort()\` and
the extra space really is \`O(1)\`, apart from whatever the sort routine uses internally (\`O(log n)\` stack
for most library sorts). Either way, no structure grows with the crowd.

**This is the one to memorise.** It is five lines, it needs no auxiliary structure, it is unaffected
by how large \`limit\` is, and it beats the bucket rung whenever the weight range is bigger than the
crowd — which, at a limit of 30000, is most realistic inputs. If the weights arrive already sorted,
it is outright \`O(n)\` with \`O(1)\` space and nothing can beat it.

---`,
}
