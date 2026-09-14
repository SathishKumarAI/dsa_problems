import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "k-closest-values",
  title: "The k Values Nearest x",
  pattern: "binary-search",
  difficulty: "medium",
  leetcode: "find-k-closest-elements",
  brief:
    "From a sorted array, return the k values closest to x — in sorted order, ties going left.",
  statement:
    "Given a sorted array, a count k and a target x, return the k values closest to x, sorted ascending. When two values are equally far from x, the smaller one wins.",
  constraints: [
    "1 <= k <= array length <= 10^4",
    "the array is SORTED ascending and may contain duplicates",
    "-10^4 <= value, x <= 10^4, and x may sit outside the array's range entirely",
    "ties go to the smaller value, so 'distance' alone is not a total order — the rule has two parts",
    "the answer is always k CONTIGUOUS values, because the array is sorted: anything between two chosen values is at least as close as both",
  ],
  examples: [
    { input: "arr = [1,2,3,4,5], k = 4, x = 3", output: "[1, 2, 3, 4]" },
    {
      input: "arr = [1,2,3,4,5], k = 4, x = -1",
      output: "[1, 2, 3, 4]",
      note: "x sits left of everything, so the answer is the leftmost window.",
    },
    {
      input: "arr = [1,1,2,2,2,2,2,3,3], k = 3, x = 3",
      output: "[2, 3, 3]",
      note: "The corner case: duplicates mean the window boundary is not where a naive 'closest single value' search lands.",
    },
  ],
  hints: [
    "The answer is a contiguous window of length k — convince yourself of that before writing anything.",
    "So the only unknown is where the window STARTS, and starts range from 0 to length − k.",
    "Compare a candidate start against its successor by comparing the two values that differ: arr[start] and arr[start + k]. That comparison is monotone in start, which means binary search.",
  ],
  whyNow:
    "Converging two pointers is linear because it steps one index at a time from the ends of a 10^4-element array to a window of size k — but the decision it makes at each step is the same monotone comparison every time. Binary searching the window's START makes those steps logarithmic in the number of candidate windows: the answer is a slice, and its position is found in about fourteen comparisons rather than ten thousand.",
  arc: "The insight comes before the algorithm: because the array is sorted, the answer is k CONTIGUOUS values, so the only unknown is where the window starts. Once the search space is 'window positions' rather than 'values', binary search applies to a comparison between arr[mid] and arr[mid + k] — the value that would leave against the value that would join — and the whole problem is four lines. Two lessons generalise. First, when a problem says 'sorted' and asks for a set, check whether the set has to be an interval; it usually does, and that collapses the search space. Second, a two-part rule (closest, then smallest) has to be honoured in the comparison itself: here it is the difference between > and >=, and getting it backwards silently returns a window one step too far right.",
  approach:
    "The answer is a window of exactly k contiguous values, so search for its left edge in the range 0 … n − k. For a candidate edge, compare x − arr[edge] against arr[edge + k] − x: if the value leaving on the left is strictly further from x than the one that would join on the right, the window should move right; otherwise it should not. That comparison is monotone in the edge, so binary search finds the smallest edge that should not move — and taking the tie in favour of not moving is exactly the 'ties go left' rule.",
  complexity: { time: "O(log(n − k) + k)", space: "O(1)" },
  python: `def k_closest_values(arr: list[int], k: int, x: int) -> list[int]:
    low, high = 0, len(arr) - k
    while low < high:
        mid = (low + high) // 2
        # the value dropping off the left vs the one joining on the right
        if x - arr[mid] > arr[mid + k] - x:
            low = mid + 1
        else:
            high = mid          # a tie keeps the window where it is: left wins
    return arr[low : low + k]`,
  java: `public int[] kClosestValues(int[] arr, int k, int x) {
    int low = 0, high = arr.length - k;
    while (low < high) {
        int mid = low + (high - low) / 2;
        if (x - arr[mid] > arr[mid + k] - x) low = mid + 1;
        else high = mid;
    }
    int[] out = new int[k];
    for (int i = 0; i < k; i++) out[i] = arr[low + i];
    return out;
}`,
  cpp: `vector<int> kClosestValues(vector<int> arr, int k, int x) {
    int low = 0, high = (int)arr.size() - k;
    while (low < high) {
        int mid = low + (high - low) / 2;
        if (x - arr[mid] > arr[mid + k] - x) low = mid + 1;
        else high = mid;
    }
    return vector<int>(arr.begin() + low, arr.begin() + low + k);
}`,
  walkthrough: [
    {
      cells: {
        values: [1, 2, 3, 4, 5],
        marks: { 2: "focus" },
        labels: { 2: "x = 3" },
      },
      caption:
        "Five values, k = 4, x = 3. Two windows of width 4 exist: starting at 0 or at 1. The search is over those starts, not over the values.",
    },
    {
      cells: {
        values: [1, 2, 3, 4, 5],
        marks: { 0: "window", 1: "window", 2: "window", 3: "window" },
        labels: { 0: "start 0" },
      },
      caption:
        "Probe start 0: the value that would leave is arr[0] = 1, three away from x; the value that would join is arr[4] = 5, two away. Two is closer, so this window wants to move right…",
    },
    {
      cells: {
        values: [1, 2, 3, 4, 5],
        marks: { 1: "window", 2: "window", 3: "window", 4: "window" },
        labels: { 1: "start 1" },
      },
      caption:
        "…except the rule is strict: 3 − 1 = 2 and 5 − 3 = 2 are EQUAL, so the tie keeps the window at start 0. That single comparison is where 'ties go to the smaller value' lives.",
    },
    {
      cells: {
        values: [1, 2, 3, 4, 5],
        marks: { 0: "done", 1: "done", 2: "done", 3: "done" },
      },
      caption:
        "The range closes on start 0 and the answer is the slice [1, 2, 3, 4].",
    },
    {
      cells: {
        values: [1, 1, 2, 2, 2, 2, 2, 3, 3],
        marks: { 6: "done", 7: "done", 8: "done" },
        labels: { 6: "start 6" },
      },
      caption:
        "With duplicates and x = 3, the window lands at start 6 — [2, 3, 3]. Nothing here searched for the closest single value; the search was over window positions the whole time.",
    },
  ],
  alternatives: [
    {
      name: "Sort by distance",
      summary:
        "Order every value by how far it is from x, breaking ties in favour of the smaller value, take the first k, and sort those back into ascending order.",
      complexity: { time: "O(n log n)", space: "O(n)" },
      python: `def k_closest_values(arr: list[int], k: int, x: int) -> list[int]:
    ranked = sorted(arr, key=lambda value: (abs(value - x), value))
    return sorted(ranked[:k])`,
      java: `public int[] kClosestValues(int[] arr, int k, int x) {
    Integer[] ranked = new Integer[arr.length];
    for (int i = 0; i < arr.length; i++) ranked[i] = arr[i];
    Arrays.sort(ranked, (a, b) -> {
        int da = Math.abs(a - x), db = Math.abs(b - x);
        return da == db ? a - b : da - db;
    });
    int[] out = new int[k];
    for (int i = 0; i < k; i++) out[i] = ranked[i];
    Arrays.sort(out);
    return out;
}`,
      cpp: `vector<int> kClosestValues(vector<int> arr, int k, int x) {
    vector<int> ranked = arr;
    sort(ranked.begin(), ranked.end(), [x](int a, int b) {
        int da = abs(a - x), db = abs(b - x);
        if (da != db) return da < db;
        return a < b;
    });
    vector<int> out(ranked.begin(), ranked.begin() + k);
    sort(out.begin(), out.end());
    return out;
}`,
    },
    {
      name: "A heap of the k best so far",
      summary:
        "Walk the array keeping a heap of size k ordered by the same two-part rule, evicting the current worst whenever a better value arrives. Sort what is left.",
      complexity: { time: "O(n log k)", space: "O(k)" },
      whyNow:
        "Sorting the whole array orders values that will never be looked at — with k = 3 and ten thousand values, 9997 of those comparisons are wasted. A heap of size k only ever orders the candidates, so the log follows k instead of n.",
      python: `import heapq

def k_closest_values(arr: list[int], k: int, x: int) -> list[int]:
    heap: list[tuple[int, int]] = []     # (-distance, -value): the worst on top
    for value in arr:
        heapq.heappush(heap, (-abs(value - x), -value))
        if len(heap) > k:
            heapq.heappop(heap)
    return sorted(-value for _, value in heap)`,
      java: `public int[] kClosestValues(int[] arr, int k, int x) {
    PriorityQueue<Integer> heap = new PriorityQueue<>((a, b) -> {
        int da = Math.abs(a - x), db = Math.abs(b - x);
        return da == db ? b - a : db - da;   // the worst candidate on top
    });
    for (int value : arr) {
        heap.add(value);
        if (heap.size() > k) heap.poll();
    }
    int[] out = new int[k];
    for (int i = 0; i < k; i++) out[i] = heap.poll();
    Arrays.sort(out);
    return out;
}`,
      cpp: `vector<int> kClosestValues(vector<int> arr, int k, int x) {
    auto worse = [x](int a, int b) {
        int da = abs(a - x), db = abs(b - x);
        if (da != db) return da < db;
        return a < b;
    };
    priority_queue<int, vector<int>, decltype(worse)> heap(worse);
    for (int value : arr) {
        heap.push(value);
        if ((int)heap.size() > k) heap.pop();
    }
    vector<int> out;
    while (!heap.empty()) {
        out.push_back(heap.top());
        heap.pop();
    }
    sort(out.begin(), out.end());
    return out;
}`,
    },
    {
      name: "Two pointers, closing in",
      summary:
        "Put one index at each end of the array and drop the further of the two values — ties dropping from the right — until exactly k values remain between them.",
      complexity: { time: "O(n − k)", space: "O(1)" },
      whyNow:
        "A heap re-derives an ordering the array already has: it is sorted, so the k closest values are contiguous and the only things that can be discarded are at the two ends. Comparing the two ends and dropping the worse one needs no ordering structure at all.",
      python: `def k_closest_values(arr: list[int], k: int, x: int) -> list[int]:
    left, right = 0, len(arr) - 1
    while right - left + 1 > k:
        if x - arr[left] > arr[right] - x:
            left += 1
        else:
            right -= 1          # a tie drops the RIGHT end, keeping smaller values
    return arr[left : right + 1]`,
      java: `public int[] kClosestValues(int[] arr, int k, int x) {
    int left = 0, right = arr.length - 1;
    while (right - left + 1 > k) {
        if (x - arr[left] > arr[right] - x) left++;
        else right--;
    }
    int[] out = new int[k];
    for (int i = 0; i < k; i++) out[i] = arr[left + i];
    return out;
}`,
      cpp: `vector<int> kClosestValues(vector<int> arr, int k, int x) {
    int left = 0, right = (int)arr.size() - 1;
    while (right - left + 1 > k) {
        if (x - arr[left] > arr[right] - x) left++;
        else right--;
    }
    return vector<int>(arr.begin() + left, arr.begin() + right + 1);
}`,
    },
  ],
}
