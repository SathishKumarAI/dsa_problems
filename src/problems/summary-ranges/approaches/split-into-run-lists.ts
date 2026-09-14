// summary-ranges — approach 3 — Split into run lists
//
// Converted from docs/deep/summary-ranges_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "split-into-run-lists",
  title: "Split into run lists",
  idea: `*If the input is already sorted, do we need a key at all?* No. Values sharing a \`value - index\` key
are already adjacent, so a single left-to-right walk can tell whether each number continues the run
being built or starts a new one — no hashing, no map, no re-sorting.

This fixes Approach 2's weakness: **it computes and sorts a key whose ordering the input already
had.** The map was reconstructing adjacency that was never lost.`,
  intuition: `> **Intuition.** You are sorting index cards into piles, left to right. Look at the next number and
> ask one question: *is it exactly one more than the last number on the current pile?* If yes it goes
> on that pile; if no you start a fresh pile. At the end each pile is one run, in order, and you
> never had to look at any pile but the most recent one. The sortedness is what makes that one local
> comparison sufficient — in an unsorted array the run a number belongs to might be several piles
> back.`,
  worked: `\`nums = [0, 2, 3, 4, 6, 8, 9]\`.

| \`x\` | last value on the current pile | \`last + 1 == x\`? | action | \`runs\` after |
|---|---|---|---|---|
| \`0\` | no piles yet | — | start a pile | \`[[0]]\` |
| \`2\` | \`0\` | \`1 != 2\` | start a pile | \`[[0], [2]]\` |
| \`3\` | \`2\` | \`3 == 3\` yes | append | \`[[0], [2, 3]]\` |
| \`4\` | \`3\` | \`4 == 4\` yes | append | \`[[0], [2, 3, 4]]\` |
| \`6\` | \`4\` | \`5 != 6\` | start a pile | \`[[0], [2, 3, 4], [6]]\` |
| \`8\` | \`6\` | \`7 != 8\` | start a pile | \`[[0], [2, 3, 4], [6], [8]]\` |
| \`9\` | \`8\` | \`9 == 9\` yes | append | \`[[0], [2, 3, 4], [6], [8, 9]]\` |

Format each pile from its first and last value: \`["0", "2->4", "6", "8->9"]\`.`,
  code: `def summary_ranges_run_lists(nums: list[int]) -> list[str]:
    runs: list[list[int]] = []
    for x in nums:
        if runs and runs[-1][-1] + 1 == x:  # compare against the run's LAST value
            runs[-1].append(x)
        else:
            runs.append([x])
    return [format_range(run[0], run[-1]) for run in runs]`,
  codeNote: `The empty array needs no special case: the loop never runs, \`runs\` stays empty, and the comprehension
returns \`[]\`.`,
  mistake: `> **Watch out.** The misconception is that a run is identified by where it **started**, so comparing
> against \`runs[-1][0]\` is the same thing. A run grows at its **end**, and only its last value knows
> what number may join next. Comparing against the first value lets a run grow by exactly one element
> and then break.

Writing \`runs[-1][0] + 1 == x\` gives, measured:

| input | with the start comparison | correct |
|---|---|---|
| \`[0, 2, 3, 4, 6, 8, 9]\` | \`['0', '2->3', '4', '6', '8->9']\` | \`['0', '2->4', '6', '8->9']\` |
| \`[0, 1, 2, 4, 5, 7]\` | \`['0->1', '2', '4->5', '7']\` | \`['0->2', '4->5', '7']\` |

Every run of length 1 or 2 comes out right, so the bug survives any test whose runs are short — and
every run of three or more is silently split, with the extra pieces still looking like perfectly
well-formed ranges.

The second mistake here is dropping the \`runs and\` guard: on the very first element \`runs[-1]\` raises
\`IndexError\` on an empty list. That one is loud and fixes itself on the first run.`,
  cost: `**Time \`O(n)\`, space \`O(n)\`.** Time is one pass doing one comparison and one append per element, with
no sorting anywhere. Space is \`O(n)\` and that is the flaw: the run lists hold every element a second
time, when only two values per run — its first and its last — ever reach the output.

Use it when you actually need the grouped **elements**, not just a summary of them: "return the runs
themselves" is a common variant, and this rung answers it directly while the later ones throw the
members away. For this problem it stores \`n\` values in order to print two per run.

---`,
}
