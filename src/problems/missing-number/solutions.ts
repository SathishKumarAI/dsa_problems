// missing-number — the ladder: every way in, worst first.
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

export const approach = "Fold indices and values into one accumulator with XOR. Seed it with n — the one index the loop never visits — then XOR in each index i and each value nums[i]. Every number that is present appears once as a value and once as an index, and x ^ x = 0, so all of them cancel. The missing number appears only as an index, so it is what survives. One pass, one integer of state, and no arithmetic that can overflow."

export const whyNow = "The running total is correct but it builds a number roughly n^2/2 large before subtracting anything, so a fixed-width int can overflow long before the answer comes out. XOR cancels the same pairs without any value ever growing past n."

export const arc = "Five rungs, and they split into two families: find the gap by imposing order (sort, flags, placing each value at its own index) or compute the gap by arithmetic (subtract the sum, or XOR the indices against the values). The arithmetic family is the lesson — when the input is a permutation with one hole, an invariant of the whole set can name the hole without looking for it. Sum is the easiest to derive on the spot; XOR is the one to prefer when overflow is a concern, since it needs no range assumption at all. Being able to produce both, and to say why XOR is safer for very large n, is what makes this a five-minute question rather than a one-minute one."

export const complexity = { time: "O(n)", space: "O(1)" }

export const python = `def missing_number(nums: list[int]) -> int:
    acc = len(nums)  # index n exists in the range but not in the loop
    for i, x in enumerate(nums):
        acc ^= i ^ x
    return acc`

export const java = `public int missingNumber(int[] nums) {
    int acc = nums.length;
    for (int i = 0; i < nums.length; i++) {
        acc ^= i ^ nums[i];
    }
    return acc;
}`

export const cpp = `int missingNumber(const vector<int>& nums) {
    int acc = (int)nums.size();
    for (int i = 0; i < (int)nums.size(); i++) {
        acc ^= i ^ nums[i];
    }
    return acc;
}`

export const alternatives: Solution[] = [
  {
    name: "Sort and scan",
    summary:
      "Sorted, the array should read 0, 1, 2, … so the first index whose value does not match it is the answer. Honest and easy to defend, and it spends n log n imposing an order the question never needed — the answer depends on WHICH values are present, not on their arrangement.",
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
      "Mark each value present in an array of n + 1 flags, then walk 0..n and return the first never set. Linear, and the flags are the thing to notice: they store one bit per value to recover a single number, which the next two rungs get for free from arithmetic the input already satisfies.",
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
      "Swap values around until every one that can sit at its own index does; the first index holding something else is the answer. Constant extra space, and the price is that it rearranges the caller's array — a destructive answer to a read-only question.",
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
      "The numbers 0..n sum to n(n+1)/2, so subtracting what the array actually holds leaves the value that never arrived. One pass, one accumulator, nothing touched — and the one place it can bite is a language where that product overflows before the subtraction happens.",
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
]
