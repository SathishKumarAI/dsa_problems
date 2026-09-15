// single-number — the ladder: every way in, worst first.
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

export const approach = "Fold the array with XOR. Because x ^ x = 0 and the operation is commutative and associative, every paired value cancels regardless of position, leaving the single value in the accumulator. One pass, one integer of state. The trick leans entirely on the promise that exactly one value is unpaired."

export const whyNow = "Sorting spends O(n log n) arranging data whose ORDER the answer never uses. The only fact that matters is that pairs cancel, and XOR cancels them in place: one pass, one integer of state, no rearrangement."

export const arc = "Three rungs, three different ideas about what to remember. A hash map remembers everything and throws almost all of it away. Sorting remembers nothing but pays to impose order the question never asked for. XOR remembers exactly one number, because the operation itself cancels pairs: a ^ a is zero, zero ^ x is x, and order does not matter. That is the lesson worth keeping — when duplicates come in pairs and you need the odd one out, reach for an operation with an inverse rather than for a container. Know why XOR is safe here (commutative, associative, self-inverse) because the follow-ups change the pairing to threes, where XOR alone stops working and bit counting takes over."

export const complexity = { time: "O(n)", space: "O(1)" }

export const python = `def single_number(nums: list[int]) -> int:
    acc = 0
    for x in nums:
        acc ^= x
    return acc`

export const java = `public int singleNumber(int[] nums) {
    int acc = 0;
    for (int x : nums) acc ^= x;
    return acc;
}`

export const cpp = `int singleNumber(const vector<int>& nums) {
    int acc = 0;
    for (int x : nums) acc ^= x;
    return acc;
}`

export const alternatives: Solution[] = [
  {
    name: "Hash map",
    summary:
      "Count every value, then return the one whose count is 1. Linear and obvious, and it pays O(n) memory to store 'appears twice' for every value in the array — facts the answer never reads. That is exactly the extra space the follow-up question forbids.",
    complexity: { time: "O(n)", space: "O(n)" },
    python: `def single_number(nums: list[int]) -> int:
    counts: dict[int, int] = {}
    for x in nums:
        counts[x] = counts.get(x, 0) + 1
    for x, c in counts.items():
        if c == 1:
            return x
    return -1`,
    java: `public int singleNumber(int[] nums) {
    Map<Integer, Integer> counts = new HashMap<>();
    for (int x : nums) counts.merge(x, 1, Integer::sum);
    for (Map.Entry<Integer, Integer> e : counts.entrySet())
        if (e.getValue() == 1) return e.getKey();
    return -1;
}`,
    cpp: `int singleNumber(const vector<int>& nums) {
    unordered_map<int, int> counts;
    for (int x : nums) counts[x]++;
    for (auto& [x, c] : counts)
        if (c == 1) return x;
    return -1;
}`,
  },
  {
    name: "Sort & scan",
    whyNow:
      "The map counts every value in order to find the one whose count is odd: n entries of bookkeeping for a single answer, which is exactly the O(n) space the follow-up forbids. Sorting puts twins next to each other instead, so the pairing becomes visible without storing anything.",
    summary:
      "Sort, so twins land next to each other, then walk in steps of two until a pair fails to match. Memory drops to nothing, but n log n is spent arranging the whole array to expose a fact about pairing — and it rearranges the caller's data to do it.",
    complexity: { time: "O(n log n)", space: "O(1)" },
    python: `def single_number(nums: list[int]) -> int:
    s = sorted(nums)
    for i in range(0, len(s) - 1, 2):
        if s[i] != s[i + 1]:
            return s[i]
    return s[-1]`,
    java: `public int singleNumber(int[] nums) {
    int[] s = nums.clone();
    Arrays.sort(s);
    for (int i = 0; i + 1 < s.length; i += 2)
        if (s[i] != s[i + 1]) return s[i];
    return s[s.length - 1];
}`,
    cpp: `int singleNumber(vector<int> nums) {
    sort(nums.begin(), nums.end());
    for (int i = 0; i + 1 < (int)nums.size(); i += 2)
        if (nums[i] != nums[i + 1]) return nums[i];
    return nums.back();
}`,
  },
]
