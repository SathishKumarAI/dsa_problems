// sort-colors — the ladder: every way in, worst first.
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

export const approach = "Hold three indices and one promise: everything left of `low` is 0, everything right of `high` is 2, and everything between `low` and `mid` is 1. Read `nums[mid]`. A 0 is swapped down to `low` and both advance. A 1 is already where it belongs, so only `mid` advances. A 2 is swapped up to `high`, which then retreats — and `mid` stays put, because the value swapped in from the back has never been examined. When `mid` passes `high` every element has been placed."

export const whyNow = "Counting each colour and rewriting the array is already linear, but it reads every element twice and overwrites values rather than moving them — which the in-place requirement is really asking you to avoid. Three pointers do it in one pass, and the invariant they maintain is the reason it works rather than a trick."

export const arc = "Counting and rewriting is two passes and completely fine; the reason the one-pass version is famous is the invariant, not the speed. Three regions — settled zeros, settled ones, settled twos — grow from the two ends and the middle, and the loop maintains 'everything before low is 0, everything after high is 2, everything between low and current is 1'. The subtle rule is that a swap with the HIGH side brings in an unexamined value, so the cursor must not advance, while a swap with the low side brings in something already seen. Getting that asymmetry right is the whole exercise, and the Dutch-national-flag partition it teaches is the same routine that makes quicksort robust against many equal keys."

export const complexity = { time: "O(n)", space: "O(1)" }

export const python = `def sort_colors(nums: list[int]) -> list[int]:
    low, mid, high = 0, 0, len(nums) - 1
    while mid <= high:
        if nums[mid] == 0:
            nums[low], nums[mid] = nums[mid], nums[low]
            low += 1
            mid += 1
        elif nums[mid] == 2:
            nums[mid], nums[high] = nums[high], nums[mid]
            high -= 1
        else:
            mid += 1
    return nums`

export const java = `public int[] sortColors(int[] nums) {
    int low = 0, mid = 0, high = nums.length - 1;
    while (mid <= high) {
        if (nums[mid] == 0) {
            int t = nums[low];
            nums[low] = nums[mid];
            nums[mid] = t;
            low++;
            mid++;
        } else if (nums[mid] == 2) {
            int t = nums[mid];
            nums[mid] = nums[high];
            nums[high] = t;
            high--;
        } else {
            mid++;
        }
    }
    return nums;
}`

export const cpp = `vector<int> sortColors(vector<int> nums) {
    int low = 0, mid = 0, high = (int)nums.size() - 1;
    while (mid <= high) {
        if (nums[mid] == 0) {
            swap(nums[low], nums[mid]);
            low++;
            mid++;
        } else if (nums[mid] == 2) {
            swap(nums[mid], nums[high]);
            high--;
        } else {
            mid++;
        }
    }
    return nums;
}`

export const alternatives: Solution[] = [
  {
    name: "Count, then rewrite",
    summary:
      "Count the 0s, 1s and 2s, then overwrite the array with that many of each. Two passes and constant memory, and it is the honest baseline — but it reads the whole array before writing anything, so it cannot run on a stream, and the follow-up asks for one pass for exactly that reason.",
    complexity: { time: "O(n)", space: "O(1)" },
    python: `def sort_colors(nums: list[int]) -> list[int]:
    counts = [0, 0, 0]
    for x in nums:
        counts[x] += 1
    at = 0
    for value in range(3):
        for _ in range(counts[value]):
            nums[at] = value
            at += 1
    return nums`,
    java: `public int[] sortColors(int[] nums) {
    int[] counts = new int[3];
    for (int x : nums) counts[x]++;
    int at = 0;
    for (int value = 0; value < 3; value++) {
        for (int i = 0; i < counts[value]; i++) {
            nums[at] = value;
            at++;
        }
    }
    return nums;
}`,
    cpp: `vector<int> sortColors(vector<int> nums) {
    vector<int> counts(3, 0);
    for (int x : nums) counts[x]++;
    int at = 0;
    for (int value = 0; value < 3; value++) {
        for (int i = 0; i < counts[value]; i++) {
            nums[at] = value;
            at++;
        }
    }
    return nums;
}`,
  },
]
