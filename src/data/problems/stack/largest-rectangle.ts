import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "largest-rectangle",
  title: "Largest Rectangle in Histogram",
  pattern: "stack",
  difficulty: "hard",
  leetcode: "largest-rectangle-in-histogram",
  brief: "Biggest rectangle fitting under a histogram's bars.",
  statement:
    "Given bar heights of a histogram (all width 1), return the area of the largest axis-aligned rectangle that fits entirely under the bars.",
  constraints: [
    "1 <= heights.length <= 10^5",
    "0 <= heights[i] <= 10^4",
    "the rectangle must span consecutive bars and is capped by the shortest of them",
  ],
  examples: [
    {
      input: "heights = [2, 1, 5, 6, 2, 3]",
      output: "10",
      note: "Height 5 spanning the 5 and 6 bars.",
    },
  ],
  hints: [
    "For each bar, the best rectangle using its full height extends to the first shorter bar on each side.",
    "A monotonic increasing stack finds both boundaries: a bar is finalized the moment a shorter one arrives.",
    "Append a sentinel height 0 so every bar gets flushed at the end.",
  ],
  whyNow:
    "Divide and conquer degrades to quadratic when the minimum keeps landing at an end. A stack of non-decreasing heights closes each bar's rectangle exactly when the first shorter bar arrives - linear whatever the shape.",
  approach:
    "Sweep with a stack of indices whose heights are non-decreasing. When the incoming bar is shorter than the stack top, the top bar's rectangle is now bounded: its right edge is the current index, its left edge is the element below it on the stack. Pop, compute area, repeat; then push the current bar. A trailing zero-height sentinel drains the stack. Each bar is pushed and popped exactly once.",
  complexity: { time: "O(n)", space: "O(n)" },
  python: `def largest_rectangle(heights: list[int]) -> int:
    best = 0
    st: list[int] = []  # indices, heights non-decreasing
    for i, h in enumerate(heights + [0]):
        while st and heights[st[-1]] > h:
            height = heights[st.pop()]
            left = st[-1] + 1 if st else 0
            best = max(best, height * (i - left))
        st.append(i)
    return best`,
  java: `public int largestRectangle(int[] heights) {
    int best = 0;
    int[] st = new int[heights.length + 1];
    int top = 0;
    for (int i = 0; i <= heights.length; i++) {
        int h = (i == heights.length) ? 0 : heights[i];
        while (top > 0 && heights[st[top - 1]] > h) {
            int height = heights[st[--top]];
            int left = (top > 0) ? st[top - 1] + 1 : 0;
            best = Math.max(best, height * (i - left));
        }
        st[top++] = i;
    }
    return best;
}
`,
  cpp: `int largestRectangle(const vector<int>& heights) {
    int best = 0;
    vector<int> st;
    for (int i = 0; i <= (int)heights.size(); i++) {
        int h = (i == (int)heights.size()) ? 0 : heights[i];
        while (!st.empty() && heights[st.back()] > h) {
            int height = heights[st.back()];
            st.pop_back();
            int left = !st.empty() ? st.back() + 1 : 0;
            best = max(best, height * (i - left));
        }
        st.push_back(i);
    }
    return best;
}
`,
  walkthrough: [
    {
      cells: { values: [2, 1, 5, 6, 2, 3] },
      caption: "Bars of a histogram. Find the largest rectangle under them.",
    },
    {
      cells: {
        values: [2, 1, 5, 6, 2, 3],
        marks: { 0: "compare", 1: "focus" },
      },
      caption: "1 < 2 → bar 0 is bounded. Area: 2 × 1 = 2. Pop it, push 1.",
    },
    {
      cells: {
        values: [2, 1, 5, 6, 2, 3],
        marks: { 1: "window", 2: "window", 3: "window" },
      },
      caption: "1, 5, 6 stack in increasing order — none bounded yet.",
    },
    {
      cells: {
        values: [2, 1, 5, 6, 2, 3],
        marks: { 2: "compare", 3: "compare", 4: "focus" },
      },
      caption:
        "2 arrives: pop 6 → area 6×1 = 6; pop 5 → area 5×2 = 10. New best.",
    },
    {
      cells: {
        values: [2, 1, 5, 6, 2, 3],
        marks: { 1: "window", 4: "window", 5: "window" },
      },
      caption: "Push 2, then 3. Sentinel 0 at the end will flush everything.",
    },
    {
      cells: { values: [2, 1, 5, 6, 2, 3], marks: { 2: "done", 3: "done" } },
      caption:
        "Flush: 3×1, 2×4, 1×6 — none beat 10. Answer 10 (height 5 over bars 2–3).",
    },
  ],
  alternatives: [
    {
      name: "Brute force",
      summary:
        'For each bar, expand left and right while neighbours are at least as tall, using the bar\'s own height. Quadratic but makes the "first shorter bar on each side" idea concrete.',
      complexity: { time: "O(n²)", space: "O(1)" },
      python: `def largest_rectangle(heights: list[int]) -> int:
    best = 0
    n = len(heights)
    for i, h in enumerate(heights):
        left = i
        while left > 0 and heights[left - 1] >= h:
            left -= 1
        right = i
        while right < n - 1 and heights[right + 1] >= h:
            right += 1
        best = max(best, h * (right - left + 1))
    return best`,
      java: `public int largestRectangle(int[] heights) {
    int best = 0;
    int n = heights.length;
    for (int i = 0; i < n; i++) {
        int h = heights[i];
        int left = i;
        while (left > 0 && heights[left - 1] >= h) {
            left--;
        }
        int right = i;
        while (right < n - 1 && heights[right + 1] >= h) {
            right++;
        }
        best = Math.max(best, h * (right - left + 1));
    }
    return best;
}
`,
      cpp: `int largestRectangle(const vector<int>& heights) {
    int best = 0;
    int n = (int)heights.size();
    for (int i = 0; i < n; i++) {
        int h = heights[i];
        int left = i;
        while (left > 0 && heights[left - 1] >= h) {
            left--;
        }
        int right = i;
        while (right < n - 1 && heights[right + 1] >= h) {
            right++;
        }
        best = max(best, h * (right - left + 1));
    }
    return best;
}
`,
    },
    {
      name: "Divide & conquer",
      whyNow:
        "Expanding from every bar re-measures the same neighbours. Splitting at the shortest bar settles three cases at once, so the work follows the recursion instead of the pairs.",
      summary:
        "Best rectangle is either fully left of the minimum bar, fully right of it, or spans it at the minimum's height. Recurse both halves. O(n log n) typical, O(n²) if the array is sorted — the stack solution dominates it.",
      complexity: { time: "O(n log n) avg", space: "O(log n)" },
      python: `def largest_rectangle(heights: list[int]) -> int:
    def solve(lo: int, hi: int) -> int:
        if lo > hi:
            return 0
        m = min(range(lo, hi + 1), key=heights.__getitem__)
        spanning = heights[m] * (hi - lo + 1)
        return max(spanning, solve(lo, m - 1), solve(m + 1, hi))

    return solve(0, len(heights) - 1)`,
      java: `public int largestRectangle(int[] h) {
    return solve(h, 0, h.length - 1);
}

static int solve(int[] h, int lo, int hi) {
    if (lo > hi) return 0;
    int m = lo;
    for (int i = lo; i <= hi; i++) {
        if (h[i] < h[m]) m = i;
    }
    int spanning = h[m] * (hi - lo + 1);
    return Math.max(spanning, Math.max(solve(h, lo, m - 1), solve(h, m + 1, hi)));
}
`,
      cpp: `static int solve(const vector<int>& h, int lo, int hi) {
    if (lo > hi) return 0;
    int m = lo;
    for (int i = lo; i <= hi; ++i) {
        if (h[i] < h[m]) m = i;
    }
    int spanning = h[m] * (hi - lo + 1);
    return max(spanning, max(solve(h, lo, m - 1), solve(h, m + 1, hi)));
}

int largestRectangle(const vector<int>& h) {
    return solve(h, 0, (int)h.size() - 1);
}`,
    },
  ],
}
