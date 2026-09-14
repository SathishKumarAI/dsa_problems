import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "window-maximum",
  title: "Maximum of Every Window",
  pattern: "sliding-window",
  difficulty: "hard",
  leetcode: "sliding-window-maximum",
  brief: "The largest value in each window of width k.",
  statement:
    "Given an array and a window width k, return the maximum of every contiguous window of that width, from left to right.",
  constraints: [
    "1 <= nums.length <= 10^5",
    "-10^4 <= nums[i] <= 10^4",
    "1 <= k <= nums.length",
    "k = 1 returns the array itself, and k = nums.length returns a single value",
  ],
  examples: [
    {
      input: "nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3",
      output: "[3, 3, 5, 5, 6, 7]",
    },
    {
      input: "nums = [4, 2, 1], k = 3",
      output: "[4]",
      note: "One window, and its maximum is the first element.",
    },
  ],
  hints: [
    "Recomputing the maximum for each window re-reads k − 1 values it already saw. What could you carry forward instead?",
    "A value with a LARGER value to its right can never be the answer again — it will always be beaten while it remains in the window.",
    "So keep the surviving candidates in a deque, largest at the front, and evict from the back anything a new arrival makes irrelevant.",
  ],
  whyNow:
    "A heap gives the maximum in log k, but it cannot remove the element that just left the window — you end up carrying stale entries and checking whether the top is still in range. A deque of indices holds only values that could still win, so the front IS the answer with no staleness to check, and each index is pushed and popped exactly once.",
  arc: "The queue is the lesson. A heap gives the maximum but cannot cheaply forget the element that just left the window, so it needs lazy eviction and drifts toward n log n. A monotonic deque keeps only the candidates that could still become the maximum — anything smaller than a newer element is dominated forever and can be discarded on arrival — so each index is pushed and popped exactly once and the whole sweep is linear. Two habits: when a structure keeps values that can never win, delete them eagerly; and when the window moves, make sure the structure can EXPIRE from the front, which is exactly what a deque adds over a stack.",
  approach:
    "Walk the array holding a deque of indices whose values are strictly decreasing. Before pushing the current index, pop from the back every index whose value is not greater than it — those can never be the maximum again, because the new value is larger and outlives them. Then drop the front if it has fallen out of the window. Once the first window is complete, the front of the deque is that window's maximum, every time. Each index enters and leaves once, so the whole thing is linear despite the nested-looking loop.",
  complexity: { time: "O(n)", space: "O(k)" },
  python: `from collections import deque


def max_sliding_window(nums: list[int], k: int) -> list[int]:
    best: deque[int] = deque()
    out: list[int] = []
    for i, x in enumerate(nums):
        while best and nums[best[-1]] <= x:
            best.pop()
        best.append(i)
        if best[0] <= i - k:
            best.popleft()
        if i >= k - 1:
            out.append(nums[best[0]])
    return out`,
  java: `public int[] maxSlidingWindow(int[] nums, int k) {
    Deque<Integer> best = new ArrayDeque<>();
    int[] out = new int[nums.length - k + 1];
    int at = 0;
    for (int i = 0; i < nums.length; i++) {
        while (!best.isEmpty() && nums[best.peekLast()] <= nums[i]) {
            best.pollLast();
        }
        best.addLast(i);
        if (best.peekFirst() <= i - k) best.pollFirst();
        if (i >= k - 1) {
            out[at] = nums[best.peekFirst()];
            at++;
        }
    }
    return out;
}`,
  cpp: `vector<int> maxSlidingWindow(const vector<int>& nums, int k) {
    deque<int> best;
    vector<int> out;
    for (int i = 0; i < (int)nums.size(); i++) {
        while (!best.empty() && nums[best.back()] <= nums[i]) {
            best.pop_back();
        }
        best.push_back(i);
        if (best.front() <= i - k) best.pop_front();
        if (i >= k - 1) out.push_back(nums[best.front()]);
    }
    return out;
}`,
  alternatives: [
    {
      name: "Scan each window",
      summary:
        "For each of the n - k + 1 window positions, walk its k elements from scratch and take the largest. Correct, one line of logic, and it re-reads the k - 1 values it already looked at on the previous window. With k anywhere near n that is billions of comparisons for a question the deque answers in one pass.",
      complexity: { time: "O(n · k)", space: "O(1)" },
      python: `def max_sliding_window(nums: list[int], k: int) -> list[int]:
    out = []
    for start in range(len(nums) - k + 1):
        best = nums[start]
        for i in range(start, start + k):
            if nums[i] > best:
                best = nums[i]
        out.append(best)
    return out`,
      java: `public int[] maxSlidingWindow(int[] nums, int k) {
    int[] out = new int[nums.length - k + 1];
    for (int start = 0; start + k <= nums.length; start++) {
        int best = nums[start];
        for (int i = start; i < start + k; i++) {
            if (nums[i] > best) best = nums[i];
        }
        out[start] = best;
    }
    return out;
}`,
      cpp: `vector<int> maxSlidingWindow(const vector<int>& nums, int k) {
    vector<int> out;
    for (int start = 0; start + k <= (int)nums.size(); start++) {
        int best = nums[start];
        for (int i = start; i < start + k; i++) {
            if (nums[i] > best) best = nums[i];
        }
        out.push_back(best);
    }
    return out;
}`,
    },
    {
      name: "Max-heap with lazy eviction",
      summary:
        "Push every (value, index) pair into a max-heap as the right edge advances, and before reading the answer, discard top entries whose index has fallen out of the window. Genuinely n log n and easy to get right, and the heap can still hold every element ever seen, because an entry is only ever evicted once it happens to reach the top.",
      complexity: { time: "O(n log n)", space: "O(n)" },
      python: `import heapq


def max_sliding_window(nums: list[int], k: int) -> list[int]:
    heap: list[tuple[int, int]] = []
    out: list[int] = []
    for i, x in enumerate(nums):
        heapq.heappush(heap, (-x, i))
        while heap[0][1] <= i - k:
            heapq.heappop(heap)
        if i >= k - 1:
            out.append(-heap[0][0])
    return out`,
      java: `public int[] maxSlidingWindow(int[] nums, int k) {
    PriorityQueue<int[]> heap =
        new PriorityQueue<>((a, b) -> b[0] - a[0]);
    int[] out = new int[nums.length - k + 1];
    int at = 0;
    for (int i = 0; i < nums.length; i++) {
        heap.add(new int[] {nums[i], i});
        while (heap.peek()[1] <= i - k) heap.poll();
        if (i >= k - 1) {
            out[at] = heap.peek()[0];
            at++;
        }
    }
    return out;
}`,
      cpp: `vector<int> maxSlidingWindow(const vector<int>& nums, int k) {
    priority_queue<pair<int,int>> heap;
    vector<int> out;
    for (int i = 0; i < (int)nums.size(); i++) {
        heap.push({nums[i], i});
        while (heap.top().second <= i - k) heap.pop();
        if (i >= k - 1) out.push_back(heap.top().first);
    }
    return out;
}`,
    },
  ],
}
