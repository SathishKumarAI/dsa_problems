// boats-to-save — approach 3 — Sort, then empty the queue from both ends.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "sort-then-empty-the-queue-from-both-ends",
  title: "Sort, then empty the queue from both ends",
  idea: `*The rule only ever asks for the heaviest and the lightest — why am I searching for them?* Sort the
weights once. After that the heaviest is the back of the queue and the lightest is the front, and
each round is two peeks instead of two scans.

This fixes the rescan's weakness — **it re-derives the same ordering n times over, even though the
weights never change.**`,
  intuition: `> **Intuition.** Line everyone up lightest at the front, heaviest at the back — the queue for a ride, sorted by
> weight. Now the rule needs no searching at all: call the person at the back, then look at the person
> at the front and see whether they fit alongside. Sorting is a one-time cost that answers "who is the
> heaviest?" for every future round at once. What this version still gets wrong is *removal*: taking
> the person off the front of a real queue means everyone behind them shuffles forward one place, and
> paying that shuffle once per boat quietly costs as much as the scanning did.`,
  worked: `\`people = [3, 2, 2, 1]\`, \`limit = 3\`. Sorted, the queue is \`[1, 2, 2, 3]\`.

| round | queue before | take from the back | front | fits? | queue after | boats |
|---|---|---|---|---|---|---|
| 1 | \`[1, 2, 2, 3]\` | 3 | 1 | 1 + 3 = 4 > 3 — no | \`[1, 2, 2]\` | 1 |
| 2 | \`[1, 2, 2]\` | 2 | 1 | 1 + 2 = 3 ≤ 3 — yes | \`[2]\` | 2 |
| 3 | \`[2]\` | 2 | queue empty | — | \`[]\` | 3 |

Same three boats, same decisions, and no scanning anywhere — but look at round 2: removing the 1 from
the front moved the two remaining people one slot each. On a fifty-thousand-person queue, that is
fifty thousand moves for one boat.`,
  code: `def boats_to_save_sorted_queue(people: list[int], limit: int) -> int:
    waiting = sorted(people)
    boats = 0
    while waiting:
        heaviest = waiting.pop()
        boats += 1
        if waiting and fits_one_boat(waiting[0], heaviest, limit):
            waiting.pop(0)  # removing the front shifts everyone behind it — this is the hidden O(n)
    return boats`,
  codeNote: `\`fits_one_boat\` is the shared rule from Approach 1 — every rung asks it the same question.`,
  mistake: `> **Watch out.** Pairing from the light end instead: pop the *lightest* and let them share with the next-lightest who
> fits. It feels equally greedy — you are still filling boats — and it passes the worked example, where
> both rules return **3**. It is wrong, and the crowd that exposes it is \`people = [1, 1, 2, 2]\`,
> \`limit = 3\`: light-end pairing puts the two 1s together, then finds 2 + 2 = 4 over the limit and sails
> each 2 alone, for **3** boats; the correct answer is **2** (a 1 with a 2, and the other 1 with the
> other 2). The reason is exactly the exchange argument above, read backwards — pairing two light people
> together *wastes* the only capacity that the heavy people could have used. Being able to name that
> failure case is worth more than being able to write the loop.`,
  cost: `**Time \`O(n²)\`, space \`O(n)\`.** The sort is \`O(n log n)\` and the peeks are free, but \`pop(0)\` on a Python
list — and \`erase(begin())\` on a C++ vector, and \`remove(0)\` on a Java \`ArrayList\` — shifts every
remaining element, so a pairing round costs \`O(n)\` and there can be n/2 of them. The space is the
sorted copy. This is the rung where the cost has moved: the searching is fixed and the *removing* is
now the bottleneck, which is a much more common shape of performance bug than it first appears.

Use it — or rather, use its idea — when the container genuinely supports cheap removal at both ends:
a \`collections.deque\` in Python, an \`ArrayDeque\` in Java, a \`std::deque\` in C++ all make removal from
the front \`O(1)\` and turn this into an honest \`O(n log n)\` solution that reads very naturally. Written
with a plain list, treat it as the instructive mistake it is.

---`,
}
