// boats-to-save — approach 1 — Exact search over every group.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "exact-search-over-every-group",
  title: "Exact search over every group",
  idea: `*How do I know a given number of boats is the smallest possible?* Try every way of filling boats and
keep the best. Track which people have already crossed as a set, and from each such state launch one
more boat — carrying one person, or two who fit together — until everybody has crossed.`,
  intuition: `> **Intuition.** Think of a light switch per person: on means "already across". The state of the crossing is the whole
> row of switches, and every boat you launch flips one or two of them from off to on. Starting from the
> all-off row, you want the shortest chain of flips that reaches the all-on row — which is a
> shortest-path question over 2ⁿ states. One pruning is worth building in from the start: a boat has to
> carry *somebody*, so insist it carries the lowest-numbered person still waiting. That costs nothing
> (the boat that carries them exists in every solution) and it stops you from exploring the same
> boatload in both possible orders.`,
  worked: `\`people = [3, 2, 2, 1]\` — person 0 weighs 3, person 1 weighs 2, person 2 weighs 2, person 3 weighs 1
— and \`limit = 3\`. Write each state as four bits, bit *i* set meaning person *i* is across. Only the
states actually reached appear:

| from state | boats so far | lowest still waiting | boat launched | to state | boats |
|---|---|---|---|---|---|
| \`0000\` | 0 | person 0 (weight 3) | 3 alone — 3+2, 3+2, 3+1 all exceed 3 | \`0001\` | 1 |
| \`0001\` | 1 | person 1 (weight 2) | 2 alone | \`0011\` | 2 |
| \`0001\` | 1 | person 1 (weight 2) | 2 + 1 (= 3, fits) | \`1011\` | 2 |
| \`0011\` | 2 | person 2 (weight 2) | 2 alone | \`0111\` | 3 |
| \`0011\` | 2 | person 2 (weight 2) | 2 + 1 (= 3, fits) | \`1111\` | **3** |
| \`1011\` | 2 | person 2 (weight 2) | 2 alone — the 1 is already across | \`1111\` | **3** |

Two different chains reach \`1111\` and both cost 3, so the answer is 3. Notice how much bookkeeping
that took for four people: sixteen states, of which six were live. For twenty people it would be a
million.`,
  code: `def fits_one_boat(lighter: int, heavier: int, limit: int) -> bool:
    """The problem's one rule, in one place: two people share a boat only if their
    combined weight is within the limit. Change the rule here and every rung follows."""
    return lighter + heavier <= limit


def boats_to_save_subset_search(people: list[int], limit: int) -> int:
    n = len(people)
    full = 1 << n
    best = [n + 1] * full  # n + 1 is "unreachable": no answer ever needs more than n boats
    best[0] = 0
    for mask in range(full):
        if best[mask] > n:
            continue
        # fixing the boat to carry the lowest waiting person removes the
        # duplicate work of trying the same pair in both orders
        first = -1
        for i in range(n):
            if not (mask >> i) & 1:
                first = i
                break
        if first < 0:
            continue
        alone = mask | (1 << first)
        if best[mask] + 1 < best[alone]:
            best[alone] = best[mask] + 1
        for j in range(first + 1, n):
            if not (mask >> j) & 1 and fits_one_boat(people[first], people[j], limit):
                both = alone | (1 << j)
                if best[mask] + 1 < best[both]:
                    best[both] = best[mask] + 1
    return best[full - 1]`,
  mistake: `> **Watch out.** Dropping the weight check on the pair — writing \`if not (mask >> j) & 1:\` and
> forgetting the \`and fits_one_boat(...)\` beside it. The search then happily loads two people into a boat that
> cannot float, and because it is minimising, it *prefers* those overloaded boats. On the
> no-pairs-possible crowd \`people = [3, 5, 3, 4], limit = 5\` the buggy version returns **2**; the
> correct answer is **4**. The bug is invisible on crowds where most pairs fit anyway, which is most
> random test data — it only shows up when the limit is genuinely tight, exactly where the problem is
> interesting.`,
  cost: `**Time \`O(2ⁿ · n)\`, space \`O(2ⁿ)\`.** The time is one visit per subset of the crowd, and each visit scans
for the lowest waiting person and then tries every partner for them — that is the \`· n\`. The space is
the table itself, one boat-count per subset. Both are stated analytically rather than measured: the
stress tests below run this rung only up to twelve people, because at thirty it would need a billion
table entries.

Use it as the oracle, not the answer. Its real job in this document is to independently confirm that
the greedy is optimal — it makes no clever assumption at all, so when it agrees with the two-pointer
sweep on a thousand random crowds, that agreement is evidence. The shape is also worth recognising on
its own: "subset as a bitmask, shortest chain of transitions" is the standard attack on genuine bin
packing and travelling-salesman-sized problems, where no greedy exists and n really is under twenty.

---`,
}
