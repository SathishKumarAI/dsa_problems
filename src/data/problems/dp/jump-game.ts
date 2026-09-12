import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "jump-game",
  title: "Can You Reach the Last Index?",
  pattern: "dp",
  difficulty: "medium",
  leetcode: "jump-game",
  brief: "Each cell says how far you may jump from it. Decide whether the end is reachable.",
  statement:
    "You start at index 0 of an array. The value at an index is the maximum number of steps you may jump forward from it. Return true when some sequence of jumps reaches the last index.",
  constraints: [
    "1 <= nums.length <= 10^4",
    "0 <= nums[i] <= 10^5",
    "a value is a MAXIMUM, not a fixed step — from a 3 you may jump 1, 2 or 3",
    "a zero is a wall you can only pass by jumping OVER it from an earlier index",
    "an array of length 1 is already at the end, so the answer is true even when that single value is 0",
  ],
  examples: [
    {
      input: "nums = [2, 3, 1, 1, 4]",
      output: "true",
      note: "1 step to index 1, then 3 steps to the end. Taking the full 2 from the start also works.",
    },
    {
      input: "nums = [3, 2, 1, 0, 4]",
      output: "false",
      note: "Every route lands on the 0 at index 3 and stops there. The 4 beyond it is unreachable.",
    },
    { input: "nums = [0]", output: "true", note: "Already standing on the last index." },
  ],
  hints: [
    "You never need to know WHICH jumps were taken — only whether the end is reachable at all.",
    "Walking left to right, keep the furthest index reached so far. An index is standable when it is not past that reach.",
    "The moment the furthest reach falls behind the index you are standing on, everything after it is unreachable and you can stop.",
  ],
  whyNow:
    "Scanning backwards for the nearest good index is linear, but it reads the array right to left while the problem runs left to right, and it keeps the answer in terms of a moving target index. Carrying the furthest reachable index forward answers the same question in one left-to-right pass with a single integer of state, and it can stop the moment the reach falls behind — which is the same failure the backwards scan only discovers at the end.",
  arc:
    "Notice what the question does NOT ask: it never wants the jumps, only whether the end is reachable. Every rung that tries to construct a route — backtracking, then a table of good indices — is answering a harder question than the one asked, and pays for it. Once you keep only the furthest index reachable so far, the whole problem collapses into one number and one comparison. That is the greedy test in general: find a quantity that is a maximum over everything seen, and check that extending it never invalidates an earlier choice. Know this one cold, and know its sibling — Jump Game II, which asks for the FEWEST jumps and needs the same reach plus a second boundary marking where the current jump ends.",
  approach:
    "One pass, one number: the furthest index reachable so far, starting at 0. At each index, if it is beyond the current reach, no sequence of jumps arrives there and the answer is false. Otherwise extend the reach to the larger of itself and index + nums[index]. If the loop survives to the end — or the reach ever covers the last index — the end is reachable. The greedy is safe because reach is a maximum over everything seen, so it never overstates what is possible and never forgets a better jump.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def can_jump(nums: list[int]) -> bool:
    reach = 0
    for i, step in enumerate(nums):
        if i > reach:
            return False        # a gap nothing jumps over
        reach = max(reach, i + step)
    return True`,
  java: `public boolean canJump(int[] nums) {
    int reach = 0;
    for (int i = 0; i < nums.length; i++) {
        if (i > reach) return false;
        reach = Math.max(reach, i + nums[i]);
    }
    return true;
}`,
  cpp: `bool canJump(vector<int> nums) {
    int reach = 0;
    for (int i = 0; i < (int)nums.size(); i++) {
        if (i > reach) return false;
        reach = max(reach, i + nums[i]);
    }
    return true;
}`,
  walkthrough: [
    {
      cells: {
        values: [2, 3, 1, 1, 4],
        marks: { 0: "focus" },
        labels: { 0: "reach = 2" },
      },
      caption:
        "Standing on index 0 with a 2: the furthest reachable index becomes 0 + 2 = 2. Nothing beyond index 2 is reachable yet.",
    },
    {
      cells: {
        values: [2, 3, 1, 1, 4],
        marks: { 0: "done", 1: "focus", 2: "window" },
        labels: { 1: "reach = 4" },
      },
      caption:
        "Index 1 is within reach, so it can be stood on. Its 3 pushes the reach to 1 + 3 = 4 — already the last index.",
    },
    {
      cells: {
        values: [2, 3, 1, 1, 4],
        marks: { 0: "done", 1: "done", 2: "done", 3: "done", 4: "focus" },
      },
      caption:
        "The rest of the pass only confirms it: every index is at or before the reach, so the walk finishes and the answer is true.",
    },
    {
      cells: {
        values: [3, 2, 1, 0, 4],
        marks: { 0: "done", 1: "done", 2: "done", 3: "compare" },
        labels: { 3: "reach = 3" },
      },
      caption:
        "The failing case: after three indices the reach is exactly 3, and index 3 holds a 0, so the reach stops growing there.",
    },
    {
      cells: {
        values: [3, 2, 1, 0, 4],
        marks: { 3: "done", 4: "compare" },
        labels: { 4: "i > reach" },
      },
      caption:
        "Index 4 is past the reach — nothing can stand there — so the pass returns false without looking at the 4 it holds.",
    },
  ],
  alternatives: [
    {
      name: "Try every jump length",
      summary:
        "Backtracking from index 0: from each index try every jump from 1 up to its value, and report success as soon as any route lands on the last index.",
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
        "Fill a table right to left: an index is good when some jump from it lands on a good index. The answer is whether index 0 is good.",
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
  ],
}
