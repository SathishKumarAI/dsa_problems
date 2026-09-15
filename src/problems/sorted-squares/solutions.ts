// sorted-squares — the ladder: every way in, worst first.
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

export const approach = "Squaring folds the array around zero: values decrease in magnitude toward the middle and increase toward both ends. So the largest square is always at one end, which means the answer can be filled from the back. Compare the squares at the two ends, write the larger into the last unfilled slot, and move that pointer inward. Each step places exactly one value and consumes exactly one input, so the walk is linear and the result is sorted by construction."

export const whyNow = "Squaring and sorting throws away the ordering that was handed to you and pays n log n to rebuild it. The sortedness is still there in a usable form — the array is smallest in the middle and largest at the ends — so two pointers walking inward produce the answer in order, in a single pass."

export const arc = "Squaring destroys the sorted order only in one specific way: the negatives reverse and the positives keep going, so the result is two sorted runs facing each other. Once that is said, the merge is obvious and the only real decision is direction — comparing the two ENDS gives the largest square, so filling the output from the back avoids any shifting. The general lesson is worth more than the trick: when a transformation breaks sortedness, ask what structure it leaves behind, because a merge of two sorted runs is linear while a fresh sort is not. This is also a clean rehearsal for merging in place from the back, which is the merge-sorted-array technique next door."

export const complexity = { time: "O(n)", space: "O(n)" }

export const python = `def sorted_squares(nums: list[int]) -> list[int]:
    out = [0] * len(nums)
    i, j = 0, len(nums) - 1
    for at in range(len(nums) - 1, -1, -1):
        left = nums[i] * nums[i]
        right = nums[j] * nums[j]
        if left > right:
            out[at] = left
            i += 1
        else:
            out[at] = right
            j -= 1
    return out`

export const java = `public int[] sortedSquares(int[] nums) {
    int[] out = new int[nums.length];
    int i = 0, j = nums.length - 1;
    for (int at = nums.length - 1; at >= 0; at--) {
        int left = nums[i] * nums[i];
        int right = nums[j] * nums[j];
        if (left > right) {
            out[at] = left;
            i++;
        } else {
            out[at] = right;
            j--;
        }
    }
    return out;
}`

export const cpp = `vector<int> sortedSquares(const vector<int>& nums) {
    int n = (int)nums.size();
    vector<int> out(n);
    int i = 0, j = n - 1;
    for (int at = n - 1; at >= 0; at--) {
        int left = nums[i] * nums[i];
        int right = nums[j] * nums[j];
        if (left > right) {
            out[at] = left;
            i++;
        } else {
            out[at] = right;
            j--;
        }
    }
    return out;
}`

export const alternatives: Solution[] = [
  {
    key: "sort",
    name: "Square, then sort",
    summary:
      "Square every value and hand the result to a sort. One line, and it throws away the only promise the input makes: the input was sorted, so the squares already run outward from whichever value sits nearest zero. Paying n log n to rediscover that is the waste.",
    complexity: { time: "O(n log n)", space: "O(n)" },
    python: `def sorted_squares(nums: list[int]) -> list[int]:
    return sorted(x * x for x in nums)`,
    java: `public int[] sortedSquares(int[] nums) {
    int[] out = new int[nums.length];
    for (int i = 0; i < nums.length; i++) out[i] = nums[i] * nums[i];
    Arrays.sort(out);
    return out;
}`,
    cpp: `vector<int> sortedSquares(const vector<int>& nums) {
    vector<int> out;
    for (int x : nums) out.push_back(x * x);
    sort(out.begin(), out.end());
    return out;
}`,
  },
  // B79. The document reaches the answer through this rung and the page could
  // not name it. It is the approach you arrive at by REASONING about what
  // squaring does to a sorted array — the input is two ascending runs of
  // squares, so merge them — where the optimal rung is the same insight
  // compressed until the two runs are no longer visible in the code.
  {
    key: "merge",
    // a stepping stone, not a variant: the document reaches the two-pointer
    // answer THROUGH this, so it sits between the sort and the answer
    after: "sort",
    name: "Split at zero, merge two runs",
    whyNow:
      "The sort is paying a log factor to discover an order the input already dictates. Squaring a sorted array does not scramble it: it leaves a descending run of squares over the negatives and an ascending run over the rest. Two sorted sequences merge in linear time, which is one comparison per output element and no sort at all.",
    summary:
      "Find where the negatives end, then read the negative half right-to-left and the non-negative half left-to-right as two ascending sequences of squares, and merge them front to back. Linear, and it names the structure out loud — the input IS two sorted runs — which is the sentence the two-pointer version leaves implicit. The output array is the only allocation, and the problem requires that anyway.",
    complexity: { time: "O(n)", space: "O(n)" },
    python: `def sorted_squares(nums: list[int]) -> list[int]:
    n = len(nums)
    split = 0
    while split < n and nums[split] < 0:  # first index holding a non-negative
        split += 1
    i, j = split - 1, split  # i walks the negatives leftward, j the rest rightward
    out: list[int] = []
    while i >= 0 and j < n:
        left, right = nums[i] * nums[i], nums[j] * nums[j]
        if left <= right:
            out.append(left)
            i -= 1
        else:
            out.append(right)
            j += 1
    while i >= 0:  # one run is exhausted; drain the other
        out.append(nums[i] * nums[i])
        i -= 1
    while j < n:
        out.append(nums[j] * nums[j])
        j += 1
    return out`,
    java: `public int[] sortedSquares(int[] nums) {
    int n = nums.length;
    int split = 0;
    while (split < n && nums[split] < 0) split++;
    int i = split - 1, j = split, at = 0;
    int[] out = new int[n];
    while (i >= 0 && j < n) {
        int left = nums[i] * nums[i], right = nums[j] * nums[j];
        if (left <= right) {
            out[at++] = left;
            i--;
        } else {
            out[at++] = right;
            j++;
        }
    }
    while (i >= 0) out[at++] = nums[i] * nums[i--];
    while (j < n) out[at++] = nums[j] * nums[j++];
    return out;
}`,
    cpp: `vector<int> sortedSquares(const vector<int>& nums) {
    int n = (int)nums.size();
    int split = 0;
    while (split < n && nums[split] < 0) split++;
    int i = split - 1, j = split;
    vector<int> out;
    while (i >= 0 && j < n) {
        int left = nums[i] * nums[i], right = nums[j] * nums[j];
        if (left <= right) {
            out.push_back(left);
            i--;
        } else {
            out.push_back(right);
            j++;
        }
    }
    while (i >= 0) { out.push_back(nums[i] * nums[i]); i--; }
    while (j < n) { out.push_back(nums[j] * nums[j]); j++; }
    return out;
}`,
  },
]
