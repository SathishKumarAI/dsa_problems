// three-sum-closest — the ladder: every way in, worst first.
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

export const approach = "Sort first: that is what makes a direction meaningful. Fix the leftmost value, then put one pointer just after it and one at the far end, and read their sum. If it undershoots the target the only way up is to move the left pointer right, because everything to its left is smaller; if it overshoots, the right pointer must come in. Either way one index retires per step, so the pair scan is linear and the whole thing is quadratic. Track the best sum with a tie-break on the value itself — closest wins, and equal distances go to the smaller sum — so the answer never depends on the order the triples happened to be visited. A sum equal to the target has distance zero and cannot be improved on, so it is returned immediately."

export const whyNow = "The plain two-pointer sweep keeps grinding through every remaining pair even after it has found a sum equal to the target, and nothing can improve on a distance of zero. Returning the moment the target is hit costs one comparison per step and turns the common 'an exact triple exists' case from a full O(n^2) sweep into an early exit."

export const arc = "A variant that punishes pattern-matching. It looks like three-sum, and the two-pointer scan is indeed the right engine, but the STOPPING rule changes: there is no exact hit to skip past, so the pointers move by the sign of the difference and the best answer seen is tracked separately. The pruning rung is worth understanding because it shows where sorting pays a second time — once the array is sorted, the smallest and largest sums reachable from an anchor bound everything below it, so whole anchors can be skipped. Carry the habit of asking, for every optimisation problem, what the update rule for 'best so far' is and whether an exact answer can short-circuit it."

export const complexity = { time: "O(n^2)", space: "O(1)" }

export const python = `def three_sum_closest(nums: list[int], target: int) -> int:
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
    return best`

export const java = `public int threeSumClosest(int[] nums, int target) {
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
}`

export const cpp = `int threeSumClosest(vector<int> nums, int target) {
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
}`

export const alternatives: Solution[] = [
  {
    name: "Every triple",
    summary:
      "Three nested loops over all distinct index triples, keeping the sum nearest the target. Cubic on unsorted data, and it can neither stop early nor skip anything: without an order, no triple tells you a thing about the ones you have not tried.",
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
      "The same three loops on sorted values, abandoning the innermost once its sum passes the target. Often much faster and still cubic in the worst case — sorting has been paid for and is only being used to stop early, not to steer.",
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
      "Fix two values, work out the third that would hit the target exactly, and binary search the sorted tail for the nearest real one. A loop is gone, and the logarithm is the tell: it searches for a partner that a second pointer already knows where to find.",
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
      "Fix the first value and squeeze the rest between a low and a high pointer, moving whichever end the sum says is wrong. Quadratic with no logarithm and no extra memory — the search for a partner became a decision, because on sorted values the sum itself says which way to move.",
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
]
