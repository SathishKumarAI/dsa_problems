// boats-to-save — approach 2 — Rescan for the heaviest and the lightest.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "rescan-for-the-heaviest-and-the-lightest",
  title: "Rescan for the heaviest and the lightest",
  idea: `*Do I actually need to consider every grouping, or is there a rule that picks the right boatload
every time?* There is. The heaviest person still waiting is boarding a boat no matter what, so the
only open question is who joins them — and if anybody can, the lightest person can. So each round:
scan for the heaviest, scan for the lightest, put them together if they fit, and repeat.

This fixes the exact search's fatal weakness — **it explores every grouping because it has no reason
to believe any particular grouping is right.**`,
  intuition: `> **Intuition.** Stop thinking about the crowd and think only about one person: the heaviest one left. They are going
> on a boat this round; that is not a choice you get to make. The boat has one spare seat, and the only
> decision in the entire problem is whether that seat sails empty or carries somebody. The lightest
> person left is the easiest passenger in the world to seat, so they are the one to try — and if even
> they do not fit, the seat is going empty and there is nothing to think about. That single question,
> asked once per round, replaces the whole subset table.

> **Why it works.** This is the **exchange argument**, and it is worth being able to say out loud,
> because a greedy you cannot justify is a guess that happened to pass. Call the heaviest waiting
> person **H** and the lightest **L**, and take any optimal plan at all; H rides in some boat in it.
>
> *Case one: L cannot ride with H* (\`L + H > limit\`). Then nobody can, because every other waiting
> person weighs at least as much as L. So in every plan, including the optimal one, H sails alone —
> which is exactly what our rule does. Nothing was given up.
>
> *Case two: L can ride with H.* Suppose the optimal plan does not pair them. Then H either sails
> alone or sails with somebody else, call them X; and L either sails alone or sails with somebody
> else, call them Y. Swap the passengers: put L with H, and put X with Y (or send them alone,
> whichever the seats allow). The H-and-L boat is fine by assumption. The X-and-Y boat is fine too,
> because X was light enough to ride with H — the heaviest person present — so X plus Y is no heavier
> than X plus H, which already fit. The swap uses no more boats than before and now contains our
> greedy choice. Repeat on what is left and you have converted any optimal plan into ours without ever
> adding a boat.
>
> The shape is the thing to carry away: *pairing the lightest with the heaviest never blocks a pairing
> that mattered, because any other partner is heavier and therefore harder to place later.*`,
  worked: `\`people = [3, 2, 2, 1]\`, \`limit = 3\`. A \`used\` flag per person; each round is two full scans.

| round | scan 1 → heaviest waiting | scan 2 → lightest waiting | fits? | boat | still waiting |
|---|---|---|---|---|---|
| 1 | index 0, weight 3 | index 3, weight 1 | 1 + 3 = 4 > 3 — **no** | 3 sails alone | 3 people |
| 2 | index 1, weight 2 | index 3, weight 1 | 1 + 2 = 3 ≤ 3 — **yes** | 2 and 1 share | 1 person |
| 3 | index 2, weight 2 | nobody left | — | 2 sails alone | 0 |

Three boats. Six full scans of a four-person array to launch three boats — and every one of those
scans re-derived a fact (who is heaviest, who is lightest) that never changed.`,
  code: `def boats_to_save_rescan(people: list[int], limit: int) -> int:
    n = len(people)
    used = [False] * n
    waiting = n
    boats = 0
    while waiting > 0:
        hi = -1
        for i in range(n):
            if not used[i] and (hi < 0 or people[i] > people[hi]):
                hi = i
        used[hi] = True  # mark BEFORE looking for a companion, or hi can be its own partner
        waiting -= 1
        boats += 1
        lo = -1
        for i in range(n):
            if not used[i] and (lo < 0 or people[i] < people[lo]):
                lo = i
        if lo >= 0 and fits_one_boat(people[lo], people[hi], limit):
            used[lo] = True
            waiting -= 1
    return boats`,
  codeNote: `\`fits_one_boat\` is the shared rule from Approach 1 — every rung asks it the same question.`,
  mistake: `> **Watch out.** Boarding two people but decrementing the waiting counter once — writing \`used[lo] = True\` and
> forgetting the \`waiting -= 1\` beside it. The loop then runs extra rounds after the shore is already
> empty, and on each of those \`hi\` stays \`-1\`, so \`used[-1] = True\` silently re-marks the *last* person
> in the list (Python's negative index does not complain) and the boat count keeps rising. On the
> worked example it returns **4** instead of **3**; on the two-person crowd \`[1, 2], limit = 3\` it
> returns **2** instead of **1**. The lesson generalises past this problem: whenever one action changes
> two pieces of state, put the two updates on adjacent lines so a reader can see they travel together.`,
  cost: `**Time \`O(n²)\`, space \`O(n)\`.** Each round launches at most one boat, so there are at most n rounds, and
each round makes two full passes over the array looking for extremes — n rounds × 2n work is
quadratic. The space is the \`used\` array, one flag per person. At fifty thousand people that is about
2.5 × 10⁹ comparisons: too slow, but only by a constant-and-a-bit, not by an astronomical margin like
the subset search.

Use it when the input must not be reordered *and* you cannot afford a copy — this is the only rung
here that leaves \`people\` untouched while using no sorting. It is also the clearest place to *state*
the greedy: with no sorting or bucketing in the way, the code says "find the heaviest, find the
lightest, pair them if they fit" almost literally, which makes it a good thing to write on a
whiteboard before optimising it in front of the interviewer.

---`,
}
