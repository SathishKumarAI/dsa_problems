import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "first-last-position",
  title: "First and Last Position of a Value",
  pattern: "binary-search",
  difficulty: "medium",
  leetcode: "find-first-and-last-position-of-element-in-sorted-array",
  brief: "Both ends of a run of equal values, in log time.",
  statement:
    "Given a sorted array that may contain duplicates and a target value, return the first and last index at which the target appears, or [-1, -1] if it is absent.",
  constraints: [
    "0 <= nums.length <= 10^5, sorted non-decreasing",
    "-10^9 <= nums[i], target <= 10^9",
    "duplicates are the point — the target may occupy a long run",
    "an empty array, and a target that is absent, both answer [-1, -1] rather than failing",
  ],
  examples: [
    { input: "nums = [5, 7, 7, 8, 8, 10], target = 8", output: "[3, 4]" },
    {
      input: "nums = [5, 7, 7, 8, 8, 10], target = 6",
      output: "[-1, -1]",
      note: "6 would slot between 5 and 7, but it is not there.",
    },
  ],
  hints: [
    "Finding ANY occurrence is ordinary binary search. Finding the first one is a different question.",
    "When you land on the target, do not stop. Record the position and keep searching the side that could hold an earlier one.",
    "Run that twice — once biased left, once biased right — and you have both ends.",
  ],
  whyNow:
    "Finding one occurrence and then walking outward is logarithmic plus linear, and the linear part dominates whenever the run is long — an array that is entirely the target degrades to a full scan. Biasing the search itself keeps both halves logarithmic, because the walk outward is replaced by more halving.",
  arc: "Two searches, not one, and the insight is to stop searching for the VALUE and start searching for a boundary: the first index whose value is at least the target, and the first whose value is greater. Those are lower and upper bound, they are the same loop with one comparison changed, and together they give the run and its length. Learning them as primitives pays off far beyond this problem — counting occurrences, insert positions, and most 'range of equal values' questions reduce to a pair of bounds. The rung that finds one occurrence then walks outward is the trap worth seeing: it is logarithmic plus the run length, which is linear when the array is all one value.",
  approach:
    "Run binary search twice with one change: on a hit, record the index and then keep going in a chosen direction rather than returning. Biased left, the search continues into the left half after a hit, so the last thing recorded is the earliest occurrence; biased right it continues into the right half and records the latest. Both searches still halve the range every step, so a run of a million equal values costs the same as a run of one. The absent case falls out for free — nothing was ever recorded, so the answer stays −1.",
  complexity: { time: "O(log n)", space: "O(1)" },
  python: `def bound(nums: list[int], target: int, first: bool) -> int:
    lo, hi = 0, len(nums) - 1
    found = -1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            found = mid
            if first:
                hi = mid - 1
            else:
                lo = mid + 1
        elif nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return found


def search_range(nums: list[int], target: int) -> list[int]:
    return [bound(nums, target, True), bound(nums, target, False)]`,
  java: `public int bound(int[] nums, int target, boolean first) {
    int lo = 0, hi = nums.length - 1, found = -1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) {
            found = mid;
            if (first) hi = mid - 1;
            else lo = mid + 1;
        } else if (nums[mid] < target) {
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    return found;
}

public int[] searchRange(int[] nums, int target) {
    return new int[] {bound(nums, target, true), bound(nums, target, false)};
}`,
  cpp: `int bound(const vector<int>& nums, int target, bool first) {
    int lo = 0, hi = (int)nums.size() - 1, found = -1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) {
            found = mid;
            if (first) hi = mid - 1;
            else lo = mid + 1;
        } else if (nums[mid] < target) {
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    return found;
}

vector<int> searchRange(const vector<int>& nums, int target) {
    return {bound(nums, target, true), bound(nums, target, false)};
}`,
  alternatives: [
    {
      name: "Scan both ends",
      summary:
        "Walk from the front for the first occurrence and from the back for the last, comparing each value to the target.",
      complexity: { time: "O(n)", space: "O(1)" },
      python: `def search_range(nums: list[int], target: int) -> list[int]:
    first = -1
    last = -1
    for i in range(len(nums)):
        if nums[i] == target:
            first = i
            break
    for i in range(len(nums) - 1, -1, -1):
        if nums[i] == target:
            last = i
            break
    return [first, last]`,
      java: `public int[] searchRange(int[] nums, int target) {
    int first = -1, last = -1;
    for (int i = 0; i < nums.length; i++) {
        if (nums[i] == target) {
            first = i;
            break;
        }
    }
    for (int i = nums.length - 1; i >= 0; i--) {
        if (nums[i] == target) {
            last = i;
            break;
        }
    }
    return new int[] {first, last};
}`,
      cpp: `vector<int> searchRange(const vector<int>& nums, int target) {
    int first = -1, last = -1;
    for (int i = 0; i < (int)nums.size(); i++) {
        if (nums[i] == target) {
            first = i;
            break;
        }
    }
    for (int i = (int)nums.size() - 1; i >= 0; i--) {
        if (nums[i] == target) {
            last = i;
            break;
        }
    }
    return {first, last};
}`,
    },
    {
      name: "Find one, then walk outward",
      summary:
        "Binary search for any occurrence, then step left and right from it while the neighbours still equal the target.",
      whyNow:
        "The scan ignores the ordering entirely. Binary search finds a foothold in log n — but the walk outward is still linear in the length of the run, so an array that is all target costs a full pass.",
      complexity: { time: "O(log n + run)", space: "O(1)" },
      python: `def search_range(nums: list[int], target: int) -> list[int]:
    lo, hi = 0, len(nums) - 1
    at = -1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            at = mid
            break
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    if at < 0:
        return [-1, -1]
    first = at
    while first > 0 and nums[first - 1] == target:
        first -= 1
    last = at
    while last + 1 < len(nums) and nums[last + 1] == target:
        last += 1
    return [first, last]`,
      java: `public int[] searchRange(int[] nums, int target) {
    int lo = 0, hi = nums.length - 1, at = -1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) {
            at = mid;
            break;
        }
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    if (at < 0) return new int[] {-1, -1};
    int first = at;
    while (first > 0 && nums[first - 1] == target) first--;
    int last = at;
    while (last + 1 < nums.length && nums[last + 1] == target) last++;
    return new int[] {first, last};
}`,
      cpp: `vector<int> searchRange(const vector<int>& nums, int target) {
    int lo = 0, hi = (int)nums.size() - 1, at = -1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) {
            at = mid;
            break;
        }
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    if (at < 0) return {-1, -1};
    int first = at;
    while (first > 0 && nums[first - 1] == target) first--;
    int last = at;
    while (last + 1 < (int)nums.size() && nums[last + 1] == target) last++;
    return {first, last};
}`,
    },
  ],
}
