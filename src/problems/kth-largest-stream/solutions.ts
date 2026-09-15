// kth-largest-stream — the ladder: every way in, worst first.
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

export const approach = "Maintain a min-heap holding exactly the k largest values seen. On add, push the new value; if the heap grows past k, pop the minimum (which by definition is no longer in the top k). The root is then the kth largest at all times. Keeping the heap small (k, not n) is the entire point."

export const whyNow = "Shifting is still linear per add, and nothing here needs the full order - only the kth value. A min-heap of size k keeps that value at the root and costs a logarithm per add."

export const arc = "A stream turns every cost into a per-add cost, and that is what exposes the waste: re-sorting rebuilds an order that was already correct a moment ago, so inserting into the sorted list is the obvious repair — but keeping the whole list ordered still maintains n values when the caller only ever reads one of them, and the shifting is linear either way. The fix is to stop storing what will never be returned. Only the k largest values seen can ever be the answer, so a heap bounded at k holds exactly the candidates and its root IS the kth largest, with no search at all. Know that bounded-heap invariant cold, including the part that reads backwards — a MIN-heap answers a max question, because its weakest member is the rank being asked for. It is the same move behind kth-largest-element, k-closest-points and top-k-frequent, and it is what makes those problems work on input that never ends."

export const complexity = { time: "O(log k) per add", space: "O(k)" }

export const python = `import heapq

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
        return self.heap[0]`

export const java = `public class KthLargest {
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
`

export const cpp = `class KthLargest {
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
};`

export const alternatives: Solution[] = [
  {
    name: "Sort per add",
    summary:
      "Keep every value in a list, re-sort the whole list on every add, and index the kth from the end. Each add pays n log n to re-establish an order that was already correct except for one new element, and add is the hot path here: this is a class that gets called repeatedly, not a function that runs once.",
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
]
