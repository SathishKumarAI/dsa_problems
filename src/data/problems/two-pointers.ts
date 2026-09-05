import type { Problem } from "../types.ts"

export const twoPointers: Problem[] = [
  {
    id: "sorted-pair-sum",
    title: "Pair Sum in Sorted Array",
    pattern: "two-pointers",
    difficulty: "easy",
    leetcode: "two-sum-ii-input-array-is-sorted",
    brief: "Two values in a sorted array that add to a target — O(1) space.",
    statement:
      "Given an array sorted in non-decreasing order and a target, return the indices of two distinct elements that sum to target, using constant extra space. Assume exactly one answer exists.",
    constraints: [
      "2 <= numbers.length <= 3 * 10^4",
      "-1000 <= numbers[i] <= 1000",
      "numbers is sorted ascending",
      "exactly one solution exists and an element may not be used twice; O(1) extra space is required",
    ],
    examples: [
      {
        input: "nums = [1, 3, 6, 9], target = 12",
        output: "[1, 3]",
        note: "3 + 9 = 12.",
      },
    ],
    hints: [
      "The hash-map trick works but spends O(n) memory. What does sortedness buy you?",
      "Put one pointer at each end. What does the current sum tell you about which pointer must move?",
      "Sum too small → only moving the left pointer right can help. Too big → move the right pointer left.",
    ],
    whyNow:
      "The map spends O(n) memory to remember what the ordering already tells you. Two pointers read the same information off the array itself, in constant space.",
    approach:
      "Start i at the front, j at the back. If nums[i] + nums[j] is too small, no pair using nums[i] can work with anything left of j (those are smaller still), so advance i. If too big, retreat j by the mirror argument. Each step permanently discards one element, so the walk terminates in n steps.",
    complexity: { time: "O(n)", space: "O(1)" },
    python: `def sorted_pair_sum(nums: list[int], target: int) -> list[int]:
    i, j = 0, len(nums) - 1
    while i < j:
        s = nums[i] + nums[j]
        if s == target:
            return [i, j]
        if s < target:
            i += 1
        else:
            j -= 1
    return []`,
    walkthrough: [
      {
        cells: { values: [1, 3, 6, 9], labels: { 0: "i", 3: "j" } },
        caption: "Target 12. Pointers at both ends.",
      },
      {
        cells: {
          values: [1, 3, 6, 9],
          marks: { 0: "compare", 3: "compare" },
          labels: { 0: "i", 3: "j" },
        },
        caption: "1 + 9 = 10 < 12. Nothing left of j can rescue 1 — advance i.",
      },
      {
        cells: {
          values: [1, 3, 6, 9],
          marks: { 0: "done", 1: "compare", 3: "compare" },
          labels: { 1: "i", 3: "j" },
        },
        caption: "3 + 9 = 12 — hit. Return [1, 3].",
      },
      {
        cells: { values: [1, 3, 6, 9], marks: { 1: "focus", 3: "focus" } },
        caption:
          "Each step throws away one element for good: O(n), O(1) space.",
      },
    ],
    alternatives: [
      {
        name: "Brute force",
        summary:
          "Try every pair and stop at the one that hits the target. It ignores the one thing this input gives you for free — the order — and it is the baseline the two-pointer answer is measured against.",
        complexity: { time: "O(n²)", space: "O(1)" },
        python: `def sorted_pair_sum(nums: list[int], target: int) -> list[int]:
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
      },
      {
        name: "Hash map",
        whyNow:
          "The double loop asks whether a partner exists by trying every candidate. One pass with a map answers it in a single lookup - but this is the answer for an unsorted array, and this array is sorted.",
        summary:
          "The unsorted-array solution still works — but it spends O(n) memory to ignore information the input already gives you for free.",
        complexity: { time: "O(n)", space: "O(n)" },
        python: `def sorted_pair_sum(nums: list[int], target: int) -> list[int]:
    seen: dict[int, int] = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i
    return []`,
      },
    ],
  },
  {
    id: "container-water",
    title: "Widest Container",
    pattern: "two-pointers",
    difficulty: "medium",
    leetcode: "container-with-most-water",
    brief: "Pick two lines that hold the most water between them.",
    statement:
      "Given an array heights where heights[i] is the height of a vertical line at position i, choose two lines so the area between them (width × shorter height) is maximised. Return that area.",
    constraints: [
      "2 <= height.length <= 10^5",
      "0 <= height[i] <= 10^4",
      "the container is capped by the shorter line and widened by the distance between them",
      "the lines are vertical: nothing between them affects the area",
    ],
    examples: [
      {
        input: "heights = [1, 8, 6, 2, 5, 4, 8, 3, 7]",
        output: "49",
        note: "Lines of height 8 and 7, seven apart: 7 × 7 = 49.",
      },
    ],
    hints: [
      "Area is limited by the shorter line. Start with maximum width — both ends.",
      "Shrinking width is always a loss unless the limiting side improves. Which pointer is pointless to move?",
      "Moving the taller side can never help: width drops and the short side still caps the height. Always move the shorter one.",
    ],
    whyNow:
      "Measuring every pair is n squared comparisons for one number. Moving the pointer at the shorter line inward discards only the pairs that line already capped, so a single sweep is enough.",
    approach:
      "Two pointers at the extremes. Record the area, then move the pointer at the shorter line inward — keeping it could only pair it with narrower widths while it stays the cap. This greedy discard is safe because every skipped pair is provably no better than one already measured.",
    complexity: { time: "O(n)", space: "O(1)" },
    python: `def max_area(heights: list[int]) -> int:
    i, j = 0, len(heights) - 1
    best = 0
    while i < j:
        best = max(best, (j - i) * min(heights[i], heights[j]))
        if heights[i] < heights[j]:
            i += 1
        else:
            j -= 1
    return best`,
    walkthrough: [
      {
        cells: {
          values: [1, 8, 6, 2, 5, 4, 8, 3, 7],
          labels: { 0: "i", 8: "j" },
        },
        caption: "Max width first. Area = 8 × min(1, 7) = 8.",
      },
      {
        cells: {
          values: [1, 8, 6, 2, 5, 4, 8, 3, 7],
          marks: { 0: "compare", 8: "compare" },
          labels: { 0: "i", 8: "j" },
        },
        caption:
          "Left line (1) is shorter — it caps every wider pairing. Move i.",
      },
      {
        cells: {
          values: [1, 8, 6, 2, 5, 4, 8, 3, 7],
          marks: { 0: "done", 1: "focus", 8: "focus" },
          labels: { 1: "i", 8: "j" },
        },
        caption: "8 and 7, width 7: area = 7 × 7 = 49. New best.",
      },
      {
        cells: {
          values: [1, 8, 6, 2, 5, 4, 8, 3, 7],
          marks: { 1: "compare", 8: "compare" },
          labels: { 1: "i", 8: "j" },
        },
        caption:
          "Right (7) is shorter now — move j inward. Later pairs never beat 49.",
      },
      {
        cells: {
          values: [1, 8, 6, 2, 5, 4, 8, 3, 7],
          marks: { 1: "done", 8: "done" },
        },
        caption:
          "Answer 49. Every discarded pair was provably ≤ a measured one.",
      },
    ],
    alternatives: [
      {
        name: "Brute force",
        summary:
          "Measure all pairs. Fine for tiny inputs; quadratic wall at scale. State it, then improve it.",
        complexity: { time: "O(n²)", space: "O(1)" },
        python: `def max_area(heights: list[int]) -> int:
    best = 0
    for i in range(len(heights)):
        for j in range(i + 1, len(heights)):
            best = max(best, (j - i) * min(heights[i], heights[j]))
    return best`,
      },
    ],
  },
  {
    id: "three-sum-zero",
    title: "Triplets Summing to Zero",
    pattern: "two-pointers",
    difficulty: "medium",
    leetcode: "3sum",
    brief: "All unique triplets that sum to zero.",
    statement:
      "Given an integer array, return every unique triplet [a, b, c] with a + b + c = 0. The same triplet must not appear twice in the output.",
    constraints: [
      "3 <= nums.length <= 3000",
      "-10^5 <= nums[i] <= 10^5",
      "the triples must be distinct as sets of values, not as sets of indices",
      "an element may not be reused within one triple",
    ],
    examples: [
      {
        input: "nums = [-1, 0, 1, 2, -1, -4]",
        output: "[[-1, -1, 2], [-1, 0, 1]]",
      },
    ],
    hints: [
      "Sort first. Duplicates become adjacent and the pair search gets cheap.",
      "Fix the smallest element of the triplet; the rest is exactly the sorted pair-sum problem on the suffix.",
      "Skip repeats at every level: same fixed element, same left value, same right value.",
    ],
    approach:
      "Sort the array. For each index k (skipping values equal to the previous one), run the two-pointer pair search on the suffix for target -nums[k]. When a triplet is found, advance both pointers past duplicate values before continuing so no repeated triplet is emitted. A small cutoff: once nums[k] > 0, no triplet can sum to zero.",
    complexity: { time: "O(n²)", space: "O(1) beyond output" },
    python: `def three_sum(nums: list[int]) -> list[list[int]]:
    nums.sort()
    out: list[list[int]] = []
    for k in range(len(nums) - 2):
        if nums[k] > 0:
            break
        if k > 0 and nums[k] == nums[k - 1]:
            continue
        i, j = k + 1, len(nums) - 1
        while i < j:
            s = nums[k] + nums[i] + nums[j]
            if s < 0:
                i += 1
            elif s > 0:
                j -= 1
            else:
                out.append([nums[k], nums[i], nums[j]])
                i += 1
                j -= 1
                while i < j and nums[i] == nums[i - 1]:
                    i += 1
                while i < j and nums[j] == nums[j + 1]:
                    j -= 1
    return out`,
    java: `public List<List<Integer>> threeSum(int[] nums) {
    Arrays.sort(nums);
    List<List<Integer>> out = new ArrayList<>();
    for (int k = 0; k + 2 < nums.length; k++) {
        if (nums[k] > 0) break;
        if (k > 0 && nums[k] == nums[k - 1]) continue;
        int i = k + 1, j = nums.length - 1;
        while (i < j) {
            int s = nums[k] + nums[i] + nums[j];
            if (s < 0) i++;
            else if (s > 0) j--;
            else {
                out.add(List.of(nums[k], nums[i], nums[j]));
                i++; j--;
                while (i < j && nums[i] == nums[i - 1]) i++;
                while (i < j && nums[j] == nums[j + 1]) j--;
            }
        }
    }
    return out;
}`,
    cpp: `vector<vector<int>> threeSum(vector<int> nums) {
    sort(nums.begin(), nums.end());
    vector<vector<int>> out;
    int n = nums.size();
    for (int k = 0; k + 2 < n; k++) {
        if (nums[k] > 0) break;
        if (k > 0 && nums[k] == nums[k - 1]) continue;
        int i = k + 1, j = n - 1;
        while (i < j) {
            int s = nums[k] + nums[i] + nums[j];
            if (s < 0) i++;
            else if (s > 0) j--;
            else {
                out.push_back({nums[k], nums[i], nums[j]});
                i++; j--;
                while (i < j && nums[i] == nums[i - 1]) i++;
                while (i < j && nums[j] == nums[j + 1]) j--;
            }
        }
    }
    return out;
}`,
    alternatives: [
      {
        name: "Brute force",
        summary:
          "Three nested loops, dedup with a set of sorted tuples. Cubic — only useful to establish correctness on small inputs.",
        complexity: { time: "O(n³)", space: "O(n) for dedup" },
        python: `def three_sum(nums: list[int]) -> list[list[int]]:
    found: set[tuple[int, int, int]] = set()
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            for k in range(j + 1, n):
                if nums[i] + nums[j] + nums[k] == 0:
                    found.add(tuple(sorted((nums[i], nums[j], nums[k]))))
    return [list(t) for t in found]`,
        java: `public List<List<Integer>> threeSum(int[] nums) {
    Set<List<Integer>> found = new HashSet<>();
    int n = nums.length;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            for (int k = j + 1; k < n; k++)
                if (nums[i] + nums[j] + nums[k] == 0) {
                    List<Integer> t = new ArrayList<>(List.of(nums[i], nums[j], nums[k]));
                    Collections.sort(t);
                    found.add(t);
                }
    return new ArrayList<>(found);
}`,
        cpp: `vector<vector<int>> threeSum(const vector<int>& nums) {
    set<vector<int>> found;
    int n = nums.size();
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            for (int k = j + 1; k < n; k++)
                if (nums[i] + nums[j] + nums[k] == 0) {
                    vector<int> t = {nums[i], nums[j], nums[k]};
                    sort(t.begin(), t.end());
                    found.insert(t);
                }
    return vector<vector<int>>(found.begin(), found.end());
}`,
      },
      {
        name: "Hash per anchor",
        summary:
          "Fix one element, solve two-sum with a hash set on the rest. Same O(n²) time as the pointer version but extra memory and fiddlier dedup — pointers are cleaner once the array is sorted anyway.",
        complexity: { time: "O(n²)", space: "O(n)" },
        python: `def three_sum(nums: list[int]) -> list[list[int]]:
    nums.sort()
    out: list[list[int]] = []
    for k in range(len(nums) - 2):
        if k > 0 and nums[k] == nums[k - 1]:
            continue
        seen: set[int] = set()
        target = -nums[k]
        for x in nums[k + 1 :]:
            if target - x in seen:
                triple = [nums[k], target - x, x]
                if triple not in out:
                    out.append(triple)
            seen.add(x)
    return out`,
        java: `public List<List<Integer>> threeSum(int[] nums) {
    Arrays.sort(nums);
    Set<List<Integer>> out = new LinkedHashSet<>();
    for (int k = 0; k + 2 < nums.length; k++) {
        if (k > 0 && nums[k] == nums[k - 1]) continue;
        Set<Integer> seen = new HashSet<>();
        int target = -nums[k];
        for (int m = k + 1; m < nums.length; m++) {
            int x = nums[m];
            if (seen.contains(target - x)) out.add(List.of(nums[k], target - x, x));
            seen.add(x);
        }
    }
    return new ArrayList<>(out);
}`,
        cpp: `vector<vector<int>> threeSum(vector<int> nums) {
    sort(nums.begin(), nums.end());
    set<vector<int>> out;
    int n = nums.size();
    for (int k = 0; k + 2 < n; k++) {
        if (k > 0 && nums[k] == nums[k - 1]) continue;
        unordered_set<int> seen;
        int target = -nums[k];
        for (int m = k + 1; m < n; m++) {
            int x = nums[m];
            if (seen.count(target - x)) out.insert({nums[k], target - x, x});
            seen.insert(x);
        }
    }
    return vector<vector<int>>(out.begin(), out.end());
}`,
      },
    ],
  },
]
