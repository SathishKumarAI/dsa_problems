// counting-bits — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The KEYS on
// `alternatives` are load-bearing where a journey exists: `lib/ladder.ts`
// merges an alternative with the act that shares its key, and `from:` in the
// journey must then name that key rather than an array index.
//
// Two arcs, and they are not duplicates. The one here is the short paragraph
// the PROBLEM page renders under the ladder; `arc.ts` holds the long one the
// teaching document ends on. Changing either does not oblige the other.

import type { Solution } from "../../data/types.ts"

export const approach = "Fill left to right with best[i] = best[i >> 1] + (i & 1). Shifting right removes the lowest bit and lands on a strictly smaller index, which has already been computed — that is the whole recurrence, and it is why a single loop suffices. The `& 1` recovers the bit that the shift discarded. Entry 0 is 0 and needs no special case beyond being the starting point."

export const whyNow = "Counting the bits of each number separately re-walks up to 32 positions for every entry, and it re-derives facts the array already holds. Removing one bit lands on a smaller number whose answer is written down — so each entry costs a shift, an and, and a lookup, and the whole array is one pass."

export const arc = "The naive rung is not wrong, it is forgetful: it walks up to seventeen bit positions for every number while the array it is filling already holds the answer for a smaller one. The DP move is to find that smaller number, and the arithmetic hands it over — shifting right drops the lowest bit and lands on i >> 1, which is strictly smaller and therefore already written down, so each entry costs a shift, an and, and one lookup. That is the pattern in miniature: an overlapping subproblem is just a smaller instance you can name, and naming it is the entire creative step. Entry 0 needs no special case because it is the base every other entry rests on. Worth knowing alongside it is the other decomposition, best[i] = best[i & (i − 1)] + 1, which strips the LOWEST SET bit rather than the last bit; the same identity drives Brian Kernighan's popcount loop, and recognising i & (i − 1) on sight pays across every bit problem."

export const complexity = { time: "O(n)", space: "O(n)" }

export const python = `def count_bits(n: int) -> list[int]:
    best = [0] * (n + 1)
    for i in range(1, n + 1):
        best[i] = best[i >> 1] + (i & 1)
    return best`

export const java = `public int[] countBits(int n) {
    int[] best = new int[n + 1];
    for (int i = 1; i <= n; i++) {
        best[i] = best[i >> 1] + (i & 1);
    }
    return best;
}`

export const cpp = `vector<int> countBits(int n) {
    vector<int> best(n + 1, 0);
    for (int i = 1; i <= n; i++) {
        best[i] = best[i >> 1] + (i & 1);
    }
    return best;
}`

export const alternatives: Solution[] = [
  {
    name: "Count each number's bits",
    summary:
      "For every number from 0 to n, shift it right until it reaches zero, adding the low bit each time. Correct and n log n, and it treats every number as a stranger — when in fact i differs from the already-computed i >> 1 by exactly one bit, which is the whole problem.",
    complexity: { time: "O(n log n)", space: "O(n)" },
    python: `def count_bits(n: int) -> list[int]:
    out = []
    for i in range(n + 1):
        count = 0
        x = i
        while x > 0:
            count += x & 1
            x >>= 1
        out.append(count)
    return out`,
    java: `public int[] countBits(int n) {
    int[] out = new int[n + 1];
    for (int i = 0; i <= n; i++) {
        int count = 0;
        int x = i;
        while (x > 0) {
            count += x & 1;
            x >>= 1;
        }
        out[i] = count;
    }
    return out;
}`,
    cpp: `vector<int> countBits(int n) {
    vector<int> out(n + 1, 0);
    for (int i = 0; i <= n; i++) {
        int count = 0;
        int x = i;
        while (x > 0) {
            count += x & 1;
            x >>= 1;
        }
        out[i] = count;
    }
    return out;
}`,
  },
]
