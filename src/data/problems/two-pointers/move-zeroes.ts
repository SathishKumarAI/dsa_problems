import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "move-zeroes",
  title: "Push the Zeroes to the End",
  pattern: "two-pointers",
  difficulty: "easy",
  leetcode: "move-zeroes",
  brief: "Zeroes to the back, everything else keeps its order.",
  statement:
    "Given an integer array, move every 0 to the end while keeping the relative order of the non-zero values. Do it in place.",
  constraints: [
    "1 <= nums.length <= 10^4",
    "-2^31 <= nums[i] <= 2^31 - 1",
    "the non-zero values must keep their RELATIVE ORDER, which rules out swapping a zero with the last element",
    "in place: no second array to build the answer in",
  ],
  examples: [
    { input: "nums = [0, 1, 0, 3, 12]", output: "[1, 3, 12, 0, 0]" },
    {
      input: "nums = [0, 0, 1]",
      output: "[1, 0, 0]",
      note: "A run of zeroes at the front is the case that catches a careless swap.",
    },
  ],
  hints: [
    "Two indices: one reading, one marking where the next non-zero value belongs.",
    "The writer only advances when something is written, so it falls behind the reader by exactly the number of zeroes seen.",
    "Once the reader is done, everything from the writer onward must become 0.",
  ],
  whyNow:
    "Building a filtered copy and padding it is the obvious version and it is already linear, but it allocates a whole second array to hold values it immediately copies back. Two indices do the same compaction inside the original array, and the gap between them is exactly the count of zeroes — no separate bookkeeping needed.",
  approach:
    "Walk with a reader and a writer. Every non-zero value the reader finds is written at the writer's position, and only then does the writer advance — so the writer tracks how much of the array is already correct. Order is preserved because values are written in the order they are read. When the reader finishes, the writer marks the boundary: everything from there to the end is zero. Two passes over the array, no extra memory, and no swapping that could disturb the order.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def move_zeroes(nums: list[int]) -> list[int]:
    write = 0
    for read in range(len(nums)):
        if nums[read] != 0:
            nums[write] = nums[read]
            write += 1
    for i in range(write, len(nums)):
        nums[i] = 0
    return nums`,
  java: `public int[] moveZeroes(int[] nums) {
    int write = 0;
    for (int read = 0; read < nums.length; read++) {
        if (nums[read] != 0) {
            nums[write] = nums[read];
            write++;
        }
    }
    for (int i = write; i < nums.length; i++) nums[i] = 0;
    return nums;
}`,
  cpp: `vector<int> moveZeroes(vector<int> nums) {
    int write = 0;
    for (int read = 0; read < (int)nums.size(); read++) {
        if (nums[read] != 0) {
            nums[write] = nums[read];
            write++;
        }
    }
    for (int i = write; i < (int)nums.size(); i++) nums[i] = 0;
    return nums;
}`,
  alternatives: [
    {
      name: "Filter into a copy",
      summary:
        "Collect the non-zero values into a new list, pad it with zeroes to the original length, and copy it back.",
      complexity: { time: "O(n)", space: "O(n)" },
      python: `def move_zeroes(nums: list[int]) -> list[int]:
    kept = [x for x in nums if x != 0]
    while len(kept) < len(nums):
        kept.append(0)
    for i in range(len(nums)):
        nums[i] = kept[i]
    return nums`,
      java: `public int[] moveZeroes(int[] nums) {
    int[] kept = new int[nums.length];
    int at = 0;
    for (int x : nums) {
        if (x != 0) {
            kept[at] = x;
            at++;
        }
    }
    for (int i = 0; i < nums.length; i++) nums[i] = kept[i];
    return nums;
}`,
      cpp: `vector<int> moveZeroes(vector<int> nums) {
    vector<int> kept;
    for (int x : nums) {
        if (x != 0) kept.push_back(x);
    }
    while (kept.size() < nums.size()) kept.push_back(0);
    for (int i = 0; i < (int)nums.size(); i++) nums[i] = kept[i];
    return nums;
}`,
    },
  ],
}
