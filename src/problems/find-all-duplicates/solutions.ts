// find-all-duplicates — the ladder: every way in, worst first.
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

export const approach = "Walk the array once. For each value take its magnitude v and look at index v - 1. If the number parked there is already negative, v has been seen before, so it is a duplicate. Otherwise negate it, which records 'v has been seen' without losing anything — the original value is still there in the magnitude, which is why every read takes an absolute value first. Two passes' worth of information in one pass, and the only allocation is the answer itself."

export const whyNow = "The tally array is n + 1 extra slots holding one bit each, when the input already has exactly n slots and every value points at one. Nothing new has to be allocated: the sign of nums[v - 1] carries the flag and the magnitude keeps the value, so the answer costs no memory beyond the list being returned."

export const arc = "Five rungs and one question underneath all of them: where is the memory for 'have I seen this' going to live? Pairwise comparison uses none and pays quadratically; sorting reuses the array itself but destroys the order; a hash map and a flag table both buy linear time with linear memory. The last rung is the one worth studying — the values are promised to lie in 1..n, so the ARRAY is already a table with exactly the right number of slots, and negating the value at index v-1 records that v was seen. Encoding a bit inside the data is a genuine constant-space technique, and its price is always the same: the data is mutated, so decide whether the caller can tolerate that, and remember how to undo it."

export const complexity = { time: "O(n)", space: "O(1)" }

export const python = `def find_duplicates(nums: list[int]) -> list[int]:
    out = []
    for x in nums:
        at = abs(x) - 1  # the magnitude survives the marking
        if nums[at] < 0:
            out.append(abs(x))
        else:
            nums[at] = -nums[at]
    return out`

export const java = `public int[] findDuplicates(int[] nums) {
    List<Integer> out = new ArrayList<>();
    for (int x : nums) {
        int at = Math.abs(x) - 1;
        if (nums[at] < 0) out.add(Math.abs(x));
        else nums[at] = -nums[at];
    }
    int[] answer = new int[out.size()];
    for (int i = 0; i < answer.length; i++) answer[i] = out.get(i);
    return answer;
}`

export const cpp = `vector<int> findDuplicates(vector<int> nums) {
    vector<int> out;
    for (int x : nums) {
        int v = x < 0 ? -x : x;
        if (nums[v - 1] < 0) out.push_back(v);
        else nums[v - 1] = -nums[v - 1];
    }
    return out;
}`

export const alternatives: Solution[] = [
  {
    name: "Compare every pair",
    summary:
      "For each element, look at everything after it and report a match. No memory and no cleverness, and quadratic — on the 10^5 bound that is five billion comparisons. It also ignores the promise that makes this problem special: the values are confined to 1..n, which is what every later rung spends.",
    complexity: { time: "O(n^2)", space: "O(1)" },
    python: `def find_duplicates(nums: list[int]) -> list[int]:
    out = []
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] == nums[j]:
                out.append(nums[i])
    return out`,
    java: `public int[] findDuplicates(int[] nums) {
    List<Integer> out = new ArrayList<>();
    for (int i = 0; i < nums.length; i++) {
        for (int j = i + 1; j < nums.length; j++) {
            if (nums[i] == nums[j]) out.add(nums[i]);
        }
    }
    int[] answer = new int[out.size()];
    for (int i = 0; i < answer.length; i++) answer[i] = out.get(i);
    return answer;
}`,
    cpp: `vector<int> findDuplicates(const vector<int>& nums) {
    vector<int> out;
    for (int i = 0; i < (int)nums.size(); i++) {
        for (int j = i + 1; j < (int)nums.size(); j++) {
            if (nums[i] == nums[j]) out.push_back(nums[i]);
        }
    }
    return out;
}`,
  },
  {
    name: "Sort, then read neighbours",
    summary:
      "Sorting puts the two copies of a value side by side, so one walk comparing each element with its predecessor collects every pair. Drops the quadratic scan for n log n, and pays for it by destroying the caller's order — in a problem whose values already tell you where they belong.",
    complexity: { time: "O(n log n)", space: "O(n)" },
    whyNow:
      "The pair scan re-reads the whole tail for every element: at n = 10^5 that is about 5 * 10^9 comparisons, minutes of work for an answer that needs milliseconds. Sorting brings the two copies of a value together so a single pass is enough — but it rearranges the input and still costs n log n.",
    python: `def find_duplicates(nums: list[int]) -> list[int]:
    ordered = sorted(nums)
    out = []
    for i in range(1, len(ordered)):
        if ordered[i] == ordered[i - 1]:
            out.append(ordered[i])
    return out`,
    java: `public int[] findDuplicates(int[] nums) {
    int[] ordered = nums.clone();
    Arrays.sort(ordered);
    List<Integer> out = new ArrayList<>();
    for (int i = 1; i < ordered.length; i++) {
        if (ordered[i] == ordered[i - 1]) out.add(ordered[i]);
    }
    int[] answer = new int[out.size()];
    for (int i = 0; i < answer.length; i++) answer[i] = out.get(i);
    return answer;
}`,
    cpp: `vector<int> findDuplicates(vector<int> nums) {
    sort(nums.begin(), nums.end());
    vector<int> out;
    for (int i = 1; i < (int)nums.size(); i++) {
        if (nums[i] == nums[i - 1]) out.push_back(nums[i]);
    }
    return out;
}`,
  },
  {
    name: "Count in a hash map",
    summary:
      "One pass to count how often each value occurs, then walk 1..n and take those seen twice. Linear at last, and the memory is the point: a general-purpose map for keys that are promised to be 1..n, which is a lookup table with a hash function bolted on top of it.",
    complexity: { time: "O(n)", space: "O(n)" },
    whyNow:
      "Sorting still costs n log n and moves values the caller may want where they were. Counting touches each value once and moves nothing — the price is a map entry per distinct value and a hash computed on every lookup.",
    python: `def find_duplicates(nums: list[int]) -> list[int]:
    counts: dict[int, int] = {}
    for x in nums:
        counts[x] = counts.get(x, 0) + 1
    out = []
    for v in range(1, len(nums) + 1):
        if counts.get(v, 0) == 2:
            out.append(v)
    return out`,
    java: `public int[] findDuplicates(int[] nums) {
    Map<Integer, Integer> counts = new HashMap<>();
    for (int x : nums) counts.merge(x, 1, Integer::sum);
    List<Integer> out = new ArrayList<>();
    for (int v = 1; v <= nums.length; v++) {
        if (counts.getOrDefault(v, 0) == 2) out.add(v);
    }
    int[] answer = new int[out.size()];
    for (int i = 0; i < answer.length; i++) answer[i] = out.get(i);
    return answer;
}`,
    cpp: `vector<int> findDuplicates(const vector<int>& nums) {
    unordered_map<int, int> counts;
    for (int x : nums) counts[x]++;
    vector<int> out;
    for (int v = 1; v <= (int)nums.size(); v++) {
        if (counts[v] == 2) out.push_back(v);
    }
    return out;
}`,
  },
  {
    name: "A flag per value",
    summary:
      "Since the values are bounded by n, the lookup table can be a plain array of n + 1 flags rather than a map — no hashing, no buckets, one memory access per value. Still O(n) extra space, and that is the last thing left to remove: the array itself already has n slots that could carry the same marks.",
    complexity: { time: "O(n)", space: "O(n)" },
    whyNow:
      "The map hashes keys that are already small integers and boxes each one — work that buys nothing when the key range is known to be 1..n. A flat array indexes straight to the slot, so the same one-pass idea runs with array reads instead of hash lookups, and the answer comes out during that pass rather than in a second sweep.",
    python: `def find_duplicates(nums: list[int]) -> list[int]:
    seen = [False] * (len(nums) + 1)
    out = []
    for x in nums:
        if seen[x]:
            out.append(x)
        else:
            seen[x] = True
    return out`,
    java: `public int[] findDuplicates(int[] nums) {
    boolean[] seen = new boolean[nums.length + 1];
    List<Integer> out = new ArrayList<>();
    for (int x : nums) {
        if (seen[x]) out.add(x);
        else seen[x] = true;
    }
    int[] answer = new int[out.size()];
    for (int i = 0; i < answer.length; i++) answer[i] = out.get(i);
    return answer;
}`,
    cpp: `vector<int> findDuplicates(const vector<int>& nums) {
    vector<bool> seen(nums.size() + 1, false);
    vector<int> out;
    for (int x : nums) {
        if (seen[x]) out.push_back(x);
        else seen[x] = true;
    }
    return out;
}`,
  },
]
