import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "three-sum-closest",
  title: "The Triple Nearest the Target",
  pattern: "two-pointers",
  difficulty: "medium",
  leetcode: "3sum-closest",
  brief: "Three values whose sum lands as close to the target as possible.",
  statement:
    "Given an integer array and a target, pick three values at distinct positions and return their sum — choosing the triple whose sum sits closest to the target. You return the sum itself, not the triple.",
  constraints: [
    "3 <= nums.length <= 500, so there is always at least one triple and always an answer",
    "-1000 <= nums[i] <= 1000 and -10^4 <= target <= 10^4; a triple sum fits comfortably in a 32-bit int",
    "the three POSITIONS must be distinct, but the values may repeat — [0, 0, 0] is legal input and its only triple is the answer",
    "unlike 3Sum, duplicate values need no skipping: we want one number back, not a set of distinct triples, so seeing the same sum twice costs nothing but time",
    "when two different triples are equally close to the target we return the SMALLER sum. LeetCode promises the input has a unique answer; pinning the tie-break anyway is what lets five different implementations be compared against each other",
  ],
  examples: [
    {
      input: "nums = [-1, 2, 1, -4], target = 1",
      output: "2",
      note: "-1 + 2 + 1 = 2 misses by one; every other triple misses by more.",
    },
    {
      input: "nums = [-2, 0, 1, 3], target = 0",
      output: "-1",
      note: "-1 and 1 are both one away from 0. The tie-break sends it to the smaller sum — an implementation that keeps whichever it happened to see first will disagree depending on the order it scanned.",
    },
    {
      input: "nums = [1, 1, 1, 0], target = -100",
      output: "2",
      note: "The target is below every possible sum, so the answer is simply the smallest triple and no pointer ever gets to bracket anything.",
    },
  ],
  hints: [
    "Every triple is a candidate. The only real question is how many of them you can avoid looking at.",
    "Sorting tells you which direction helps: if the current sum is under the target, the only way to raise it is to reach for a bigger value.",
    "Fix the first value and put two pointers on the rest. Each step either raises the sum or lowers it and retires one index, so a whole inner scan finishes in linear time — and a sum that lands exactly on the target cannot be beaten, so you can stop there.",
  ],
  whyNow:
    "The plain two-pointer sweep keeps grinding through every remaining pair even after it has found a sum equal to the target, and nothing can improve on a distance of zero. Returning the moment the target is hit costs one comparison per step and turns the common 'an exact triple exists' case from a full O(n^2) sweep into an early exit.",
  approach:
    "Sort first: that is what makes a direction meaningful. Fix the leftmost value, then put one pointer just after it and one at the far end, and read their sum. If it undershoots the target the only way up is to move the left pointer right, because everything to its left is smaller; if it overshoots, the right pointer must come in. Either way one index retires per step, so the pair scan is linear and the whole thing is quadratic. Track the best sum with a tie-break on the value itself — closest wins, and equal distances go to the smaller sum — so the answer never depends on the order the triples happened to be visited. A sum equal to the target has distance zero and cannot be improved on, so it is returned immediately.",
  complexity: { time: "O(n^2)", space: "O(1)" },
  python: `def three_sum_closest(nums: list[int], target: int) -> int:
    nums = sorted(nums)
    n = len(nums)
    best = nums[0] + nums[1] + nums[2]
    for i in range(n - 2):
        lo, hi = i + 1, n - 1
        while lo < hi:
            s = nums[i] + nums[lo] + nums[hi]
            d, bd = abs(s - target), abs(best - target)
            if d < bd or (d == bd and s < best):
                best = s
            if s == target:
                return target
            if s < target:
                lo += 1
            else:
                hi -= 1
    return best`,
  java: `public int threeSumClosest(int[] nums, int target) {
    Arrays.sort(nums);
    int n = nums.length;
    int best = nums[0] + nums[1] + nums[2];
    for (int i = 0; i < n - 2; i++) {
        int lo = i + 1, hi = n - 1;
        while (lo < hi) {
            int s = nums[i] + nums[lo] + nums[hi];
            int d = Math.abs(s - target), bd = Math.abs(best - target);
            if (d < bd || (d == bd && s < best)) best = s;
            if (s == target) return target;
            if (s < target) lo++;
            else hi--;
        }
    }
    return best;
}`,
  cpp: `int threeSumClosest(vector<int> nums, int target) {
    sort(nums.begin(), nums.end());
    int n = (int)nums.size();
    int best = nums[0] + nums[1] + nums[2];
    for (int i = 0; i < n - 2; i++) {
        int lo = i + 1, hi = n - 1;
        while (lo < hi) {
            int s = nums[i] + nums[lo] + nums[hi];
            int d = s - target < 0 ? target - s : s - target;
            int bd = best - target < 0 ? target - best : best - target;
            if (d < bd || (d == bd && s < best)) best = s;
            if (s == target) return target;
            if (s < target) lo++;
            else hi--;
        }
    }
    return best;
}`,
  walkthrough: [
    {
      cells: {
        values: [-4, -1, 1, 2],
        marks: { 0: "focus", 1: "compare", 3: "compare" },
        labels: { 0: "i", 1: "lo", 3: "hi" },
      },
      caption:
        "target = 1. Sorted, the array is [-4,-1,1,2]. Fix i on -4: the pair sum is -1 + 2, so the triple is -3 — four below the target.",
    },
    {
      cells: {
        values: [-4, -1, 1, 2],
        marks: { 0: "focus", 2: "compare", 3: "compare" },
        labels: { 0: "i", 2: "lo", 3: "hi" },
      },
      caption:
        "-3 undershoots, so lo moves up: only a larger value can help. The triple is now -1, still short but closer. Best so far: -1.",
    },
    {
      cells: {
        values: [-4, -1, 1, 2],
        marks: { 0: "done", 1: "focus", 2: "compare", 3: "compare" },
        labels: { 1: "i", 2: "lo", 3: "hi" },
      },
      caption:
        "lo and hi have met, so -4 is retired without ever looking at its remaining pairs. i moves to -1.",
    },
    {
      cells: {
        values: [-4, -1, 1, 2],
        marks: { 0: "done", 1: "done", 2: "done", 3: "done" },
        labels: { 1: "i" },
      },
      caption:
        "-1 + 1 + 2 = 2, one above the target and one away — closer than -1, so best becomes 2. Nothing left to try, and 2 is the answer.",
    },
  ],
  alternatives: [
    {
      name: "Every triple",
      summary:
        "Three nested loops over all distinct index triples, keeping whichever sum has landed closest to the target so far.",
      complexity: { time: "O(n^3)", space: "O(1)" },
      python: `def three_sum_closest(nums: list[int], target: int) -> int:
    n = len(nums)
    best = nums[0] + nums[1] + nums[2]
    for i in range(n - 2):
        for j in range(i + 1, n - 1):
            for k in range(j + 1, n):
                s = nums[i] + nums[j] + nums[k]
                d, bd = abs(s - target), abs(best - target)
                if d < bd or (d == bd and s < best):
                    best = s
    return best`,
      java: `public int threeSumClosest(int[] nums, int target) {
    int n = nums.length;
    int best = nums[0] + nums[1] + nums[2];
    for (int i = 0; i < n - 2; i++) {
        for (int j = i + 1; j < n - 1; j++) {
            for (int k = j + 1; k < n; k++) {
                int s = nums[i] + nums[j] + nums[k];
                int d = Math.abs(s - target), bd = Math.abs(best - target);
                if (d < bd || (d == bd && s < best)) best = s;
            }
        }
    }
    return best;
}`,
      cpp: `int threeSumClosest(vector<int> nums, int target) {
    int n = (int)nums.size();
    int best = nums[0] + nums[1] + nums[2];
    for (int i = 0; i < n - 2; i++) {
        for (int j = i + 1; j < n - 1; j++) {
            for (int k = j + 1; k < n; k++) {
                int s = nums[i] + nums[j] + nums[k];
                int d = s - target < 0 ? target - s : s - target;
                int bd = best - target < 0 ? target - best : best - target;
                if (d < bd || (d == bd && s < best)) best = s;
            }
        }
    }
    return best;
}`,
    },
    {
      name: "Sort, then prune",
      summary:
        "Same three loops, but on sorted values — once the innermost sum reaches the target, every later k only overshoots further, so the scan can stop.",
      complexity: { time: "O(n^3) worst case", space: "O(1)" },
      whyNow:
        "The blind triple loop cannot tell a hopeless candidate from a promising one, because unsorted values give no direction: after seeing a sum way above the target it still has to check the rest. Sorting makes the innermost loop monotone, so the first sum that reaches the target is the last one worth looking at for that pair.",
      python: `def three_sum_closest(nums: list[int], target: int) -> int:
    nums = sorted(nums)
    n = len(nums)
    best = nums[0] + nums[1] + nums[2]
    for i in range(n - 2):
        for j in range(i + 1, n - 1):
            for k in range(j + 1, n):
                s = nums[i] + nums[j] + nums[k]
                d, bd = abs(s - target), abs(best - target)
                if d < bd or (d == bd and s < best):
                    best = s
                if s >= target:
                    break
    return best`,
      java: `public int threeSumClosest(int[] nums, int target) {
    Arrays.sort(nums);
    int n = nums.length;
    int best = nums[0] + nums[1] + nums[2];
    for (int i = 0; i < n - 2; i++) {
        for (int j = i + 1; j < n - 1; j++) {
            for (int k = j + 1; k < n; k++) {
                int s = nums[i] + nums[j] + nums[k];
                int d = Math.abs(s - target), bd = Math.abs(best - target);
                if (d < bd || (d == bd && s < best)) best = s;
                if (s >= target) break;
            }
        }
    }
    return best;
}`,
      cpp: `int threeSumClosest(vector<int> nums, int target) {
    sort(nums.begin(), nums.end());
    int n = (int)nums.size();
    int best = nums[0] + nums[1] + nums[2];
    for (int i = 0; i < n - 2; i++) {
        for (int j = i + 1; j < n - 1; j++) {
            for (int k = j + 1; k < n; k++) {
                int s = nums[i] + nums[j] + nums[k];
                int d = s - target < 0 ? target - s : s - target;
                int bd = best - target < 0 ? target - best : best - target;
                if (d < bd || (d == bd && s < best)) best = s;
                if (s >= target) break;
            }
        }
    }
    return best;
}`,
    },
    {
      name: "Binary search the third",
      summary:
        "Fix the first two values, work out the third that would hit the target exactly, and binary search the sorted tail for the neighbours on either side of it.",
      complexity: { time: "O(n^2 log n)", space: "O(1)" },
      whyNow:
        "Pruning only helps when the target sits early in the run; a target above everything makes the inner loop scan to the end every time, and it is still O(n^3). The sorted tail can be searched instead of walked: the ideal third value is arithmetic, and the two entries straddling it are the only candidates worth testing.",
      python: `def three_sum_closest(nums: list[int], target: int) -> int:
    nums = sorted(nums)
    n = len(nums)
    best = nums[0] + nums[1] + nums[2]
    for i in range(n - 2):
        for j in range(i + 1, n - 1):
            want = target - nums[i] - nums[j]
            lo, hi = j + 1, n
            while lo < hi:
                mid = (lo + hi) // 2
                if nums[mid] < want:
                    lo = mid + 1
                else:
                    hi = mid
            for k in (lo - 1, lo):
                if j < k < n:
                    s = nums[i] + nums[j] + nums[k]
                    d, bd = abs(s - target), abs(best - target)
                    if d < bd or (d == bd and s < best):
                        best = s
    return best`,
      java: `public int threeSumClosest(int[] nums, int target) {
    Arrays.sort(nums);
    int n = nums.length;
    int best = nums[0] + nums[1] + nums[2];
    for (int i = 0; i < n - 2; i++) {
        for (int j = i + 1; j < n - 1; j++) {
            int want = target - nums[i] - nums[j];
            int lo = j + 1, hi = n;
            while (lo < hi) {
                int mid = (lo + hi) / 2;
                if (nums[mid] < want) lo = mid + 1;
                else hi = mid;
            }
            for (int k = lo - 1; k <= lo; k++) {
                if (k <= j || k >= n) continue;
                int s = nums[i] + nums[j] + nums[k];
                int d = Math.abs(s - target), bd = Math.abs(best - target);
                if (d < bd || (d == bd && s < best)) best = s;
            }
        }
    }
    return best;
}`,
      cpp: `int threeSumClosest(vector<int> nums, int target) {
    sort(nums.begin(), nums.end());
    int n = (int)nums.size();
    int best = nums[0] + nums[1] + nums[2];
    for (int i = 0; i < n - 2; i++) {
        for (int j = i + 1; j < n - 1; j++) {
            int want = target - nums[i] - nums[j];
            int lo = j + 1, hi = n;
            while (lo < hi) {
                int mid = (lo + hi) / 2;
                if (nums[mid] < want) lo = mid + 1;
                else hi = mid;
            }
            for (int k = lo - 1; k <= lo; k++) {
                if (k <= j || k >= n) continue;
                int s = nums[i] + nums[j] + nums[k];
                int d = s - target < 0 ? target - s : s - target;
                int bd = best - target < 0 ? target - best : best - target;
                if (d < bd || (d == bd && s < best)) best = s;
            }
        }
    }
    return best;
}`,
    },
    {
      name: "Two pointers",
      summary:
        "Fix the first value and squeeze the rest between a low and a high pointer, moving whichever end the sum says is wrong.",
      complexity: { time: "O(n^2)", space: "O(1)" },
      whyNow:
        "The binary search restarts from scratch for every pair, throwing away everything the previous search learned about where the tail sits relative to the target. A pointer that only ever moves inward keeps that knowledge: one comparison retires one index for good, which replaces the log n search with a single step.",
      python: `def three_sum_closest(nums: list[int], target: int) -> int:
    nums = sorted(nums)
    n = len(nums)
    best = nums[0] + nums[1] + nums[2]
    for i in range(n - 2):
        lo, hi = i + 1, n - 1
        while lo < hi:
            s = nums[i] + nums[lo] + nums[hi]
            d, bd = abs(s - target), abs(best - target)
            if d < bd or (d == bd and s < best):
                best = s
            if s < target:
                lo += 1
            else:
                hi -= 1
    return best`,
      java: `public int threeSumClosest(int[] nums, int target) {
    Arrays.sort(nums);
    int n = nums.length;
    int best = nums[0] + nums[1] + nums[2];
    for (int i = 0; i < n - 2; i++) {
        int lo = i + 1, hi = n - 1;
        while (lo < hi) {
            int s = nums[i] + nums[lo] + nums[hi];
            int d = Math.abs(s - target), bd = Math.abs(best - target);
            if (d < bd || (d == bd && s < best)) best = s;
            if (s < target) lo++;
            else hi--;
        }
    }
    return best;
}`,
      cpp: `int threeSumClosest(vector<int> nums, int target) {
    sort(nums.begin(), nums.end());
    int n = (int)nums.size();
    int best = nums[0] + nums[1] + nums[2];
    for (int i = 0; i < n - 2; i++) {
        int lo = i + 1, hi = n - 1;
        while (lo < hi) {
            int s = nums[i] + nums[lo] + nums[hi];
            int d = s - target < 0 ? target - s : s - target;
            int bd = best - target < 0 ? target - best : best - target;
            if (d < bd || (d == bd && s < best)) best = s;
            if (s < target) lo++;
            else hi--;
        }
    }
    return best;
}`,
    },
  ],
}
