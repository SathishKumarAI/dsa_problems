import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "missing-number",
  title: "The Number That Is Not There",
  pattern: "arrays-hashing",
  difficulty: "easy",
  leetcode: "missing-number",
  brief:
    "n distinct values drawn from 0..n — name the one that never shows up.",
  statement:
    "An array holds n distinct integers taken from the range 0 to n inclusive. That range has n + 1 numbers in it and the array has n slots, so exactly one number is absent. Return it. The follow-up asks for linear time and constant extra memory.",
  constraints: [
    "n == nums.length, 1 <= n <= 10^4",
    "0 <= nums[i] <= n, and every value is distinct — no counting is needed, only presence",
    "the missing value can be 0 or n itself, so a scan that only looks between the smallest and largest value is wrong",
    "n may be 1: [0] is missing 1 and [1] is missing 0, and both ends have to work",
  ],
  examples: [
    { input: "nums = [3, 0, 1]", output: "2" },
    {
      input: "nums = [0, 1]",
      output: "2",
      note: "The gap is past the end of the array. Nothing inside the data points at it — only the promise about the range does.",
    },
    { input: "nums = [9, 6, 4, 2, 3, 5, 7, 0, 1]", output: "8" },
  ],
  hints: [
    "The answer is not decided by any single element — it is decided by which of the n + 1 candidates is absent. What do you know about all of them together?",
    "Pair every index 0..n-1 with the value sitting at it, and add n to the pile. Every number in 0..n appears twice in that pile except one.",
    "XOR is the operation that cancels a value against itself and does not care about order or overflow.",
  ],
  whyNow:
    "The running total is correct but it builds a number roughly n^2/2 large before subtracting anything, so a fixed-width int can overflow long before the answer comes out. XOR cancels the same pairs without any value ever growing past n.",
  arc:
    "Five rungs, and they split into two families: find the gap by imposing order (sort, flags, placing each value at its own index) or compute the gap by arithmetic (subtract the sum, or XOR the indices against the values). The arithmetic family is the lesson — when the input is a permutation with one hole, an invariant of the whole set can name the hole without looking for it. Sum is the easiest to derive on the spot; XOR is the one to prefer when overflow is a concern, since it needs no range assumption at all. Being able to produce both, and to say why XOR is safer for very large n, is what makes this a five-minute question rather than a one-minute one.",
  approach:
    "Fold indices and values into one accumulator with XOR. Seed it with n — the one index the loop never visits — then XOR in each index i and each value nums[i]. Every number that is present appears once as a value and once as an index, and x ^ x = 0, so all of them cancel. The missing number appears only as an index, so it is what survives. One pass, one integer of state, and no arithmetic that can overflow.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def missing_number(nums: list[int]) -> int:
    acc = len(nums)  # index n exists in the range but not in the loop
    for i, x in enumerate(nums):
        acc ^= i ^ x
    return acc`,
  java: `public int missingNumber(int[] nums) {
    int acc = nums.length;
    for (int i = 0; i < nums.length; i++) {
        acc ^= i ^ nums[i];
    }
    return acc;
}`,
  cpp: `int missingNumber(const vector<int>& nums) {
    int acc = (int)nums.size();
    for (int i = 0; i < (int)nums.size(); i++) {
        acc ^= i ^ nums[i];
    }
    return acc;
}`,
  walkthrough: [
    {
      cells: { values: [3, 0, 1], labels: { 0: "i=0" }, marks: { 0: "focus" } },
      caption:
        "acc starts at n = 3. XOR in index 0 and value 3: acc = 3 ^ 0 ^ 3 = 0.",
    },
    {
      cells: { values: [3, 0, 1], labels: { 1: "i=1" }, marks: { 1: "focus" } },
      caption: "XOR in index 1 and value 0: acc = 0 ^ 1 ^ 0 = 1.",
    },
    {
      cells: { values: [3, 0, 1], labels: { 2: "i=2" }, marks: { 2: "focus" } },
      caption: "XOR in index 2 and value 1: acc = 1 ^ 2 ^ 1 = 2.",
    },
    {
      cells: { values: [3, 0, 1], marks: { 0: "done", 1: "done", 2: "done" } },
      caption:
        "0, 1 and 3 each appeared twice and cancelled. acc = 2 — the missing number.",
    },
  ],
  alternatives: [
    {
      name: "Sort and scan",
      summary:
        "Sorted, the array should read 0, 1, 2, ... — the first index whose value does not match itself is the answer. If every one matches, the gap is at the end.",
      complexity: { time: "O(n log n)", space: "O(n)" },
      python: `def missing_number(nums: list[int]) -> int:
    ordered = sorted(nums)
    for i, x in enumerate(ordered):
        if x != i:
            return i
    return len(ordered)`,
      java: `public int missingNumber(int[] nums) {
    int[] ordered = nums.clone();
    Arrays.sort(ordered);
    for (int i = 0; i < ordered.length; i++) {
        if (ordered[i] != i) return i;
    }
    return ordered.length;
}`,
      cpp: `int missingNumber(vector<int> nums) {
    sort(nums.begin(), nums.end());
    for (int i = 0; i < (int)nums.size(); i++) {
        if (nums[i] != i) return i;
    }
    return (int)nums.size();
}`,
    },
    {
      name: "Table of flags",
      summary:
        "Mark each value present in an array of n + 1 flags, then walk 0..n and return the first flag never set.",
      complexity: { time: "O(n)", space: "O(n)" },
      whyNow:
        "Sorting rearranges all n values to answer a question about presence, and it charges n log n for the privilege. A flag per candidate answers presence directly in one pass — the price is n + 1 slots of memory the follow-up does not allow.",
      python: `def missing_number(nums: list[int]) -> int:
    n = len(nums)
    seen = [False] * (n + 1)
    for x in nums:
        seen[x] = True
    for i in range(n + 1):
        if not seen[i]:
            return i
    return -1`,
      java: `public int missingNumber(int[] nums) {
    int n = nums.length;
    boolean[] seen = new boolean[n + 1];
    for (int x : nums) seen[x] = true;
    for (int i = 0; i <= n; i++) {
        if (!seen[i]) return i;
    }
    return -1;
}`,
      cpp: `int missingNumber(const vector<int>& nums) {
    int n = (int)nums.size();
    vector<bool> seen(n + 1, false);
    for (int x : nums) seen[x] = true;
    for (int i = 0; i <= n; i++) {
        if (!seen[i]) return i;
    }
    return -1;
}`,
    },
    {
      name: "Put each value at its own index",
      summary:
        "Swap values around until every value that can sit at its own index does. Then the first index holding something else is the missing number.",
      complexity: { time: "O(n)", space: "O(1)" },
      whyNow:
        "The flag table spends n + 1 fresh slots to record what the input already contains. Because every value is a legal index, the array can be its own table: send each value home and the hole shows itself — no extra memory, at the cost of rearranging the caller's array.",
      python: `def missing_number(nums: list[int]) -> int:
    n = len(nums)
    i = 0
    while i < n:
        v = nums[i]
        if v < n and nums[v] != v:
            nums[i], nums[v] = nums[v], nums[i]
        else:
            i += 1
    for i in range(n):
        if nums[i] != i:
            return i
    return n`,
      java: `public int missingNumber(int[] nums) {
    int n = nums.length;
    int i = 0;
    while (i < n) {
        int v = nums[i];
        if (v < n && nums[v] != v) {
            nums[i] = nums[v];
            nums[v] = v;
        } else {
            i++;
        }
    }
    for (int j = 0; j < n; j++) {
        if (nums[j] != j) return j;
    }
    return n;
}`,
      cpp: `int missingNumber(vector<int> nums) {
    int n = (int)nums.size();
    int i = 0;
    while (i < n) {
        int v = nums[i];
        if (v < n && nums[v] != v) {
            swap(nums[i], nums[v]);
        } else {
            i++;
        }
    }
    for (int j = 0; j < n; j++) {
        if (nums[j] != j) return j;
    }
    return n;
}`,
    },
    {
      name: "Subtract from the total",
      summary:
        "The numbers 0..n add up to n * (n + 1) / 2. Subtract what the array actually holds and the difference is the value that never arrived.",
      complexity: { time: "O(n)", space: "O(1)" },
      whyNow:
        "Placing values home is constant space but it destroys the caller's array and still needs a second scan to find the hole. A running total needs neither: one accumulator, one pass, and the input untouched.",
      python: `def missing_number(nums: list[int]) -> int:
    n = len(nums)
    total = n * (n + 1) // 2
    for x in nums:
        total -= x
    return total`,
      java: `public int missingNumber(int[] nums) {
    int n = nums.length;
    int total = n * (n + 1) / 2;
    for (int x : nums) total -= x;
    return total;
}`,
      cpp: `int missingNumber(const vector<int>& nums) {
    int n = (int)nums.size();
    int total = n * (n + 1) / 2;
    for (int x : nums) total -= x;
    return total;
}`,
    },
  ],
}
