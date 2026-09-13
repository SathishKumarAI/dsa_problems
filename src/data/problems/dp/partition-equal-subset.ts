import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "partition-equal-subset",
  title: "Split the Array Into Two Equal Halves",
  pattern: "dp",
  difficulty: "medium",
  leetcode: "partition-equal-subset-sum",
  brief: "Can the values be divided into two groups of equal sum?",
  statement:
    "Given an array of positive integers, decide whether it can be split into two groups whose sums are equal. Every element must go into exactly one group.",
  constraints: [
    "1 <= nums.length <= 200",
    "1 <= nums[i] <= 100, so the total is at most 20 000 — small enough to index by",
    "an ODD total can never be split, which is a one-line rejection before any work",
    "the groups need not be the same size, only the same sum",
  ],
  examples: [
    {
      input: "nums = [1, 5, 11, 5]",
      output: "true",
      note: "[11] against [1, 5, 5].",
    },
    {
      input: "nums = [1, 2, 3, 5]",
      output: "false",
      note: "The total is 11, which is odd — no split can exist.",
    },
  ],
  hints: [
    "If the two groups have equal sums, each one is exactly half the total. So the question is: can any subset reach half?",
    "That turns it into a yes/no reachability question over sums, not a search for the actual groups.",
    "Track which sums are reachable as a row of booleans, and add one number at a time.",
  ],
  whyNow:
    "Trying every subset is 2^n, and almost all of those subsets are distinguishable only by a total the later steps do not care about. Once the question is 'which sums are reachable', two subsets with the same sum are the same state — so the exponential collapses into one boolean per sum, bounded by the total rather than by the number of elements.",
  arc:
    "One reframing does all the work: stop asking which elements go in which group and start asking which SUMS are reachable. Two subsets with the same total are indistinguishable from there on, so the 2^n choice tree collapses into one boolean per sum and the state space becomes the total — at most twenty thousand here — instead of the number of elements. That is the classic subset-sum move, and rejecting an odd total is the free line that comes before it. What decides correctness is the direction of the inner sweep. Update sums DOWNWARD so a sum marked by the current number is not read again in the same pass; go upward and the number gets reused within one pass, which silently solves the unbounded version rather than this one. Know the 0/1 knapsack shape and know which way the loop runs, because coin-change-II, target sum and every 'can I hit exactly this total' question are this row swept in one of the two directions.",
  approach:
    "Reject an odd total immediately, then ask whether any subset sums to half of it. Keep a row of booleans over sums 0..target, seeded with sum 0 reachable by taking nothing. For each number, mark every sum that becomes reachable by adding it. Walk that update DOWNWARD: going upward would let the same number be used twice in one pass, because a sum just marked would be read again in the same sweep. That direction is the entire correctness argument, and reversing it silently turns this into the unbounded version of the problem.",
  complexity: { time: "O(n · total)", space: "O(total)" },
  python: `def can_partition(nums: list[int]) -> bool:
    total = sum(nums)
    if total % 2 == 1:
        return False
    target = total // 2
    reachable = [False] * (target + 1)
    reachable[0] = True
    for x in nums:
        for s in range(target, x - 1, -1):
            if reachable[s - x]:
                reachable[s] = True
    return reachable[target]`,
  java: `public boolean canPartition(int[] nums) {
    int total = 0;
    for (int x : nums) total += x;
    if (total % 2 == 1) return false;
    int target = total / 2;
    boolean[] reachable = new boolean[target + 1];
    reachable[0] = true;
    for (int x : nums) {
        for (int s = target; s >= x; s--) {
            if (reachable[s - x]) reachable[s] = true;
        }
    }
    return reachable[target];
}`,
  cpp: `bool canPartition(const vector<int>& nums) {
    int total = 0;
    for (int x : nums) total += x;
    if (total % 2 == 1) return false;
    int target = total / 2;
    vector<char> reachable(target + 1, 0);
    reachable[0] = 1;
    for (int x : nums) {
        for (int s = target; s >= x; s--) {
            if (reachable[s - x]) reachable[s] = 1;
        }
    }
    return reachable[target] != 0;
}`,
  alternatives: [
    {
      name: "Try every subset",
      summary:
        "Recurse over the elements, taking or skipping each, and report whether any combination reaches half the total.",
      complexity: { time: "O(2^n)", space: "O(n)" },
      python: `def walk(nums: list[int], at: int, remaining: int) -> bool:
    if remaining == 0:
        return True
    if at == len(nums) or remaining < 0:
        return False
    return walk(nums, at + 1, remaining - nums[at]) or walk(nums, at + 1, remaining)


def can_partition(nums: list[int]) -> bool:
    total = sum(nums)
    if total % 2 == 1:
        return False
    return walk(nums, 0, total // 2)`,
      java: `public boolean walk(int[] nums, int at, int remaining) {
    if (remaining == 0) return true;
    if (at == nums.length || remaining < 0) return false;
    return walk(nums, at + 1, remaining - nums[at]) || walk(nums, at + 1, remaining);
}

public boolean canPartition(int[] nums) {
    int total = 0;
    for (int x : nums) total += x;
    if (total % 2 == 1) return false;
    return walk(nums, 0, total / 2);
}`,
      cpp: `bool walk(const vector<int>& nums, int at, int remaining) {
    if (remaining == 0) return true;
    if (at == (int)nums.size() || remaining < 0) return false;
    return walk(nums, at + 1, remaining - nums[at]) || walk(nums, at + 1, remaining);
}

bool canPartition(const vector<int>& nums) {
    int total = 0;
    for (int x : nums) total += x;
    if (total % 2 == 1) return false;
    return walk(nums, 0, total / 2);
}`,
    },
  ],
}
