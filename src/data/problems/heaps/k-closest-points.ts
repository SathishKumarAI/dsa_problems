import type { Problem } from "../../types.ts"

export const problem: Problem = {
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
  arc:
    "Ordering is the expense, and none of it was asked for — any k points will do, in any order. Sorting ranks all n to hand back k, so the first real idea is to stop ranking: partitioning around a pivot drives the k closest to the front without putting them in any order, which is quickselect, expected linear and the asymptotic winner. What it gives up is a promise, since an unlucky run of pivots goes quadratic, and it wants every point in memory to shuffle them. Bounding a heap at k trades the linear headline for a cost you can state in advance and a working set of k, so it survives input that arrives as a stream. Know the size-k heap and the partition step cold. The squared distance is the small habit worth keeping too: the square root is monotone, so comparing without it is the same ordering with none of the floating-point trouble — the same sidestep works anywhere distances are only ever compared.",
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
    PriorityQueue<Object[]> heap = new PriorityQueue<>(new Comparator<Object[]>() {
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
    priority_queue<pair<int, vector<int>>, vector<pair<int, vector<int>>>,
                   greater<pair<int, vector<int>>>> heap;
    for (const auto& p : points) {
        int d = -(p[0] * p[0] + p[1] * p[1]);
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
}`,
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
}
