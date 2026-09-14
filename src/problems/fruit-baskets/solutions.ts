// fruit-baskets — the ladder: every way in, worst first.
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

export const approach = "Keep a count per kind inside the window. Extend the right edge one tree at a time; whenever the window holds more than two kinds, advance the left edge by exactly one — never more — dropping that tree's count and forgetting a kind when its count reaches zero. The window can therefore never grow while illegal and never shrinks below the best legal width seen, so after the walk the window's own width is the answer."

export const whyNow = "The shrinking window is already linear — every index enters and leaves once — but it spends that work restoring legality after every violation, and the answer is a MAXIMUM, which never needs the window to be legal again. Letting the window keep its size and slide instead of shrink makes the left edge move at most once per step, removes the inner loop entirely, and the final width is the answer by construction."

export const arc = "The problem is 'longest run with at most two distinct values' wearing a story, and recognising that is most of the work — the same window answers at most K distinct, and K = 2 is just the version with a nice picture. The rungs then argue about the left edge: restart it per start index and you are quadratic; shrink it until the window is legal again and you are linear with an inner loop; move it exactly one step and you are linear with none. The last version is worth understanding rather than memorising — it works because the answer is a MAXIMUM, so the window never needs to be legal again, only never wider than the best legal width seen. The one detail people get wrong is removal: a kind leaves the window when its count hits zero, not when one of its occurrences slides out."

export const complexity = { time: "O(n)", space: "O(1)" }

export const python = `def fruit_baskets(fruits: list[int]) -> int:
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
    return len(fruits) - left`

export const java = `public int fruitBaskets(int[] fruits) {
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
}`

export const cpp = `int fruitBaskets(vector<int> fruits) {
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
}`

export const alternatives: Solution[] = [
  {
    name: "Try every starting tree",
    summary:
      "For every tree, walk forward collecting kinds until a third one appears, and keep the longest run found. It is the problem statement read literally, and every start re-walks ground the previous start already covered, so the row is traversed once per tree rather than once in total.",
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
]
