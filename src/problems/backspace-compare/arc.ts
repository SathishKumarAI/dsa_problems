// backspace-compare — the closing narrative, and the rungs side by side.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a copy
// of the other.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

import type { Comparison } from "../../content/types.ts"

export const arc = `The principle every step here chases is *stop doing work you will have to undo, and the way to stop is
to change the direction you read in*. The difficulty is present before any code: the editor's rule
says a \`'#'\` deletes the nearest **surviving** character to its left, so reading left to right the
fate of any character depends on keystrokes that have not arrived yet, and every forward approach must
therefore hold characters provisionally. The recursion is the most literal reading of the rule —
find the first \`'#'\`, delete it and its victim, hand yourself a shorter problem — and it is correct,
and it pays for that literalness by copying both strings and opening a call frame for every single
deletion. Flattening it into a loop that types the text out removes the recursion and keeps the worst
of the cost, because trimming the last character of an immutable string rebuilds the whole prefix, so
a linear number of keystrokes becomes quadratic work; what that rung makes visible, though, is that
the *algorithm* was already linear and all the expense was in the **container**. Swapping in a stack
fixes exactly that — one push or one pop per keystroke, with a pop from empty stated explicitly as the
no-op the constraints promise — and gives the first genuinely linear solution. But the trace of that
stack shows \`'b'\` and \`'c'\` pushed and then popped, work done and undone, and the reason is not the
container but the direction: at the moment the stack met \`'b'\` the information needed to judge \`'b'\`
did not yet exist. Reverse the reading and that changes completely, because the hashes arrive before
their victims, so a character's fate now depends only on the suffix already consumed; a single integer
counting **deletions still owed** replaces the container entirely, and it must be a counter rather
than a flag precisely because a run of hashes owes more than one. That leaves two survivor lists
holding two full texts in order to answer a single boolean, which is the last thing to go: run the two
backward walks in lockstep instead, compare each pair of survivors as they surface, and stop at the
first disagreement or at the moment one side runs out while the other has not. The fiddly part, and
the only genuinely hard line in the problem, is that each walk must consume an entire **run** of
hashes before it may report a survivor — step once and you compare a character that the finished text
does not contain — which is why that walk is worth lifting into its own named function with one loop
and one exit. The transferable habit is short enough to keep: **when a rule refers to what comes
after, try walking the other way**, and when an algorithm is already linear but slow, suspect the
container before the logic.

---`

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
            "Recursion, one cancel at a time",
            "`O((n + m)²)`",
            "`O(n + m)` frames",
            "The most literal statement of the rule; copies both strings and opens a frame per deletion",
            "Convincing yourself what the rule actually means — never for running"
        ],
        [
            "Rebuild by slicing",
            "`O(n² + m²)`",
            "`O(n + m)`",
            "Flat and readable, but every `'#'` rebuilds the whole prefix",
            "Showing that the cost is the container, not the algorithm"
        ],
        [
            "Cancel with a stack",
            "`O(n + m)`",
            "`O(n + m)`",
            "One operation per keystroke; still pushes characters it later pops, because forwards it cannot know",
            "The follow-up is not asked; short, obviously correct, edge case stated in code"
        ],
        [
            "Backward pass with a debt counter",
            "`O(n + m)`",
            "`O(n + m)`",
            "Same cost as the stack, but each character is decided once and finally — a counter replaces a container",
            "The step that carries the idea; ship the next one instead"
        ],
        [
            "Two backward cursors",
            "`O(n + m)`, early exit",
            "`O(1)`",
            "Never builds either text; compares survivors as they surface, at the price of the fiddliest loop here",
            "The expected answer once `O(1)` space is asked for — which it will be"
        ]
    ]
}
