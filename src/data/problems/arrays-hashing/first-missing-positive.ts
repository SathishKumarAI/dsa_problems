import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "first-missing-positive",
  title: "The Smallest Positive That Is Missing",
  pattern: "arrays-hashing",
  difficulty: "hard",
  leetcode: "first-missing-positive",
  brief:
    "The smallest positive integer absent from the array, in O(n) time and O(1) extra space.",
  statement:
    "Given an unsorted integer array, return the smallest positive integer (1, 2, 3, …) that does not appear in it. Zeroes and negatives may be present but can never be the answer. The follow-up — and the whole difficulty — is doing it in linear time with only a constant amount of extra memory.",
  constraints: [
    "1 <= nums.length <= 10^5",
    "-2^31 <= nums[i] <= 2^31 - 1 — zeroes, negatives and duplicates are all allowed",
    "the answer always lies in 1..n+1, because n values can cover at most n consecutive positives",
    "any value <= 0 or > n is noise: it can never be the answer and it never blocks one",
    "O(n) time AND O(1) extra space is the requirement — a hash set is a correct answer that fails the follow-up",
    "the input array may be modified; nothing promises it comes back intact",
  ],
  examples: [
    { input: "nums = [1, 2, 0]", output: "3" },
    {
      input: "nums = [3, 4, -1, 1]",
      output: "2",
      note: "The answer is a hole in the middle, not one past the end — a solution that only extends the longest run misses it.",
    },
    {
      input: "nums = [7, 8, 9, 11, 12]",
      output: "1",
      note: "Nothing in 1..n is present at all. Every value is noise and the answer is the very first candidate.",
    },
  ],
  hints: [
    "How large can the answer possibly be? With n values in hand, name the biggest answer you could ever be forced to give.",
    "That bound means anything <= 0 or > n is irrelevant. The only interesting values are 1..n — exactly as many of them as the array has slots.",
    "You are allowed to wreck the input. Put value v into slot v-1; afterwards the first slot that disagrees with its own index names the answer.",
  ],
  whyNow:
    "The boolean table is linear in time but still allocates n+1 fresh cells, which is exactly what the O(1)-space follow-up forbids. The input array already has n slots, and nobody needs its original contents once the answer is out — so the marking table can BE the input: send each value v to slot v-1 and the array marks itself.",
  arc: "The constraint that looks like trivia is the whole solution: among n values, the smallest missing positive is always between 1 and n+1, so only n+1 candidates matter and everything else — negatives, huge values, duplicates — is noise. Each rung then narrows where the bookkeeping lives, from a rescan per candidate, to sorting, to a set, to a flag table, and finally into the array itself by swapping each value into the slot it belongs in. Cyclic placement is worth practising because the loop looks dangerous and is not: every swap puts one value home for good, so the total work is linear despite the inner while. Know the bound argument cold — it is the part an interviewer is actually testing.",
  approach:
    "Two passes over the array itself. First, place every value that could matter: while nums[i] sits in 1..n and is not already in slot nums[i]-1, swap it there. The swap is the trick — the value that lands in position i is examined next, so every swap puts one value permanently home and the total number of swaps is at most n, which keeps the nested while loop linear. The guard nums[nums[i]-1] != nums[i] is what stops a duplicate from swapping with its twin forever. Second, walk the slots: the first i whose value is not i+1 means i+1 was never placed, so return i+1. If every slot is home, 1..n are all present and the answer is n+1.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def first_missing_positive(nums: list[int]) -> int:
    n = len(nums)
    for i in range(n):
        # keep sending the value at i home until i holds junk or is settled
        while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
            j = nums[i] - 1
            nums[i], nums[j] = nums[j], nums[i]
    for i in range(n):
        if nums[i] != i + 1:
            return i + 1
    return n + 1`,
  java: `public int firstMissingPositive(int[] nums) {
    int n = nums.length;
    for (int i = 0; i < n; i++) {
        while (nums[i] >= 1 && nums[i] <= n && nums[nums[i] - 1] != nums[i]) {
            int j = nums[i] - 1;
            int t = nums[j];
            nums[j] = nums[i];
            nums[i] = t;
        }
    }
    for (int i = 0; i < n; i++) {
        if (nums[i] != i + 1) return i + 1;
    }
    return n + 1;
}`,
  cpp: `int firstMissingPositive(vector<int> nums) {
    int n = (int)nums.size();
    for (int i = 0; i < n; i++) {
        while (nums[i] >= 1 && nums[i] <= n && nums[nums[i] - 1] != nums[i]) {
            int j = nums[i] - 1;
            int t = nums[j];
            nums[j] = nums[i];
            nums[i] = t;
        }
    }
    for (int i = 0; i < n; i++) {
        if (nums[i] != i + 1) return i + 1;
    }
    return n + 1;
}`,
  alternatives: [
    {
      name: "Try 1, then 2, then 3",
      summary:
        "Ask the array whether it holds 1; if it does, ask about 2, and so on. The first candidate that is absent is the answer, and n+1 candidates is always enough because the array cannot block more than n of them.",
      complexity: { time: "O(n^2)", space: "O(1)" },
      python: `def first_missing_positive(nums: list[int]) -> int:
    for c in range(1, len(nums) + 2):
        found = False
        for x in nums:
            if x == c:
                found = True
                break
        if not found:
            return c
    return len(nums) + 1`,
      java: `public int firstMissingPositive(int[] nums) {
    for (int c = 1; c <= nums.length + 1; c++) {
        boolean found = false;
        for (int x : nums) {
            if (x == c) { found = true; break; }
        }
        if (!found) return c;
    }
    return nums.length + 1;
}`,
      cpp: `int firstMissingPositive(vector<int> nums) {
    int n = (int)nums.size();
    for (int c = 1; c <= n + 1; c++) {
        bool found = false;
        for (int x : nums) {
            if (x == c) { found = true; break; }
        }
        if (!found) return c;
    }
    return n + 1;
}`,
    },
    {
      name: "Sort, then walk",
      summary:
        "Sort, then walk with a counter holding the next positive still wanted. Duplicates and values below the counter are skipped; the first value that overshoots proves the counter is missing.",
      complexity: { time: "O(n log n)", space: "O(1)" },
      whyNow:
        "Rescanning the whole array once per candidate repeats the same comparisons endlessly: candidate 5 re-reads everything candidates 1 through 4 already read. Sorting arranges the values so one left-to-right walk settles every candidate at once.",
      python: `def first_missing_positive(nums: list[int]) -> int:
    nums.sort()
    want = 1
    for x in nums:
        if x == want:
            want += 1
        elif x > want:
            break
    return want`,
      java: `public int firstMissingPositive(int[] nums) {
    Arrays.sort(nums);
    int want = 1;
    for (int x : nums) {
        if (x == want) want++;
        else if (x > want) break;
    }
    return want;
}`,
      cpp: `int firstMissingPositive(vector<int> nums) {
    sort(nums.begin(), nums.end());
    int want = 1;
    for (int x : nums) {
        if (x == want) want++;
        else if (x > want) break;
    }
    return want;
}`,
    },
    {
      name: "Hash set",
      summary:
        "Pour every value into a set, then probe 1, 2, 3, … until a probe misses. Each probe is O(1), so the whole thing is linear.",
      complexity: { time: "O(n)", space: "O(n)" },
      whyNow:
        "The sort spends O(n log n) arranging values into an order the answer never asks about — it only ever asks whether one particular number is present. A set answers exactly that in constant time, so the ordering work was pure waste.",
      python: `def first_missing_positive(nums: list[int]) -> int:
    seen = set(nums)
    want = 1
    while want in seen:
        want += 1
    return want`,
      java: `public int firstMissingPositive(int[] nums) {
    Set<Integer> seen = new HashSet<>();
    for (int x : nums) seen.add(x);
    int want = 1;
    while (seen.contains(want)) want++;
    return want;
}`,
      cpp: `int firstMissingPositive(vector<int> nums) {
    unordered_set<int> seen(nums.begin(), nums.end());
    int want = 1;
    while (seen.count(want)) want++;
    return want;
}`,
    },
    {
      name: "Boolean table of size n+1",
      summary:
        "Because the answer lives in 1..n+1, only the values 1..n matter. Tick those off in a flat boolean array indexed by the value itself, then return the first index never ticked.",
      complexity: { time: "O(n)", space: "O(n)" },
      whyNow:
        "The set stores every value, including the negatives and the huge ones that can never be part of any answer, and it pays a hash on each insert and each probe. Once the answer is known to be capped at n+1, an array of n+1 flags indexes straight into itself — no hashing, and an out-of-range value is dropped the moment it is seen.",
      python: `def first_missing_positive(nums: list[int]) -> int:
    n = len(nums)
    seen = [False] * (n + 1)
    for x in nums:
        if 1 <= x <= n:
            seen[x] = True
    for c in range(1, n + 1):
        if not seen[c]:
            return c
    return n + 1`,
      java: `public int firstMissingPositive(int[] nums) {
    int n = nums.length;
    boolean[] seen = new boolean[n + 1];
    for (int x : nums) {
        if (x >= 1 && x <= n) seen[x] = true;
    }
    for (int c = 1; c <= n; c++) {
        if (!seen[c]) return c;
    }
    return n + 1;
}`,
      cpp: `int firstMissingPositive(vector<int> nums) {
    int n = (int)nums.size();
    vector<bool> seen(n + 1, false);
    for (int x : nums) {
        if (x >= 1 && x <= n) seen[x] = true;
    }
    for (int c = 1; c <= n; c++) {
        if (!seen[c]) return c;
    }
    return n + 1;
}`,
    },
  ],
  walkthrough: [
    {
      cells: { values: [3, 4, -1, 1] },
      caption:
        "n = 4, so the answer is somewhere in 1..5. Goal: make slot i hold i+1 wherever that value exists.",
    },
    {
      cells: { values: [3, 4, -1, 1], marks: { 0: "focus", 2: "compare" } },
      caption:
        "nums[0] = 3 belongs in slot 2 (0-based). Slot 2 holds -1, which is not 3, so swap them.",
    },
    {
      cells: { values: [-1, 4, 3, 1], marks: { 0: "focus" } },
      caption:
        "Slot 0 now holds -1 — outside 1..4, so it can never be an answer and never blocks one. Leave it and move on.",
    },
    {
      cells: { values: [-1, 4, 3, 1], marks: { 1: "focus", 3: "compare" } },
      caption: "nums[1] = 4 belongs in slot 3, which holds 1. Swap.",
    },
    {
      cells: { values: [-1, 1, 3, 4], marks: { 1: "focus", 0: "compare" } },
      caption:
        "The swap handed slot 1 a new value, 1, which belongs in slot 0. Keep working the SAME slot until it holds junk or is already home.",
    },
    {
      cells: {
        values: [1, -1, 3, 4],
        marks: { 0: "done", 1: "done", 2: "done", 3: "done" },
      },
      caption:
        "3 and 4 were already home, so the placing pass is over. At most n swaps happened in total — that is why the nested loop is still linear.",
    },
    {
      cells: { values: [1, -1, 3, 4], marks: { 0: "done", 1: "focus" } },
      caption:
        "Second pass. Slot 0 holds 1, correct. Slot 1 holds -1, not 2 — so 2 was never placed. Answer: 2.",
    },
  ],
}
