// remove-duplicates-sorted — the ladder: every way in, worst first.
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

export const approach = "Keep a write index one past the last survivor. Read forward; whenever the current value differs from the value at the last written slot, it is new, so write it and advance. Because the array is sorted, differing from the previous survivor is the same as being new — that equivalence is what makes the single comparison sufficient. The first element is always a survivor, so the walk starts from the second."

export const whyNow = "Collecting the distinct values into a set loses the ordering the input handed you and spends memory to rebuild it. Sortedness means a duplicate is always adjacent, so one comparison against the previous survivor is enough — no set, no re-sorting, no extra array."

export const arc = "The reader/writer pair again, with the comparison that matters being 'is this value different from the last one I KEPT', not 'different from the previous element'. On sorted input those coincide, which is exactly why the problem is easy — and why the variant allowing each value twice is a good follow-up: it changes the test to a comparison against the value two slots back in the output, and nothing else. Carry the habit of writing the loop in terms of the output's tail rather than the input's neighbourhood; it survives the variants, and it makes the required return value — the new length — fall out of the writer's position instead of needing a second count."

export const complexity = { time: "O(n)", space: "O(1)" }

export const python = `def remove_duplicates(nums: list[int]) -> list[int]:
    if not nums:
        return []
    write = 1
    for read in range(1, len(nums)):
        if nums[read] != nums[write - 1]:
            nums[write] = nums[read]
            write += 1
    return nums[:write]`

export const java = `public int[] removeDuplicates(int[] nums) {
    if (nums.length == 0) return new int[0];
    int write = 1;
    for (int read = 1; read < nums.length; read++) {
        if (nums[read] != nums[write - 1]) {
            nums[write] = nums[read];
            write++;
        }
    }
    return Arrays.copyOf(nums, write);
}`

export const cpp = `vector<int> removeDuplicates(vector<int> nums) {
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
}`

export const alternatives: Solution[] = [
  {
    name: "Build a distinct copy",
    summary:
      "Walk the array collecting values that differ from the last one kept, into a new list. Linear and obviously correct, and the copy is the whole cost — the survivors are always a prefix of the original, so they can be written over the array as it is read.",
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
]
