import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "rotated-search",
  title: "Search a Rotated Sorted Array",
  pattern: "binary-search",
  difficulty: "medium",
  leetcode: "search-in-rotated-sorted-array",
  brief: "Binary search when the sorted array has been cut and swapped.",
  statement:
    "An ascending array of distinct values has been rotated at some unknown pivot, so [0,1,2,4,5,6,7] might arrive as [4,5,6,7,0,1,2]. Find the index of a target value, or −1 if it is absent, in logarithmic time.",
  constraints: [
    "1 <= nums.length <= 5000",
    "-10^4 <= nums[i], target <= 10^4, and all values are distinct",
    "the array is a rotation of a sorted array, possibly by zero — an un-rotated array is still valid input",
    "distinctness is what makes this solvable in log n: with duplicates the halves cannot always be told apart",
  ],
  examples: [
    { input: "nums = [4, 5, 6, 7, 0, 1, 2], target = 0", output: "4" },
    {
      input: "nums = [4, 5, 6, 7, 0, 1, 2], target = 3",
      output: "-1",
      note: "3 is in neither half's range.",
    },
  ],
  hints: [
    "Cut the array at the midpoint. One of the two halves is still in plain ascending order — always.",
    "Work out WHICH half is sorted by comparing the midpoint to an end. Then you can say, exactly, whether the target lies inside it.",
    "If the target is inside the sorted half, search there. Otherwise it can only be in the other one.",
  ],
  whyNow:
    "Finding the pivot first and then binary searching the right piece works and is also logarithmic, but it walks the array twice and needs the pivot search to be correct on its own. Deciding which half is sorted at every step folds both jobs into one loop: the same comparison that narrows the range also identifies the ordered side.",
  arc: "One probe, three questions: which half is sorted, is the target inside that sorted half, and therefore which half to discard. That is the entire algorithm, and writing it as those three lines is what keeps it from becoming a thicket of conditions. Comparing the middle against the LEFT end to identify the sorted half is the usual formulation, with equality needing care when the window is two elements wide. The version worth practising for interviews is the single pass, not the find-the-pivot-then-search one, because the follow-up is always duplicates — which break the 'which half is sorted' test and reintroduce a linear worst case.",
  approach:
    "Standard binary search, with one extra question at each step. Compare nums[mid] to nums[lo]: if it is at least as large, the left half is unrotated and therefore sorted; otherwise the right half is. Whichever half is sorted, you can test membership with two comparisons against its endpoints — and that test is decisive, because a sorted range contains a value exactly when the value lies between its ends. Recurse into that half if the target is inside it, and into the other half if not. The rotation never has to be located.",
  complexity: { time: "O(log n)", space: "O(1)" },
  python: `def search_rotated(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1`,
  java: `public int searchRotated(int[] nums, int target) {
    int lo = 0, hi = nums.length - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return mid;
        if (nums[lo] <= nums[mid]) {
            if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
            else lo = mid + 1;
        } else {
            if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
            else hi = mid - 1;
        }
    }
    return -1;
}`,
  cpp: `int searchRotated(const vector<int>& nums, int target) {
    int lo = 0, hi = (int)nums.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return mid;
        if (nums[lo] <= nums[mid]) {
            if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
            else lo = mid + 1;
        } else {
            if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
            else hi = mid - 1;
        }
    }
    return -1;
}`,
  alternatives: [
    {
      name: "Scan for it",
      summary:
        "Walk the array from the front comparing each value to the target, ignoring the order entirely.",
      complexity: { time: "O(n)", space: "O(1)" },
      python: `def search_rotated(nums: list[int], target: int) -> int:
    for i in range(len(nums)):
        if nums[i] == target:
            return i
    return -1`,
      java: `public int searchRotated(int[] nums, int target) {
    for (int i = 0; i < nums.length; i++) {
        if (nums[i] == target) return i;
    }
    return -1;
}`,
      cpp: `int searchRotated(const vector<int>& nums, int target) {
    for (int i = 0; i < (int)nums.size(); i++) {
        if (nums[i] == target) return i;
    }
    return -1;
}`,
    },
    {
      name: "Find the pivot, then search one side",
      summary:
        "Binary search for the rotation point, then run an ordinary binary search on whichever of the two sorted pieces could contain the target.",
      whyNow:
        "The scan ignores the structure completely. Locating the pivot recovers two genuinely sorted ranges and gets to log n — at the cost of two searches, and a pivot search that has to be right on its own before the second one means anything.",
      complexity: { time: "O(log n)", space: "O(1)" },
      python: `def search_rotated(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1
        else:
            hi = mid
    pivot = lo
    for start, end in ((0, pivot - 1), (pivot, len(nums) - 1)):
        a, b = start, end
        while a <= b:
            mid = (a + b) // 2
            if nums[mid] == target:
                return mid
            if nums[mid] < target:
                a = mid + 1
            else:
                b = mid - 1
    return -1`,
      java: `public int searchRotated(int[] nums, int target) {
    int lo = 0, hi = nums.length - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] > nums[hi]) lo = mid + 1;
        else hi = mid;
    }
    int pivot = lo;
    int[][] ranges = {{0, pivot - 1}, {pivot, nums.length - 1}};
    for (int[] range : ranges) {
        int a = range[0], b = range[1];
        while (a <= b) {
            int mid = a + (b - a) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) a = mid + 1;
            else b = mid - 1;
        }
    }
    return -1;
}`,
      cpp: `int searchRotated(const vector<int>& nums, int target) {
    int lo = 0, hi = (int)nums.size() - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] > nums[hi]) lo = mid + 1;
        else hi = mid;
    }
    int pivot = lo;
    vector<pair<int,int>> ranges = {{0, pivot - 1}, {pivot, (int)nums.size() - 1}};
    for (auto range : ranges) {
        int a = range.first, b = range.second;
        while (a <= b) {
            int mid = a + (b - a) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) a = mid + 1;
            else b = mid - 1;
        }
    }
    return -1;
}`,
    },
  ],
}
