import type { Problem } from "../types.ts"

export const heaps: Problem[] = [
  {
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
        input:
          "k = 3, start = [4, 5, 8, 2]; add(3) → 4; add(5) → 5; add(10) → 5",
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
    private java.util.PriorityQueue<Integer> heap;

    public KthLargest(int k, int[] nums) {
        this.k = k;
        this.heap = new java.util.PriorityQueue<>();
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
    std::priority_queue<int, std::vector<int>, std::greater<int>> heap;

    KthLargest(int k, const std::vector<int>& nums): k(k), heap(std::greater<int>()) {
        for (int num : nums) heap.push(num);
        while ((int)heap.size() > k) heap.pop();
    }

    int add(int x) {
        heap.push(x);
        if ((int)heap.size() > k) heap.pop();
        return heap.top();
    }
};`,
    walkthrough: [
      {
        text: "k = 3, start = [4, 5, 8, 2]\n\nheapify → pop smallest until size 3\nmin-heap: [4, 5, 8]   root = 4",
        caption: "Keep only the 3 largest. Root = 3rd largest = 4.",
      },
      {
        text: "add(3):  push → [3, 4, 5, 8]\n         size 4 > 3 → pop 3\n\nmin-heap: [4, 5, 8]   root = 4",
        caption: "3 can't be in the top three — evicted immediately.",
      },
      {
        text: "add(5):  push → [4, 5, 5, 8]\n         pop 4\n\nmin-heap: [5, 5, 8]   root = 5",
        caption: "New 5 pushes old 4 out of the top three.",
      },
      {
        text: "add(10): push → [5, 5, 8, 10]\n         pop 5\n\nmin-heap: [5, 8, 10]  root = 5",
        caption: "Top three are 10, 8, 5 — root answers in O(1).",
      },
    ],
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
        java: `public int kthLargest(int k, List<Integer> nums, int x) {
    nums.add(x);
    Collections.sort(nums);
    return nums.get(nums.size() - k);
}`,
        cpp: `int kthLargest(vector<int>& nums, int k, int x) {
    nums.push_back(x);
    sort(nums.begin(), nums.end());
    return nums[nums.size() - k];
}`,
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
        java: `public int add(List<Integer> nums, int k, int x) {
    int idx = Collections.binarySearch(nums, x);
    if (idx < 0) idx = -idx - 1;
    nums.add(idx, x);
    return nums.get(nums.size() - k);
}`,
        cpp: `int add(vector<int>& nums, int k, int x) {
    auto it = lower_bound(nums.begin(), nums.end(), x);
    nums.insert(it, x);
    return nums[nums.size() - k];
}`,
      },
    ],
  },
  {
    id: "k-closest-points",
    title: "K Closest Points to Origin",
    pattern: "heaps",
    difficulty: "medium",
    leetcode: "k-closest-points-to-origin",
    brief: "The k points nearest to (0, 0).",
    statement:
      "Given points on a plane and an integer k, return the k points closest to the origin by Euclidean distance. Any order.",
    constraints: [
      "1 <= k <= points.length <= 10^4",
      "-10^4 <= x, y <= 10^4",
      "distances may tie; any valid set of k is accepted",
      "the squared distance avoids a square root and never overflows in these bounds",
    ],
    examples: [
      {
        input: "points = [[1, 3], [-2, 2], [5, 8]], k = 2",
        output: "[[-2, 2], [1, 3]]",
      },
    ],
    hints: [
      "Comparing squared distances avoids the sqrt entirely.",
      "Same shape as kth-largest: keep the k best in a bounded heap.",
      "Python's heapq is a min-heap — store negated distance to evict the farthest of the kept k.",
    ],
    whyNow:
      "Quickselect is expected linear, but it needs every point in memory at once and degrades on unlucky pivots. A heap bounded at k streams the input and gives the same answer at a cost you can promise.",
    approach:
      "Keep a heap of the k closest points seen so far, keyed by negative squared distance so the worst kept point sits at the root. For each point beyond the first k, compare against that root: closer means replace (one pushpop), farther means skip. n log k beats sorting when k is small.",
    complexity: { time: "O(n log k)", space: "O(k)" },
    python: `import heapq

def k_closest(points: list[list[int]], k: int) -> list[list[int]]:
    heap: list[tuple[int, list[int]]] = []  # (-dist², point)
    for p in points:
        d = -(p[0] ** 2 + p[1] ** 2)
        if len(heap) < k:
            heapq.heappush(heap, (d, p))
        elif d > heap[0][0]:
            heapq.heappushpop(heap, (d, p))
    return [p for _, p in heap]`,
    java: `public List<List<Integer>> kClosest(List<List<Integer>> points, int k) {
    PriorityQueue<Object[]> heap = new PriorityQueue<>(new java.util.Comparator<Object[]>() {
        public int compare(Object[] a, Object[] b) { return Integer.compare((Integer)a[0], (Integer)b[0]); }
    });
    for (List<Integer> p : points) {
        int d = -(p.get(0)*p.get(0) + p.get(1)*p.get(1));
        if (heap.size() < k) {
            heap.offer(new Object[]{d, p});
        } else if (d > ((Integer)heap.peek()[0])) {
            heap.poll();
            heap.offer(new Object[]{d, p});
        }
    }
    List<List<Integer>> res = new ArrayList<>();
    while (!heap.isEmpty()) {
        res.add((List<Integer>)heap.poll()[1]);
    }
    return res;
}
`,
    cpp: `vector<vector<int>> kClosest(const vector<vector<int>>& points, int k) {
    priority_queue<pair<int, vector<int>>> heap;
    for (const auto& p : points) {
        int d = -(p[0]*p[0] + p[1]*p[1]);
        if ((int)heap.size() < k) {
            heap.emplace(d, p);
        } else if (d > heap.top().first) {
            heap.pop();
            heap.emplace(d, p);
        }
    }
    vector<vector<int>> res;
    while (!heap.empty()) {
        res.push_back(heap.top().second);
        heap.pop();
    }
    return res;
}
`,
    walkthrough: [
      {
        text: "points: [1,3] [-2,2] [5,8]   k = 2\n\ndist²:  [1,3]→10  [-2,2]→8  [5,8]→89",
        caption:
          "Squared distance is enough — ordering is identical to true distance.",
      },
      {
        text: "push [1,3]  (d²=10)\npush [-2,2] (d²=8)\n\nkept: {[1,3], [-2,2]}   worst kept: 10",
        caption: "First k points always enter the heap.",
      },
      {
        text: "[5,8]: d² = 89 > 10 (worst kept)\n→ skip\n\nkept: {[1,3], [-2,2]}",
        caption: "Farther than the worst kept point — rejected in O(1).",
      },
      {
        text: "answer: [[-2,2], [1,3]]\n\nn log k, not n log n:\nonly the k kept points ever touch the heap",
        caption: "Bounded heap = the whole trick.",
      },
    ],
    alternatives: [
      {
        name: "Sort all",
        summary:
          "Sort every point by distance and slice. One line, n log n, perfectly fine when n is small or k ≈ n.",
        complexity: { time: "O(n log n)", space: "O(n)" },
        python: `def k_closest(points: list[list[int]], k: int) -> list[list[int]]:
    return sorted(points, key=lambda p: p[0] ** 2 + p[1] ** 2)[:k]`,
        java: `public List<List<Integer>> kClosest(List<List<Integer>> points, int k) {
    List<List<Integer>> copy = new ArrayList<>(points);
    Collections.sort(copy, new Comparator<List<Integer>>() {
        public int compare(List<Integer> a, List<Integer> b) {
            int da = a.get(0) * a.get(0) + a.get(1) * a.get(1);
            int db = b.get(0) * b.get(0) + b.get(1) * b.get(1);
            return Integer.compare(da, db);
        }
    });
    return copy.subList(0, k);
}
`,
        cpp: `vector<vector<int>> kClosest(const vector<vector<int>>& points, int k) {
    vector<vector<int>> res = points;
    sort(res.begin(), res.end(), [](const vector<int>& a, const vector<int>& b){
        return a[0]*a[0] + a[1]*a[1] < b[0]*b[0] + b[1]*b[1];
    });
    return vector<vector<int>>(res.begin(), res.begin() + k);
}
`,
      },
      {
        name: "Quickselect",
        whyNow:
          "Sorting orders all n points when only k of them are wanted. Partitioning around a pivot puts the k closest in front without ordering any of them.",
        summary:
          "Partition around a random pivot distance until the first k positions hold the k closest (unordered). Expected linear — the asymptotic winner, with the worst quadratic tail and the most code.",
        complexity: { time: "O(n) expected", space: "O(1) in-place" },
        python: `import random

def k_closest(points: list[list[int]], k: int) -> list[list[int]]:
    d = lambda p: p[0] ** 2 + p[1] ** 2
    lo, hi = 0, len(points) - 1
    while lo < hi:
        pivot = d(points[random.randint(lo, hi)])
        i, j = lo, hi
        while i <= j:
            while d(points[i]) < pivot:
                i += 1
            while d(points[j]) > pivot:
                j -= 1
            if i <= j:
                points[i], points[j] = points[j], points[i]
                i, j = i + 1, j - 1
        if k - 1 <= j:
            hi = j
        elif k - 1 >= i:
            lo = i
        else:
            break
    return points[:k]`,
        java: `public int[][] kClosest(int[][] points, int k) {
    int lo = 0, hi = points.length - 1;
    while (lo < hi) {
        int pivotIdx = lo + (int) (Math.random() * (hi - lo + 1));
        int pivot = d(points[pivotIdx]);
        int i = lo, j = hi;
        while (i <= j) {
            while (d(points[i]) < pivot) i++;
            while (d(points[j]) > pivot) j--;
            if (i <= j) {
                int[] tmp = points[i];
                points[i] = points[j];
                points[j] = tmp;
                i++;
                j--;
            }
        }
        if (k - 1 <= j) hi = j;
        else if (k - 1 >= i) lo = i;
        else break;
    }
    return Arrays.copyOfRange(points, 0, k);
}

private int d(int[] p) { return p[0] * p[0] + p[1] * p[1]; }`,
        cpp: `int d(const vector<int>& p) { return p[0] * p[0] + p[1] * p[1]; }

vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {
    int lo = 0, hi = (int)points.size() - 1;
    while (lo < hi) {
        int pivot = d(points[lo + rand() % (hi - lo + 1)]);
        int i = lo, j = hi;
        while (i <= j) {
            while (d(points[i]) < pivot) i++;
            while (d(points[j]) > pivot) j--;
            if (i <= j) {
                swap(points[i], points[j]);
                i++;
                j--;
            }
        }
        if (k - 1 <= j) hi = j;
        else if (k - 1 >= i) lo = i;
        else break;
    }
    return vector<vector<int>>(points.begin(), points.begin() + k);
}`,
      },
    ],
  },
  {
    id: "task-cooldown",
    title: "Task Scheduling With Cooldown",
    pattern: "heaps",
    difficulty: "medium",
    leetcode: "task-scheduler",
    brief: "Minimum time to run tasks when repeats need n idle slots.",
    statement:
      "Given task labels and a cooldown n, identical tasks must be at least n time-units apart. Each task takes one unit; you may idle. Return the minimum total units to finish everything.",
    constraints: [
      "1 <= tasks.length <= 10^4",
      "tasks[i] is an uppercase letter, so at most 26 distinct tasks",
      "0 <= n <= 100",
      "identical tasks must be separated by at least n intervals; idle intervals are allowed",
    ],
    examples: [
      {
        input: "tasks = [A, A, A, B, B, B], n = 2",
        output: "8",
        note: "A B _ A B _ A B",
      },
    ],
    hints: [
      "Greedy: always run the task with the most remaining copies (breaking it up matters most).",
      "A max-heap of remaining counts gives you that task; a queue holds cooling tasks with their release times.",
      "Time advances by 1 per unit; a task leaving the heap re-enters via the cooldown queue.",
    ],
    whyNow:
      "The formula gives the length in one line but never says what actually runs when, and it has to special-case the tasks tied for most frequent. Simulating with a max-heap produces the schedule itself, which is what the follow-up asks for.",
    approach:
      "Max-heap of remaining counts (negated for Python). Each tick: pop the most frequent available task, run it, and if copies remain, park it in a queue stamped with when its cooldown ends. Move queue heads back into the heap as their timestamps expire. When both structures are empty, the clock is the answer. Running the most frequent task first is safe because it is the one that forces idles if postponed.",
    complexity: { time: "O(total ticks × log 26)", space: "O(26)" },
    python: `import heapq
from collections import Counter, deque

def least_interval(tasks: list[str], n: int) -> int:
    heap = [-c for c in Counter(tasks).values()]
    heapq.heapify(heap)
    cooling: deque[tuple[int, int]] = deque()  # (ready_time, -count)
    time = 0
    while heap or cooling:
        time += 1
        if cooling and cooling[0][0] == time:
            heapq.heappush(heap, cooling.popleft()[1])
        if heap:
            count = heapq.heappop(heap) + 1  # ran one copy
            if count:
                cooling.append((time + n + 1, count))
    return time`,
    java: `public int leastInterval(String[] tasks, int n) {
    Map<String,Integer> freq = new HashMap<>();
    for (String t: tasks) freq.put(t, freq.getOrDefault(t,0)+1);
    PriorityQueue<Integer> heap = new PriorityQueue<>();
    for (int c: freq.values()) heap.add(-c);
    ArrayDeque<int[]> cooling = new ArrayDeque<>();
    int time=0;
    while (!heap.isEmpty() || !cooling.isEmpty()){
        time++;
        if (!cooling.isEmpty() && cooling.peek()[0]==time){
            heap.add(cooling.poll()[1]);
        }
        if (!heap.isEmpty()){
            int count = heap.poll()+1;
            if (count!=0) cooling.offer(new int[]{time+n+1, count});
        }
    }
    return time;
}
`,
    cpp: `int leastInterval(const vector<string>& tasks, int n) {
    unordered_map<string,int> freq;
    for (auto &t: tasks) freq[t]++;
    priority_queue<int> heap;
    for (auto &p: freq) heap.push(p.second);
    deque<pair<int,int>> cooling;
    int time=0;
    while (!heap.empty() || !cooling.empty()){
        time++;
        if (!cooling.empty() && cooling.front().first==time){
            heap.push(cooling.front().second);
            cooling.pop_front();
        }
        if (!heap.empty()){
            int count = heap.top(); heap.pop();
            count--;
            if (count>0) cooling.emplace_back(time+n+1, count);
        }
    }
    return time;
}
`,
    walkthrough: [
      {
        text: "tasks: A×3 B×3   n = 2\nheap: [A:3, B:3]   cooling: []",
        caption: "Counts in a max-heap; cooldown queue empty.",
      },
      {
        text: "t=1  run A (2 left) → cooling until t=4\nt=2  run B (2 left) → cooling until t=5\nt=3  nothing ready → idle",
        caption: "Most-frequent-first; both cooling, clock still ticks.",
      },
      {
        text: "t=4  A ready → run A (1 left) → cool to t=7\nt=5  B ready → run B (1 left) → cool to t=8\nt=6  idle",
        caption: "Same shape repeats: A B idle.",
      },
      {
        text: "t=7  run A (0 left)\nt=8  run B (0 left)\n\nA B _ A B _ A B   →  8 units",
        caption: "Heap and queue empty at t=8 — answer 8.",
      },
    ],
    alternatives: [
      {
        name: "Math formula",
        summary:
          "Only the most frequent task shapes the schedule: (maxCount − 1) blocks of size n+1, plus one slot per task tied at maxCount. Take max with len(tasks) for the no-idle case. O(1) after counting — but the heap simulation generalizes when the formula's assumptions break.",
        complexity: { time: "O(n)", space: "O(26)" },
        python: `from collections import Counter

def least_interval(tasks: list[str], n: int) -> int:
    counts = Counter(tasks)
    peak = max(counts.values())
    ties = sum(1 for c in counts.values() if c == peak)
    return max(len(tasks), (peak - 1) * (n + 1) + ties)`,
        java: `public int leastInterval(String[] tasks, int n) {
    Map<String, Integer> counts = new HashMap<>();
    for (String t : tasks) {
        counts.put(t, counts.getOrDefault(t, 0) + 1);
    }
    int peak = 0;
    for (int c : counts.values()) if (c > peak) peak = c;
    int ties = 0;
    for (int c : counts.values()) if (c == peak) ties++;
    return Math.max(tasks.length, (peak - 1) * (n + 1) + ties);
}
`,
        cpp: `int leastInterval(const vector<string>& tasks, int n) {
    unordered_map<string,int> counts;
    for (const string& t : tasks) counts[t]++;
    int peak = 0;
    for (auto &p: counts) if (p.second > peak) peak = p.second;
    int ties = 0;
    for (auto &p: counts) if (p.second == peak) ties++;
    return max((int)tasks.size(), (peak - 1) * (n + 1) + ties);
}
`,
      },
    ],
  },
]
