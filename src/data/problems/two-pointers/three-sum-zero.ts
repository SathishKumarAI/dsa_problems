import type { Problem } from "../../types.ts"

export const problem: Problem = {
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
}
