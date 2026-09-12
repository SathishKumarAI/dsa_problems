import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "fruit-baskets",
  title: "The Longest Run of Two Kinds",
  pattern: "sliding-window",
  difficulty: "medium",
  leetcode: "fruit-into-baskets",
  brief: "Pick from a row of trees with two baskets: find the longest run holding at most two kinds.",
  statement:
    "Each value in the array is the kind of fruit on that tree. You walk the row picking one fruit per tree and may hold at most two kinds in total; you must stop as soon as a third kind appears. Return the largest number of fruits you can pick, which is the length of the longest run containing at most two distinct values.",
  constraints: [
    "1 <= fruits.length <= 10^5",
    "0 <= fruit kind < fruits.length, so the kinds are unbounded in value but bounded in count",
    "the run must be CONTIGUOUS — you cannot skip a tree and continue",
    "at most two distinct kinds, so a row of one kind is entirely pickable",
    "repeats do not count against the limit: [1,1,1,2,2] is five fruits and only two kinds",
  ],
  examples: [
    { input: "fruits = [1, 2, 1]", output: "3", note: "Two kinds, the whole row." },
    {
      input: "fruits = [0, 1, 2, 2]",
      output: "3",
      note: "Starting at the 1 gives 1, 2, 2 — starting at the 0 stops at the first 2.",
    },
    {
      input: "fruits = [1, 2, 3, 2, 2]",
      output: "4",
      note: "The corner case for shrinking: the window must drop the 1 AND the 2s before it, landing on 2, 3, 2, 2 rather than just after the 3.",
    },
  ],
  hints: [
    "The answer is a window, and the rule about a window is local: it is legal while it holds at most two distinct values.",
    "Grow the window on the right. When a third kind appears, move the left edge forward until one kind is gone entirely.",
    "Counts, not presence: a kind leaves the window only when its count drops to zero.",
  ],
  whyNow:
    "The shrinking window is already linear — every index enters and leaves once — but it spends that work restoring legality after every violation, and the answer is a MAXIMUM, which never needs the window to be legal again. Letting the window keep its size and slide instead of shrink makes the left edge move at most once per step, removes the inner loop entirely, and the final width is the answer by construction.",
  arc:
    "The problem is 'longest run with at most two distinct values' wearing a story, and recognising that is most of the work — the same window answers at most K distinct, and K = 2 is just the version with a nice picture. The rungs then argue about the left edge: restart it per start index and you are quadratic; shrink it until the window is legal again and you are linear with an inner loop; move it exactly one step and you are linear with none. The last version is worth understanding rather than memorising — it works because the answer is a MAXIMUM, so the window never needs to be legal again, only never wider than the best legal width seen. The one detail people get wrong is removal: a kind leaves the window when its count hits zero, not when one of its occurrences slides out.",
  approach:
    "Keep a count per kind inside the window. Extend the right edge one tree at a time; whenever the window holds more than two kinds, advance the left edge by exactly one — never more — dropping that tree's count and forgetting a kind when its count reaches zero. The window can therefore never grow while illegal and never shrinks below the best legal width seen, so after the walk the window's own width is the answer.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def fruit_baskets(fruits: list[int]) -> int:
    counts: dict[int, int] = {}
    left = 0
    for right, kind in enumerate(fruits):
        counts[kind] = counts.get(kind, 0) + 1
        if len(counts) > 2:
            # one step only: the window slides rather than shrinking
            going = fruits[left]
            counts[going] -= 1
            if counts[going] == 0:
                del counts[going]
            left += 1
    return len(fruits) - left`,
  java: `public int fruitBaskets(int[] fruits) {
    Map<Integer, Integer> counts = new HashMap<>();
    int left = 0;
    for (int right = 0; right < fruits.length; right++) {
        counts.merge(fruits[right], 1, Integer::sum);
        if (counts.size() > 2) {
            int going = fruits[left];
            if (counts.merge(going, -1, Integer::sum) == 0) counts.remove(going);
            left++;
        }
    }
    return fruits.length - left;
}`,
  cpp: `int fruitBaskets(vector<int> fruits) {
    unordered_map<int, int> counts;
    int left = 0;
    for (int right = 0; right < (int)fruits.size(); right++) {
        counts[fruits[right]]++;
        if ((int)counts.size() > 2) {
            int going = fruits[left];
            if (--counts[going] == 0) counts.erase(going);
            left++;
        }
    }
    return (int)fruits.size() - left;
}`,
  walkthrough: [
    {
      cells: {
        values: [1, 2, 3, 2, 2],
        marks: { 0: "window", 1: "window" },
        labels: { 0: "left" },
      },
      caption:
        "The window grows over 1 and 2 — two kinds, legal, width 2. Nothing has been dropped yet.",
    },
    {
      cells: {
        values: [1, 2, 3, 2, 2],
        marks: { 0: "compare", 1: "window", 2: "focus" },
        labels: { 2: "3rd kind" },
      },
      caption:
        "The 3 arrives and the window now holds three kinds. The left edge moves one step, dropping the 1 — whose count reaches zero, so that kind is forgotten.",
    },
    {
      cells: {
        values: [1, 2, 3, 2, 2],
        marks: { 1: "window", 2: "window", 3: "window" },
        labels: { 1: "left" },
      },
      caption:
        "Legal again at width 3: kinds 2 and 3. The window never got smaller — it slid.",
    },
    {
      cells: {
        values: [1, 2, 3, 2, 2],
        marks: { 1: "window", 2: "window", 3: "window", 4: "window" },
        labels: { 4: "width 4" },
      },
      caption:
        "The last 2s extend the window without adding a kind. Its final width, 4, is the answer — no maximum ever had to be tracked.",
    },
    {
      cells: {
        values: [0, 1, 2, 2],
        marks: { 1: "window", 2: "window", 3: "window" },
        labels: { 1: "left" },
      },
      caption:
        "The same shape on [0,1,2,2]: one slide past the 0, and the window ends three wide.",
    },
  ],
  alternatives: [
    {
      name: "Try every starting tree",
      summary:
        "For each tree, walk forward collecting kinds until a third appears, and remember the longest run found.",
      complexity: { time: "O(n²)", space: "O(1)" },
      python: `def fruit_baskets(fruits: list[int]) -> int:
    best = 0
    for start in range(len(fruits)):
        kinds: set[int] = set()
        end = start
        while end < len(fruits):
            kinds.add(fruits[end])
            if len(kinds) > 2:
                break
            end += 1
        best = max(best, end - start)
    return best`,
      java: `public int fruitBaskets(int[] fruits) {
    int best = 0;
    for (int start = 0; start < fruits.length; start++) {
        Set<Integer> kinds = new HashSet<>();
        int end = start;
        while (end < fruits.length) {
            kinds.add(fruits[end]);
            if (kinds.size() > 2) break;
            end++;
        }
        best = Math.max(best, end - start);
    }
    return best;
}`,
      cpp: `int fruitBaskets(vector<int> fruits) {
    int best = 0;
    int n = (int)fruits.size();
    for (int start = 0; start < n; start++) {
        unordered_set<int> kinds;
        int end = start;
        while (end < n) {
            kinds.insert(fruits[end]);
            if ((int)kinds.size() > 2) break;
            end++;
        }
        best = max(best, end - start);
    }
    return best;
}`,
    },
    {
      name: "A window that shrinks until it is legal",
      summary:
        "One window with a count per kind: extend on the right, and while three kinds are present, pull the left edge forward until one of them disappears. Track the widest legal width seen.",
      complexity: { time: "O(n)", space: "O(1)" },
      whyNow:
        "Every start re-walks the run that the previous start already walked — [1,1,1,1] costs 4 + 3 + 2 + 1 steps to learn what one pass knows. The runs overlap completely, so a single window can carry the answer forward instead of restarting it.",
      python: `def fruit_baskets(fruits: list[int]) -> int:
    counts: dict[int, int] = {}
    best = 0
    left = 0
    for right, kind in enumerate(fruits):
        counts[kind] = counts.get(kind, 0) + 1
        while len(counts) > 2:
            going = fruits[left]
            counts[going] -= 1
            if counts[going] == 0:
                del counts[going]
            left += 1
        best = max(best, right - left + 1)
    return best`,
      java: `public int fruitBaskets(int[] fruits) {
    Map<Integer, Integer> counts = new HashMap<>();
    int best = 0, left = 0;
    for (int right = 0; right < fruits.length; right++) {
        counts.merge(fruits[right], 1, Integer::sum);
        while (counts.size() > 2) {
            int going = fruits[left];
            if (counts.merge(going, -1, Integer::sum) == 0) counts.remove(going);
            left++;
        }
        best = Math.max(best, right - left + 1);
    }
    return best;
}`,
      cpp: `int fruitBaskets(vector<int> fruits) {
    unordered_map<int, int> counts;
    int best = 0, left = 0;
    for (int right = 0; right < (int)fruits.size(); right++) {
        counts[fruits[right]]++;
        while ((int)counts.size() > 2) {
            int going = fruits[left];
            if (--counts[going] == 0) counts.erase(going);
            left++;
        }
        best = max(best, right - left + 1);
    }
    return best;
}`,
    },
  ],
}
