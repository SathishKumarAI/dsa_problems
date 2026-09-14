// first-missing-positive — the ladder: every way in, worst first.
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

export const approach = "Two passes over the array itself. First, place every value that could matter: while nums[i] sits in 1..n and is not already in slot nums[i]-1, swap it there. The swap is the trick — the value that lands in position i is examined next, so every swap puts one value permanently home and the total number of swaps is at most n, which keeps the nested while loop linear. The guard nums[nums[i]-1] != nums[i] is what stops a duplicate from swapping with its twin forever. Second, walk the slots: the first i whose value is not i+1 means i+1 was never placed, so return i+1. If every slot is home, 1..n are all present and the answer is n+1."

export const whyNow = "The boolean table is linear in time but still allocates n+1 fresh cells, which is exactly what the O(1)-space follow-up forbids. The input array already has n slots, and nobody needs its original contents once the answer is out — so the marking table can BE the input: send each value v to slot v-1 and the array marks itself."

export const arc = "The constraint that looks like trivia is the whole solution: among n values, the smallest missing positive is always between 1 and n+1, so only n+1 candidates matter and everything else — negatives, huge values, duplicates — is noise. Each rung then narrows where the bookkeeping lives, from a rescan per candidate, to sorting, to a set, to a flag table, and finally into the array itself by swapping each value into the slot it belongs in. Cyclic placement is worth practising because the loop looks dangerous and is not: every swap puts one value home for good, so the total work is linear despite the inner while. Know the bound argument cold — it is the part an interviewer is actually testing."

export const complexity = { time: "O(n)", space: "O(1)" }

export const python = `def first_missing_positive(nums: list[int]) -> int:
    n = len(nums)
    for i in range(n):
        # keep sending the value at i home until i holds junk or is settled
        while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
            j = nums[i] - 1
            nums[i], nums[j] = nums[j], nums[i]
    for i in range(n):
        if nums[i] != i + 1:
            return i + 1
    return n + 1`

export const java = `public int firstMissingPositive(int[] nums) {
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
}`

export const cpp = `int firstMissingPositive(vector<int> nums) {
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
}`

export const alternatives: Solution[] = [
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
      "Pour every value into a set, then probe 1, 2, 3, … until a probe misses. Linear, and it finally uses the fact that the answer cannot exceed n + 1 — but it allocates a second structure the size of the input to record membership, which the array's own slots can encode.",
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
]
