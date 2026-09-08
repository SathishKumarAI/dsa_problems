import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "contains-duplicate",
  title: "Any Repeat in the Array?",
  pattern: "arrays-hashing",
  difficulty: "easy",
  leetcode: "contains-duplicate",
  brief: "True if any value appears at least twice.",
  statement:
    "Given an integer array, return true if any value appears at least twice, and false if every element is distinct.",
  constraints: [
    "1 <= nums.length <= 10^5",
    "-10^9 <= nums[i] <= 10^9",
    "a single element cannot repeat, so a one-element array is always false",
    "values are unbounded in range but bounded in count — there is no room to index by value",
  ],
  examples: [
    { input: "nums = [1, 2, 3, 1]", output: "true", note: "1 appears twice." },
    { input: "nums = [1, 2, 3, 4]", output: "false", note: "All distinct." },
  ],
  hints: [
    "You do not need to know WHICH value repeats, or how often — only whether one does.",
    "Walk once and remember what you have already seen. What structure answers 'have I seen this?' in constant time?",
    "The moment a value is already in the set, you can return — there is nothing left to learn.",
  ],
  whyNow:
    "Sorting pays O(n log n) to put duplicates next to each other, but adjacency was never the question. A set answers 'seen before?' directly, and the early return means a duplicate near the front costs almost nothing.",
  approach:
    "Walk the array once carrying a set of the values seen so far. Before adding a value, ask whether it is already there; if it is, the answer is true and the rest of the array is irrelevant. If the walk finishes, every value was distinct. The set costs O(n) memory, which is the price of not having to sort.",
  complexity: { time: "O(n)", space: "O(n)" },
  python: `def contains_duplicate(nums: list[int]) -> bool:
    seen = set()
    for x in nums:
        if x in seen:
            return True
        seen.add(x)
    return False`,
  java: `public boolean containsDuplicate(int[] nums) {
    Set<Integer> seen = new HashSet<>();
    for (int x : nums) {
        if (!seen.add(x)) return true;
    }
    return false;
}`,
  cpp: `bool containsDuplicate(const vector<int>& nums) {
    unordered_set<int> seen;
    for (int x : nums) {
        if (seen.count(x)) return true;
        seen.insert(x);
    }
    return false;
}`,
  alternatives: [
    {
      name: "Brute force",
      summary:
        "Compare every pair of positions and return true the first time two of them hold the same value.",
      complexity: { time: "O(n²)", space: "O(1)" },
      python: `def contains_duplicate(nums: list[int]) -> bool:
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] == nums[j]:
                return True
    return False`,
      java: `public boolean containsDuplicate(int[] nums) {
    for (int i = 0; i < nums.length; i++) {
        for (int j = i + 1; j < nums.length; j++) {
            if (nums[i] == nums[j]) return true;
        }
    }
    return false;
}`,
      cpp: `bool containsDuplicate(const vector<int>& nums) {
    int n = (int)nums.size();
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (nums[i] == nums[j]) return true;
        }
    }
    return false;
}`,
    },
    {
      name: "Sort first",
      summary:
        "Sort the array, then walk it once: duplicates, if there are any, must end up side by side.",
      whyNow:
        "The nested scan re-reads the whole tail for every element. Sorting collapses the question to a single comparison per position — but it pays O(n log n) and destroys the original order to do it.",
      complexity: { time: "O(n log n)", space: "O(1)" },
      python: `def contains_duplicate(nums: list[int]) -> bool:
    ordered = sorted(nums)
    for i in range(1, len(ordered)):
        if ordered[i] == ordered[i - 1]:
            return True
    return False`,
      java: `public boolean containsDuplicate(int[] nums) {
    int[] ordered = nums.clone();
    Arrays.sort(ordered);
    for (int i = 1; i < ordered.length; i++) {
        if (ordered[i] == ordered[i - 1]) return true;
    }
    return false;
}`,
      cpp: `bool containsDuplicate(const vector<int>& nums) {
    vector<int> ordered = nums;
    sort(ordered.begin(), ordered.end());
    for (size_t i = 1; i < ordered.size(); i++) {
        if (ordered[i] == ordered[i - 1]) return true;
    }
    return false;
}`,
    },
  ],
}
