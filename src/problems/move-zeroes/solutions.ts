// move-zeroes — the ladder: every way in, worst first.
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

export const approach =
  "Walk with a reader and a writer. Every non-zero value the reader finds is written at the writer's position, and only then does the writer advance — so the writer tracks how much of the array is already correct. Order is preserved because values are written in the order they are read. When the reader finishes, the writer marks the boundary: everything from there to the end is zero. Two passes over the array, no extra memory, and no swapping that could disturb the order."

export const whyNow =
  "Building a filtered copy and padding it is the obvious version and it is already linear, but it allocates a whole second array to hold values it immediately copies back. Two indices do the same compaction inside the original array, and the gap between them is exactly the count of zeroes — no separate bookkeeping needed."

export const arc =
  "A tiny problem that teaches the reader/writer pair: one cursor reads every position, another marks where the next kept value belongs, and the gap between them is exactly the number of zeros seen. Filtering into a copy is the obvious version and the one to compare against, because it makes the in-place version look like what it is — the same filter with the output aliased onto the input. Two details are worth carrying: writing then zero-filling the tail is easier to argue than swapping, but swapping keeps the total writes down when zeros are rare; and the same skeleton, with the test changed, solves remove-element and remove-duplicates-from-sorted-array."

export const complexity = { time: "O(n)", space: "O(1)" }

export const python = `def move_zeroes(nums: list[int]) -> list[int]:
    write = 0
    for read in range(len(nums)):
        if nums[read] != 0:
            nums[write] = nums[read]
            write += 1
    for i in range(write, len(nums)):
        nums[i] = 0
    return nums`

export const java = `public int[] moveZeroes(int[] nums) {
    int write = 0;
    for (int read = 0; read < nums.length; read++) {
        if (nums[read] != 0) {
            nums[write] = nums[read];
            write++;
        }
    }
    for (int i = write; i < nums.length; i++) nums[i] = 0;
    return nums;
}`

export const cpp = `vector<int> moveZeroes(vector<int> nums) {
    int write = 0;
    for (int read = 0; read < (int)nums.size(); read++) {
        if (nums[read] != 0) {
            nums[write] = nums[read];
            write++;
        }
    }
    for (int i = write; i < (int)nums.size(); i++) nums[i] = 0;
    return nums;
}`

export const alternatives: Solution[] = [
  {
    key: "copy",
    name: "Filter into a copy",
    costWhy:
      "O(n) time and O(n) space. One pass to collect the non-zero values into a new list, one to write them back with zeroes appended \u2014 linear, and obviously correct, which is what it is for. The O(n) space is the copy, and it is disqualifying here rather than merely wasteful: the statement says in place. Keep it on the page as the thing the in-place rung must agree with, element for element.",
    summary:
      "Collect the non-zero values into a new list, pad with zeroes, copy back. Linear and easy to defend, and it allocates a second array of n to perform a rearrangement the array can do to itself — the statement says in place, and this satisfies the letter of that by copying back at the end.",
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
  // B79. The document teaches a third way and the page could not name it.
  // It is NOT a complexity improvement and it is not the answer either — it
  // is the same O(n)/O(1) walk with the write replaced by a swap, and it
  // earns its rung because the trade runs in an interesting direction: at
  // most n writes when zeroes dominate, up to 2n when they are rare, because
  // every kept value is then swapped with itself.
  {
    key: "swap",
    name: "Swap instead of write",
    costWhy:
      "O(n) time and O(1) space \u2014 the same bounds as the rung above it, which is exactly why this rung is about something other than cost. It swaps rather than writes, so it performs up to 2n memory writes where the write-index version performs one per surviving value, and on an array that is mostly zeroes that difference is measurable. Same bound, different clock: the asymptotic notation cannot see it, and this is one of the places worth saying so.",
    whyNow:
      "The reader-and-writer version copies every kept value forward and then walks the tail a second time filling in zeroes. But the slot the kept value came from is now free, and what belongs there is known — a zero, because that is exactly what was sitting at the writer's position. Swapping puts it back in the same move, and the second pass disappears.",
    summary:
      "One pass, swapping `nums[read]` with `nums[write]` instead of copying. The zero waiting at the writer travels out to the reader, which is where a zero belongs, so when the reader finishes the tail is already all zeroes and there is no cleanup. Same bound as the optimal rung and a different constant — fewer writes when zeroes are common, more when they are rare, since a kept value with nothing to trade is swapped with itself.",
    complexity: { time: "O(n)", space: "O(1)" },
    python: `def move_zeroes(nums: list[int]) -> list[int]:
    write = 0
    for read in range(len(nums)):
        if nums[read] != 0:
            # the zero waiting at write travels out to read, where it belongs
            nums[write], nums[read] = nums[read], nums[write]
            write += 1
    return nums`,
    java: `public int[] moveZeroes(int[] nums) {
    int write = 0;
    for (int read = 0; read < nums.length; read++) {
        if (nums[read] != 0) {
            int tmp = nums[write];
            nums[write] = nums[read];
            nums[read] = tmp;
            write++;
        }
    }
    return nums;
}`,
    cpp: `vector<int> moveZeroes(vector<int> nums) {
    int write = 0;
    for (int read = 0; read < (int)nums.size(); read++) {
        if (nums[read] != 0) {
            swap(nums[write], nums[read]);
            write++;
        }
    }
    return nums;
}`,
  },
]

// HOW THE TARGET BOUND WAS COUNTED. Each rung carries its own.
export const costWhy =
  "One pass with two indices: the reader visits each of the n elements once, and the writer only ever advances behind it, so the total work is n reads plus at most n writes \u2014 O(n), with a constant near one. The second loop that fills the tail with zeroes is another at most n writes and does not change the class. The O(1) space is the two indices: nothing is allocated, which is the whole difference from the copy rung. What the bound hides and the invariant does not: a write only happens on a non-zero value, so on an array that is mostly zeroes this does far fewer writes than n \u2014 which is why it beats the swap version on memory traffic even though both are linear."
