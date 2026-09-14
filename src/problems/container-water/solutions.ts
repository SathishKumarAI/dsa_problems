// container-water — the ladder: every way in, worst first.
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

export const approach = "Two pointers at the extremes. Record the area, then move the pointer at the shorter line inward — keeping it could only pair it with narrower widths while it stays the cap. This greedy discard is safe because every skipped pair is provably no better than one already measured."

export const whyNow = "Measuring every pair is n squared comparisons for one number. Moving the pointer at the shorter line inward discards only the pairs that line already capped, so a single sweep is enough."

export const arc = "One greedy argument carries the whole problem, and it is worth being able to say precisely: the area is limited by the SHORTER wall, so moving the taller one inward can never help — the width shrinks and the height is still capped by the short wall. Moving the shorter one is the only move that can improve anything, so no pair worth checking is ever skipped. That is the shape of every two-pointer proof: show that the pointer you advance cannot be part of a better remaining answer. Brute force is worth writing once to see the quadratic, and the exchange argument is worth rehearsing out loud, because an interviewer asking 'why is that safe?' is asking for exactly this paragraph."

export const complexity = { time: "O(n)", space: "O(1)" }

export const python = `def max_area(heights: list[int]) -> int:
    i, j = 0, len(heights) - 1
    best = 0
    while i < j:
        best = max(best, (j - i) * min(heights[i], heights[j]))
        if heights[i] < heights[j]:
            i += 1
        else:
            j -= 1
    return best`

export const java = `public int maxArea(int[] h) {
    int i = 0, j = h.length - 1, best = 0;
    while (i < j) {
        best = Math.max(best, (j - i) * Math.min(h[i], h[j]));
        if (h[i] < h[j]) i++;
        else j--;
    }
    return best;
}`

export const cpp = `int maxArea(const vector<int>& h) {
    int i = 0, j = (int)h.size() - 1, best = 0;
    while (i < j) {
        best = max(best, (j - i) * min(h[i], h[j]));
        if (h[i] < h[j]) i++;
        else j--;
    }
    return best;
}`

export const alternatives: Solution[] = [
  {
    name: "Brute force",
    summary:
      "Measure every pair of lines and keep the largest area. Right, and quadratic — and the reason it is worth stating is that it treats all n squared pairs as equally plausible, when the width of a pair is known before either height is read.",
    complexity: { time: "O(n²)", space: "O(1)" },
    python: `def max_area(heights: list[int]) -> int:
    best = 0
    for i in range(len(heights)):
        for j in range(i + 1, len(heights)):
            best = max(best, (j - i) * min(heights[i], heights[j]))
    return best`,
    java: `public int maxArea(int[] h) {
    int best = 0;
    for (int i = 0; i < h.length; i++)
        for (int j = i + 1; j < h.length; j++)
            best = Math.max(best, (j - i) * Math.min(h[i], h[j]));
    return best;
}`,
    cpp: `int maxArea(const vector<int>& h) {
    int best = 0;
    for (int i = 0; i < (int)h.size(); i++)
        for (int j = i + 1; j < (int)h.size(); j++)
            best = max(best, (j - i) * min(h[i], h[j]));
    return best;
}`,
  },
]
