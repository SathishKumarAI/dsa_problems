import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "longest-increasing-run",
  title: "Longest Increasing Subsequence",
  pattern: "dp",
  difficulty: "medium",
  leetcode: "longest-increasing-subsequence",
  brief: "Longest strictly rising pick, order kept, gaps allowed.",
  statement:
    "Given an integer array, return the length of the longest strictly increasing subsequence — a selection of elements that keeps their original order but need not be contiguous.",
  constraints: [
    "1 <= nums.length <= 2500",
    "-10^4 <= nums[i] <= 10^4",
    "strictly increasing, so equal values cannot both be taken",
    "elements keep their order but may be skipped — this is a subsequence, not a substring",
  ],
  examples: [
    {
      input: "nums = [10, 9, 2, 5, 3, 7, 101, 18]",
      output: "4",
      note: "2, 3, 7, 101 — the picks are not adjacent.",
    },
    {
      input: "nums = [7, 7, 7]",
      output: "1",
      note: "Equal values cannot extend each other.",
    },
  ],
  hints: [
    "Define the answer for a position: the longest increasing run that ENDS at index i. The overall answer is the largest of those.",
    "To extend to i, you may append nums[i] to any earlier run whose last value is smaller.",
    "The table version is O(n²). To do better, stop storing lengths and start storing, for each length, the smallest value a run of that length can end with.",
  ],
  whyNow:
    "The table asks, for every position, which of the earlier positions it can extend — that inner scan is the whole n² cost. The patience version stores one number per achievable length instead: the smallest tail a run of that length can have. That list is sorted by construction, so the right slot is a binary search rather than a scan.",
  approach:
    "Keep a list of tails, where tails[k] is the smallest value that any increasing run of length k+1 can end with. For each value, binary search for the first tail that is not smaller than it: overwrite that tail (a run of that length can now end lower, which can only help later), or append if the value beats every tail (a longer run just became possible). The list is not itself a subsequence — it is a ledger of what is achievable — but its length is the answer.",
  complexity: { time: "O(n log n)", space: "O(n)" },
  python: `import bisect


def length_of_lis(nums: list[int]) -> int:
    tails: list[int] = []
    for x in nums:
        at = bisect.bisect_left(tails, x)
        if at == len(tails):
            tails.append(x)
        else:
            tails[at] = x
    return len(tails)`,
  java: `public int lengthOfLis(int[] nums) {
    int[] tails = new int[nums.length];
    int sz = 0;
    for (int x : nums) {
        int l = 0, r = sz;
        while (l < r) {
            int m = (l + r) / 2;
            if (tails[m] < x) l = m + 1; else r = m;
        }
        if (l == sz) tails[sz++] = x; else tails[l] = x;
    }
    return sz;
}
`,
  cpp: `int lengthOfLis(const vector<int>& nums) {
    int n = (int)nums.size();
    vector<int> tails(n);
    int sz = 0;
    for (int x : nums) {
        int l = 0, r = sz;
        while (l < r) {
            int m = (l + r) / 2;
            if (tails[m] < x) l = m + 1; else r = m;
        }
        if (l == sz) tails[sz++] = x; else tails[l] = x;
    }
    return sz;
}
`,
  walkthrough: [
    {
      cells: { values: [10, 9, 2, 5, 3, 7, 101, 18] },
      caption:
        "tails[k] will hold the smallest value a run of length k+1 can end with. It starts empty.",
    },
    {
      cells: { values: [10, 9, 2, 5, 3, 7, 101, 18], marks: { 0: "focus" } },
      caption: "10 beats every tail (there are none) → tails = [10].",
    },
    {
      cells: {
        values: [10, 9, 2, 5, 3, 7, 101, 18],
        marks: { 0: "compare", 1: "focus" },
      },
      caption:
        "9 replaces 10: a run of length 1 can now end lower, which can only help. tails = [9].",
    },
    {
      cells: {
        values: [10, 9, 2, 5, 3, 7, 101, 18],
        marks: { 2: "focus" },
      },
      caption: "2 replaces 9 for the same reason. tails = [2].",
    },
    {
      cells: {
        values: [10, 9, 2, 5, 3, 7, 101, 18],
        marks: { 2: "window", 3: "focus" },
      },
      caption:
        "5 beats every tail → append. tails = [2, 5], so a run of length 2 exists.",
    },
    {
      cells: {
        values: [10, 9, 2, 5, 3, 7, 101, 18],
        marks: { 2: "window", 3: "compare", 4: "focus" },
      },
      caption:
        "3 replaces the 5. tails = [2, 3] — still length 2, but cheaper to extend.",
    },
    {
      cells: {
        values: [10, 9, 2, 5, 3, 7, 101, 18],
        marks: { 2: "window", 4: "window", 5: "window", 6: "focus" },
      },
      caption:
        "7 then 101 both append. tails = [2, 3, 7, 101], length 4 — and 18 later replaces 101 without changing the count.",
    },
    {
      cells: {
        values: [10, 9, 2, 5, 3, 7, 101, 18],
        marks: { 2: "done", 4: "done", 5: "done", 6: "done" },
      },
      caption:
        "Answer 4. tails is a ledger of what is achievable, not the subsequence itself — but its length is right.",
    },
  ],
  alternatives: [
    {
      name: "Every subsequence",
      summary:
        "Try both choices at every index — take this element if it is larger than the last one taken, or skip it — and report the deepest run found.",
      complexity: { time: "O(2^n)", space: "O(n)" },
      python: `def length_of_lis(nums: list[int]) -> int:
    def walk(i: int, previous: int) -> int:
        if i == len(nums):
            return 0
        best = walk(i + 1, previous)
        if nums[i] > previous:
            best = max(best, 1 + walk(i + 1, nums[i]))
        return best

    return walk(0, -(10**9))`,
      java: `public int walk(int[] nums, int i, int previous) {
    if (i == nums.length) return 0;
    int best = walk(nums, i + 1, previous);
    if (nums[i] > previous) {
        best = Math.max(best, 1 + walk(nums, i + 1, nums[i]));
    }
    return best;
}

public int lengthOfLis(int[] nums) {
    return walk(nums, 0, -1000000000);
}`,
      cpp: `int lengthOfLis(const vector<int>& nums) {
    function<int(int,int)> walk = [&](int i, int previous){
        if (i == (int)nums.size()) return 0;
        int best = walk(i + 1, previous);
        if (nums[i] > previous) {
            best = max(best, 1 + walk(i + 1, nums[i]));
        }
        return best;
    };
    return walk(0, -1000000000);
}`,
    },
    {
      name: "Table of best-ending-here",
      summary:
        "Let best[i] be the length of the longest increasing run ending exactly at index i, built by scanning every earlier index that could feed it.",
      whyNow:
        "The recursion re-solves the same suffix once per path that reaches it, which is where the exponential comes from. Writing each position's answer down once turns those repeats into a single lookup.",
      complexity: { time: "O(n²)", space: "O(n)" },
      python: `def length_of_lis(nums: list[int]) -> int:
    if not nums:
        return 0
    best = [1] * len(nums)
    for i in range(1, len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                best[i] = max(best[i], best[j] + 1)
    return max(best)`,
      java: `public int lengthOfLis(int[] nums) {
    if (nums.length == 0) return 0;
    int n = nums.length;
    int[] best = new int[n];
    for (int i = 0; i < n; i++) best[i] = 1;
    for (int i = 1; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                best[i] = Math.max(best[i], best[j] + 1);
            }
        }
    }
    int res = 0;
    for (int v : best) {
        if (v > res) res = v;
    }
    return res;
}
`,
      cpp: `int lengthOfLis(const vector<int>& nums) {
    if (nums.empty()) return 0;
    int n = (int)nums.size();
    vector<int> best(n, 1);
    for (int i = 1; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                best[i] = max(best[i], best[j] + 1);
            }
        }
    }
    int res = 0;
    for (int v : best) {
        if (v > res) res = v;
    }
    return res;
}
`,
    },
  ],
}
