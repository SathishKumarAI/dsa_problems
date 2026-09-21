// sorted-pair-sum — the ladder: every way in, worst first.
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
  "Start i at the front, j at the back. If nums[i] + nums[j] is too small, no pair using nums[i] can work with anything left of j (those are smaller still), so advance i. If too big, retreat j by the mirror argument. Each step permanently discards one element, so the walk terminates in n steps."

export const whyNow =
  "The map spends O(n) memory to remember what the ordering already tells you. Two pointers read the same information off the array itself, in constant space."

export const arc =
  "The same question as the unsorted version, with one promise added — and the whole point is what that promise buys. A hash map still works and still costs linear memory; sorted order makes the memory unnecessary, because the sum of the two ends tells you which end is wrong. Too small means the small end must grow, too big means the big end must shrink, and each pointer only ever moves one way, so the scan is linear and constant-space. That is the converging-pointer pattern in its purest form. Learn to spot its precondition — a sorted sequence and a monotone response to moving each end — because it is what unlocks three-sum, container with most water, and every k-sum built on top of them."

export const complexity = { time: "O(n)", space: "O(1)" }

export const python = `def sorted_pair_sum(nums: list[int], target: int) -> list[int]:
    i, j = 0, len(nums) - 1
    while i < j:
        s = nums[i] + nums[j]
        if s == target:
            return [i, j]
        if s < target:
            i += 1
        else:
            j -= 1
    return []`

export const java = `public int[] sortedPairSum(int[] nums, int target) {
    int i = 0, j = nums.length - 1;
    while (i < j) {
        int s = nums[i] + nums[j];
        if (s == target) return new int[] {i, j};
        if (s < target) i++;
        else j--;
    }
    return new int[0];
}`

export const cpp = `vector<int> sortedPairSum(const vector<int>& nums, int target) {
    int i = 0, j = (int)nums.size() - 1;
    while (i < j) {
        int s = nums[i] + nums[j];
        if (s == target) return {i, j};
        if (s < target) i++;
        else j--;
    }
    return {};
}`

export const alternatives: Solution[] = [
  {
    name: "Brute force",
    summary:
      "Try every pair and stop at the one that hits the target. It ignores the one thing this input gives you for free — the order — and it is the baseline the two-pointer answer is measured against.",
    complexity: { time: "O(n²)", space: "O(1)" },
    costWhy:
      "O(n\u00b2) time and O(1) space, counted: every pair once, n(n \u2212 1)/2 additions and comparisons, about 4.5\u00b710\u2078 at the ceiling of 3\u00b710\u2074. Note what it does NOT use \u2014 the sortedness. That is the tell that a better rung exists: an approach that would give the same answer on shuffled input is ignoring something the problem promised.",
    python: `def sorted_pair_sum(nums: list[int], target: int) -> list[int]:
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
    java: `public int[] sortedPairSum(int[] nums, int target) {
    for (int i = 0; i < nums.length; i++)
        for (int j = i + 1; j < nums.length; j++)
            if (nums[i] + nums[j] == target)
                return new int[] {i, j};
    return new int[0];
}`,
    cpp: `vector<int> sortedPairSum(const vector<int>& nums, int target) {
    for (int i = 0; i < (int)nums.size(); i++)
        for (int j = i + 1; j < (int)nums.size(); j++)
            if (nums[i] + nums[j] == target)
                return {i, j};
    return {};
}`,
  },
  {
    name: "Hash map",
    whyNow:
      "The double loop asks whether a partner exists by trying every candidate. One pass with a map answers it in a single lookup - but this is the answer for an unsorted array, and this array is sorted.",
    summary:
      "The unsorted-array solution still works: remember each value's index and look up the complement. Linear, and it spends O(n) memory to ignore the one thing this input hands you free. Sortedness means a comparison tells you about everything you have not looked at, and a map throws that away.",
    complexity: { time: "O(n)", space: "O(n)" },
    costWhy:
      "One pass, one lookup and one insert per element, both O(1) on average \u2014 the same count as the unsorted sibling problem, because this is literally that solution. The O(n) space is [[hash map|the map]], and on this page that is disqualifying rather than merely unfortunate: the statement requires O(1) extra space. Worth keeping on the ladder anyway, as the rung that shows what the sortedness is WORTH \u2014 the same time, none of the memory.",
    python: `def sorted_pair_sum(nums: list[int], target: int) -> list[int]:
    seen: dict[int, int] = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i
    return []`,
    java: `public int[] sortedPairSum(int[] nums, int target) {
    Map<Integer, Integer> seen = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int need = target - nums[i];
        if (seen.containsKey(need)) return new int[] {seen.get(need), i};
        seen.put(nums[i], i);
    }
    return new int[0];
}`,
    cpp: `vector<int> sortedPairSum(const vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < (int)nums.size(); i++) {
        int need = target - nums[i];
        if (seen.count(need)) return {seen[need], i};
        seen[nums[i]] = i;
    }
    return {};
}`,
  },
]

// HOW THE BOUND WAS COUNTED. The page target; each rung carries its own.
export const costWhy =
  "Each iteration moves exactly one pointer, and the two only ever move toward each other, so the gap between them shrinks by one every step: at most n \u2212 1 iterations before they meet. Inside the loop there is one addition and one comparison, both constant. That is the O(n), and it is a stronger statement than it looks \u2014 the walk examines about n of the n(n\u22121)/2 pairs and skips the rest because sortedness PROVES they cannot be the answer, not because it is sampling. The space is two indices, which is the O(1) the statement demands."
