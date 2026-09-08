import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "product-except-self",
  title: "Product of Everything Else",
  pattern: "arrays-hashing",
  difficulty: "medium",
  leetcode: "product-of-array-except-self",
  brief: "Each position gets the product of all the others — no division.",
  statement:
    "Given an integer array, return an array where each position holds the product of every element except the one at that position. Solve it without using division, in linear time.",
  constraints: [
    "2 <= nums.length <= 10^5",
    "-30 <= nums[i] <= 30",
    "every answer is guaranteed to fit in a 32-bit integer",
    "division is off the table — which matters most precisely because the array may contain zeros",
  ],
  examples: [
    { input: "nums = [1, 2, 3, 4]", output: "[24, 12, 8, 6]" },
    {
      input: "nums = [-1, 1, 0, -3, 3]",
      output: "[0, 0, 9, 0, 0]",
      note: "A single zero makes every other answer zero.",
    },
  ],
  hints: [
    "The answer at i is (everything to the left of i) × (everything to the right of i). Two independent questions.",
    "Both halves can be built by a running product — one sweep left to right, one right to left.",
    "You do not need to store both: write the left products into the output, then multiply the right products in on a second sweep.",
  ],
  whyNow:
    "Holding the two prefix arrays makes the idea obvious but keeps 2n numbers alive to read each of them exactly once. The output array can carry the left products while the right sweep folds its running product straight into them, so the same two passes need no storage beyond the answer.",
  approach:
    "Sweep left to right writing into the output the product of everything strictly before each index, carrying a running product. Then sweep right to left with a second running product of everything strictly after, multiplying it into what is already there. Each position ends up holding left × right, which is every element but its own. Nothing is ever divided, so a zero — or two — behaves like any other value rather than being a special case.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def product_except_self(nums: list[int]) -> list[int]:
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
    return out`,
  java: `public int[] productExceptSelf(int[] nums) {
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
}`,
  cpp: `vector<int> productExceptSelf(const vector<int>& nums) {
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
}`,
  walkthrough: [
    {
      cells: { values: [1, 2, 3, 4] },
      caption:
        "Each answer is (everything left) × (everything right). Two sweeps, no division.",
    },
    {
      cells: {
        values: [1, 1, 2, 6],
        marks: { 0: "done", 1: "done", 2: "done", 3: "focus" },
      },
      caption:
        "After the left sweep the output holds the product of everything BEFORE each index: [1, 1, 2, 6].",
    },
    {
      cells: {
        values: [1, 1, 2, 6],
        marks: { 3: "focus" },
        labels: { 3: "right=1" },
      },
      caption:
        "Now sweep back. At index 3 the running right product is still 1 → 6 × 1 = 6. Then it becomes 4.",
    },
    {
      cells: {
        values: [1, 1, 2, 6],
        marks: { 2: "focus", 3: "done" },
        labels: { 2: "right=4" },
      },
      caption: "Index 2: 2 × 4 = 8. The running right product becomes 12.",
    },
    {
      cells: {
        values: [1, 1, 8, 6],
        marks: { 1: "focus", 2: "done", 3: "done" },
        labels: { 1: "right=12" },
      },
      caption: "Index 1: 1 × 12 = 12. Running product becomes 24.",
    },
    {
      cells: {
        values: [24, 12, 8, 6],
        marks: { 0: "done", 1: "done", 2: "done", 3: "done" },
      },
      caption:
        "Index 0: 1 × 24 = 24. Two passes, one output array, and zeros needed no special handling.",
    },
  ],
  alternatives: [
    {
      name: "Product of the others, each time",
      summary:
        "For every index, loop over the whole array multiplying together every element except the one at that index.",
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
    {
      name: "Two prefix arrays",
      summary:
        "Build one array of running products from the left and another from the right, then multiply them position by position.",
      whyNow:
        "The nested loop recomputes the same partial products for every index. Storing each running product once makes the whole thing linear — at the cost of two extra arrays that are each read exactly once.",
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
  ],
}
