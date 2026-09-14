// intersection-of-arrays — the ladder: every way in, worst first.
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

export const approach = "Count the shorter array into a map from value to remaining stock, then stream the longer array past it. Each value that still has stock is taken into the answer and its count is decremented, so a value can be taken only as many times as the short side actually held it — min(count1, count2) falls out with no comparison of counts anywhere. A value the map has never heard of, or whose stock has hit zero, is skipped. One pass to build, one pass to spend, and the map never grows past the number of distinct values in the smaller array. The final sort exists only to pin down a single canonical ordering; the judge accepts any."

export const whyNow = "Counting nums2 always hashes nums2, whatever its size: ten values on the left and a billion on the right still costs a billion counts to produce a ten-element answer. The tally is symmetric — min(a, b) is the same either way round — so counting whichever array is SHORTER and streaming the other one gives the same answer with memory bounded by the smaller input, which is exactly what the follow-up about an unbounded, disk-resident nums2 asks for."

export const arc = "The ladder is a tour of every way two collections can be compared: cross off in place, sort both and walk cursors, count both sides and take the minimum per value, or count the smaller side and spend from it while scanning the larger. What decides the winner is not the asymptotic form but which input is smaller and whether the data is already sorted — which is exactly the follow-up question this problem is famous for. Carry the counting-with-multiplicity idea: for a multiset intersection, the answer's count for a value is the MINIMUM of the two counts, and 'spend as you go' is that minimum computed lazily. Counting the smaller array is the memory-conscious default."

export const complexity = { time: "O(n + m + k log k)", space: "O(min(n, m))" }

export const python = `def intersect(nums1: list[int], nums2: list[int]) -> list[int]:
    small, large = (nums1, nums2) if len(nums1) <= len(nums2) else (nums2, nums1)
    stock: dict[int, int] = {}
    for x in small:
        stock[x] = stock.get(x, 0) + 1
    out: list[int] = []
    for x in large:
        if stock.get(x, 0) > 0:
            stock[x] -= 1
            out.append(x)
    out.sort()
    return out`

export const java = `public int[] intersect(int[] nums1, int[] nums2) {
    int[] small = nums1.length <= nums2.length ? nums1 : nums2;
    int[] large = nums1.length <= nums2.length ? nums2 : nums1;
    Map<Integer, Integer> stock = new HashMap<>();
    for (int x : small) stock.merge(x, 1, Integer::sum);
    List<Integer> out = new ArrayList<>();
    for (int x : large) {
        int have = stock.getOrDefault(x, 0);
        if (have > 0) {
            stock.put(x, have - 1);
            out.add(x);
        }
    }
    Collections.sort(out);
    int[] ans = new int[out.size()];
    for (int i = 0; i < ans.length; i++) ans[i] = out.get(i);
    return ans;
}`

export const cpp = `vector<int> intersect(vector<int> nums1, vector<int> nums2) {
    const vector<int>& small = nums1.size() <= nums2.size() ? nums1 : nums2;
    const vector<int>& large = nums1.size() <= nums2.size() ? nums2 : nums1;
    unordered_map<int, int> stock;
    for (int x : small) stock[x]++;
    vector<int> out;
    for (int x : large) {
        auto it = stock.find(x);
        if (it != stock.end() && it->second > 0) {
            it->second--;
            out.push_back(x);
        }
    }
    sort(out.begin(), out.end());
    return out;
}`

export const alternatives: Solution[] = [
  {
    name: "Cross off with used flags",
    summary:
      "For each value on the left, scan the right for an unclaimed copy of it and mark that copy used. The flags are what stop one 2 on the right from answering for two 2s on the left.",
    complexity: { time: "O(n * m)", space: "O(m)" },
    python: `def intersect(nums1: list[int], nums2: list[int]) -> list[int]:
    used = [False] * len(nums2)
    out: list[int] = []
    for x in nums1:
        for j in range(len(nums2)):
            if not used[j] and nums2[j] == x:
                used[j] = True
                out.append(x)
                break
    out.sort()
    return out`,
    java: `public int[] intersect(int[] nums1, int[] nums2) {
    boolean[] used = new boolean[nums2.length];
    List<Integer> out = new ArrayList<>();
    for (int x : nums1) {
        for (int j = 0; j < nums2.length; j++) {
            if (!used[j] && nums2[j] == x) {
                used[j] = true;
                out.add(x);
                break;
            }
        }
    }
    Collections.sort(out);
    int[] ans = new int[out.size()];
    for (int i = 0; i < ans.length; i++) ans[i] = out.get(i);
    return ans;
}`,
    cpp: `vector<int> intersect(vector<int> nums1, vector<int> nums2) {
    vector<bool> used(nums2.size(), false);
    vector<int> out;
    for (int x : nums1) {
        for (int j = 0; j < (int)nums2.size(); j++) {
            if (!used[j] && nums2[j] == x) {
                used[j] = true;
                out.push_back(x);
                break;
            }
        }
    }
    sort(out.begin(), out.end());
    return out;
}`,
  },
  {
    name: "Sort both, then two cursors",
    summary:
      "Sort both arrays and walk them together. Equal values are a match and both cursors advance; otherwise the cursor on the smaller value advances, because that value can never be matched later.",
    complexity: { time: "O(n log n + m log m)", space: "O(n + m)" },
    whyNow:
      "The brute force restarts its scan of the right array from index 0 for every element of the left, re-reading copies it already claimed and skipped. Once both sides are in order neither cursor ever needs to go backwards, so each array is read exactly once — and the answer comes out ascending for free.",
    python: `def intersect(nums1: list[int], nums2: list[int]) -> list[int]:
    a = sorted(nums1)
    b = sorted(nums2)
    i = j = 0
    out: list[int] = []
    while i < len(a) and j < len(b):
        if a[i] < b[j]:
            i += 1
        elif a[i] > b[j]:
            j += 1
        else:
            out.append(a[i])
            i += 1
            j += 1
    return out`,
    java: `public int[] intersect(int[] nums1, int[] nums2) {
    int[] a = nums1.clone();
    int[] b = nums2.clone();
    Arrays.sort(a);
    Arrays.sort(b);
    List<Integer> out = new ArrayList<>();
    int i = 0, j = 0;
    while (i < a.length && j < b.length) {
        if (a[i] < b[j]) i++;
        else if (a[i] > b[j]) j++;
        else { out.add(a[i]); i++; j++; }
    }
    int[] ans = new int[out.size()];
    for (int k = 0; k < ans.length; k++) ans[k] = out.get(k);
    return ans;
}`,
    cpp: `vector<int> intersect(vector<int> nums1, vector<int> nums2) {
    sort(nums1.begin(), nums1.end());
    sort(nums2.begin(), nums2.end());
    vector<int> out;
    size_t i = 0, j = 0;
    while (i < nums1.size() && j < nums2.size()) {
        if (nums1[i] < nums2[j]) i++;
        else if (nums1[i] > nums2[j]) j++;
        else { out.push_back(nums1[i]); i++; j++; }
    }
    return out;
}`,
  },
  {
    name: "Count both sides, take the minimum",
    summary:
      "Tally each array into its own map, then for every value present on the left emit it min(left count, right count) times. The rule is stated outright instead of being enforced by flags or cursors.",
    complexity: { time: "O(n + m + k log k)", space: "O(n + m)" },
    whyNow:
      "Sorting spends O(n log n) putting the values in an order the answer never asked for — the question is how many of each value each side holds, and ordering is not part of that. Two tallies answer it in linear time, and make the min(count1, count2) rule visible as one line instead of an emergent property of two cursors.",
    python: `def intersect(nums1: list[int], nums2: list[int]) -> list[int]:
    c1: dict[int, int] = {}
    c2: dict[int, int] = {}
    for x in nums1:
        c1[x] = c1.get(x, 0) + 1
    for x in nums2:
        c2[x] = c2.get(x, 0) + 1
    out: list[int] = []
    for x, n in c1.items():
        take = min(n, c2.get(x, 0))
        out.extend([x] * take)
    out.sort()
    return out`,
    java: `public int[] intersect(int[] nums1, int[] nums2) {
    Map<Integer, Integer> c1 = new HashMap<>();
    Map<Integer, Integer> c2 = new HashMap<>();
    for (int x : nums1) c1.merge(x, 1, Integer::sum);
    for (int x : nums2) c2.merge(x, 1, Integer::sum);
    List<Integer> out = new ArrayList<>();
    for (Map.Entry<Integer, Integer> e : c1.entrySet()) {
        int take = Math.min(e.getValue(), c2.getOrDefault(e.getKey(), 0));
        for (int t = 0; t < take; t++) out.add(e.getKey());
    }
    Collections.sort(out);
    int[] ans = new int[out.size()];
    for (int i = 0; i < ans.length; i++) ans[i] = out.get(i);
    return ans;
}`,
    cpp: `vector<int> intersect(vector<int> nums1, vector<int> nums2) {
    unordered_map<int, int> c1, c2;
    for (int x : nums1) c1[x]++;
    for (int x : nums2) c2[x]++;
    vector<int> out;
    for (auto& kv : c1) {
        auto it = c2.find(kv.first);
        int take = it == c2.end() ? 0 : min(kv.second, it->second);
        for (int t = 0; t < take; t++) out.push_back(kv.first);
    }
    sort(out.begin(), out.end());
    return out;
}`,
  },
  {
    name: "One count table, spend as you go",
    summary:
      "Tally nums2 only, then walk nums1 and take any value that still has stock, decrementing it. The minimum is enforced by running out rather than by comparing two numbers.",
    complexity: { time: "O(n + m + k log k)", space: "O(m)" },
    whyNow:
      "The second tally exists only to be compared against the first, and building it forces a separate pass over the keys afterwards to assemble the answer. The left array can be consumed on the fly instead: a value that finds stock is taken and the stock drops, so one map and one walk produce what two maps and three passes did.",
    python: `def intersect(nums1: list[int], nums2: list[int]) -> list[int]:
    stock: dict[int, int] = {}
    for x in nums2:
        stock[x] = stock.get(x, 0) + 1
    out: list[int] = []
    for x in nums1:
        if stock.get(x, 0) > 0:
            stock[x] -= 1
            out.append(x)
    out.sort()
    return out`,
    java: `public int[] intersect(int[] nums1, int[] nums2) {
    Map<Integer, Integer> stock = new HashMap<>();
    for (int x : nums2) stock.merge(x, 1, Integer::sum);
    List<Integer> out = new ArrayList<>();
    for (int x : nums1) {
        int have = stock.getOrDefault(x, 0);
        if (have > 0) {
            stock.put(x, have - 1);
            out.add(x);
        }
    }
    Collections.sort(out);
    int[] ans = new int[out.size()];
    for (int i = 0; i < ans.length; i++) ans[i] = out.get(i);
    return ans;
}`,
    cpp: `vector<int> intersect(vector<int> nums1, vector<int> nums2) {
    unordered_map<int, int> stock;
    for (int x : nums2) stock[x]++;
    vector<int> out;
    for (int x : nums1) {
        auto it = stock.find(x);
        if (it != stock.end() && it->second > 0) {
            it->second--;
            out.push_back(x);
        }
    }
    sort(out.begin(), out.end());
    return out;
}`,
  },
]
