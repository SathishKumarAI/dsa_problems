// trap-rain-water — the ladder: every way in, worst first.
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

export const approach =
  "Put i at the left and j at the right, carrying leftMax and rightMax. Whichever side is shorter is the side whose water level is already fixed: nothing outside it can raise the level, because the other side is taller. So process that side — add its trapped water and step inward — and repeat. Each bar is visited once and the two maxima are only ever updated, never recomputed."

export const whyNow =
  "Precomputing the two maxima arrays is already linear, but it reads the array three times and holds 2n extra numbers. Walking inward from both ends carries the same two maxima in two variables, because the shorter wall is always the one that decides — and the shorter wall is always the one you can safely move."

export const arc =
  "Water above a column is decided by one number: the smaller of the tallest wall to its left and the tallest to its right. Write that down and the ladder builds itself — recompute both maxima per column and you are quadratic, precompute them into two arrays and you are linear with linear memory, and then the final rung notices you only ever need the SMALLER of the two, so whichever side is currently lower can be advanced safely while its running maximum is already known. That last argument is the one to practise saying, because it is the reason the two-pointer version is correct rather than merely shorter. Know the prefix/suffix-maxima version too: it is easier to derive under pressure and generalises to the two-dimensional variant."

export const complexity = { time: "O(n)", space: "O(1)" }

export const python = `def trap(height: list[int]) -> int:
    i, j = 0, len(height) - 1
    left_max = right_max = 0
    total = 0
    while i < j:
        if height[i] < height[j]:
            left_max = max(left_max, height[i])
            total += left_max - height[i]
            i += 1
        else:
            right_max = max(right_max, height[j])
            total += right_max - height[j]
            j -= 1
    return total`

export const java = `public int trap(int[] height) {
    int i = 0, j = height.length - 1;
    int leftMax = 0, rightMax = 0, total = 0;
    while (i < j) {
        if (height[i] < height[j]) {
            leftMax = Math.max(leftMax, height[i]);
            total += leftMax - height[i];
            i++;
        } else {
            rightMax = Math.max(rightMax, height[j]);
            total += rightMax - height[j];
            j--;
        }
    }
    return total;
}`

export const cpp = `int trap(const vector<int>& height) {
    int i = 0, j = (int)height.size() - 1;
    int leftMax = 0, rightMax = 0, total = 0;
    while (i < j) {
        if (height[i] < height[j]) {
            leftMax = max(leftMax, height[i]);
            total += leftMax - height[i];
            i++;
        } else {
            rightMax = max(rightMax, height[j]);
            total += rightMax - height[j];
            j--;
        }
    }
    return total;
}`

export const alternatives: Solution[] = [
  {
    name: "Brute force per column",
    costWhy:
      "O(n\u00b2) time, O(1) space. For each of the n columns, two scans \u2014 left and right \u2014 to find the tallest bar on each side, so about n\u00b2 comparisons in total and roughly 4\u00b710\u2078 at the ceiling of 2\u00b710\u2074. The space is three variables. Every one of those scans recomputes a value that changes by at most one comparison between neighbouring columns, which is precisely the waste the next rung removes.",
    summary:
      "For each column, scan left and right for the tallest bar on each side; the water above it is the smaller of those minus its own height. Correct, and quadratic because each column re-derives maxima its neighbour just computed — the same scan, one position over.",
    complexity: { time: "O(n²)", space: "O(1)" },
    python: `def trap(height: list[int]) -> int:
    total = 0
    for i in range(len(height)):
        left = max(height[: i + 1])
        right = max(height[i:])
        total += min(left, right) - height[i]
    return total`,
    java: `public int trap(int[] height) {
    int total = 0;
    for (int i = 0; i < height.length; i++) {
        int left = 0, right = 0;
        for (int a = 0; a <= i; a++) left = Math.max(left, height[a]);
        for (int b = i; b < height.length; b++) right = Math.max(right, height[b]);
        total += Math.min(left, right) - height[i];
    }
    return total;
}`,
    cpp: `int trap(const vector<int>& height) {
    int n = (int)height.size();
    int total = 0;
    for (int i = 0; i < n; i++) {
        int left = 0, right = 0;
        for (int a = 0; a <= i; a++) left = max(left, height[a]);
        for (int b = i; b < n; b++) right = max(right, height[b]);
        total += min(left, right) - height[i];
    }
    return total;
}`,
  },
  {
    name: "Prefix and suffix maxima",
    costWhy:
      "O(n) time and O(n) space: three passes \u2014 left maxima, right maxima, then the water \u2014 each linear, and two arrays of length n to hold them. This is the rung that makes the idea obvious: the maxima are computed once instead of n times, and the water formula is then a single subtraction per column. What it spends is memory, and the [[two pointers|two-pointer]] rung above it shows that memory was never necessary.",
    summary:
      "Precompute the tallest bar at or before every index and at or after it, then read both off in a third pass. The rescanning is gone and it is genuinely linear; what remains is two arrays of n, holding numbers that two travelling variables could carry instead.",
    complexity: { time: "O(n)", space: "O(n)" },
    python: `def trap(height: list[int]) -> int:
    n = len(height)
    if n == 0:
        return 0
    left = [0] * n
    right = [0] * n
    left[0] = height[0]
    for i in range(1, n):
        left[i] = max(left[i - 1], height[i])
    right[n - 1] = height[n - 1]
    for i in range(n - 2, -1, -1):
        right[i] = max(right[i + 1], height[i])
    return sum(min(left[i], right[i]) - height[i] for i in range(n))`,
    java: `public int trap(int[] height) {
    int n = height.length;
    if (n == 0) return 0;
    int[] left = new int[n];
    int[] right = new int[n];
    left[0] = height[0];
    for (int i = 1; i < n; i++) left[i] = Math.max(left[i - 1], height[i]);
    right[n - 1] = height[n - 1];
    for (int i = n - 2; i >= 0; i--) right[i] = Math.max(right[i + 1], height[i]);
    int total = 0;
    for (int i = 0; i < n; i++) total += Math.min(left[i], right[i]) - height[i];
    return total;
}`,
    cpp: `int trap(const vector<int>& height) {
    int n = (int)height.size();
    if (n == 0) return 0;
    vector<int> left(n), right(n);
    left[0] = height[0];
    for (int i = 1; i < n; i++) left[i] = max(left[i - 1], height[i]);
    right[n - 1] = height[n - 1];
    for (int i = n - 2; i >= 0; i--) right[i] = max(right[i + 1], height[i]);
    int total = 0;
    for (int i = 0; i < n; i++) total += min(left[i], right[i]) - height[i];
    return total;
}`,
  },
]

// HOW THE TARGET BOUND WAS COUNTED. Each rung carries its own.
export const costWhy =
  "One pass, two pointers, O(n) time and O(1) space \u2014 and the space is what separates this rung from the one below it, which is also linear in time. Each iteration moves exactly one pointer inward, so the loop runs at most n times, doing a comparison, a maximum update and one subtraction. The reason no array of maxima is needed: the pointer on the SHORTER side is the one whose water is already determined, because the taller side guarantees a wall at least that high somewhere beyond it. So the two running maxima — a [[two pointers|two-pointer]] sweep — carry everything the three-pass version stored, in two variables instead of two arrays of length n."
