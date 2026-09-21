// product-except-self — the ladder: every way in, worst first.
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
  "Sweep left to right writing into the output the product of everything strictly before each index, carrying a running product. Then sweep right to left with a second running product of everything strictly after, multiplying it into what is already there. Each position ends up holding left × right, which is every element but its own. Nothing is ever divided, so a zero — or two — behaves like any other value rather than being a special case."

export const whyNow =
  "Holding the two prefix arrays makes the idea obvious but keeps 2n numbers alive to read each of them exactly once. The output array can carry the left products while the right sweep folds its running product straight into them, so the same two passes need no storage beyond the answer."

export const arc =
  "Division is banned, and that ban is the whole teaching device: it forces you to find the structure instead of the shortcut. The answer at position i is 'everything to the left' times 'everything to the right', and both of those are running products that can be swept in one pass each — which is the prefix-sum idea with multiplication swapped in. The final rung removes even the second array by reusing the output as the left pass and carrying the right pass in a single variable. That pattern — compute prefixes forward, then fold suffixes backward into the same array — reappears in trapping rain water and in several interval problems. The corner case to rehearse is a zero, which is exactly what the division shortcut cannot survive."

export const complexity = { time: "O(n)", space: "O(1)" }

export const python = `def product_except_self(nums: list[int]) -> list[int]:
    n = len(nums)
    out = [1] * n
    running = 1
    for i in range(n):
        out[i] = running
        running *= nums[i]
    running = 1
    for i in range(n - 1, -1, -1):
        out[i] *= running
        running *= nums[i]
    return out`

export const java = `public int[] productExceptSelf(int[] nums) {
    int n = nums.length;
    int[] out = new int[n];
    int running = 1;
    for (int i = 0; i < n; i++) {
        out[i] = running;
        running *= nums[i];
    }
    running = 1;
    for (int i = n - 1; i >= 0; i--) {
        out[i] *= running;
        running *= nums[i];
    }
    return out;
}`

export const cpp = `vector<int> productExceptSelf(const vector<int>& nums) {
    int n = (int)nums.size();
    vector<int> out(n, 1);
    int running = 1;
    for (int i = 0; i < n; i++) {
        out[i] = running;
        running *= nums[i];
    }
    running = 1;
    for (int i = n - 1; i >= 0; i--) {
        out[i] *= running;
        running *= nums[i];
    }
    return out;
}`

export const alternatives: Solution[] = [
  {
    key: "brute",
    name: "Product of the others, each time",
    costWhy:
      "O(n\u00b2) time and O(1) extra space: for each of n indices, multiply the other n\u22121 values \u2014 about n\u00b2 multiplications, 10^10 at the 10\u2075 ceiling, which is minutes rather than milliseconds. Every one of those products shares almost all of its factors with its neighbour\u2019s, and noticing that the shared part has a one-step recurrence is the move that produces every faster rung on this page.",
    summary:
      "For every index, loop the whole array multiplying everything except that one element. Quadratic, and it recomputes almost the same product n times over — every pair of positions shares all but two of its factors, which is the redundancy the prefix rungs remove.",
    complexity: { time: "O(n²)", space: "O(1)" },
    python: `def product_except_self(nums: list[int]) -> list[int]:
    out = []
    for i in range(len(nums)):
        product = 1
        for j in range(len(nums)):
            if j != i:
                product *= nums[j]
        out.append(product)
    return out`,
    java: `public int[] productExceptSelf(int[] nums) {
    int n = nums.length;
    int[] out = new int[n];
    for (int i = 0; i < n; i++) {
        int prod = 1;
        for (int j = 0; j < n; j++) {
            if (j != i) prod *= nums[j];
        }
        out[i] = prod;
    }
    return out;
}`,
    cpp: `vector<int> productExceptSelf(const vector<int>& nums) {
    int n = (int)nums.size();
    vector<int> out(n);
    for (int i = 0; i < n; i++) {
        int prod = 1;
        for (int j = 0; j < n; j++) {
            if (j != i) prod *= nums[j];
        }
        out[i] = prod;
    }
    return out;
}`,
  },
  // B79. The document works this one through properly rather than skipping
  // it, and the page could not name it. It is not a step toward the answer —
  // it is the move the problem BANS, and the reason it is banned is what
  // points at the structure the prefix rungs exploit. A rung the learner is
  // meant to reach for, try, and understand the failure of.
  {
    key: "division",
    after: "brute",
    name: "Divide the total product",
    costWhy:
      "O(n) time and O(1) extra space \u2014 the best bounds on the page, and not an answer to THIS problem: the statement forbids division. It is on the ladder because its failure is instructive rather than merely disallowed. One zero makes the total product zero and every quotient meaningless, so a working version needs three branches (no zeros, one zero, two or more), and the sweeps need none.",
    whyNow:
      "Brute force recomputes shared factors n times: every pair of positions shares all but two of its factors. Computing the whole product once and removing one factor per position fixes exactly that — and is the move almost everyone reaches for first, which is why it is worth working through rather than skipping.",
    summary:
      "Multiply everything in one pass, then emit each answer by dividing the total by that position's value. Linear on paper, and disqualified twice over: the statement forbids division outright, and a zero has no reciprocal — so the honest version needs a zero COUNT and three separate cases, one zero leaving exactly one surviving slot and two zeroes wiping the whole answer. Working out why the shortcut fails is what shows that the answer only ever needs what is before a position and what is after it.",
    complexity: { time: "O(n)", space: "O(1) beyond the output" },
    python: `def product_except_self(nums: list[int]) -> list[int]:
    zeros = nums.count(0)
    if zeros > 1:  # two zeros leave a zero in every product
        return [0] * len(nums)
    product_of_nonzero = 1
    for x in nums:
        if x != 0:
            product_of_nonzero *= x
    if zeros == 1:  # only the zero's own slot survives
        return [product_of_nonzero if x == 0 else 0 for x in nums]
    return [product_of_nonzero // x for x in nums]  # exact: x divides the product`,
    java: `public int[] productExceptSelf(int[] nums) {
    int n = nums.length;
    int[] out = new int[n];
    int zeros = 0, productOfNonzero = 1;
    for (int x : nums) {
        if (x == 0) zeros++;
        else productOfNonzero *= x;
    }
    for (int i = 0; i < n; i++) {
        if (zeros > 1) out[i] = 0;
        else if (zeros == 1) out[i] = nums[i] == 0 ? productOfNonzero : 0;
        else out[i] = productOfNonzero / nums[i];
    }
    return out;
}`,
    cpp: `vector<int> productExceptSelf(const vector<int>& nums) {
    int n = (int)nums.size();
    vector<int> out(n);
    int zeros = 0, productOfNonzero = 1;
    for (int x : nums) {
        if (x == 0) zeros++;
        else productOfNonzero *= x;
    }
    for (int i = 0; i < n; i++) {
        if (zeros > 1) out[i] = 0;
        else if (zeros == 1) out[i] = nums[i] == 0 ? productOfNonzero : 0;
        else out[i] = productOfNonzero / nums[i];
    }
    return out;
}`,
  },
  {
    key: "prefix",
    name: "Two prefix arrays",
    costWhy:
      "O(n) time and O(n) space: one array of prefix products, one of suffix products, then a multiply per index. This is the rung that makes the idea visible \u2014 each answer is the product of two sides, computed once each rather than n times. What it spends is two arrays of length n, and the top rung shows that the suffix array was only ever read once, left to right, which a single carried variable can do.",
    summary:
      "Build running products from the left and from the right, then multiply them position by position. Linear at last, and the insight is complete: everything before me times everything after me. What it still pays is two full arrays of scaffolding for an answer array that could have carried the same information itself.",
    complexity: { time: "O(n)", space: "O(n)" },
    python: `def product_except_self(nums: list[int]) -> list[int]:
    n = len(nums)
    left = [1] * n
    right = [1] * n
    for i in range(1, n):
        left[i] = left[i - 1] * nums[i - 1]
    for i in range(n - 2, -1, -1):
        right[i] = right[i + 1] * nums[i + 1]
    return [left[i] * right[i] for i in range(n)]`,
    java: `public int[] productExceptSelf(int[] nums) {
    int n = nums.length;
    int[] left = new int[n];
    int[] right = new int[n];
    Arrays.fill(left, 1);
    Arrays.fill(right, 1);
    for (int i = 1; i < n; i++) {
        left[i] = left[i - 1] * nums[i - 1];
    }
    for (int i = n - 2; i >= 0; i--) {
        right[i] = right[i + 1] * nums[i + 1];
    }
    int[] result = new int[n];
    for (int i = 0; i < n; i++) {
        result[i] = left[i] * right[i];
    }
    return result;
}
`,
    cpp: `vector<int> productExceptSelf(const vector<int>& nums) {
    int n = (int)nums.size();
    vector<int> left(n, 1);
    vector<int> right(n, 1);
    for (int i = 1; i < n; i++) {
        left[i] = left[i - 1] * nums[i - 1];
    }
    for (int i = n - 2; i >= 0; i--) {
        right[i] = right[i + 1] * nums[i + 1];
    }
    vector<int> result(n);
    for (int i = 0; i < n; i++) {
        result[i] = left[i] * right[i];
    }
    return result;
}
`,
  },
]

// HOW THE TARGET BOUND WAS COUNTED. Each rung carries its own.
export const costWhy =
  "Two passes over n elements, each doing one multiply and one write, so about 2n multiplications and 2n writes \u2014 O(n) time with a constant of two, against the 10^10 the naive rung costs at this ceiling. The space claim needs its convention stated: the OUTPUT array is required by the problem and is not counted, so the O(1) is the running product carried between iterations \u2014 a single variable. That is the whole difference from the two-prefix-array rung, which computes exactly the same numbers and stores two arrays of length n to do it."
