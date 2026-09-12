import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "rotate-array",
  title: "Rotate the Array by k",
  pattern: "arrays-hashing",
  difficulty: "medium",
  leetcode: "rotate-array",
  brief: "Shift every value k places to the right, wrapping around, in place.",
  statement:
    "Given an integer array, move every value k positions to the right; the values that fall off the end wrap around to the front. The follow-up asks for it in place, with constant extra memory.",
  constraints: [
    "1 <= nums.length <= 10^5",
    "-2^31 <= nums[i] <= 2^31 - 1",
    "0 <= k <= 10^5, and k may exceed the length — k % n is the real rotation, so k = 7 on a 7-element array is no rotation at all",
    "the rotation is to the RIGHT: nums[i] ends up at index (i + k) % n",
    "in place: the follow-up rules out a second array the size of the input",
  ],
  examples: [
    {
      input: "nums = [1, 2, 3, 4, 5, 6, 7], k = 3",
      output: "[5, 6, 7, 1, 2, 3, 4]",
    },
    { input: "nums = [-1, -100, 3, 99], k = 2", output: "[3, 99, -1, -100]" },
    {
      input: "nums = [1, 2], k = 5",
      output: "[2, 1]",
      note: "k is larger than the array. Without k % n every version below either loops five times for nothing or indexes past the end.",
    },
  ],
  hints: [
    "Rotating by n leaves the array exactly as it was, so only k % n matters. Reduce k before you touch a single value.",
    "After the rotation the array is two blocks that swapped places: the last k values, then the first n - k.",
    "Reversing the whole array puts both blocks on the correct side, each one backwards. Reverse each block to undo that.",
  ],
  whyNow:
    "Cyclic replacements already run in place, but they need a count of how many values have moved (or a gcd) to know how many chains to start, and that bookkeeping is the part people get wrong. Three reversals reach the same arrangement with one primitive applied three times and nothing to count.",
  arc:
    "Three genuinely different ideas share this ladder: copy into place using modular arithmetic, follow the cycles of the rotation permutation, or reverse three times. The reversal trick is the one to memorise — reverse everything, then reverse the first k and the rest — because it is short, constant-space, and easy to argue: reversing puts the tail in front in the wrong internal order, and the two local reversals repair that. The cyclic version teaches something the reversal hides: a rotation decomposes into gcd(n, k) cycles, which is why a naive single-cycle walk misses elements. And reducing k modulo n first is not a detail — without it, k larger than n does pointless full turns or indexes out of range.",
  approach:
    "Reduce k to k % n, because a rotation by a multiple of n changes nothing. Then reverse the whole array: the last k values are now at the front and the first n - k at the back, which is the right arrangement of blocks with each block written backwards. Reverse the first k, then reverse the rest, and both blocks read forwards again. Three passes over the array with a swap loop, no allocation, and no index formula to get the direction wrong.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def rotate_array(nums: list[int], k: int) -> list[int]:
    n = len(nums)
    k %= n
    # whole array, then the two blocks the first reverse created
    for lo, hi in ((0, n - 1), (0, k - 1), (k, n - 1)):
        while lo < hi:
            nums[lo], nums[hi] = nums[hi], nums[lo]
            lo += 1
            hi -= 1
    return nums`,
  java: `public int[] rotateArray(int[] nums, int k) {
    int n = nums.length;
    k %= n;
    for (int lo = 0, hi = n - 1; lo < hi; lo++, hi--) {
        int t = nums[lo]; nums[lo] = nums[hi]; nums[hi] = t;
    }
    for (int lo = 0, hi = k - 1; lo < hi; lo++, hi--) {
        int t = nums[lo]; nums[lo] = nums[hi]; nums[hi] = t;
    }
    for (int lo = k, hi = n - 1; lo < hi; lo++, hi--) {
        int t = nums[lo]; nums[lo] = nums[hi]; nums[hi] = t;
    }
    return nums;
}`,
  cpp: `vector<int> rotateArray(vector<int> nums, int k) {
    int n = (int)nums.size();
    k %= n;
    for (int lo = 0, hi = n - 1; lo < hi; lo++, hi--) swap(nums[lo], nums[hi]);
    for (int lo = 0, hi = k - 1; lo < hi; lo++, hi--) swap(nums[lo], nums[hi]);
    for (int lo = k, hi = n - 1; lo < hi; lo++, hi--) swap(nums[lo], nums[hi]);
    return nums;
}`,
  walkthrough: [
    {
      cells: {
        values: [1, 2, 3, 4, 5, 6, 7],
        marks: { 4: "window", 5: "window", 6: "window" },
      },
      caption: "k = 3 on 7 values. The marked tail belongs at the front.",
    },
    {
      cells: {
        values: [7, 6, 5, 4, 3, 2, 1],
        marks: { 0: "window", 1: "window", 2: "window" },
      },
      caption:
        "Reverse everything. The tail is at the front now — but backwards.",
    },
    {
      cells: {
        values: [5, 6, 7, 4, 3, 2, 1],
        marks: { 0: "done", 1: "done", 2: "done" },
        labels: { 0: "lo", 2: "hi" },
      },
      caption: "Reverse the first k = 3. That block reads forwards again.",
    },
    {
      cells: {
        values: [5, 6, 7, 1, 2, 3, 4],
        marks: { 3: "done", 4: "done", 5: "done", 6: "done" },
        labels: { 3: "lo", 6: "hi" },
      },
      caption:
        "Reverse the remaining n - k = 4. Both blocks are in order — done.",
    },
  ],
  alternatives: [
    {
      name: "One step at a time",
      summary:
        "Shift every value one place right, put the value that fell off the end at the front, and repeat that k times.",
      complexity: { time: "O(n * k)", space: "O(1)" },
      python: `def rotate_array(nums: list[int], k: int) -> list[int]:
    n = len(nums)
    for _ in range(k % n):
        last = nums[n - 1]
        for i in range(n - 1, 0, -1):
            nums[i] = nums[i - 1]
        nums[0] = last
    return nums`,
      java: `public int[] rotateArray(int[] nums, int k) {
    int n = nums.length;
    for (int step = 0; step < k % n; step++) {
        int last = nums[n - 1];
        for (int i = n - 1; i > 0; i--) nums[i] = nums[i - 1];
        nums[0] = last;
    }
    return nums;
}`,
      cpp: `vector<int> rotateArray(vector<int> nums, int k) {
    int n = (int)nums.size();
    for (int step = 0; step < k % n; step++) {
        int last = nums[n - 1];
        for (int i = n - 1; i > 0; i--) nums[i] = nums[i - 1];
        nums[0] = last;
    }
    return nums;
}`,
    },
    {
      name: "Copy into a second array",
      summary:
        "Every value's destination is known up front: nums[i] belongs at (i + k) % n. Write each one there in a new array, then copy that back.",
      complexity: { time: "O(n)", space: "O(n)" },
      whyNow:
        "Shifting by one rewrites all n values k times over, which is 10^10 writes at the stated limits. The destination of a value never depended on the steps in between — (i + k) % n names it directly, so one pass places everything, at the cost of a full-size scratch array.",
      python: `def rotate_array(nums: list[int], k: int) -> list[int]:
    n = len(nums)
    moved = [0] * n
    for i in range(n):
        moved[(i + k) % n] = nums[i]
    for i in range(n):
        nums[i] = moved[i]
    return nums`,
      java: `public int[] rotateArray(int[] nums, int k) {
    int n = nums.length;
    int[] moved = new int[n];
    for (int i = 0; i < n; i++) moved[(i + k) % n] = nums[i];
    for (int i = 0; i < n; i++) nums[i] = moved[i];
    return nums;
}`,
      cpp: `vector<int> rotateArray(vector<int> nums, int k) {
    int n = (int)nums.size();
    vector<int> moved(n, 0);
    for (int i = 0; i < n; i++) moved[(i + k) % n] = nums[i];
    for (int i = 0; i < n; i++) nums[i] = moved[i];
    return nums;
}`,
    },
    {
      name: "Cut and rejoin",
      summary:
        "A rotation is two blocks swapping places. Take the last k values, put the first n - k after them, and that is the answer — two bulk copies, no per-element arithmetic.",
      complexity: { time: "O(n)", space: "O(n)" },
      whyNow:
        "The formula version computes an index for every single element, and writing (i - k) % n by mistake rotates the wrong way — a bug that still passes on a palindrome. Naming the two blocks says what a rotation IS, so the direction is visible in the code instead of hidden in a modulo.",
      python: `def rotate_array(nums: list[int], k: int) -> list[int]:
    n = len(nums)
    k %= n
    nums[:] = nums[n - k:] + nums[: n - k]
    return nums`,
      java: `public int[] rotateArray(int[] nums, int k) {
    int n = nums.length;
    k %= n;
    int[] out = new int[n];
    for (int i = 0; i < k; i++) out[i] = nums[n - k + i];
    for (int i = 0; i < n - k; i++) out[k + i] = nums[i];
    return out;
}`,
      cpp: `vector<int> rotateArray(vector<int> nums, int k) {
    int n = (int)nums.size();
    k %= n;
    vector<int> out(nums.begin() + (n - k), nums.end());
    out.insert(out.end(), nums.begin(), nums.begin() + (n - k));
    return out;
}`,
    },
    {
      name: "Cyclic replacements",
      summary:
        "Carry one value to its destination, pick up whatever was there, and carry that on. Each chain closes back where it started; start a new chain until all n values have moved.",
      complexity: { time: "O(n)", space: "O(1)" },
      whyNow:
        "Both copying versions allocate a second array as large as the input, which the follow-up forbids. Following the chain i -> (i + k) % n moves each value straight to its slot with only one value held aside — but the chain closes early when k and n share a factor, so it has to be restarted gcd(n, k) times.",
      python: `def rotate_array(nums: list[int], k: int) -> list[int]:
    n = len(nums)
    k %= n
    moved = 0
    start = 0
    while moved < n:
        i = start
        carry = nums[start]
        while True:
            j = (i + k) % n
            nums[j], carry = carry, nums[j]
            i = j
            moved += 1
            if i == start:
                break
        start += 1
    return nums`,
      java: `public int[] rotateArray(int[] nums, int k) {
    int n = nums.length;
    k %= n;
    int moved = 0;
    for (int start = 0; moved < n; start++) {
        int i = start;
        int carry = nums[start];
        do {
            int j = (i + k) % n;
            int t = nums[j];
            nums[j] = carry;
            carry = t;
            i = j;
            moved++;
        } while (i != start);
    }
    return nums;
}`,
      cpp: `vector<int> rotateArray(vector<int> nums, int k) {
    int n = (int)nums.size();
    k %= n;
    int moved = 0;
    for (int start = 0; moved < n; start++) {
        int i = start;
        int carry = nums[start];
        do {
            int j = (i + k) % n;
            int t = nums[j];
            nums[j] = carry;
            carry = t;
            i = j;
            moved++;
        } while (i != start);
    }
    return nums;
}`,
    },
  ],
}
