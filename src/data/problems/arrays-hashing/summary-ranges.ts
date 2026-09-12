import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "summary-ranges",
  title: "Collapse the Runs into Ranges",
  pattern: "arrays-hashing",
  difficulty: "easy",
  leetcode: "summary-ranges",
  brief:
    "Sorted distinct numbers in, the shortest list of ranges that covers them out.",
  statement:
    'Given a sorted array of distinct integers, return the smallest sorted list of ranges that covers exactly the values present. A stretch of consecutive numbers a, a+1, …, b becomes "a->b"; a number with no consecutive neighbour stands alone as "a".',
  constraints: [
    "0 <= nums.length <= 20 — the empty array is legal input and must come back as an empty list",
    "-2^31 <= nums[i] <= 2^31 - 1, so the VALUES can be astronomically far apart even when there are only a handful of them",
    "nums is sorted strictly ascending: already ordered, and no duplicates to skip",
    'a run of length one prints as the bare value, never as "x->x"',
    "the ranges come out in ascending order and together cover every value exactly once, with no value covered twice",
  ],
  examples: [
    {
      input: "nums = [0, 1, 2, 4, 5, 7]",
      output: '["0->2", "4->5", "7"]',
    },
    {
      input: "nums = [0, 2, 3, 4, 6, 8, 9]",
      output: '["0", "2->4", "6", "8->9"]',
      note: 'Three runs of length one. A version that always prints a->b turns 6 into "6->6" and fails here.',
    },
    {
      input: "nums = []",
      output: "[]",
      note: "The empty array is legal, so nothing may read nums[0] before checking there is one.",
    },
  ],
  hints: [
    "The input is already sorted with no duplicates, so a run is exactly a stretch where each value is one more than the value before it.",
    "Per run you only ever need two numbers: where it started and where it stopped. Everything between them is implied by consecutiveness.",
    "Remember the start, walk forward while the next value is +1, and emit the moment the chain breaks — the lone-value case is simply start == end.",
  ],
  whyNow:
    "Collecting the break positions still needs a second pass and a list of positions that grows with the number of runs. But a range can be written down the instant its break is seen, so nothing has to survive the pass except the value the current run started at — one number of state, and the output is built in the same walk that finds the runs.",
  arc:
    "The useful observation arrives before any code: in a sorted array a consecutive run is exactly a maximal block where value minus index is constant. Once that is said, the bucketing rung and the boundary-scan rung are two ways of using the same fact, and the final version does not even need the arithmetic — it simply walks until the next value is not one more than the current, which is the same test written locally. The general habit is to look for an invariant that is constant within a group and changes between groups; it turns grouping problems into scans. The corner cases are the empty array and a single-element run, whose formatting differs — a detail worth writing down first, because it is where the output format bites.",
  approach:
    "One walk with an anchor. At index i, remember nums[i] as the start of a run, then advance i while the next value is exactly one more than the current one. When that stops, i sits on the last value of the run: emit the bare start if start equals nums[i], otherwise start->nums[i]. Step past it and begin the next run. Because the inner advance never revisits an index, the two loops together touch each element once. The empty array simply never enters the outer loop, and a lone value is a run whose inner loop advances zero times.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def summary_ranges(nums: list[int]) -> list[str]:
    out: list[str] = []
    n = len(nums)
    i = 0
    while i < n:
        start = nums[i]
        # walk the chain of +1 steps; i lands on the run's last value
        while i + 1 < n and nums[i + 1] == nums[i] + 1:
            i += 1
        out.append(str(start) if start == nums[i] else str(start) + "->" + str(nums[i]))
        i += 1
    return out`,
  java: `public String[] summaryRanges(int[] nums) {
    List<String> out = new ArrayList<>();
    int i = 0;
    while (i < nums.length) {
        int start = nums[i];
        while (i + 1 < nums.length && nums[i + 1] == nums[i] + 1) i++;
        out.add(start == nums[i] ? String.valueOf(start) : start + "->" + nums[i]);
        i++;
    }
    return out.toArray(new String[0]);
}`,
  cpp: `vector<string> summaryRanges(const vector<int>& nums) {
    vector<string> out;
    int n = (int)nums.size();
    int i = 0;
    while (i < n) {
        int start = nums[i];
        while (i + 1 < n && nums[i + 1] == nums[i] + 1) i++;
        out.push_back(start == nums[i] ? to_string(start)
                                       : to_string(start) + "->" + to_string(nums[i]));
        i++;
    }
    return out;
}`,
  alternatives: [
    {
      name: "Paint the number line",
      summary:
        "Mark every present value on a flat line spanning the smallest value to the largest, then walk that line from end to end and read off the painted stretches.",
      complexity: { time: "O(hi - lo)", space: "O(hi - lo)" },
      python: `def summary_ranges(nums: list[int]) -> list[str]:
    if not nums:
        return []
    lo, hi = nums[0], nums[-1]
    present = [False] * (hi - lo + 1)
    for x in nums:
        present[x - lo] = True
    out: list[str] = []
    v = lo
    while v <= hi:
        if not present[v - lo]:
            v += 1
            continue
        start = v
        while v <= hi and present[v - lo]:
            v += 1
        end = v - 1
        out.append(str(start) if start == end else str(start) + "->" + str(end))
    return out`,
      java: `public String[] summaryRanges(int[] nums) {
    List<String> out = new ArrayList<>();
    if (nums.length == 0) return out.toArray(new String[0]);
    int lo = nums[0], hi = nums[nums.length - 1];
    boolean[] present = new boolean[hi - lo + 1];
    for (int x : nums) present[x - lo] = true;
    int v = lo;
    while (v <= hi) {
        if (!present[v - lo]) { v++; continue; }
        int start = v;
        while (v <= hi && present[v - lo]) v++;
        int end = v - 1;
        out.add(start == end ? String.valueOf(start) : start + "->" + end);
    }
    return out.toArray(new String[0]);
}`,
      cpp: `vector<string> summaryRanges(const vector<int>& nums) {
    vector<string> out;
    if (nums.empty()) return out;
    int lo = nums.front(), hi = nums.back();
    vector<bool> present(hi - lo + 1, false);
    for (int x : nums) present[x - lo] = true;
    int v = lo;
    while (v <= hi) {
        if (!present[v - lo]) { v++; continue; }
        int start = v;
        while (v <= hi && present[v - lo]) v++;
        int end = v - 1;
        out.push_back(start == end ? to_string(start)
                                   : to_string(start) + "->" + to_string(end));
    }
    return out;
}`,
    },
    {
      name: "Bucket by value minus index",
      summary:
        "Inside a run of consecutive values, nums[i] - i is constant, and it jumps at every gap. Bucket the values by that key in a map ordered by key, then turn each bucket into a range.",
      complexity: { time: "O(n log n)", space: "O(n)" },
      whyNow:
        "Painting the line walks the numeric SPAN rather than the array: [1, 1000000000] is two numbers and a billion steps, and on the real bounds the line cannot be allocated at all. Keying on value minus index touches each element once, so the cost finally follows the length of the input instead of the size of the numbers in it.",
      python: `def summary_ranges(nums: list[int]) -> list[str]:
    groups: dict[int, list[int]] = {}
    for i, x in enumerate(nums):
        groups.setdefault(x - i, []).append(x)
    out: list[str] = []
    for key in sorted(groups):
        g = groups[key]
        out.append(str(g[0]) if len(g) == 1 else str(g[0]) + "->" + str(g[-1]))
    return out`,
      java: `public String[] summaryRanges(int[] nums) {
    Map<Integer, List<Integer>> groups = new TreeMap<>();
    for (int i = 0; i < nums.length; i++)
        groups.computeIfAbsent(nums[i] - i, k -> new ArrayList<>()).add(nums[i]);
    List<String> out = new ArrayList<>();
    for (List<Integer> g : groups.values()) {
        int a = g.get(0), z = g.get(g.size() - 1);
        out.add(a == z ? String.valueOf(a) : a + "->" + z);
    }
    return out.toArray(new String[0]);
}`,
      cpp: `vector<string> summaryRanges(const vector<int>& nums) {
    map<int, vector<int>> groups;
    for (int i = 0; i < (int)nums.size(); i++) groups[nums[i] - i].push_back(nums[i]);
    vector<string> out;
    for (auto& kv : groups) {
        int a = kv.second.front(), z = kv.second.back();
        out.push_back(a == z ? to_string(a) : to_string(a) + "->" + to_string(z));
    }
    return out;
}`,
    },
    {
      name: "Split into run lists",
      summary:
        "Walk the array once and append each value either to the run being built or to a fresh one, depending on whether it continues the chain. Then format each run from its first and last value.",
      complexity: { time: "O(n)", space: "O(n)" },
      whyNow:
        "The map hashes or compares every element to build a key whose ordering is only incidentally the answer's ordering — and it needs an ordered map to get that ordering back. But the input is already sorted, so values sharing a key are already adjacent: a straight scan finds the same groups with no keys, no map and no re-sorting.",
      python: `def summary_ranges(nums: list[int]) -> list[str]:
    runs: list[list[int]] = []
    for x in nums:
        if runs and runs[-1][-1] + 1 == x:
            runs[-1].append(x)
        else:
            runs.append([x])
    return [str(r[0]) if len(r) == 1 else str(r[0]) + "->" + str(r[-1]) for r in runs]`,
      java: `public String[] summaryRanges(int[] nums) {
    List<List<Integer>> runs = new ArrayList<>();
    for (int x : nums) {
        if (!runs.isEmpty()) {
            List<Integer> last = runs.get(runs.size() - 1);
            if (last.get(last.size() - 1) + 1 == x) { last.add(x); continue; }
        }
        List<Integer> fresh = new ArrayList<>();
        fresh.add(x);
        runs.add(fresh);
    }
    List<String> out = new ArrayList<>();
    for (List<Integer> r : runs) {
        int a = r.get(0), z = r.get(r.size() - 1);
        out.add(a == z ? String.valueOf(a) : a + "->" + z);
    }
    return out.toArray(new String[0]);
}`,
      cpp: `vector<string> summaryRanges(const vector<int>& nums) {
    vector<vector<int>> runs;
    for (int x : nums) {
        if (!runs.empty() && runs.back().back() + 1 == x) runs.back().push_back(x);
        else runs.push_back({x});
    }
    vector<string> out;
    for (auto& r : runs) {
        int a = r.front(), z = r.back();
        out.push_back(a == z ? to_string(a) : to_string(a) + "->" + to_string(z));
    }
    return out;
}`,
    },
    {
      name: "Collect the break points",
      summary:
        "First pass records every index where the chain breaks; second pass pairs consecutive break points into ranges. No values are copied, only positions.",
      complexity: { time: "O(n)", space: "O(k) for k runs" },
      whyNow:
        "The run lists hold every element a second time when only two of each run — its first and last value — ever reach the output. Recording the positions where the chain breaks keeps one number per run instead of one per element.",
      python: `def summary_ranges(nums: list[int]) -> list[str]:
    if not nums:
        return []
    ends = [i for i in range(len(nums) - 1) if nums[i] + 1 != nums[i + 1]]
    ends.append(len(nums) - 1)
    out: list[str] = []
    start = 0
    for b in ends:
        a, z = nums[start], nums[b]
        out.append(str(a) if a == z else str(a) + "->" + str(z))
        start = b + 1
    return out`,
      java: `public String[] summaryRanges(int[] nums) {
    List<String> out = new ArrayList<>();
    if (nums.length == 0) return out.toArray(new String[0]);
    List<Integer> ends = new ArrayList<>();
    for (int i = 0; i + 1 < nums.length; i++)
        if (nums[i] + 1 != nums[i + 1]) ends.add(i);
    ends.add(nums.length - 1);
    int start = 0;
    for (int b : ends) {
        int a = nums[start], z = nums[b];
        out.add(a == z ? String.valueOf(a) : a + "->" + z);
        start = b + 1;
    }
    return out.toArray(new String[0]);
}`,
      cpp: `vector<string> summaryRanges(const vector<int>& nums) {
    vector<string> out;
    if (nums.empty()) return out;
    int n = (int)nums.size();
    vector<int> ends;
    for (int i = 0; i + 1 < n; i++)
        if (nums[i] + 1 != nums[i + 1]) ends.push_back(i);
    ends.push_back(n - 1);
    int start = 0;
    for (int b : ends) {
        int a = nums[start], z = nums[b];
        out.push_back(a == z ? to_string(a) : to_string(a) + "->" + to_string(z));
        start = b + 1;
    }
    return out;
}`,
    },
  ],
  walkthrough: [
    {
      cells: { values: [0, 1, 2, 4, 5, 7] },
      caption:
        "Sorted, distinct. Every stretch that steps by exactly 1 collapses into a single range.",
    },
    {
      cells: { values: [0, 1, 2, 4, 5, 7], marks: { 0: "focus" } },
      caption:
        "start = 0. The next value is 1, which is 0+1, so the run continues.",
    },
    {
      cells: {
        values: [0, 1, 2, 4, 5, 7],
        marks: { 0: "window", 1: "window", 2: "focus" },
      },
      caption:
        "2 is 1+1, still going. The next value is 4, and 4 is not 3 — the chain breaks here, with 2 as the run's last value.",
    },
    {
      cells: {
        values: [0, 1, 2, 4, 5, 7],
        marks: { 0: "done", 1: "done", 2: "done", 3: "focus" },
      },
      caption:
        'start 0 and end 2 differ, so emit "0->2". A new run starts at 4.',
    },
    {
      cells: {
        values: [0, 1, 2, 4, 5, 7],
        marks: { 0: "done", 1: "done", 2: "done", 3: "window", 4: "focus" },
      },
      caption: '5 is 4+1, then 7 breaks the chain. Emit "4->5".',
    },
    {
      cells: {
        values: [0, 1, 2, 4, 5, 7],
        marks: {
          0: "done",
          1: "done",
          2: "done",
          3: "done",
          4: "done",
          5: "focus",
        },
      },
      caption:
        '7 has nothing after it, so its run is one value long: start equals end, and it prints bare as "7", not "7->7".',
    },
    {
      cells: {
        values: [0, 1, 2, 4, 5, 7],
        marks: {
          0: "done",
          1: "done",
          2: "done",
          3: "done",
          4: "done",
          5: "done",
        },
      },
      caption:
        'Every index was visited exactly once by the anchor or the inner walk. Answer: ["0->2", "4->5", "7"].',
    },
  ],
}
