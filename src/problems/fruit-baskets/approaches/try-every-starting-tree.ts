// fruit-baskets — approach 1 — Try every starting tree.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "try-every-starting-tree",
  title: "Try every starting tree",
  idea: `*Which starting tree gives the longest haul?* Try all of them. Stand at each tree in turn, walk
forward collecting kinds into a set, and stop the moment the set holds three. The longest walk any
starting tree produced is the answer.`,
  intuition: `> **Intuition.** You literally do what the story says, once per starting tree. Stand at tree 0, walk
> and collect until a third kind stops you, note how many fruits you got, then trudge back to the
> start, step forward one tree, and do the whole walk again. What makes it wasteful is that the walk
> from tree 1 covers almost exactly the ground the walk from tree 0 just covered, and you learned
> nothing from the first walk that you carry into the second — the set is thrown away and rebuilt
> every time. On a row like \`[1,1,1,1]\` you walk four trees, then three, then two, then one, to
> discover a fact a single pass already had.`,
  worked: `\`fruits = [1, 2, 3, 2, 2]\`. One row per starting tree; \`end\` stops on the first tree that would make
a third kind, or past the end of the row.

| \`start\` | kinds collected as \`end\` advances | \`end\` stops at | reason | width \`end − start\` | best |
|---|---|---|---|---|---|
| 0 | \`{1}\` → \`{1,2}\` → \`{1,2,3}\` | 2 | the \`3\` is a third kind | 2 | 2 |
| **1** | \`{2}\` → \`{2,3}\` → \`{2,3}\` → \`{2,3}\` | 5 | ran off the end of the row | **4** | **4** |
| 2 | \`{3}\` → \`{3,2}\` → \`{3,2}\` | 5 | ran off the end | 3 | 4 |
| 3 | \`{2}\` → \`{2}\` | 5 | ran off the end | 2 | 4 |
| 4 | \`{2}\` | 5 | ran off the end | 1 | 4 |

The answer is 4, from \`start = 1\`. Count the tree-visits down that table: 3 + 4 + 3 + 2 + 1 = 13
visits over a row of 5 trees. The trees at indices 3 and 4 are visited by four different starts.`,
  code: `def fruit_baskets_every_start(fruits: list[int]) -> int:
    best = 0
    for start in range(len(fruits)):
        kinds: set[int] = set()
        end = start
        while end < len(fruits):
            kinds.add(fruits[end])
            if len(kinds) > 2:
                break
            end += 1
        best = max(best, end - start)
    return best`,
  codeNote: `A set is enough here, and only here: this rung never removes anything, so it never has to ask
whether a kind is *still* present. Every later rung removes, and every later rung therefore needs
counts.`,
  mistake: `> **Watch out.** The misconception is that the loop leaves \`end\` on the last **legal** tree, so the
> width needs the usual \`+ 1\`. It does not: \`end\` is left on the first *illegal* tree — the one that
> made three kinds — or one past the end of the row. Either way \`end\` is already an exclusive bound
> and the width is \`end - start\` exactly.

Writing \`best = max(best, end - start + 1)\` returns **5** on the worked example instead of 4 — it
claims the whole row, three kinds and all, is pickable. The bug is seductive because \`+ 1\` is right
in almost every other loop you write, where the index ends on the last thing you accepted. Here the
\`break\` fires *before* \`end += 1\`, so the loop's exit leaves \`end\` pointing at something it refused.

The general habit that prevents it: after writing a loop with a \`break\`, say out loud what the exit
variable points at. "\`end\` is the first tree I could not take" answers the \`+ 1\` question
immediately.`,
  cost: `**Time** \`O(n²)\`, **space** \`O(1)\`. The time comes from the nested walk — \`n\` starting trees, each
walking up to \`n\` trees forward — and it is genuinely quadratic on the worst input, a row of a single
kind, where every start walks to the end. The space is one set holding at most three kinds, which is
constant regardless of the row's length.

At \`n = 10^5\` this is roughly 10¹⁰ steps and will not finish; that worst case is stated analytically,
not measured, and the stress tests below run it only at small \`n\`. Use it as the oracle in a test
harness — it is the version whose correctness you can confirm by reading, which is exactly what you
need from the thing checking the clever ones. In an interview, state it in one sentence, name the
\`O(n²)\`, and improve on it.

---`,
}
