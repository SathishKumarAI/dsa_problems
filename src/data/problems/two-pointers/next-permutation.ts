import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "next-permutation",
  title: "The Next Arrangement in Order",
  pattern: "two-pointers",
  difficulty: "medium",
  leetcode: "next-permutation",
  brief:
    "Rearrange the numbers into the very next arrangement, counting upward.",
  statement:
    "List every arrangement of the given numbers in increasing order, as if each arrangement were a number read left to right. Return the one that comes immediately after the array you were handed.",
  constraints: [
    "1 <= nums.length <= 100, and 0 <= nums[i] <= 100",
    "the answer uses exactly the same multiset of values — this is a rearrangement, never a substitution",
    "a fully descending array is the LAST arrangement, so it has no successor and wraps around to the sorted-ascending first one",
    "duplicates are allowed, and two arrangements that read the same are the same arrangement — [1,1,5] is followed by [1,5,1], not by another [1,1,5]",
    "a single element is both the first and last arrangement, so it comes back unchanged",
    "the rearrangement happens in place, using only a constant amount of extra room",
  ],
  examples: [
    { input: "nums = [1, 2, 3]", output: "[1, 3, 2]" },
    {
      input: "nums = [3, 2, 1]",
      output: "[1, 2, 3]",
      note: "The wrap. Nothing is larger, so the sequence starts over at the smallest arrangement — a solution that only knows how to step forward returns nothing here.",
    },
    {
      input: "nums = [1, 3, 5, 4, 2]",
      output: "[1, 4, 2, 3, 5]",
      note: "Only the tail from index 1 changes, and it comes back ascending rather than merely swapped.",
    },
  ],
  hints: [
    "The next arrangement differs from this one as far to the RIGHT as possible — the front stays put as long as it can.",
    "Scan from the right for the first position whose value is smaller than its neighbour. Everything past it is descending, which means it is already the largest it can be.",
    "Swap that position with the smallest value to its right that still beats it, then make the tail as small as possible. The tail is descending, so reversing it is all that takes.",
  ],
  whyNow:
    "Copying the tail out, reversing it, and writing it straight back allocates a second array whose entire purpose is to be poured into the first — memory proportional to the input for an operation that changes nothing but the order of what is already there. Two indices walking toward each other from the ends of the tail swap it into place where it lies, which is the constant-space requirement met rather than approximated.",
  approach:
    "Walk in from the right to find the pivot: the last position whose value is smaller than the one after it. Everything to its right is non-increasing, which is exactly the statement that the tail is already at its largest arrangement — so the pivot is the rightmost place where anything can grow. Find the last value in that tail still greater than the pivot and swap the two; the pivot's slot has now grown by the smallest amount possible, and the tail stays non-increasing because the swap traded two values in the right order. Reverse the tail in place with two indices to turn the largest tail into the smallest, and the result is the immediate successor. If no pivot exists the array was the final arrangement: the tail is the whole array, and reversing it wraps to the sorted order.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def next_permutation(nums: list[int]) -> list[int]:
    n = len(nums)
    pivot = n - 2
    while pivot >= 0 and nums[pivot] >= nums[pivot + 1]:
        pivot -= 1
    if pivot >= 0:
        at = n - 1
        while nums[at] <= nums[pivot]:
            at -= 1
        nums[pivot], nums[at] = nums[at], nums[pivot]
    # pivot == -1 means no successor: the tail is the whole array, and
    # reversing it wraps to the smallest arrangement
    left, right = pivot + 1, n - 1
    while left < right:
        nums[left], nums[right] = nums[right], nums[left]
        left += 1
        right -= 1
    return nums`,
  java: `public int[] nextPermutation(int[] nums) {
    int n = nums.length;
    int pivot = n - 2;
    while (pivot >= 0 && nums[pivot] >= nums[pivot + 1]) pivot--;
    if (pivot >= 0) {
        int at = n - 1;
        while (nums[at] <= nums[pivot]) at--;
        int tmp = nums[pivot];
        nums[pivot] = nums[at];
        nums[at] = tmp;
    }
    int left = pivot + 1, right = n - 1;
    while (left < right) {
        int tmp = nums[left];
        nums[left] = nums[right];
        nums[right] = tmp;
        left++;
        right--;
    }
    return nums;
}`,
  cpp: `vector<int> nextPermutation(vector<int> nums) {
    int n = (int)nums.size();
    int pivot = n - 2;
    while (pivot >= 0 && nums[pivot] >= nums[pivot + 1]) pivot--;
    if (pivot >= 0) {
        int at = n - 1;
        while (nums[at] <= nums[pivot]) at--;
        int tmp = nums[pivot];
        nums[pivot] = nums[at];
        nums[at] = tmp;
    }
    int left = pivot + 1, right = n - 1;
    while (left < right) {
        int tmp = nums[left];
        nums[left] = nums[right];
        nums[right] = tmp;
        left++;
        right--;
    }
    return nums;
}`,
  walkthrough: [
    {
      cells: {
        values: [1, 3, 5, 4, 2],
        marks: { 2: "window", 3: "window", 4: "window" },
        labels: { 1: "pivot" },
      },
      caption:
        "Scanning in from the right, 4 >= 2 and 5 >= 4, but 3 < 5. Index 1 is the pivot; the tail [5, 4, 2] behind it is already its own largest arrangement.",
    },
    {
      cells: {
        values: [1, 3, 5, 4, 2],
        marks: { 1: "focus", 3: "compare" },
        labels: { 1: "pivot", 3: "at" },
      },
      caption:
        "Walking back from the end for the last value still greater than 3: the 2 is too small, the 4 is not. That 4 is the smallest possible upgrade for the pivot's slot.",
    },
    {
      cells: {
        values: [1, 4, 5, 3, 2],
        marks: { 1: "done", 2: "window", 3: "window", 4: "window" },
        labels: { 2: "left", 4: "right" },
      },
      caption:
        "Swap them. The front is now as small as it can be while still exceeding the original, and the tail [5, 3, 2] is still descending — the swap put 3 exactly where 4 had been.",
    },
    {
      cells: {
        values: [1, 4, 2, 3, 5],
        marks: { 1: "done", 2: "focus", 4: "focus" },
        labels: { 3: "left/right" },
      },
      caption:
        "Two indices walk in from the ends of the tail and swap as they go, turning the largest tail into the smallest. They meet at index 3 and stop.",
    },
    {
      cells: {
        values: [1, 4, 2, 3, 5],
        marks: { 0: "done", 1: "done", 2: "done", 3: "done", 4: "done" },
      },
      caption:
        "[1, 4, 2, 3, 5] — the immediate successor of [1, 3, 5, 4, 2]. Had there been no pivot at all, the same reversal would have run over the whole array and wrapped it to sorted order.",
    },
  ],
  alternatives: [
    {
      name: "List every arrangement in order",
      summary:
        "Generate all n! orderings of the values, drop the duplicates, sort them, find where the input sits and take the next entry — wrapping to the first when the input is last.",
      complexity: { time: "O(n! · n log(n!))", space: "O(n! · n)" },
      python: `def next_permutation(nums: list[int]) -> list[int]:
    n = len(nums)
    base = sorted(nums)
    total = 1
    for i in range(2, n + 1):
        total *= i
    seen = set()
    for k in range(total):
        # k counted in the factorial number system picks one ordering
        pool = list(base)
        perm = []
        rest = k
        for left in range(n, 0, -1):
            f = 1
            for i in range(2, left):
                f *= i
            perm.append(pool.pop(rest // f))
            rest %= f
        seen.add(tuple(perm))
    ordered = sorted(seen)
    at = ordered.index(tuple(nums))
    return list(ordered[(at + 1) % len(ordered)])`,
      java: `public int[] nextPermutation(int[] nums) {
    int n = nums.length;
    int[] base = nums.clone();
    Arrays.sort(base);
    long total = 1;
    for (int i = 2; i <= n; i++) total *= i;
    List<int[]> all = new ArrayList<>();
    for (long k = 0; k < total; k++) {
        List<Integer> pool = new ArrayList<>();
        for (int v : base) pool.add(v);
        int[] perm = new int[n];
        long rest = k;
        for (int left = n; left >= 1; left--) {
            long f = 1;
            for (int i = 2; i < left; i++) f *= i;
            perm[n - left] = pool.remove((int) (rest / f));
            rest = rest % f;
        }
        all.add(perm);
    }
    all.sort((a, b) -> {
        for (int i = 0; i < a.length; i++) if (a[i] != b[i]) return a[i] - b[i];
        return 0;
    });
    List<int[]> uniq = new ArrayList<>();
    for (int[] p : all) {
        boolean same = false;
        if (!uniq.isEmpty()) {
            same = true;
            int[] last = uniq.get(uniq.size() - 1);
            for (int i = 0; i < n; i++) if (last[i] != p[i]) same = false;
        }
        if (!same) uniq.add(p);
    }
    int at = 0;
    for (int i = 0; i < uniq.size(); i++) {
        boolean same = true;
        for (int j = 0; j < n; j++) if (uniq.get(i)[j] != nums[j]) same = false;
        if (same) at = i;
    }
    return uniq.get((at + 1) % uniq.size());
}`,
      cpp: `vector<int> nextPermutation(vector<int> nums) {
    int n = (int)nums.size();
    vector<int> base = nums;
    sort(base.begin(), base.end());
    long long total = 1;
    for (int i = 2; i <= n; i++) total *= i;
    vector<vector<int>> all;
    for (long long k = 0; k < total; k++) {
        vector<int> pool = base;
        vector<int> perm;
        long long rest = k;
        for (int left = n; left >= 1; left--) {
            long long f = 1;
            for (int i = 2; i < left; i++) f *= i;
            int idx = (int)(rest / f);
            perm.push_back(pool[idx]);
            pool.erase(pool.begin() + idx);
            rest = rest % f;
        }
        all.push_back(perm);
    }
    sort(all.begin(), all.end());
    all.erase(unique(all.begin(), all.end()), all.end());
    int at = 0;
    for (int i = 0; i < (int)all.size(); i++) if (all[i] == nums) at = i;
    return all[(at + 1) % (int)all.size()];
}`,
    },
    {
      name: "Try every swap, then sort the tail",
      summary:
        "For each pair of positions, swap them, sort everything after the left one, and keep the smallest result that still beats the original. If nothing beats it, the answer is the sorted array.",
      complexity: { time: "O(n^3 log n)", space: "O(n)" },
      whyNow:
        "Building n! arrangements to move a handful of values is hopeless past about ten elements, and storing them all is worse than generating them. The successor is always reachable by one swap plus a sorted tail, so a candidate set of n^2 arrangements already contains it — the factorial part was never needed.",
      python: `def next_permutation(nums: list[int]) -> list[int]:
    n = len(nums)
    best = None
    for i in range(n):
        for j in range(i + 1, n):
            cand = list(nums)
            cand[i], cand[j] = cand[j], cand[i]
            cand[i + 1 :] = sorted(cand[i + 1 :])
            if cand > nums and (best is None or cand < best):
                best = cand
    # nothing beat the input, so it was the last arrangement
    return best if best is not None else sorted(nums)`,
      java: `public int[] nextPermutation(int[] nums) {
    int n = nums.length;
    int[] best = null;
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            int[] cand = nums.clone();
            cand[i] = nums[j];
            cand[j] = nums[i];
            Arrays.sort(cand, i + 1, n);
            int c = 0;
            for (int k = 0; k < n && c == 0; k++)
                if (cand[k] != nums[k]) c = cand[k] < nums[k] ? -1 : 1;
            if (c <= 0) continue;
            int b = best == null ? 1 : 0;
            for (int k = 0; k < n && b == 0; k++)
                if (cand[k] != best[k]) b = cand[k] < best[k] ? 1 : -1;
            if (b > 0) best = cand;
        }
    }
    if (best == null) {
        best = nums.clone();
        Arrays.sort(best);
    }
    return best;
}`,
      cpp: `vector<int> nextPermutation(vector<int> nums) {
    int n = (int)nums.size();
    vector<int> best;
    bool found = false;
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            vector<int> cand = nums;
            int tmp = cand[i];
            cand[i] = cand[j];
            cand[j] = tmp;
            sort(cand.begin() + i + 1, cand.end());
            if (!(cand > nums)) continue;
            if (!found || cand < best) {
                best = cand;
                found = true;
            }
        }
    }
    if (!found) {
        best = nums;
        sort(best.begin(), best.end());
    }
    return best;
}`,
    },
    {
      name: "Find the pivot, then sort the tail",
      summary:
        "Scan in from the right for the pivot, sort the tail ascending, then swap the pivot with the first tail value that exceeds it.",
      complexity: { time: "O(n log n)", space: "O(n)" },
      whyNow:
        "Trying every pair tests n^2 candidates when only one position can ever change first: the rightmost index whose value is smaller than its neighbour. Everything to its right is descending, so it is already maximal and nothing there can grow — naming that pivot collapses the whole search to a single scan.",
      python: `def next_permutation(nums: list[int]) -> list[int]:
    n = len(nums)
    pivot = n - 2
    while pivot >= 0 and nums[pivot] >= nums[pivot + 1]:
        pivot -= 1
    if pivot < 0:
        nums.sort()  # no successor: wrap to the smallest arrangement
        return nums
    nums[pivot + 1 :] = sorted(nums[pivot + 1 :])
    at = pivot + 1
    while nums[at] <= nums[pivot]:
        at += 1
    # the tail stays ascending: the pivot's value slots exactly where the
    # value it displaced was smallest-but-still-larger
    nums[pivot], nums[at] = nums[at], nums[pivot]
    return nums`,
      java: `public int[] nextPermutation(int[] nums) {
    int n = nums.length;
    int pivot = n - 2;
    while (pivot >= 0 && nums[pivot] >= nums[pivot + 1]) pivot--;
    if (pivot < 0) {
        Arrays.sort(nums);
        return nums;
    }
    Arrays.sort(nums, pivot + 1, n);
    int at = pivot + 1;
    while (nums[at] <= nums[pivot]) at++;
    int tmp = nums[pivot];
    nums[pivot] = nums[at];
    nums[at] = tmp;
    return nums;
}`,
      cpp: `vector<int> nextPermutation(vector<int> nums) {
    int n = (int)nums.size();
    int pivot = n - 2;
    while (pivot >= 0 && nums[pivot] >= nums[pivot + 1]) pivot--;
    if (pivot < 0) {
        sort(nums.begin(), nums.end());
        return nums;
    }
    sort(nums.begin() + pivot + 1, nums.end());
    int at = pivot + 1;
    while (nums[at] <= nums[pivot]) at++;
    int tmp = nums[pivot];
    nums[pivot] = nums[at];
    nums[at] = tmp;
    return nums;
}`,
    },
    {
      name: "Pivot, swap, rebuild the tail backwards",
      summary:
        "Find the pivot, swap it with the last value that still beats it, then read the tail from the end into a fresh list and copy that list back.",
      complexity: { time: "O(n)", space: "O(n)" },
      whyNow:
        "Sorting the tail spends O(n log n) comparisons discovering an order that is already known: the tail was descending before the swap, and swapping a smaller value into the slot of a larger one keeps it descending. Reading it backwards produces the ascending version for free, which drops the whole solution to a linear pass.",
      python: `def next_permutation(nums: list[int]) -> list[int]:
    n = len(nums)
    pivot = n - 2
    while pivot >= 0 and nums[pivot] >= nums[pivot + 1]:
        pivot -= 1
    if pivot >= 0:
        at = n - 1
        while nums[at] <= nums[pivot]:
            at -= 1
        nums[pivot], nums[at] = nums[at], nums[pivot]
    tail = []
    for i in range(n - 1, pivot, -1):
        tail.append(nums[i])
    nums[pivot + 1 :] = tail
    return nums`,
      java: `public int[] nextPermutation(int[] nums) {
    int n = nums.length;
    int pivot = n - 2;
    while (pivot >= 0 && nums[pivot] >= nums[pivot + 1]) pivot--;
    if (pivot >= 0) {
        int at = n - 1;
        while (nums[at] <= nums[pivot]) at--;
        int tmp = nums[pivot];
        nums[pivot] = nums[at];
        nums[at] = tmp;
    }
    int[] tail = new int[n - pivot - 1];
    for (int i = 0; i < tail.length; i++) tail[i] = nums[n - 1 - i];
    for (int i = 0; i < tail.length; i++) nums[pivot + 1 + i] = tail[i];
    return nums;
}`,
      cpp: `vector<int> nextPermutation(vector<int> nums) {
    int n = (int)nums.size();
    int pivot = n - 2;
    while (pivot >= 0 && nums[pivot] >= nums[pivot + 1]) pivot--;
    if (pivot >= 0) {
        int at = n - 1;
        while (nums[at] <= nums[pivot]) at--;
        int tmp = nums[pivot];
        nums[pivot] = nums[at];
        nums[at] = tmp;
    }
    vector<int> tail;
    for (int i = n - 1; i > pivot; i--) tail.push_back(nums[i]);
    for (int i = 0; i < (int)tail.size(); i++) nums[pivot + 1 + i] = tail[i];
    return nums;
}`,
    },
  ],
}
