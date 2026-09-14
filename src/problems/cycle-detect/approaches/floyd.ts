// cycle-detect — approach 3 — Floyd's tortoise and hare.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "floyd",
  title: "Floyd's tortoise and hare",
  idea: `*The set only ever needed to answer "am I somewhere I have been?" — is there a way to be in two places
at once instead?* Yes: send two pointers from the head, one stepping one node at a time and one
stepping two. If the list ends, the fast one falls off. If it loops, both end up inside the loop and
the fast one catches the slow one from behind. *What does it fix?* It removes the set entirely: \`O(1)\`
space, same \`O(n)\` time, and nothing is remembered between steps except two positions.`,
  intuition: `> **Intuition.** Two runners set off together round a track. If the track is a straight road the
> faster one reaches the end and the race is over. If the track has a loop in it, both eventually
> enter the loop and never leave — and from that moment the faster one is gaining, lap after lap,
> until he is running alongside the slower one. Nobody wrote anything down: the **evidence** of a
> repeat is simply that the two runners are in the same place.

> **Why it works.** Once both pointers are inside the loop, the gap between them — measured forward
> from \`fast\` to \`slow\` around the loop — shrinks by **exactly one** node per step, because \`slow\`
> advances 1 and \`fast\` advances 2. A quantity that decreases by exactly one can never step *over*
> zero; it has to land on it. That is why they are guaranteed to meet rather than merely pass, and it
> is why the step sizes are 1 and 2 rather than 1 and 3: a gap closing by two per step could skip
> zero, leaving you to argue about the parity of the loop length. The 1-and-2 version needs no such
> argument.

The loop condition \`while fast is not None and fast.next is not None\` is doing two jobs. It is the
no-cycle exit — an acyclic list eventually gives \`fast\` a \`None\` to stand on or to step from — and it
is the safety check that makes \`fast.next.next\` legal, since you may only dereference a node you have
just confirmed is not \`None\`.

One last detail that trips everyone: the check \`if slow is fast\` must happen **after** both have
moved. They both start at the head, so a check before the first move fires immediately on every input.`,
  worked: `Input: \`1 → 2 → 3 → 4 → (back to N2)\`. The loop is \`N2 → N3 → N4 → N2\`, length 3.

| Step | \`slow\` (+1) | \`fast\` (+2) | met? | note |
|---|---|---|---|---|
| start | \`N1\` | \`N1\` | — | not checked yet — they always start equal |
| 1 | \`N2\` | \`N3\` | no | fast entered the loop |
| 2 | \`N3\` | \`N2\` (\`N4 → N2\`) | no | slow is now in the loop too; gap is 2 going forward |
| 3 | \`N4\` | \`N4\` (\`N2 → N3 → N4\`) | **yes** | **return True** |

Watch the gap, measured as the forward distance from \`fast\` to \`slow\` around the 3-cycle: after step 1
it is 2, after step 2 it is 1, after step 3 it is 0. Exactly one less each step, as promised — it
could not have jumped past zero.

For contrast, the same algorithm on the acyclic \`1 → 2 → ∅\`: step 1 sets \`slow = N2\` and
\`fast = None\`; the condition \`fast is not None\` now fails and the function returns \`False\`, having
touched three pointers and allocated nothing.`,
  code: `def cycle_detect_floyd(head: ListNode | None) -> bool:
    slow = fast = head
    while fast is not None and fast.next is not None:  # also makes fast.next.next safe
        slow = slow.next
        fast = fast.next.next
        if slow is fast:  # checked AFTER moving — they start equal
            return True
    return False`,
  mistake: `> **Watch out.** The misconception is that \`slow is fast\` *means* "a cycle exists", so where you
> test it is a matter of taste. It means no such thing. It is evidence of a cycle only once the two
> pointers have travelled **different distances**, and at the top of the first iteration they have
> travelled the same distance: none.

Checking \`if slow is fast\` at the top of the loop, before either pointer moves:

\`\`\`python
while fast is not None and fast.next is not None:
    if slow is fast:      # WRONG — true on the very first iteration, always
        return True
    slow = slow.next
    fast = fast.next.next
\`\`\`

Both pointers start at \`head\`, so this returns **\`True\`** for every list with at least two nodes,
cycle or not — measured on the acyclic \`1 → 2 → ∅\` and on a five-node straight list, both of which
the buggy version calls cyclic. The empty list and the one-node list escape only because the loop
condition rejects them before the check is ever reached, which is exactly the sort of accidental
survival that hides a bug from a test suite.

The usual attempted fix — starting \`fast = head.next\` — works, but then you must handle \`head is None\`
separately before touching \`head.next\`, and the meeting point no longer has the clean distance
property that the find-the-entry-point follow-up depends on. Moving first and checking second is the
version to memorize.`,
  cost: `**Time** \`O(n)\`, **space** \`O(1)\`. The time bound is not obvious and is worth being able to defend:
\`slow\` takes at most \`tail + loop\` steps to enter the loop and at most \`loop\` more before \`fast\`
catches it, so the total is under \`2n\` steps. Space is two pointers, regardless of list length.

This is the one to ship. It is the only approach here that satisfies the \`O(1)\`-space requirement
while staying linear, it never touches the list's data, and it extends: the same two pointers, after
meeting, locate the cycle's entry node (reset one to the head, advance both by one, they meet at the
entry) and measure the cycle's length (keep one still, walk the other round). It is also the engine
behind find-the-duplicate-number and several cycle-finding tricks in number theory.

---`,
}
