// classic-binary-search — the ladder: every way in, worst first.
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

export const approach = "Maintain an inclusive search range [lo, hi] that must contain the target if it exists. Probe the midpoint: equal means done; smaller means the answer lives strictly right of mid; larger means strictly left. Each probe halves the range, giving the logarithmic bound."

export const whyNow = "Recursion pays a stack frame per halving and buys nothing. The same loop written iteratively is constant space, and it is the version to write under pressure."

export const arc = "The base case of a whole pattern, and worth writing until the boundaries are automatic: while low is at most high, probe the middle, and move the side that cannot contain the answer. Two habits prevent most bugs. Compute the midpoint as low plus half the gap rather than by adding the two ends, so nothing overflows in languages with fixed-width integers. And decide the loop's contract before typing — either 'low <= high' with mid plus or minus one, or 'low < high' converging on a single survivor — then keep it consistent, because mixing the two is how the off-by-one and the infinite loop both appear. Every later rung in this pattern is this loop with a different question at the probe."

export const complexity = { time: "O(log n)", space: "O(1)" }

export const python = `def binary_search(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`

export const java = `public int binarySearch(int[] nums, int target) {
    int lo = 0, hi = nums.length - 1;
    while (lo <= hi) {
        int mid = (lo + hi) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}`

export const cpp = `int binarySearch(const vector<int>& nums, int target) {
    int lo = 0, hi = (int)nums.size() - 1;
    while (lo <= hi) {
        int mid = (lo + hi) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}`

export const alternatives: Solution[] = [
  {
    key: "scan",
    name: "Linear scan",
    summary:
      "Look at every element until the target turns up. Correct, and immediately disqualified: the statement demands O(log n) and this is O(n). It earns its place by naming what the sortedness is FOR — a scan works on any array, which is exactly why it cannot exploit the one promise this input makes.",
    complexity: { time: "O(n)", space: "O(1)" },
    python: `def binary_search(nums: list[int], target: int) -> int:
    for i, x in enumerate(nums):
        if x == target:
            return i
    return -1`,
    java: `public int binarySearch(int[] nums, int target) {
    for (int i = 0; i < nums.length; i++) {
        if (nums[i] == target) return i;
    }
    return -1;
}
`,
    cpp: `int binarySearch(const vector<int>& nums, int target) {
    for (int i = 0; i < (int)nums.size(); i++) {
        if (nums[i] == target) return i;
    }
    return -1;
}
`,
  },
  {
    key: "recurse",
    name: "Recursive",
    summary:
      "The same halving, written as a function that calls itself on the surviving half. Identical comparisons and arguably the clearer statement of the invariant, but it spends a call frame per level — O(log n) stack against the loop's O(1) — for no gain the problem can see.",
    complexity: { time: "O(log n)", space: "O(log n) stack" },
    python: `def binary_search(nums: list[int], target: int) -> int:
    def go(lo: int, hi: int) -> int:
        if lo > hi:
            return -1
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            return go(mid + 1, hi)
        return go(lo, mid - 1)

    return go(0, len(nums) - 1)`,
    java: `public int binarySearch(int[] nums, int target) {
    return binarySearch(nums, target, 0, nums.length - 1);
}
private int binarySearch(int[] nums, int target, int lo, int hi) {
    if (lo > hi) return -1;
    int mid = (lo + hi) / 2;
    if (nums[mid] == target) return mid;
    if (nums[mid] < target) return binarySearch(nums, target, mid + 1, hi);
    return binarySearch(nums, target, lo, mid - 1);
}`,
    cpp: `int binarySearchHelper(const vector<int>& nums, int target, int lo, int hi) {
    if (lo > hi) return -1;
    int mid = (lo + hi) / 2;
    if (nums[mid] == target) return mid;
    if (nums[mid] < target) return binarySearchHelper(nums, target, mid + 1, hi);
    return binarySearchHelper(nums, target, lo, mid - 1);
}

int binarySearch(const vector<int>& nums, int target) {
    return binarySearchHelper(nums, target, 0, (int)nums.size() - 1);
}`,
  },
  // B79. The document teaches a SECOND CONTRACT and the page could not name
  // it. It is not faster — it is marginally slower, because it cannot return
  // early on a hit. What it fixes is a weakness in the reader: the inclusive
  // `lo <= hi` contract cannot express "the first index where a property
  // starts holding", and search-insert-position, first-last-position and
  // single-in-sorted are all that question wearing different clothes.
  {
    key: "converge",
    name: "Converge on the single survivor",
    whyNow:
      "The inclusive loop answers \"is it here?\" and stops the moment it is. That is the right shape for this question and the wrong shape for the four that follow it, which ask where a property BEGINS. A converging range answers that instead: it never discards a candidate that might be the answer, and stops when exactly one is left.",
    summary:
      "Shrink `[lo, hi]` while `lo < hi`, moving `lo` past a midpoint that is provably too small and moving `hi` TO a midpoint that might itself be the answer. The loop ends with one candidate and the check happens once, afterwards. Slightly slower than the inclusive version because an early hit cannot return — and the contract you want for every \"leftmost index satisfying P\" question, which is most of the rest of this pattern.",
    complexity: { time: "O(log n)", space: "O(1)" },
    python: `def binary_search(nums: list[int], target: int) -> int:
    if not nums:
        return -1
    lo, hi = 0, len(nums) - 1
    while lo < hi:  # converging range: stop with exactly one candidate left
        mid = lo + (hi - lo) // 2
        if nums[mid] < target:
            lo = mid + 1  # mid is provably too small, skip it
        else:
            hi = mid  # mid might BE the answer, so keep it
    return lo if nums[lo] == target else -1`,
    java: `public int binarySearch(int[] nums, int target) {
    if (nums.length == 0) return -1;
    int lo = 0, hi = nums.length - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid;
    }
    return nums[lo] == target ? lo : -1;
}`,
    cpp: `int binarySearch(const vector<int>& nums, int target) {
    if (nums.empty()) return -1;
    int lo = 0, hi = (int)nums.size() - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid;
    }
    return nums[lo] == target ? lo : -1;
}`,
  },
]
