// inorder-walk — the closing narrative, and the rungs side by side.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a copy
// of the other.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

import type { Comparison } from "../../content/types.ts"

export const arc = `Every rung here performs the identical walk — left, node, right — and what changes is **where the
unfinished work is kept**, which turns out to be the only interesting question in traversal. The
literal transcription keeps it in the return values, so each node builds a whole list and every
concatenation copies both halves; that is \`O(n²)\` hiding inside something that looks linear, and it
is measurable — \`795µs\` against \`37µs\` on an \`800\`-node spine. Handing one list down removes the
copying and moves the memory into the call stack, which is what recursion is for and costs the
height of the tree. Writing that stack out by hand changes nothing about the algorithm and three
things about what you can do with it: the memory becomes bounded and inspectable, the walk can stop
early, and the \`1 000\`-frame ceiling stops being a limit — which matters because this problem
permits a \`10 000\`-node chain, on which both recursive rungs simply fail. The last rung asks whether
any extra memory is needed at all, and the answer is no: a node's inorder predecessor is the
rightmost node of its left subtree, whose right pointer is empty by definition, so the walk can
borrow that pointer as a way back and untie it on the return. It pays for \`O(1)\` by mutating the
tree mid-walk and restoring it — safe only if it finishes, which is the honest reason the explicit
stack remains the answer and Morris remains the party trick worth understanding.`

export const comparison: Comparison = {
    "head": [
        "Approach",
        "Time",
        "Space",
        "Core trade-off",
        "Best used when"
    ],
    "rows": [
        [
            "Rebuild at every node",
            "`O(n²)`",
            "`O(n²)`",
            "The definition, verbatim; copies at every level",
            "Checking you believe the rule"
        ],
        [
            "One list, handed down",
            "`O(n)`",
            "`O(h)` frames",
            "Shortest correct version",
            "Default, until the tree is deep"
        ],
        [
            "Explicit stack",
            "`O(n)`",
            "`O(h)`",
            "Same walk, memory you own and can stop",
            "\"Without recursion\", deep trees, early exit"
        ],
        [
            "Morris threading",
            "`O(n)`",
            "`O(1)`",
            "Borrows the tree's own pointers",
            "Memory-bound, and nothing can interrupt it"
        ]
    ]
}
