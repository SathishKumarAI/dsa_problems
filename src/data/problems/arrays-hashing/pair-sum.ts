import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "pair-sum",
  title: "Pair With Target Sum",
  pattern: "arrays-hashing",
  difficulty: "easy",
  leetcode: "two-sum",
  brief: "Find two indices whose values add up to a target.",
  statement:
    "Given an integer array nums and an integer target, return the indices of two distinct elements whose sum equals target. Assume exactly one such pair exists.",
  constraints: [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "-10^9 <= target <= 10^9",
    "exactly one valid pair exists, and an element may not be paired with itself",
  ],
  examples: [
    {
      input: "nums = [3, 6, 1, 5], target = 8",
      output: "[0, 3]",
      note: "3 + 5 = 8, at indices 0 and 3.",
    },
    { input: "nums = [2, 2], target = 4", output: "[0, 1]" },
  ],
  hints: [
    "Brute force checks every pair — O(n²). What single question do you ask when standing on nums[i]?",
    'The question is: "have I already seen target - nums[i]?" A hash map answers that in O(1).',
    "Store value → index as you scan. Check for the complement before inserting the current value, so you never pair an element with itself.",
  ],
  arc: "Every step follows one idea applied twice: do not redo work you do not need to. Brute force re-scans the array for every element, so you reorder it to make the scan directional — sort, then converge two pointers — and the cost drops to the sort. Then you notice the sort itself is wasted, because the question never needed order, only 'have I seen this value before', which a hash map answers in one step without touching order at all. That is the whole progression: unordered scan, imposed order, remembered values. Know brute force, the one-pass hash map and the sort-plus-two-pointer shape cold — those three cover most pair and sum follow-ups, and the two-pointer version is the one that survives when the array arrives already sorted.",
  whyNow:
    "The sort exists only to make searching fast, and the question is not a comparison at all: it is whether the value target - x is present, and where. That is a lookup, which a map answers in one step with no ordering. Sorting also destroys the indices the answer is made of, so they have to be carried along separately.",
  approach:
    "Walk the array once, keeping a map from value to index. At each element, compute the complement target - nums[i]. If the complement is already in the map, the current index and the stored index are the answer. Otherwise record the current value and move on. One pass, one lookup and one insert per element.",
  complexity: { time: "O(n)", space: "O(n)" },
  python: `def pair_sum(nums: list[int], target: int) -> list[int]:
    seen: dict[int, int] = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i
    return []`,
  java: `public int[] pairSum(int[] nums, int target) {
    Map<Integer, Integer> seen = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int need = target - nums[i];
        if (seen.containsKey(need)) return new int[]{seen.get(need), i};
        seen.put(nums[i], i);
    }
    return new int[0];
}`,
  cpp: `vector<int> pairSum(const vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < (int)nums.size(); i++) {
        auto it = seen.find(target - nums[i]);
        if (it != seen.end()) return {it->second, i};
        seen[nums[i]] = i;
    }
    return {};
}`,
  alternatives: [
    {
      name: "Brute force",
      summary:
        "Check every pair until one sums to the target. No memory, nothing to get wrong, and the right thing to say first in an interview — but it re-reads the whole array for every element, asking a question it has already asked n times. On the 10^4 upper bound that is fifty million pairs to find one.",
      complexity: { time: "O(n²)", space: "O(1)" },
      python: `def pair_sum(nums: list[int], target: int) -> list[int]:
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
      java: `public int[] pairSum(int[] nums, int target) {
    for (int i = 0; i < nums.length; i++)
        for (int j = i + 1; j < nums.length; j++)
            if (nums[i] + nums[j] == target) return new int[]{i, j};
    return new int[0];
}`,
      cpp: `vector<int> pairSum(const vector<int>& nums, int target) {
    int n = nums.size();
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if (nums[i] + nums[j] == target) return {i, j};
    return {};
}`,
    },
    {
      name: "Sort + two pointers",
      whyNow:
        "Brute force re-reads the whole array for every element, asking the same question n times. Sorting answers it once: on ordered values, comparing the two ends tells you which end can never reach the target, so a single comparison retires a whole row of the table.",
      summary:
        "Sort (value, index) pairs and run the converging-pointer scan. Beats brute force, but sorting costs the O(n log n) and the original indices must be carried along — the hash map wins on both counts.",
      complexity: { time: "O(n log n)", space: "O(n)" },
      python: `def pair_sum(nums: list[int], target: int) -> list[int]:
    order = sorted(range(len(nums)), key=lambda k: nums[k])
    i, j = 0, len(nums) - 1
    while i < j:
        s = nums[order[i]] + nums[order[j]]
        if s == target:
            return sorted([order[i], order[j]])
        if s < target:
            i += 1
        else:
            j -= 1
    return []`,
      java: `public int[] pairSum(int[] nums, int target) {
    Integer[] order = new Integer[nums.length];
    for (int k = 0; k < nums.length; k++) order[k] = k;
    Arrays.sort(order, (a, b) -> Integer.compare(nums[a], nums[b]));
    int i = 0, j = nums.length - 1;
    while (i < j) {
        int s = nums[order[i]] + nums[order[j]];
        if (s == target) {
            int[] ans = {order[i], order[j]};
            Arrays.sort(ans);
            return ans;
        }
        if (s < target) i++; else j--;
    }
    return new int[0];
}`,
      cpp: `vector<int> pairSum(const vector<int>& nums, int target) {
    int n = nums.size();
    vector<int> order(n);
    iota(order.begin(), order.end(), 0);
    sort(order.begin(), order.end(), [&](int a, int b) { return nums[a] < nums[b]; });
    int i = 0, j = n - 1;
    while (i < j) {
        int s = nums[order[i]] + nums[order[j]];
        if (s == target) return {min(order[i], order[j]), max(order[i], order[j])};
        if (s < target) i++; else j--;
    }
    return {};
}`,
    },
  ],
}
