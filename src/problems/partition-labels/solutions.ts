// partition-labels — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The top-level block is
// the rung the page recommends; `alternatives` is worst -> best beneath it.
//
// Python only for now. Java and C++ are optional until a problem has a journey
// (`problems.test.ts` holds that line), and `scripts/localsmith` backfills
// them — a translation nobody has run is not content, it is a claim.

import type { Solution } from "../../data/types.ts"

export const approach = "One pass records the last index of each letter. A second pass sweeps left to right carrying the furthest last-occurrence among the letters seen since the current part began; when the index reaches that furthest point, no letter inside the part occurs later, so cutting here is legal and — because it is the earliest such point — it leaves the most room for the parts after it. Emit the size, begin the next part, and continue. Two linear passes with a fixed 26-entry table."

export const whyNow = "Extending a candidate part and rescanning it for a violation re-reads the same prefix every time the part grows, so a long part costs a quadratic amount of checking. Knowing each letter's last index up front turns that check into a running maximum, and the legality of a cut becomes a single comparison."

export const arc = "The exchange argument here is unusually easy to see, which makes it a good place to learn the shape: cutting at the earliest legal point can never cost you a part, because any later cut covers everything the earlier one did and leaves less behind for the rest of the string. That is the whole proof, and without it 'cut as early as you can' is a plausible guess rather than an algorithm. The other transferable habit is precomputing the constraint before the sweep — the last occurrence of each letter is what turns a global condition, no letter crosses a boundary, into something local you can test with one running maximum. Look for that conversion whenever a rule mentions the whole input but is enforced one position at a time."

export const complexity = { time: "O(n)", space: "O(1) — 26 entries regardless of input" }

export const python = `def partition_labels(s: str) -> list[int]:
    last = {ch: i for i, ch in enumerate(s)}  # last wins, which is the point
    out: list[int] = []
    start = 0
    reach = 0
    for i, ch in enumerate(s):
        # the part cannot close before the last copy of anything inside it
        reach = max(reach, last[ch])
        if i == reach:
            out.append(i - start + 1)
            start = i + 1
    return out`

export const alternatives: Solution[] = [
  {
    name: "Grow a part and recheck it",
    summary:
      "Extend the current part one character at a time and, after each step, check whether any letter in it appears again later in the string. Cut as soon as none does. It follows the definition literally and rereads the part on every extension.",
    complexity: { time: "O(n^3) worst case", space: "O(n)" },
    python: `def partition_labels(s: str) -> list[int]:
    out: list[int] = []
    start = 0
    i = start
    while start < len(s):
        i = start
        while i < len(s):
            part = s[start:i + 1]
            rest = s[i + 1:]
            if not any(ch in rest for ch in set(part)):
                break
            i += 1
        out.append(i - start + 1)
        start = i + 1
    return out`,
  },
  {
    name: "Turn each letter into an interval, then merge",
    summary:
      "Every letter spans from its first to its last occurrence, which makes this exactly the interval-merging problem: merge the 26 spans and the merged blocks are the parts. It is the same answer arrived at through a different pattern, which is worth seeing once.",
    complexity: { time: "O(n)", space: "O(1) — 26 spans" },
    whyNow:
      "Re-examining the part after every character repeats a membership test over a prefix that has not changed. Collapsing each letter to a single span states the constraint once per letter instead of once per position.",
    python: `def partition_labels(s: str) -> list[int]:
    first: dict[str, int] = {}
    last: dict[str, int] = {}
    for i, ch in enumerate(s):
        if ch not in first:
            first[ch] = i
        last[ch] = i
    spans = sorted((first[ch], last[ch]) for ch in first)
    out: list[int] = []
    lo, hi = spans[0]
    for a, b in spans[1:]:
        if a <= hi:
            hi = max(hi, b)
        else:
            out.append(hi - lo + 1)
            lo, hi = a, b
    out.append(hi - lo + 1)
    return out`,
  },
]
