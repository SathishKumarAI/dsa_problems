// jump-game — the ladder: every way in, worst first.
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

export const approach = "One pass, one number: the furthest index reachable so far, starting at 0. At each index, if it is beyond the current reach, no sequence of jumps arrives there and the answer is false. Otherwise extend the reach to the larger of itself and index + nums[index]. If the loop survives to the end — or the reach ever covers the last index — the end is reachable. The greedy is safe because reach is a maximum over everything seen, so it never overstates what is possible and never forgets a better jump."

export const whyNow = "Scanning backwards for the nearest good index is linear, but it reads the array right to left while the problem runs left to right, and it keeps the answer in terms of a moving target index. Carrying the furthest reachable index forward answers the same question in one left-to-right pass with a single integer of state, and it can stop the moment the reach falls behind — which is the same failure the backwards scan only discovers at the end."

export const arc = "Notice what the question does NOT ask: it never wants the jumps, only whether the end is reachable. Every rung that tries to construct a route — backtracking, then a table of good indices — is answering a harder question than the one asked, and pays for it. Once you keep only the furthest index reachable so far, the whole problem collapses into one number and one comparison. That is the greedy test in general: find a quantity that is a maximum over everything seen, and check that extending it never invalidates an earlier choice. Know this one cold, and know its sibling — Jump Game II, which asks for the FEWEST jumps and needs the same reach plus a second boundary marking where the current jump ends."

export const complexity = { time: "O(n)", space: "O(1)" }

export const python = `def can_jump(nums: list[int]) -> bool:
    reach = 0
    for i, step in enumerate(nums):
        if i > reach:
            return False        # a gap nothing jumps over
        reach = max(reach, i + step)
    return True`

export const java = `public boolean canJump(int[] nums) {
    int reach = 0;
    for (int i = 0; i < nums.length; i++) {
        if (i > reach) return false;
        reach = Math.max(reach, i + nums[i]);
    }
    return true;
}`

export const cpp = `bool canJump(vector<int> nums) {
    int reach = 0;
    for (int i = 0; i < (int)nums.size(); i++) {
        if (i > reach) return false;
        reach = max(reach, i + nums[i]);
    }
    return true;
}`

export const alternatives: Solution[] = [
  {
    name: "Try every jump length",
    summary:
      "From each index try every jump from 1 up to its value, and report success as soon as a route lands on the end. Exponential, and the routes overlap: whether the end is reachable FROM an index has nothing to do with which path arrived there, so the same index is re-explored once per way of reaching it.",
    complexity: { time: "O(2^n)", space: "O(n)" },
    python: `def can_jump(nums: list[int]) -> bool:
    last = len(nums) - 1

    def from_index(i: int) -> bool:
        if i >= last:
            return True
        for step in range(1, nums[i] + 1):
            if from_index(i + step):
                return True
        return False

    return from_index(0)`,
    java: `public boolean canJump(int[] nums) {
    return fromIndex(nums, 0);
}

private boolean fromIndex(int[] nums, int i) {
    if (i >= nums.length - 1) return true;
    for (int step = 1; step <= nums[i]; step++)
        if (fromIndex(nums, i + step)) return true;
    return false;
}`,
    cpp: `bool fromIndex(const vector<int>& nums, int i) {
    if (i >= (int)nums.size() - 1) return true;
    for (int step = 1; step <= nums[i]; step++)
        if (fromIndex(nums, i + step)) return true;
    return false;
}

bool canJump(vector<int> nums) {
    return fromIndex(nums, 0);
}`,
  },
  {
    name: "A good/bad table",
    summary:
      "Fill a table right to left, marking an index good when some jump from it lands on a good index. Quadratic, and the inner scan is the cost — it checks every landing spot in range, when the only thing that matters is whether the jump reaches the leftmost good index found so far.",
    complexity: { time: "O(n²)", space: "O(n)" },
    whyNow:
      "Backtracking re-explores the same index through every route that reaches it, so an array like [5,4,3,2,1,…] revisits the tail exponentially often. Whether an index can reach the end does not depend on how you got to it — one boolean per index, computed once, replaces the whole tree.",
    python: `def can_jump(nums: list[int]) -> bool:
    n = len(nums)
    good = [False] * n
    good[n - 1] = True
    for i in range(n - 2, -1, -1):
        furthest = min(i + nums[i], n - 1)
        for j in range(i + 1, furthest + 1):
            if good[j]:
                good[i] = True
                break
    return good[0]`,
    java: `public boolean canJump(int[] nums) {
    int n = nums.length;
    boolean[] good = new boolean[n];
    good[n - 1] = true;
    for (int i = n - 2; i >= 0; i--) {
        int furthest = Math.min(i + nums[i], n - 1);
        for (int j = i + 1; j <= furthest; j++) {
            if (good[j]) {
                good[i] = true;
                break;
            }
        }
    }
    return good[0];
}`,
    cpp: `bool canJump(vector<int> nums) {
    int n = (int)nums.size();
    vector<bool> good(n, false);
    good[n - 1] = true;
    for (int i = n - 2; i >= 0; i--) {
        int furthest = min(i + nums[i], n - 1);
        for (int j = i + 1; j <= furthest; j++) {
            if (good[j]) {
                good[i] = true;
                break;
            }
        }
    }
    return good[0];
}`,
  },
  {
    name: "The leftmost good index",
    summary:
      "Walk right to left keeping one number: the leftmost index known to reach the end. An index joins it when its jump covers that target, and the target moves to it.",
    complexity: { time: "O(n)", space: "O(1)" },
    whyNow:
      "The table scans forward from every index to check whether ANY good index is in range — but the good indices form a suffix-anchored set whose leftmost member is all that matters: if a jump reaches the leftmost good index it reaches the end, and if it does not reach that one it reaches none. One number replaces the whole row and the inner loop.",
    python: `def can_jump(nums: list[int]) -> bool:
    target = len(nums) - 1
    for i in range(len(nums) - 2, -1, -1):
        if i + nums[i] >= target:
            target = i
    return target == 0`,
    java: `public boolean canJump(int[] nums) {
    int target = nums.length - 1;
    for (int i = nums.length - 2; i >= 0; i--)
        if (i + nums[i] >= target) target = i;
    return target == 0;
}`,
    cpp: `bool canJump(vector<int> nums) {
    int target = (int)nums.size() - 1;
    for (int i = (int)nums.size() - 2; i >= 0; i--)
        if (i + nums[i] >= target) target = i;
    return target == 0;
}`,
  },
]
