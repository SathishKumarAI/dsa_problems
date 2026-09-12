import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "max-product-subarray",
  title: "The Best Product a Run Can Make",
  pattern: "dp",
  difficulty: "medium",
  leetcode: "maximum-product-subarray",
  brief: "Find the largest product of any contiguous run — negatives and zeros included.",
  statement:
    "Given an integer array, return the largest product achievable by multiplying together the values of one contiguous, non-empty run.",
  constraints: [
    "1 <= nums.length <= 2 · 10^4",
    "-10 <= nums[i] <= 10, and every prefix product fits in a 32-bit integer",
    "the run must be contiguous and non-empty, so the answer is at least the largest single value",
    "a negative value FLIPS the ranking: the worst product so far becomes the best when multiplied by it, which is what separates this from the sum version",
    "a zero cuts the array — no run may cross it — and restarts both running products",
  ],
  examples: [
    {
      input: "nums = [2, 3, -2, 4]",
      output: "6",
      note: "2 × 3. Extending across the -2 makes it negative.",
    },
    {
      input: "nums = [-2, 0, -1]",
      output: "0",
      note: "The zero is itself a legal one-element run, and it beats both negatives.",
    },
    {
      input: "nums = [-2, 3, -4]",
      output: "24",
      note: "The whole array: two negatives cancel. Tracking only the best product so far misses this — the MOST NEGATIVE product is what turns into the answer.",
    },
  ],
  hints: [
    "The sum version works because extending a run can only help or hurt in one direction. Multiplication breaks that: a negative reverses which running value is worth keeping.",
    "So carry two numbers at each index — the best product of a run ending here, and the worst.",
    "When the current value is negative, swap them before extending: the worst becomes the best.",
  ],
  whyNow:
    "The two prefix sweeps are linear and correct, but they need the array twice and the argument for why 'scan left, scan right, take the best' finds the answer is a proof about where zeros and sign changes sit — it is a trick that works rather than a rule you can restate. Carrying the best AND the worst product ending at the current index says the reason out loud: a negative swaps them. One pass, two numbers, and the recurrence explains itself.",
  arc:
    "This problem exists to break a habit. Kadane's algorithm works for sums because extending a run can only be better or worse in one direction; multiplication has a sign, and a negative number reverses which running value is worth keeping. The fix is not a bigger table but a second variable — carry the WORST product as well as the best, and let a negative swap them. The general lesson is worth more than the problem: when a running quantity is not monotone under the operation you are applying, carry the extremes on both sides. The same move solves maximum product of three numbers and several sign-flipping interval problems. Know that the value alone is always one of the candidates, too — that is what restarts a run after a zero, without a single special case.",
  approach:
    "Walk once, carrying the best and the worst product of a run ending at the current index. At each value, the new best is the largest of the value alone, best × value and worst × value; the new worst is the smallest of the same three. Taking the value alone is what restarts a run after a zero; including the worst is what catches a pair of negatives. Track the maximum best ever seen and return it.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def max_product(nums: list[int]) -> int:
    best = worst = answer = nums[0]
    for x in nums[1:]:
        # x alone restarts the run — that is how a zero is escaped
        candidates = (x, best * x, worst * x)
        best, worst = max(candidates), min(candidates)
        answer = max(answer, best)
    return answer`,
  java: `public int maxProduct(int[] nums) {
    int best = nums[0], worst = nums[0], answer = nums[0];
    for (int i = 1; i < nums.length; i++) {
        int x = nums[i];
        int a = x, b = best * x, c = worst * x;
        best = Math.max(a, Math.max(b, c));
        worst = Math.min(a, Math.min(b, c));
        answer = Math.max(answer, best);
    }
    return answer;
}`,
  cpp: `int maxProduct(vector<int> nums) {
    int best = nums[0], worst = nums[0], answer = nums[0];
    for (int i = 1; i < (int)nums.size(); i++) {
        int x = nums[i];
        int a = x, b = best * x, c = worst * x;
        best = max(a, max(b, c));
        worst = min(a, min(b, c));
        answer = max(answer, best);
    }
    return answer;
}`,
  walkthrough: [
    {
      cells: {
        values: [-2, 3, -4],
        marks: { 0: "focus" },
        labels: { 0: "both -2" },
      },
      caption:
        "Starting on -2, the only run ending here is the value itself, so it is both the best and the worst product. Answer so far: -2.",
    },
    {
      cells: {
        values: [-2, 3, -4],
        marks: { 0: "done", 1: "focus" },
        labels: { 1: "3 / -6" },
      },
      caption:
        "At 3 the three candidates are 3 alone, -2 × 3 = -6 and the same -6. Best becomes 3, worst -6 — and that -6 is the value worth keeping for later.",
    },
    {
      cells: {
        values: [-2, 3, -4],
        marks: { 0: "done", 1: "done", 2: "focus" },
        labels: { 2: "24" },
      },
      caption:
        "At -4 the candidates are -4, 3 × -4 = -12 and -6 × -4 = 24. The WORST product became the best: two negatives cancelled. Answer: 24.",
    },
    {
      cells: {
        values: [-2, 0, -1],
        marks: { 1: "compare" },
        labels: { 1: "restart" },
      },
      caption:
        "The zero case: every candidate through a zero is 0, and the value-alone candidate restarts the run after it — so nothing carries a stale product across the cut.",
    },
    {
      cells: {
        values: [-2, 0, -1],
        marks: { 0: "done", 1: "done", 2: "done" },
      },
      caption:
        "The best product here is the zero itself: a one-element run is legal, and it beats both negatives.",
    },
  ],
  alternatives: [
    {
      name: "Multiply out every run",
      summary:
        "Two nested loops over start and end, multiplying the values of each run from scratch and keeping the largest product seen.",
      complexity: { time: "O(n³)", space: "O(1)" },
      python: `def max_product(nums: list[int]) -> int:
    answer = nums[0]
    for start in range(len(nums)):
        for end in range(start, len(nums)):
            product = 1
            for k in range(start, end + 1):
                product *= nums[k]
            answer = max(answer, product)
    return answer`,
      java: `public int maxProduct(int[] nums) {
    int answer = nums[0];
    for (int start = 0; start < nums.length; start++) {
        for (int end = start; end < nums.length; end++) {
            int product = 1;
            for (int k = start; k <= end; k++) product *= nums[k];
            answer = Math.max(answer, product);
        }
    }
    return answer;
}`,
      cpp: `int maxProduct(vector<int> nums) {
    int answer = nums[0];
    int n = (int)nums.size();
    for (int start = 0; start < n; start++) {
        for (int end = start; end < n; end++) {
            int product = 1;
            for (int k = start; k <= end; k++) product *= nums[k];
            answer = max(answer, product);
        }
    }
    return answer;
}`,
    },
    {
      name: "Grow each run in place",
      summary:
        "Same pairs of endpoints, but the product of a run is carried as the end moves instead of being recomputed: one multiplication per extension.",
      complexity: { time: "O(n²)", space: "O(1)" },
      whyNow:
        "The innermost loop recomputes a product the loop before it already had — extending a run by one value is one multiplication, not a fresh pass over the run. Dropping that loop costs nothing in clarity and removes a whole factor of n.",
      python: `def max_product(nums: list[int]) -> int:
    answer = nums[0]
    for start in range(len(nums)):
        product = 1
        for end in range(start, len(nums)):
            product *= nums[end]
            answer = max(answer, product)
    return answer`,
      java: `public int maxProduct(int[] nums) {
    int answer = nums[0];
    for (int start = 0; start < nums.length; start++) {
        int product = 1;
        for (int end = start; end < nums.length; end++) {
            product *= nums[end];
            answer = Math.max(answer, product);
        }
    }
    return answer;
}`,
      cpp: `int maxProduct(vector<int> nums) {
    int answer = nums[0];
    int n = (int)nums.size();
    for (int start = 0; start < n; start++) {
        int product = 1;
        for (int end = start; end < n; end++) {
            product *= nums[end];
            answer = max(answer, product);
        }
    }
    return answer;
}`,
    },
    {
      name: "Prefix products, both directions",
      summary:
        "Sweep left to right multiplying a running product (reset to 1 after a zero) and keep the best; then sweep right to left the same way. The larger of the two is the answer.",
      complexity: { time: "O(n)", space: "O(1)" },
      whyNow:
        "The quadratic version still re-reads every suffix of every start. The insight that removes the second loop: the best run is bounded by zeros, and inside a zero-free block the product of the WHOLE block is either the answer or becomes it once one end is trimmed — and trimming from one end is what a one-directional prefix sweep already tries.",
      python: `def max_product(nums: list[int]) -> int:
    answer = nums[0]
    product = 1
    for x in nums:
        product *= x
        answer = max(answer, product)
        if product == 0:
            product = 1          # a zero ends every run through it
    product = 1
    for x in reversed(nums):
        product *= x
        answer = max(answer, product)
        if product == 0:
            product = 1
    return answer`,
      java: `public int maxProduct(int[] nums) {
    int answer = nums[0];
    int product = 1;
    for (int i = 0; i < nums.length; i++) {
        product *= nums[i];
        answer = Math.max(answer, product);
        if (product == 0) product = 1;
    }
    product = 1;
    for (int i = nums.length - 1; i >= 0; i--) {
        product *= nums[i];
        answer = Math.max(answer, product);
        if (product == 0) product = 1;
    }
    return answer;
}`,
      cpp: `int maxProduct(vector<int> nums) {
    int answer = nums[0];
    int product = 1;
    for (int i = 0; i < (int)nums.size(); i++) {
        product *= nums[i];
        answer = max(answer, product);
        if (product == 0) product = 1;
    }
    product = 1;
    for (int i = (int)nums.size() - 1; i >= 0; i--) {
        product *= nums[i];
        answer = max(answer, product);
        if (product == 0) product = 1;
    }
    return answer;
}`,
    },
  ],
}
