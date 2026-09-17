import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "contains-duplicate",
  title: "Any Repeat in the Array?",
  pattern: "arrays-hashing",
  difficulty: "easy",
  leetcode: "contains-duplicate",
  brief: "True if any value appears at least twice.",
  statement:
    "Given an integer array, return true if any value appears at least twice, and false if every element is distinct.",
  constraints: [
    "1 <= nums.length <= 10^5",
    "-10^9 <= nums[i] <= 10^9",
    "a single element cannot repeat, so a one-element array is always false",
    "values are unbounded in range but bounded in count — there is no room to index by value",
  ],
  examples: [
    { input: "nums = [1, 2, 3, 1]", output: "true", note: "1 appears twice." },
    { input: "nums = [1, 2, 3, 4]", output: "false", note: "All distinct." },
  ],
  // What each bound BUYS. Lifted from this problem's own teaching document
  // (`docs/deep/contains-duplicate_explained.md`, "The constraints, and what
  // each one unlocks") — the same content, two thousand words earlier, where
  // the bound is actually on screen.
  unlocks: [
    {
      constraint: "1 <= nums.length <= 10^5",
      what: "A hundred thousand elements makes O(n²) about 5·10⁹ comparisons. This is the bound that rules brute force out — it demands O(n log n) or better.",
      // The work at the ceiling, which is what the bound actually decides.
      // Log scale: on a linear one the single pass is 0.002% of the row — an
      // invisible sliver, which draws the opposite of the lesson.
      figure: {
        kind: "quantities",
        // these are COMPARISONS, so the figure may price them in seconds
        unit: "ops",
        items: [
          { label: "every pair", value: 5e9, tone: "bad" },
          { label: "sort, then sweep", value: 1.7e6, tone: "plain" },
          { label: "one pass", value: 1e5, tone: "good" },
        ],
      },
    },
    {
      constraint: "-10^9 <= nums[i] <= 10^9",
      what: "Values may be negative and span four billion possibilities, so an array with one slot per value is not allocatable. The lookup structure has to take arbitrary integer keys, which is a hash set's job.",
      // Sparsity, drawn. The range is the line; the dots are everything you
      // will actually hold. The empty space between them IS the argument
      // against giving every possible value a slot.
      figure: {
        kind: "span",
        from: "−10⁹",
        to: "10⁹",
        marks: [4, 27, 33, 51, 68, 71, 92],
        note: "a handful of values, anywhere in four billion — the gaps are what you would be paying for",
      },
    },
    {
      constraint:
        "a single element cannot repeat, so a one-element array is always false",
      what: "The base case — and the one an off-by-one gets wrong: a sweep written as nums[i] == nums[i - 1] starting at i = 0 reads position -1.",
      // One cell, and the empty place a neighbour comparison reaches for.
      figure: {
        kind: "cells",
        values: ["?", "7"],
        caption:
          "a repeat needs two positions; index −1 is the one an off-by-one reads",
      },
    },
    {
      constraint:
        "values are unbounded in range but bounded in count — there is no room to index by value",
      what: "At most 10⁵ elements against 2·10⁹ possible values: a structure sized by the DATA is affordable, one sized by the value RANGE is not.",
      // The whole trade in one comparison: what you could see against what you
      // will. Four orders of magnitude, which is why the set is affordable.
      figure: {
        kind: "quantities",
        items: [
          { label: "values you could see", value: 2e9, tone: "bad" },
          { label: "values you will hold", value: 1e5, tone: "good" },
        ],
      },
    },
  ],
  // Read before you solve. Every answer is in the statement or the bounds
  // above it; none of them needs an approach, so none of them can spoil one.
  checks: [
    {
      ask: "What is the question actually asking you to produce?",
      options: [
        "Which value repeats",
        "How many times a value repeats",
        "Whether any value repeats at all",
        "The position of the first repeat",
      ],
      answer: 2,
      because:
        "The statement asks for true if any value appears at least twice — existence, not identity. That is what lets an approach stop reading the moment it finds one: nothing later in the array can change the answer.",
    },
    {
      ask: "nums = [7]. What comes back?",
      options: [
        "true — a value is trivially a repeat of itself",
        "false — a repeat needs two positions",
        "it is undefined; the input is too small",
      ],
      answer: 1,
      because:
        "A repeat means the same value at two different positions, and one element has only one. The bounds say the length is at least 1, so this input is legal and must answer false rather than crash.",
    },
    {
      ask: "Values run from -10^9 to 10^9. What does that bound rule OUT?",
      options: [
        "Sorting the array first",
        "An array with one slot per possible value",
        "Carrying a hash set of what you have seen",
        "Returning as soon as you find a repeat",
      ],
      answer: 1,
      because:
        "Two billion possible values against at most a hundred thousand elements. Indexing by value would allocate a slot for every value that could occur; a set allocates one per value that does.",
    },
  ],
  // This problem's own sources, beside the pattern's reading list. Both are
  // about THIS problem and would be the wrong link on any other problem in
  // arrays-hashing — which is exactly the line between the two lists.
  reading: [
    {
      title: "Check if array contains duplicates — GeeksforGeeks",
      href: "https://www.geeksforgeeks.org/dsa/check-if-the-given-input-contains-duplicates/",
      kind: "reference",
      note: "The same three rungs this page climbs, written out in C++, Java, Python and JavaScript — useful as a second voice on the same ladder, and for the languages this page does not carry.",
    },
    {
      title: "Duplicate Integer — NeetCode",
      href: "https://neetcode.io/problems/duplicate-integer",
      kind: "course",
      note: "A video walkthrough of the same problem. Watch it after you have tried the checks above, not before — it states the set approach in the first minute.",
    },
  ],
  hints: [
    "You do not need to know WHICH value repeats, or how often — only whether one does.",
    "Walk once and remember what you have already seen. What structure answers 'have I seen this?' in constant time?",
    "The moment a value is already in the set, you can return — there is nothing left to learn.",
  ],
  whyNow:
    "Sorting pays O(n log n) to put duplicates next to each other, but adjacency was never the question. A set answers 'seen before?' directly, and the early return means a duplicate near the front costs almost nothing.",
  arc: "The shortest ladder in the set, and a good one to say out loud in an interview: brute force compares every pair, sorting makes duplicates adjacent so one pass finds them, and a hash set answers membership directly. What matters is naming the trade rather than jumping to the set — sorting is O(n log n) but constant extra memory and it leaves the data useful for other questions, while the set is linear time at linear memory and may be the wrong call when memory is the tight resource. The early exit matters too: the answer is decided the moment a repeat appears, so there is no reason to finish the scan. Most 'has a duplicate' variants are this ladder with one extra condition bolted on.",
  approach:
    "Walk the array once carrying a set of the values seen so far. Before adding a value, ask whether it is already there; if it is, the answer is true and the rest of the array is irrelevant. If the walk finishes, every value was distinct. The set costs O(n) memory, which is the price of not having to sort.",
  complexity: { time: "O(n)", space: "O(n)" },
  costWhy:
    "One pass, and inside it one hash lookup and at most one insertion — both O(1) on average — so the time is linear in the number of elements EXAMINED, which the early exit often makes far fewer than n. The space is the set itself: up to n values when everything is distinct, which is the price of not sorting. Strictly the hash operations are O(1) expected, not worst case; adversarially chosen keys can collide and degrade the pass, which is the one theoretical edge sorting keeps.",
  python: `def contains_duplicate(nums: list[int]) -> bool:
    seen = set()
    for x in nums:
        if x in seen:
            return True
        seen.add(x)
    return False`,
  java: `public boolean containsDuplicate(int[] nums) {
    Set<Integer> seen = new HashSet<>();
    for (int x : nums) {
        if (!seen.add(x)) return true;
    }
    return false;
}`,
  cpp: `bool containsDuplicate(const vector<int>& nums) {
    unordered_set<int> seen;
    for (int x : nums) {
        if (seen.count(x)) return true;
        seen.insert(x);
    }
    return false;
}`,
  alternatives: [
    {
      // the act of the same name — keyed so `ladderOf` merges them into one
      // rung and this row's ladder metadata reaches the page (B79)
      key: "brute",
      name: "Brute force",
      summary:
        "Compare every pair of positions and return true the first time two match. No memory at all, and quadratic: on 10^5 distinct values that is five billion comparisons to answer false. Every comparison also forgets what it learned, which is the waste the next two rungs attack from opposite directions.",
      complexity: { time: "O(n²)", space: "O(1)" },
      costWhy:
        "Each of the n starting positions scans the tail after it: n − 1 comparisons, then n − 2, and so on, which sums to about n²/2. Halving it changes nothing — n²/2 is still O(n²). Nothing is stored, so the memory is the two loop counters, and that is the O(1).",
      python: `def contains_duplicate(nums: list[int]) -> bool:
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] == nums[j]:
                return True
    return False`,
      java: `public boolean containsDuplicate(int[] nums) {
    for (int i = 0; i < nums.length; i++) {
        for (int j = i + 1; j < nums.length; j++) {
            if (nums[i] == nums[j]) return true;
        }
    }
    return false;
}`,
      cpp: `bool containsDuplicate(const vector<int>& nums) {
    int n = (int)nums.size();
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (nums[i] == nums[j]) return true;
        }
    }
    return false;
}`,
    },
    {
      // the act of the same name — keyed so `ladderOf` merges them into one
      // rung and this row's ladder metadata reaches the page (B79)
      key: "sort",
      name: "Sort first",
      summary:
        "Sort, then walk once: duplicates, if there are any, must end up side by side. Trades the quadratic scan for n log n and keeps memory constant, but it reorders the caller's array to answer a yes/no question, and it cannot stop early — the sort finishes before the first comparison happens.",
      complexity: { time: "O(n log n)", space: "O(1)" },
      costWhy:
        "Two costs, and naming them apart is this rung's lesson. RESTRUCTURING — the sort — is O(n log n) and dominates. SEARCHING — the single adjacency sweep after it — is only O(n), so improving the sweep buys nothing and the only way forward is to stop sorting. The O(1) space assumes an in-place sort; the Python here copies with sorted(), which is O(n).",
      python: `def contains_duplicate(nums: list[int]) -> bool:
    ordered = sorted(nums)
    for i in range(1, len(ordered)):
        if ordered[i] == ordered[i - 1]:
            return True
    return False`,
      java: `public boolean containsDuplicate(int[] nums) {
    int[] ordered = nums.clone();
    Arrays.sort(ordered);
    for (int i = 1; i < ordered.length; i++) {
        if (ordered[i] == ordered[i - 1]) return true;
    }
    return false;
}`,
      cpp: `bool containsDuplicate(const vector<int>& nums) {
    vector<int> ordered = nums;
    sort(ordered.begin(), ordered.end());
    for (size_t i = 1; i < ordered.size(); i++) {
        if (ordered[i] == ordered[i - 1]) return true;
    }
    return false;
}`,
    },
  ],
}
