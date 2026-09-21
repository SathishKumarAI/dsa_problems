import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "pair-sum",
  title: "Pair With Target Sum",
  pattern: "arrays-hashing",
  difficulty: "easy",
  leetcode: "two-sum",
  brief: "Find two indices whose values add up to a target.",
  statement:
    "Given an integer array nums and an integer target, return the indices of two distinct elements whose sum equals target. Assume exactly one such pair exists.",
  constraints: [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "-10^9 <= target <= 10^9",
    "exactly one valid pair exists, and an element may not be paired with itself",
  ],
  examples: [
    {
      input: "nums = [3, 6, 1, 5], target = 8",
      output: "[0, 3]",
      note: "3 + 5 = 8, at indices 0 and 3.",
    },
    { input: "nums = [2, 2], target = 4", output: "[0, 1]" },
  ],
  hints: [
    "Brute force checks every pair — O(n²). What single question do you ask when standing on nums[i]?",
    'The question is: "have I already seen target - nums[i]?" A hash map answers that in O(1).',
    "Store value → index as you scan. Check for the complement before inserting the current value, so you never pair an element with itself.",
  ],
  // THE FIVE FIELDS (docs/PROBLEM-PAGE-PLAYBOOK.md). `unlocks` is lifted from
  // the teaching document's constraints table; the figures are authored here,
  // because a number in a sentence is not a number a chart may assume.
  unlocks: [
    {
      constraint: "2 <= nums.length <= 10^4",
      what: "Ten thousand elements is fifty million pairs \u2014 about 5\u00b710\u2077 comparisons, which a modern machine finishes in well under a second. This bound does NOT rule brute force out, and saying so is the honest version: the quadratic rung passes here. What rules it out is the same shape one size up, where 10\u2075 elements give 5\u00b710\u2079.",
      figure: {
        kind: "quantities",
        unit: "ops",
        items: [
          { label: "every pair, n = 10^4", value: 5e7, tone: "plain" },
          {
            label: "every pair at n = 10^5, the next size up",
            value: 5e9,
            tone: "bad",
          },
          { label: "one pass, n = 10^4", value: 1e4, tone: "good" },
        ],
      },
    },
    {
      constraint: "-10^9 <= nums[i] <= 10^9",
      what: "Two billion possible values against at most ten thousand actual ones. That is the argument against indexing by value \u2014 a slot per possible value is two billion slots to hold 10\u2074 numbers \u2014 and the argument for a structure that pays for what it stores rather than for what it might store. It also means two values can overflow 32-bit arithmetic when added: subtracting is safe, adding needs a long in Java and C++.",
      figure: {
        kind: "span",
        from: "-10^9",
        to: "10^9",
        marks: [3, 17, 24, 41, 55, 62, 78, 91],
        note: "eight of the ten thousand values you actually hold, on the two billion the range allows. The hatched gaps are what indexing by value would be paying for.",
      },
    },
    {
      constraint: "-10^9 <= target <= 10^9",
      what: "The target can be negative and so can the values, which kills every approach that assumes the running sum grows as you move right. No window, no early exit on the sum being already too large \u2014 those arguments need non-negative values, and this line is the problem saying it will not give you them.",
    },
    {
      constraint:
        "exactly one valid pair exists, and an element may not be paired with itself",
      what: "Two promises for the price of one. ONE pair means you may return the moment you find it and never think about ties. NOT ITSELF is the one that bites: it is why the lookup must come before the insert. Record the current value first and an element worth exactly half the target pairs with its own index \u2014 [3, 4] with target 6 returns [0, 0], which is wrong and passes every example that has no such element.",
      figure: {
        kind: "cells",
        values: ["3", "4"],
        caption:
          "target = 6. Record the 3, then ask for 6 \u2212 3: the answer is the index you just wrote. Ask first and it is correctly absent.",
      },
    },
  ],
  // `checks` is the only genuinely new writing on this page: comprehension of
  // the STATEMENT, asked before the hints start giving the approach away.
  checks: [
    {
      ask: "What does the function return?",
      options: [
        "The two values that add up to the target",
        "The two indices of those values",
        "True or false, whether such a pair exists",
        "How many pairs add up to the target",
      ],
      answer: 1,
      because:
        "The statement says to return the INDICES of two distinct elements. That one word decides the whole page: reordering the array throws the indices away, so any approach that sorts has to carry them alongside \u2014 which is what makes the sorted rung cost more than it first looks.",
    },
    {
      ask: "The array is NOT sorted, and values can be negative. Which of these does that rule out?",
      options: [
        "Remembering values you have already passed",
        "Stopping as soon as a pair is found",
        "Walking two pointers inward from the ends of nums as given",
        "Returning the two indices in either order",
      ],
      answer: 2,
      because:
        "Walking inward from both ends rests on order: if the sum is too small, only the left end can help. On unsorted input that comparison says nothing at all. The technique is still available \u2014 after paying to sort \u2014 and that price is exactly what the ladder measures.",
    },
    {
      ask: "nums = [3, 4], target = 6. What must an approach NOT do?",
      options: [
        "Return [0, 1]",
        "Use the 3 at index 0 twice",
        "Look at the 4 at all",
        "Return an empty answer",
      ],
      answer: 1,
      because:
        "3 + 3 = 6, so a scan that records the current value before asking for its complement finds the entry it just wrote and returns [0, 0]. The statement forbids pairing an element with itself, and the fix is an ordering rule rather than a special case: ask first, record after.",
    },
  ],
  reading: [
    {
      title: "Two Integer Sum \u2014 NeetCode",
      href: "https://neetcode.io/problems/two-integer-sum",
      kind: "course",
      note: "A video walkthrough of the same three rungs. Watch it AFTER the checks above \u2014 it states the map approach in the first two minutes.",
    },
    {
      title: "Two pointers technique \u2014 GeeksforGeeks",
      href: "https://www.geeksforgeeks.org/dsa/two-pointers-technique/",
      kind: "reference",
      note: "The middle rung on its own, without the index-carrying this problem forces on it. Read it for the termination argument: the gap shrinks every iteration.",
    },
    {
      title: "Python: time complexity of dict operations",
      href: "https://wiki.python.org/moin/TimeComplexity",
      kind: "docs",
      note: "Where the O(1) per lookup on this page comes from, and the worst case it hides \u2014 the one honest asterisk on the top rung.",
    },
  ],
  costWhy:
    "One pass over n elements, and inside it exactly two operations on [[hash map|the map]]: one lookup for target \u2212 x and one insert of x. Both are O(1) on average, so the time is linear in the number of elements EXAMINED, which the early return often makes far fewer than n. The space is the map itself: in the worst case every element is stored before the pair is found, which is n entries, and that is the whole price of not sorting. The asterisk, stated rather than buried: those operations are O(1) EXPECTED, not worst case \u2014 keys chosen adversarially can [[collision|collide]] and degrade a lookup to O(n).",
  arc: "Every step follows one idea applied twice: do not redo work you do not need to. Brute force re-scans the array for every element, so you reorder it to make the scan directional — sort, then converge [[two pointers]] — and the cost drops to the sort. Then you notice the sort itself is wasted, because the question never needed order, only 'have I seen this value before', which a [[hash map]] answers in one step without touching order at all. That is the whole progression: unordered scan, imposed order, remembered values. Know brute force, the one-pass hash map and the sort-plus-two-pointer shape cold — those three cover most pair and sum follow-ups, and the two-pointer version is the one that survives when the array arrives already sorted.",
  whyNow:
    "The sort exists only to make searching fast, and the question is not a comparison at all: it is whether the value target - x is present, and where. That is a lookup, which a map answers in one step with no ordering. Sorting also destroys the indices the answer is made of, so they have to be carried along separately.",
  approach:
    "Walk the array once, keeping a map from value to index. At each element, compute the complement target - nums[i]. If the complement is already in the map, the current index and the stored index are the answer. Otherwise record the current value and move on. One pass, one lookup and one insert per element.",
  complexity: { time: "O(n)", space: "O(n)" },
  python: `def pair_sum(nums: list[int], target: int) -> list[int]:
    seen: dict[int, int] = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i
    return []`,
  java: `public int[] pairSum(int[] nums, int target) {
    Map<Integer, Integer> seen = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int need = target - nums[i];
        if (seen.containsKey(need)) return new int[]{seen.get(need), i};
        seen.put(nums[i], i);
    }
    return new int[0];
}`,
  cpp: `vector<int> pairSum(const vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < (int)nums.size(); i++) {
        auto it = seen.find(target - nums[i]);
        if (it != seen.end()) return {it->second, i};
        seen[nums[i]] = i;
    }
    return {};
}`,
  alternatives: [
    {
      name: "Brute force",
      summary:
        "Check every pair until one sums to the target. No memory, nothing to get wrong, and the right thing to say first in an interview — but it re-reads the whole array for every element, asking a question it has already asked n times. On the 10^4 upper bound that is fifty million pairs to find one.",
      complexity: { time: "O(n²)", space: "O(1)" },
      costWhy:
        "Element 0 is compared against the n \u2212 1 after it, element 1 against n \u2212 2, and so on down to one \u2014 which sums to n(n \u2212 1)/2, about n\u00b2/2. Halving does not change the class. At the ceiling of 10\u2074 that is 5\u00b710\u2077 comparisons, and that number is worth carrying because it PASSES here: this rung is slow, not impossible, and the same argument at 10\u2075 is what makes it impossible elsewhere. Nothing is stored beyond two loop counters, so the space is O(1).",
      python: `def pair_sum(nums: list[int], target: int) -> list[int]:
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
      java: `public int[] pairSum(int[] nums, int target) {
    for (int i = 0; i < nums.length; i++)
        for (int j = i + 1; j < nums.length; j++)
            if (nums[i] + nums[j] == target) return new int[]{i, j};
    return new int[0];
}`,
      cpp: `vector<int> pairSum(const vector<int>& nums, int target) {
    int n = nums.size();
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if (nums[i] + nums[j] == target) return {i, j};
    return {};
}`,
    },
    {
      name: "Sort + two pointers",
      whyNow:
        "Brute force re-reads the whole array for every element, asking the same question n times. Sorting answers it once: on ordered values, comparing the two ends tells you which end can never reach the target, so a single comparison retires a whole row of the table.",
      summary:
        "Sort (value, index) pairs and run the converging-pointer scan. Beats brute force, but sorting costs the O(n log n) and the original indices must be carried along — the hash map wins on both counts.",
      complexity: { time: "O(n log n)", space: "O(n)" },
      costWhy:
        "Two costs, and separating them is this rung\u2019s lesson. RESTRUCTURING \u2014 the sort \u2014 is O(n log n) and dominates everything after it. SEARCHING \u2014 the converging walk \u2014 is O(n), because every step retires one end and the [[two pointers]] cross the array once between them. So making the walk faster buys nothing: the only way forward is to stop sorting. The O(n) space is not the sort itself but the index array it forces, because ordering the values destroys the indices the answer is made of.",
      python: `def pair_sum(nums: list[int], target: int) -> list[int]:
    order = sorted(range(len(nums)), key=lambda k: nums[k])
    i, j = 0, len(nums) - 1
    while i < j:
        s = nums[order[i]] + nums[order[j]]
        if s == target:
            return sorted([order[i], order[j]])
        if s < target:
            i += 1
        else:
            j -= 1
    return []`,
      java: `public int[] pairSum(int[] nums, int target) {
    Integer[] order = new Integer[nums.length];
    for (int k = 0; k < nums.length; k++) order[k] = k;
    Arrays.sort(order, (a, b) -> Integer.compare(nums[a], nums[b]));
    int i = 0, j = nums.length - 1;
    while (i < j) {
        int s = nums[order[i]] + nums[order[j]];
        if (s == target) {
            int[] ans = {order[i], order[j]};
            Arrays.sort(ans);
            return ans;
        }
        if (s < target) i++; else j--;
    }
    return new int[0];
}`,
      cpp: `vector<int> pairSum(const vector<int>& nums, int target) {
    int n = nums.size();
    vector<int> order(n);
    iota(order.begin(), order.end(), 0);
    sort(order.begin(), order.end(), [&](int a, int b) { return nums[a] < nums[b]; });
    int i = 0, j = n - 1;
    while (i < j) {
        int s = nums[order[i]] + nums[order[j]];
        if (s == target) return {min(order[i], order[j]), max(order[i], order[j])};
        if (s < target) i++; else j--;
    }
    return {};
}`,
    },
  ],
}
