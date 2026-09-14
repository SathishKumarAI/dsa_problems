// remove-element — the ladder: every way in, worst first.
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

export const approach = "Walk the array with a reader and a writer. The reader visits every position; the writer marks where the next survivor belongs. When the reader finds something other than val it goes to the writer's slot and the writer steps forward — so the gap between them is exactly how many copies of val have been passed, and the survivors land in the order they were read. Skip the copy when the two indices coincide, because writing a value onto itself is work with no effect. When the reader runs out, the writer's position is the length of the answer, and the answer is the prefix ending there."

export const whyNow = "The plain reader/writer pass writes every survivor back over itself until the first val shows up, and if val never appears it rewrites the whole array with the values already sitting there — n pointless writes on the commonest input. Checking that the pointers have actually parted turns the 'nothing to remove' case into a pure scan and costs one comparison."

export const arc = "Five rungs that are really one idea arriving in stages: stop moving data and start choosing where to write it. Deleting with shifts is quadratic for a reason worth naming — each removal rewrites the tail. A copy is linear but allocates. The reader/writer pair is linear, in place, and stable. The final rung is the variant worth knowing for interviews: when ORDER does not matter, a value to remove can be overwritten with the last element instead, which makes the number of writes proportional to the number of removals rather than to the array. Choosing between them is a question about the contract, which is why the first move is to ask whether order is part of the answer."

export const complexity = { time: "O(n)", space: "O(1)" }

export const python = `def remove_element(nums: list[int], val: int) -> list[int]:
    write = 0
    for read in range(len(nums)):
        if nums[read] != val:
            if read != write:
                nums[write] = nums[read]
            write += 1
    return nums[:write]`

export const java = `public int[] removeElement(int[] nums, int val) {
    int write = 0;
    for (int read = 0; read < nums.length; read++) {
        if (nums[read] != val) {
            if (read != write) nums[write] = nums[read];
            write++;
        }
    }
    return Arrays.copyOf(nums, write);
}`

export const cpp = `vector<int> removeElement(vector<int> nums, int val) {
    int write = 0;
    for (int read = 0; read < (int)nums.size(); read++) {
        if (nums[read] != val) {
            if (read != write) nums[write] = nums[read];
            write++;
        }
    }
    nums.resize(write);
    return nums;
}`

export const alternatives: Solution[] = [
  {
    name: "Delete and shift",
    summary:
      "Every time a match turns up, slide the whole remaining tail one slot left. It is what deletion looks like if you picture it literally, and it is quadratic: an array of all-matching values shifts n, then n-1, then n-2 elements for a job one pass finishes.",
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
      "Collect the survivors into a fresh list in one pass. Linear, and it leaves the caller's array untouched — which sounds like a virtue and is the wrong answer here, because the statement asks for the removal to happen in place.",
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
      "One pass to count the survivors, a second to slide them to the front. In place and constant-space, and the first pass earns nothing: the second already knows a value survives at the moment it reads it, so counting them first is asking the same question twice.",
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
      "One pass, two indices: the reader visits every position, the writer advances only when a survivor is placed. This is the answer — the two indices are the whole idea, and every rung above it is this one with an extra pass or an extra array bolted on.",
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
]
