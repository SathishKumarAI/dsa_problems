import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "kth-largest-element",
  title: "The kth Largest Value",
  pattern: "heaps",
  difficulty: "medium",
  leetcode: "kth-largest-element-in-an-array",
  brief: "kth largest by rank, counting duplicates.",
  statement:
    "Given an integer array and a number k, return the kth largest value — the value that would sit at position k from the end if the array were sorted. Duplicates count: in [3, 3, 1] the 2nd largest is 3.",
  constraints: [
    "1 <= k <= nums.length <= 10^5",
    "-10^4 <= nums[i] <= 10^4",
    "kth largest by POSITION in sorted order, not the kth distinct value",
    "k = 1 is the maximum and k = nums.length is the minimum, so both ends are legal",
  ],
  examples: [
    { input: "nums = [3, 2, 1, 5, 6, 4], k = 2", output: "5" },
    {
      input: "nums = [3, 3, 1], k = 2",
      output: "3",
      note: "The duplicate occupies a rank of its own.",
    },
  ],
  hints: [
    "Sorting gives the answer but computes the full order when only one position is wanted.",
    "Hold the k largest values seen so far. What is the answer, at every moment, in terms of that set?",
    "It is the SMALLEST of them — so keep a min-heap of size k, and evict its top whenever something bigger arrives.",
  ],
  whyNow:
    "Sorting orders all n values to read one of them. A min-heap of size k only ever holds the candidates that could still be the answer, so each element costs log k rather than contributing to an n log n sort — and when k is small, log k is close to nothing.",
  approach:
    "Keep a min-heap holding at most k values. Push each element; when the heap grows past k, pop the smallest, because a value outside the top k can never become the kth largest as more values arrive. The invariant is the whole idea: the heap always holds exactly the k largest seen so far, and its smallest member is the kth largest. Note that a min-heap answers a max question — the top is the weakest survivor, which is precisely the rank being asked for.",
  complexity: { time: "O(n log k)", space: "O(k)" },
  python: `import heapq


def find_kth_largest(nums: list[int], k: int) -> int:
    heap: list[int] = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]`,
  java: `public int findKthLargest(int[] nums, int k) {
    PriorityQueue<Integer> heap = new PriorityQueue<>();
    for (int x : nums) {
        heap.add(x);
        if (heap.size() > k) heap.poll();
    }
    return heap.peek();
}`,
  cpp: `int findKthLargest(const vector<int>& nums, int k) {
    priority_queue<int, vector<int>, greater<int>> heap;
    for (int x : nums) {
        heap.push(x);
        if ((int)heap.size() > k) heap.pop();
    }
    return heap.top();
}`,
  alternatives: [
    {
      name: "Sort and index",
      summary:
        "Sort the whole array ascending and read the element k places from the end.",
      complexity: { time: "O(n log n)", space: "O(n)" },
      python: `def find_kth_largest(nums: list[int], k: int) -> int:
    ordered = sorted(nums)
    return ordered[len(ordered) - k]`,
      java: `public int findKthLargest(int[] nums, int k) {
    int[] ordered = nums.clone();
    Arrays.sort(ordered);
    return ordered[ordered.length - k];
}`,
      cpp: `int findKthLargest(const vector<int>& nums, int k) {
    vector<int> ordered = nums;
    sort(ordered.begin(), ordered.end());
    return ordered[(int)ordered.size() - k];
}`,
    },
    {
      name: "Count the values",
      summary:
        "Tally how many times each value occurs, then walk the value range downward subtracting counts until k is reached.",
      whyNow:
        "Sorting arranges every element when only a rank is wanted. Counting replaces the comparison sort with a walk over the value range — linear in n, but it trades that for a table the size of the range, so it only pays when the values are tightly bounded.",
      complexity: { time: "O(n + range)", space: "O(range)" },
      python: `def find_kth_largest(nums: list[int], k: int) -> int:
    low, high = min(nums), max(nums)
    counts = [0] * (high - low + 1)
    for x in nums:
        counts[x - low] += 1
    remaining = k
    for value in range(high, low - 1, -1):
        remaining -= counts[value - low]
        if remaining <= 0:
            return value
    return low`,
      java: `public int findKthLargest(int[] nums, int k) {
    int low = nums[0], high = nums[0];
    for (int x : nums) {
        low = Math.min(low, x);
        high = Math.max(high, x);
    }
    int[] counts = new int[high - low + 1];
    for (int x : nums) counts[x - low]++;
    int remaining = k;
    for (int value = high; value >= low; value--) {
        remaining -= counts[value - low];
        if (remaining <= 0) return value;
    }
    return low;
}`,
      cpp: `int findKthLargest(const vector<int>& nums, int k) {
    int low = nums[0], high = nums[0];
    for (int x : nums) {
        low = min(low, x);
        high = max(high, x);
    }
    vector<int> counts(high - low + 1, 0);
    for (int x : nums) counts[x - low]++;
    int remaining = k;
    for (int value = high; value >= low; value--) {
        remaining -= counts[value - low];
        if (remaining <= 0) return value;
    }
    return low;
}`,
    },
  ],
}
