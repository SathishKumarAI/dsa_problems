import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "remove-duplicates-sorted",
  title: "Squeeze Out the Duplicates",
  pattern: "two-pointers",
  difficulty: "easy",
  leetcode: "remove-duplicates-from-sorted-array",
  brief: "Keep one of each value, in place, order preserved.",
  statement:
    "Given a sorted array, remove the duplicates in place so each value appears once, keeping the original order, and return the array truncated to the values that remain.",
  constraints: [
    "1 <= nums.length <= 3 * 10^4, sorted non-decreasing",
    "-100 <= nums[i] <= 100",
    "sortedness is the whole gift: duplicates are always ADJACENT, so a value only has to be compared with the one before it",
    "in place — the survivors must end up at the front of the same array",
  ],
  examples: [
    { input: "nums = [1, 1, 2]", output: "[1, 2]" },
    {
      input: "nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]",
      output: "[0, 1, 2, 3, 4]",
    },
  ],
  hints: [
    "Because the array is sorted, a duplicate is always sitting next to its twin.",
    "One index reads, one index marks where the next survivor belongs.",
    "Write only when the value differs from the last one written.",
  ],
  whyNow:
    "Collecting the distinct values into a set loses the ordering the input handed you and spends memory to rebuild it. Sortedness means a duplicate is always adjacent, so one comparison against the previous survivor is enough — no set, no re-sorting, no extra array.",
  arc:
    "The reader/writer pair again, with the comparison that matters being 'is this value different from the last one I KEPT', not 'different from the previous element'. On sorted input those coincide, which is exactly why the problem is easy — and why the variant allowing each value twice is a good follow-up: it changes the test to a comparison against the value two slots back in the output, and nothing else. Carry the habit of writing the loop in terms of the output's tail rather than the input's neighbourhood; it survives the variants, and it makes the required return value — the new length — fall out of the writer's position instead of needing a second count.",
  approach:
    "Keep a write index one past the last survivor. Read forward; whenever the current value differs from the value at the last written slot, it is new, so write it and advance. Because the array is sorted, differing from the previous survivor is the same as being new — that equivalence is what makes the single comparison sufficient. The first element is always a survivor, so the walk starts from the second.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def remove_duplicates(nums: list[int]) -> list[int]:
    if not nums:
        return []
    write = 1
    for read in range(1, len(nums)):
        if nums[read] != nums[write - 1]:
            nums[write] = nums[read]
            write += 1
    return nums[:write]`,
  java: `public int[] removeDuplicates(int[] nums) {
    if (nums.length == 0) return new int[0];
    int write = 1;
    for (int read = 1; read < nums.length; read++) {
        if (nums[read] != nums[write - 1]) {
            nums[write] = nums[read];
            write++;
        }
    }
    return Arrays.copyOf(nums, write);
}`,
  cpp: `vector<int> removeDuplicates(vector<int> nums) {
    if (nums.empty()) return {};
    int write = 1;
    for (int read = 1; read < (int)nums.size(); read++) {
        if (nums[read] != nums[write - 1]) {
            nums[write] = nums[read];
            write++;
        }
    }
    nums.resize(write);
    return nums;
}`,
  alternatives: [
    {
      name: "Build a distinct copy",
      summary:
        "Walk the array collecting values that differ from the last one collected, into a new list.",
      complexity: { time: "O(n)", space: "O(n)" },
      python: `def remove_duplicates(nums: list[int]) -> list[int]:
    out: list[int] = []
    for x in nums:
        if not out or out[-1] != x:
            out.append(x)
    return out`,
      java: `public int[] removeDuplicates(int[] nums) {
    int[] out = new int[nums.length];
    int size = 0;
    for (int x : nums) {
        if (size == 0 || out[size - 1] != x) {
            out[size] = x;
            size++;
        }
    }
    return Arrays.copyOf(out, size);
}`,
      cpp: `vector<int> removeDuplicates(const vector<int>& nums) {
    vector<int> out;
    for (int x : nums) {
        if (out.empty() || out.back() != x) out.push_back(x);
    }
    return out;
}`,
    },
  ],
}
