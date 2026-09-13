import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "kth-largest-stream",
  title: "Kth Largest in a Stream",
  pattern: "heaps",
  difficulty: "easy",
  leetcode: "kth-largest-element-in-a-stream",
  brief: "Always know the kth largest as numbers keep arriving.",
  statement:
    "Design a class initialized with k and a list of numbers. Each call to add(x) inserts x and returns the kth largest value seen so far.",
  constraints: [
    "1 <= k <= 10^4",
    "0 <= nums.length <= 10^4",
    "-10^4 <= nums[i], val <= 10^4",
    "at least k values exist when kth-largest is asked for",
  ],
  examples: [
    {
      input: "k = 3, start = [4, 5, 8, 2]; add(3) → 4; add(5) → 5; add(10) → 5",
      output: "see calls",
      note: "After add(10) the three largest are 10, 8, 5.",
    },
  ],
  hints: [
    "You never care about anything smaller than the current kth largest.",
    "Keep only the k largest values. Which structure evicts its smallest in O(log k)?",
    "A min-heap of size k: its root IS the kth largest.",
  ],
  whyNow:
    "Shifting is still linear per add, and nothing here needs the full order - only the kth value. A min-heap of size k keeps that value at the root and costs a logarithm per add.",
  arc:
    "A stream turns every cost into a per-add cost, and that is what exposes the waste: re-sorting rebuilds an order that was already correct a moment ago, so inserting into the sorted list is the obvious repair — but keeping the whole list ordered still maintains n values when the caller only ever reads one of them, and the shifting is linear either way. The fix is to stop storing what will never be returned. Only the k largest values seen can ever be the answer, so a heap bounded at k holds exactly the candidates and its root IS the kth largest, with no search at all. Know that bounded-heap invariant cold, including the part that reads backwards — a MIN-heap answers a max question, because its weakest member is the rank being asked for. It is the same move behind kth-largest-element, k-closest-points and top-k-frequent, and it is what makes those problems work on input that never ends.",
  approach:
    "Maintain a min-heap holding exactly the k largest values seen. On add, push the new value; if the heap grows past k, pop the minimum (which by definition is no longer in the top k). The root is then the kth largest at all times. Keeping the heap small (k, not n) is the entire point.",
  complexity: { time: "O(log k) per add", space: "O(k)" },
  python: `import heapq

class KthLargest:
    def __init__(self, k: int, nums: list[int]):
        self.k = k
        self.heap = nums
        heapq.heapify(self.heap)
        while len(self.heap) > k:
            heapq.heappop(self.heap)

    def add(self, x: int) -> int:
        heapq.heappush(self.heap, x)
        if len(self.heap) > self.k:
            heapq.heappop(self.heap)
        return self.heap[0]`,
  java: `public class KthLargest {
    private int k;
    private PriorityQueue<Integer> heap;

    public KthLargest(int k, int[] nums) {
        this.k = k;
        this.heap = new PriorityQueue<>();
        for (int num : nums) heap.add(num);
        while (heap.size() > k) heap.poll();
    }

    public int add(int x) {
        heap.offer(x);
        if (heap.size() > k) heap.poll();
        return heap.peek();
    }
}
`,
  cpp: `class KthLargest {
public:
    int k;
    priority_queue<int, vector<int>, greater<int>> heap;

    KthLargest(int k, const vector<int>& nums): k(k), heap(greater<int>()) {
        for (int num : nums) heap.push(num);
        while ((int)heap.size() > k) heap.pop();
    }

    int add(int x) {
        heap.push(x);
        if ((int)heap.size() > k) heap.pop();
        return heap.top();
    }
};`,
  alternatives: [
    {
      name: "Sort per add",
      summary:
        "Keep a list, re-sort on every add, index the kth from the end. Each add costs n log n — painful for a hot path the heap serves in log k.",
      complexity: { time: "O(n log n) per add", space: "O(n)" },
      python: `class KthLargest:
    def __init__(self, k: int, nums: list[int]):
        self.k = k
        self.nums = list(nums)

    def add(self, x: int) -> int:
        self.nums.append(x)
        self.nums.sort()
        return self.nums[-self.k]`,
      java: `public class KthLargest {
    private int k;
    private List<Integer> nums;

    public KthLargest(int k, int[] nums) {
        this.k = k;
        this.nums = new ArrayList<>();
        for (int num : nums) this.nums.add(num);
    }

    public int add(int x) {
        nums.add(x);
        Collections.sort(nums);
        return nums.get(nums.size() - k);
    }
}`,
      cpp: `class KthLargest {
public:
    int k;
    vector<int> nums;

    KthLargest(int k, const vector<int>& nums): k(k), nums(nums) {}

    int add(int x) {
        nums.push_back(x);
        sort(nums.begin(), nums.end());
        return nums[nums.size() - k];
    }
};`,
    },
    {
      name: "Sorted insert (bisect)",
      whyNow:
        "Re-sorting on every add redoes work that was already in order. Inserting into a sorted list keeps the order for the price of shifting elements.",
      summary:
        "Keep the list sorted and insert with bisect. Insertion is O(n) due to shifting, but far better constants than re-sorting; still loses to the heap asymptotically.",
      complexity: { time: "O(n) per add", space: "O(n)" },
      python: `import bisect

class KthLargest:
    def __init__(self, k: int, nums: list[int]):
        self.k = k
        self.nums = sorted(nums)

    def add(self, x: int) -> int:
        bisect.insort(self.nums, x)
        return self.nums[-self.k]`,
      java: `public class KthLargest {
    private int k;
    private List<Integer> nums;

    public KthLargest(int k, int[] nums) {
        this.k = k;
        this.nums = new ArrayList<>();
        for (int num : nums) this.nums.add(num);
        Collections.sort(this.nums);
    }

    public int add(int x) {
        int idx = Collections.binarySearch(nums, x);
        if (idx < 0) idx = -idx - 1;
        nums.add(idx, x);
        return nums.get(nums.size() - k);
    }
}`,
      cpp: `class KthLargest {
public:
    int k;
    vector<int> nums;

    KthLargest(int k, vector<int> nums): k(k), nums(nums) {
        sort(this->nums.begin(), this->nums.end());
    }

    int add(int x) {
        auto it = lower_bound(nums.begin(), nums.end(), x);
        nums.insert(it, x);
        return nums[nums.size() - k];
    }
};`,
    },
  ],
}
