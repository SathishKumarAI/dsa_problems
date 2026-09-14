import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "remove-element",
  title: "Strip Out Every Copy of a Value",
  pattern: "two-pointers",
  difficulty: "easy",
  leetcode: "remove-element",
  brief:
    "Drop every copy of one value; the survivors stay packed at the front.",
  statement:
    "Given an integer array and a value, remove every occurrence of that value and hand back what survives, in the order it appeared. Do the removal inside the array you were given rather than building a second one.",
  constraints: [
    "0 <= nums.length <= 100",
    "0 <= nums[i] <= 50 and 0 <= val <= 100, so val may be a number that never appears at all",
    "the survivors keep their ORIGINAL relative order — LeetCode accepts any order, but pinning it is what lets five different implementations be compared against each other",
    "an empty array is legal, and so is an array where every value is val: both answer with nothing, so the code must survive a writer that never advances",
  ],
  examples: [
    { input: "nums = [3, 2, 2, 3], val = 3", output: "[2, 2]" },
    {
      input: "nums = [0, 1, 2, 2, 3, 0, 4, 2], val = 2",
      output: "[0, 1, 3, 0, 4]",
      note: "The two 2s in the middle are adjacent — the writer has to fall two behind, not one.",
    },
    {
      input: "nums = [2, 2, 2], val = 2",
      output: "[]",
      note: "Everything matches. The writer never moves, and the answer is an empty prefix.",
    },
  ],
  hints: [
    "The answer is a PREFIX: the survivors, in order, packed at the front. Nothing past that boundary matters.",
    "Every position gets read, but only some get written. That is two indices moving at different speeds.",
    "Where the writer stops IS the length of the answer — it never needed a separate count.",
  ],
  whyNow:
    "The plain reader/writer pass writes every survivor back over itself until the first val shows up, and if val never appears it rewrites the whole array with the values already sitting there — n pointless writes on the commonest input. Checking that the pointers have actually parted turns the 'nothing to remove' case into a pure scan and costs one comparison.",
  arc: "Five rungs that are really one idea arriving in stages: stop moving data and start choosing where to write it. Deleting with shifts is quadratic for a reason worth naming — each removal rewrites the tail. A copy is linear but allocates. The reader/writer pair is linear, in place, and stable. The final rung is the variant worth knowing for interviews: when ORDER does not matter, a value to remove can be overwritten with the last element instead, which makes the number of writes proportional to the number of removals rather than to the array. Choosing between them is a question about the contract, which is why the first move is to ask whether order is part of the answer.",
  approach:
    "Walk the array with a reader and a writer. The reader visits every position; the writer marks where the next survivor belongs. When the reader finds something other than val it goes to the writer's slot and the writer steps forward — so the gap between them is exactly how many copies of val have been passed, and the survivors land in the order they were read. Skip the copy when the two indices coincide, because writing a value onto itself is work with no effect. When the reader runs out, the writer's position is the length of the answer, and the answer is the prefix ending there.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def remove_element(nums: list[int], val: int) -> list[int]:
    write = 0
    for read in range(len(nums)):
        if nums[read] != val:
            if read != write:
                nums[write] = nums[read]
            write += 1
    return nums[:write]`,
  java: `public int[] removeElement(int[] nums, int val) {
    int write = 0;
    for (int read = 0; read < nums.length; read++) {
        if (nums[read] != val) {
            if (read != write) nums[write] = nums[read];
            write++;
        }
    }
    return Arrays.copyOf(nums, write);
}`,
  cpp: `vector<int> removeElement(vector<int> nums, int val) {
    int write = 0;
    for (int read = 0; read < (int)nums.size(); read++) {
        if (nums[read] != val) {
            if (read != write) nums[write] = nums[read];
            write++;
        }
    }
    nums.resize(write);
    return nums;
}`,
  walkthrough: [
    {
      cells: {
        values: [0, 1, 2, 2, 3, 0, 4, 2],
        marks: { 0: "focus" },
        labels: { 0: "r/w" },
      },
      caption:
        "val = 2. Reader and writer both start at 0. While nothing has matched, they move together.",
    },
    {
      cells: {
        values: [0, 1, 2, 2, 3, 0, 4, 2],
        marks: { 0: "done", 1: "done", 2: "compare" },
        labels: { 2: "r/w" },
      },
      caption:
        "0 and 1 survive and are written onto themselves — the skip test makes those two writes free. The reader now sees a 2.",
    },
    {
      cells: {
        values: [0, 1, 2, 2, 3, 0, 4, 2],
        marks: { 0: "done", 1: "done", 3: "compare" },
        labels: { 2: "w", 3: "r" },
      },
      caption:
        "The writer stays at 2 while the reader steps past the match. A second 2 follows, so the gap widens to two.",
    },
    {
      cells: {
        values: [0, 1, 3, 2, 3, 0, 4, 2],
        marks: { 0: "done", 1: "done", 2: "done", 4: "compare" },
        labels: { 3: "w", 4: "r" },
      },
      caption:
        "The 3 at index 4 is a survivor, so it is copied back to index 2 and the writer advances. The gap is the number of 2s seen so far.",
    },
    {
      cells: {
        values: [0, 1, 3, 0, 4, 0, 4, 2],
        marks: { 0: "done", 1: "done", 2: "done", 3: "done", 4: "done" },
        labels: { 5: "w" },
      },
      caption:
        "The 0 and the 4 follow the same way; the last 2 is skipped. The reader is spent and the writer sits at 5 — the answer is the first five cells.",
    },
  ],
  alternatives: [
    {
      name: "Delete and shift",
      summary:
        "Scan for a match and, every time one turns up, slide the whole remaining tail one slot to the left and shrink the live length.",
      complexity: { time: "O(n^2)", space: "O(1)" },
      python: `def remove_element(nums: list[int], val: int) -> list[int]:
    n = len(nums)
    i = 0
    while i < n:
        if nums[i] == val:
            for j in range(i, n - 1):
                nums[j] = nums[j + 1]
            n -= 1
        else:
            i += 1
    return nums[:n]`,
      java: `public int[] removeElement(int[] nums, int val) {
    int n = nums.length;
    int i = 0;
    while (i < n) {
        if (nums[i] == val) {
            for (int j = i; j < n - 1; j++) nums[j] = nums[j + 1];
            n--;
        } else {
            i++;
        }
    }
    return Arrays.copyOf(nums, n);
}`,
      cpp: `vector<int> removeElement(vector<int> nums, int val) {
    int n = (int)nums.size();
    int i = 0;
    while (i < n) {
        if (nums[i] == val) {
            for (int j = i; j < n - 1; j++) nums[j] = nums[j + 1];
            n--;
        } else {
            i++;
        }
    }
    nums.resize(n);
    return nums;
}`,
    },
    {
      name: "Filter into a copy",
      summary:
        "Collect the survivors into a fresh list in one pass and return that, leaving the original array untouched.",
      complexity: { time: "O(n)", space: "O(n)" },
      whyNow:
        "Shifting the tail on every match re-copies values that were already in the right place; an array of nothing but val does that n times, which is quadratic work to produce an empty answer. Appending the survivors somewhere else touches each value exactly once.",
      python: `def remove_element(nums: list[int], val: int) -> list[int]:
    kept = []
    for x in nums:
        if x != val:
            kept.append(x)
    return kept`,
      java: `public int[] removeElement(int[] nums, int val) {
    int[] kept = new int[nums.length];
    int at = 0;
    for (int x : nums) {
        if (x != val) {
            kept[at] = x;
            at++;
        }
    }
    return Arrays.copyOf(kept, at);
}`,
      cpp: `vector<int> removeElement(vector<int> nums, int val) {
    vector<int> kept;
    for (int x : nums) {
        if (x != val) kept.push_back(x);
    }
    return kept;
}`,
    },
    {
      name: "Count, then compact",
      summary:
        "One pass to count how many values survive, a second to slide them to the front of the original array, and return that many.",
      complexity: { time: "O(n)", space: "O(1)" },
      whyNow:
        "The filtered copy is linear but it allocates a second array the size of the input just to hold values that already exist. Counting first gives the length of the answer up front, so the survivors can be packed into the array that was already there and nothing new is allocated.",
      python: `def remove_element(nums: list[int], val: int) -> list[int]:
    keep = 0
    for x in nums:
        if x != val:
            keep += 1
    write = 0
    for read in range(len(nums)):
        if nums[read] != val:
            nums[write] = nums[read]
            write += 1
    return nums[:keep]`,
      java: `public int[] removeElement(int[] nums, int val) {
    int keep = 0;
    for (int x : nums) {
        if (x != val) keep++;
    }
    int write = 0;
    for (int read = 0; read < nums.length; read++) {
        if (nums[read] != val) {
            nums[write] = nums[read];
            write++;
        }
    }
    return Arrays.copyOf(nums, keep);
}`,
      cpp: `vector<int> removeElement(vector<int> nums, int val) {
    int keep = 0;
    for (int x : nums) {
        if (x != val) keep++;
    }
    int write = 0;
    for (int read = 0; read < (int)nums.size(); read++) {
        if (nums[read] != val) {
            nums[write] = nums[read];
            write++;
        }
    }
    nums.resize(keep);
    return nums;
}`,
    },
    {
      name: "Reader and writer",
      summary:
        "One pass with two indices: the reader visits everything, the writer only advances when a survivor is placed.",
      complexity: { time: "O(n)", space: "O(1)" },
      whyNow:
        "The counting pass exists only to learn the length of the answer, and the compaction loop already knows it — the writer's index at the end is that number. Dropping the first pass halves the reads and removes a second place where the match test could be written differently by accident.",
      python: `def remove_element(nums: list[int], val: int) -> list[int]:
    write = 0
    for read in range(len(nums)):
        if nums[read] != val:
            nums[write] = nums[read]
            write += 1
    return nums[:write]`,
      java: `public int[] removeElement(int[] nums, int val) {
    int write = 0;
    for (int read = 0; read < nums.length; read++) {
        if (nums[read] != val) {
            nums[write] = nums[read];
            write++;
        }
    }
    return Arrays.copyOf(nums, write);
}`,
      cpp: `vector<int> removeElement(vector<int> nums, int val) {
    int write = 0;
    for (int read = 0; read < (int)nums.size(); read++) {
        if (nums[read] != val) {
            nums[write] = nums[read];
            write++;
        }
    }
    nums.resize(write);
    return nums;
}`,
    },
  ],
}
