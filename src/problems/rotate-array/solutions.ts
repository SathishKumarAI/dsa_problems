// rotate-array — the ladder: every way in, worst first.
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

export const approach = "Reduce k to k % n, because a rotation by a multiple of n changes nothing. Then reverse the whole array: the last k values are now at the front and the first n - k at the back, which is the right arrangement of blocks with each block written backwards. Reverse the first k, then reverse the rest, and both blocks read forwards again. Three passes over the array with a swap loop, no allocation, and no index formula to get the direction wrong."

export const whyNow = "Cyclic replacements already run in place, but they need a count of how many values have moved (or a gcd) to know how many chains to start, and that bookkeeping is the part people get wrong. Three reversals reach the same arrangement with one primitive applied three times and nothing to count."

export const arc = "Three genuinely different ideas share this ladder: copy into place using modular arithmetic, follow the cycles of the rotation permutation, or reverse three times. The reversal trick is the one to memorise — reverse everything, then reverse the first k and the rest — because it is short, constant-space, and easy to argue: reversing puts the tail in front in the wrong internal order, and the two local reversals repair that. The cyclic version teaches something the reversal hides: a rotation decomposes into gcd(n, k) cycles, which is why a naive single-cycle walk misses elements. And reducing k modulo n first is not a detail — without it, k larger than n does pointless full turns or indexes out of range."

export const complexity = { time: "O(n)", space: "O(1)" }

export const python = `def rotate_array(nums: list[int], k: int) -> list[int]:
    n = len(nums)
    k %= n
    # whole array, then the two blocks the first reverse created
    for lo, hi in ((0, n - 1), (0, k - 1), (k, n - 1)):
        while lo < hi:
            nums[lo], nums[hi] = nums[hi], nums[lo]
            lo += 1
            hi -= 1
    return nums`

export const java = `public int[] rotateArray(int[] nums, int k) {
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
}`

export const cpp = `vector<int> rotateArray(vector<int> nums, int k) {
    int n = (int)nums.size();
    k %= n;
    for (int lo = 0, hi = n - 1; lo < hi; lo++, hi--) swap(nums[lo], nums[hi]);
    for (int lo = 0, hi = k - 1; lo < hi; lo++, hi--) swap(nums[lo], nums[hi]);
    for (int lo = k, hi = n - 1; lo < hi; lo++, hi--) swap(nums[lo], nums[hi]);
    return nums;
}`

export const alternatives: Solution[] = [
  {
    name: "One step at a time",
    summary:
      "Shift every value one place right, move the one that fell off to the front, and do that k times. Faithful to the word 'rotate' and disastrous: n·k work, so a k near n is quadratic — and all of it recomputed, since every value's final home was knowable before the first shift.",
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
      "Every value's destination is known up front — nums[i] belongs at (i + k) % n — so write each one there in a fresh array and copy it back. Linear and clear, and the cost is the second array: n extra slots to express a permutation the array can perform on itself.",
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
]
