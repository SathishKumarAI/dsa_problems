import type { Problem } from "../types"

export const heaps: Problem[] = [
  {
    id: "kth-largest-stream",
    title: "Kth Largest in a Stream",
    pattern: "heaps",
    difficulty: "easy",
    brief: "Always know the kth largest as numbers keep arriving.",
    statement:
      "Design a class initialized with k and a list of numbers. Each call to add(x) inserts x and returns the kth largest value seen so far.",
    examples: [
      { input: "k = 3, start = [4, 5, 8, 2]; add(3) → 4; add(5) → 5; add(10) → 5", output: "see calls", note: "After add(10) the three largest are 10, 8, 5." },
    ],
    hints: [
      "You never care about anything smaller than the current kth largest.",
      "Keep only the k largest values. Which structure evicts its smallest in O(log k)?",
      "A min-heap of size k: its root IS the kth largest.",
    ],
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
    walkthrough: [
      { text: "k = 3, start = [4, 5, 8, 2]\n\nheapify → pop smallest until size 3\nmin-heap: [4, 5, 8]   root = 4", caption: "Keep only the 3 largest. Root = 3rd largest = 4." },
      { text: "add(3):  push → [3, 4, 5, 8]\n         size 4 > 3 → pop 3\n\nmin-heap: [4, 5, 8]   root = 4", caption: "3 can't be in the top three — evicted immediately." },
      { text: "add(5):  push → [4, 5, 5, 8]\n         pop 4\n\nmin-heap: [5, 5, 8]   root = 5", caption: "New 5 pushes old 4 out of the top three." },
      { text: "add(10): push → [5, 5, 8, 10]\n         pop 5\n\nmin-heap: [5, 8, 10]  root = 5", caption: "Top three are 10, 8, 5 — root answers in O(1)." },
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
      },
      {
        name: "Sorted insert (bisect)",
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
      },
    ],
  },
  {
    id: "k-closest-points",
    title: "K Closest Points to Origin",
    pattern: "heaps",
    difficulty: "medium",
    brief: "The k points nearest to (0, 0).",
    statement:
      "Given points on a plane and an integer k, return the k points closest to the origin by Euclidean distance. Any order.",
    examples: [
      { input: "points = [[1, 3], [-2, 2], [5, 8]], k = 2", output: "[[-2, 2], [1, 3]]" },
    ],
    hints: [
      "Comparing squared distances avoids the sqrt entirely.",
      "Same shape as kth-largest: keep the k best in a bounded heap.",
      "Python's heapq is a min-heap — store negated distance to evict the farthest of the kept k.",
    ],
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
    walkthrough: [
      { text: "points: [1,3] [-2,2] [5,8]   k = 2\n\ndist²:  [1,3]→10  [-2,2]→8  [5,8]→89", caption: "Squared distance is enough — ordering is identical to true distance." },
      { text: "push [1,3]  (d²=10)\npush [-2,2] (d²=8)\n\nkept: {[1,3], [-2,2]}   worst kept: 10", caption: "First k points always enter the heap." },
      { text: "[5,8]: d² = 89 > 10 (worst kept)\n→ skip\n\nkept: {[1,3], [-2,2]}", caption: "Farther than the worst kept point — rejected in O(1)." },
      { text: "answer: [[-2,2], [1,3]]\n\nn log k, not n log n:\nonly the k kept points ever touch the heap", caption: "Bounded heap = the whole trick." },
    ],
    alternatives: [
      {
        name: "Sort all",
        summary: "Sort every point by distance and slice. One line, n log n, perfectly fine when n is small or k ≈ n.",
        complexity: { time: "O(n log n)", space: "O(n)" },
        python: `def k_closest(points: list[list[int]], k: int) -> list[list[int]]:
    return sorted(points, key=lambda p: p[0] ** 2 + p[1] ** 2)[:k]`,
      },
      {
        name: "Quickselect",
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
      },
    ],
  },
  {
    id: "task-cooldown",
    title: "Task Scheduling With Cooldown",
    pattern: "heaps",
    difficulty: "medium",
    brief: "Minimum time to run tasks when repeats need n idle slots.",
    statement:
      "Given task labels and a cooldown n, identical tasks must be at least n time-units apart. Each task takes one unit; you may idle. Return the minimum total units to finish everything.",
    examples: [
      { input: "tasks = [A, A, A, B, B, B], n = 2", output: "8", note: "A B _ A B _ A B" },
    ],
    hints: [
      "Greedy: always run the task with the most remaining copies (breaking it up matters most).",
      "A max-heap of remaining counts gives you that task; a queue holds cooling tasks with their release times.",
      "Time advances by 1 per unit; a task leaving the heap re-enters via the cooldown queue.",
    ],
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
    walkthrough: [
      { text: "tasks: A×3 B×3   n = 2\nheap: [A:3, B:3]   cooling: []", caption: "Counts in a max-heap; cooldown queue empty." },
      { text: "t=1  run A (2 left) → cooling until t=4\nt=2  run B (2 left) → cooling until t=5\nt=3  nothing ready → idle", caption: "Most-frequent-first; both cooling, clock still ticks." },
      { text: "t=4  A ready → run A (1 left) → cool to t=7\nt=5  B ready → run B (1 left) → cool to t=8\nt=6  idle", caption: "Same shape repeats: A B idle." },
      { text: "t=7  run A (0 left)\nt=8  run B (0 left)\n\nA B _ A B _ A B   →  8 units", caption: "Heap and queue empty at t=8 — answer 8." },
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
      },
    ],
  },
]
