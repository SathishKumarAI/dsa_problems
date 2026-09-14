// boats-to-save — the ladder: every way in, worst first.
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

export const approach = "Sort the weights, then put one index at the lightest person and one at the heaviest. Each round launches exactly one boat for the heaviest person still waiting. If the lightest person fits alongside them, that person boards too and the light index advances; otherwise the heaviest sails alone. Either way the heavy index steps back and the boat count goes up. The greedy choice is safe because the lightest person is the easiest passenger to place: if they cannot ride with the heaviest, nobody can, and if they can, using them here never blocks a pairing that mattered later."

export const whyNow = "Counting weights into buckets is fast, but the table is sized by the weight LIMIT rather than by the crowd: a limit of 30000 allocates 30000 counters to ferry two people, and the walk still has to skip over every empty weight in between. Sorting the array once puts the same weights in the same order using memory proportional to the people who actually exist, and the whole remaining state is two indices."

export const arc = "The greedy sits on one sentence: the heaviest person is boarding a boat no matter what, so the only decision is whether the lightest person rides with them. If the lightest cannot, nobody can; if they can, pairing them there never blocks a pairing that mattered, because any other partner is heavier and therefore harder to place. That exchange argument is the proof, and being able to state it is the difference between guessing and knowing. The bucket rung is a good foil — it is linear in the crowd but allocates by the weight LIMIT, which is a reminder that 'linear' means nothing until you say linear in what. Sorting plus two converging pointers is the version to remember."

export const complexity = { time: "O(n log n)", space: "O(1)" }

export const python = `def num_rescue_boats(people: list[int], limit: int) -> int:
    order = sorted(people)
    i, j = 0, len(order) - 1
    boats = 0
    while i <= j:
        if order[i] + order[j] <= limit:
            i += 1  # the lightest fits alongside the heaviest, so they share
        j -= 1
        boats += 1
    return boats`

export const java = `public int numRescueBoats(int[] people, int limit) {
    int[] order = people.clone();
    Arrays.sort(order);
    int i = 0, j = order.length - 1;
    int boats = 0;
    while (i <= j) {
        if (order[i] + order[j] <= limit) i++;
        j--;
        boats++;
    }
    return boats;
}`

export const cpp = `int numRescueBoats(vector<int> people, int limit) {
    vector<int> order = people;
    sort(order.begin(), order.end());
    int i = 0, j = (int)order.size() - 1;
    int boats = 0;
    while (i <= j) {
        if (order[i] + order[j] <= limit) i++;
        j--;
        boats++;
    }
    return boats;
}`

export const alternatives: Solution[] = [
  {
    name: "Exact search over every group",
    summary:
      "A table over subsets of people: for each set already carried, launch one more boat holding the lowest-numbered person still waiting, alone or with one companion who fits. The last entry holds the true minimum.",
    complexity: { time: "O(2^n · n)", space: "O(2^n)" },
    python: `def num_rescue_boats(people: list[int], limit: int) -> int:
    n = len(people)
    full = 1 << n
    best = [n + 1] * full
    best[0] = 0
    for mask in range(full):
        if best[mask] > n:
            continue
        # fixing the boat to carry the lowest waiting person removes the
        # duplicate work of trying the same pair in both orders
        first = -1
        for i in range(n):
            if not (mask >> i) & 1:
                first = i
                break
        if first < 0:
            continue
        alone = mask | (1 << first)
        if best[mask] + 1 < best[alone]:
            best[alone] = best[mask] + 1
        for j in range(first + 1, n):
            if not (mask >> j) & 1 and people[first] + people[j] <= limit:
                both = alone | (1 << j)
                if best[mask] + 1 < best[both]:
                    best[both] = best[mask] + 1
    return best[full - 1]`,
    java: `public int numRescueBoats(int[] people, int limit) {
    int n = people.length;
    int full = 1 << n;
    int[] best = new int[full];
    for (int i = 0; i < full; i++) best[i] = n + 1;
    best[0] = 0;
    for (int mask = 0; mask < full; mask++) {
        if (best[mask] > n) continue;
        int first = -1;
        for (int i = 0; i < n; i++) {
            if (((mask >> i) & 1) == 0) {
                first = i;
                break;
            }
        }
        if (first < 0) continue;
        int alone = mask | (1 << first);
        if (best[mask] + 1 < best[alone]) best[alone] = best[mask] + 1;
        for (int j = first + 1; j < n; j++) {
            if (((mask >> j) & 1) == 0 && people[first] + people[j] <= limit) {
                int both = alone | (1 << j);
                if (best[mask] + 1 < best[both]) best[both] = best[mask] + 1;
            }
        }
    }
    return best[full - 1];
}`,
    cpp: `int numRescueBoats(vector<int> people, int limit) {
    int n = (int)people.size();
    int full = 1 << n;
    vector<int> best(full, n + 1);
    best[0] = 0;
    for (int mask = 0; mask < full; mask++) {
        if (best[mask] > n) continue;
        int first = -1;
        for (int i = 0; i < n; i++) {
            if (((mask >> i) & 1) == 0) {
                first = i;
                break;
            }
        }
        if (first < 0) continue;
        int alone = mask | (1 << first);
        if (best[mask] + 1 < best[alone]) best[alone] = best[mask] + 1;
        for (int j = first + 1; j < n; j++) {
            if (((mask >> j) & 1) == 0 && people[first] + people[j] <= limit) {
                int both = alone | (1 << j);
                if (best[mask] + 1 < best[both]) best[both] = best[mask] + 1;
            }
        }
    }
    return best[full - 1];
}`,
  },
  {
    name: "Rescan for the heaviest and the lightest",
    summary:
      "Keep a used flag per person; each round, scan for the heaviest still waiting, then scan again for the lightest that fits beside them. The greedy pairing is already right — the cost is rediscovering the two extremes every round, which one sort establishes once and for all.",
    complexity: { time: "O(n^2)", space: "O(n)" },
    whyNow:
      "The subset table doubles in size with every extra person — fifty thousand people is not a bigger table, it is an impossible one. The greedy rule replaces the whole table: the heaviest person's boat is best shared with the lightest who fits, so each round needs only those two people, not a record of every group that could have sailed.",
    python: `def num_rescue_boats(people: list[int], limit: int) -> int:
    n = len(people)
    used = [False] * n
    waiting = n
    boats = 0
    while waiting > 0:
        hi = -1
        for i in range(n):
            if not used[i] and (hi < 0 or people[i] > people[hi]):
                hi = i
        used[hi] = True
        waiting -= 1
        boats += 1
        lo = -1
        for i in range(n):
            if not used[i] and (lo < 0 or people[i] < people[lo]):
                lo = i
        if lo >= 0 and people[lo] + people[hi] <= limit:
            used[lo] = True
            waiting -= 1
    return boats`,
    java: `public int numRescueBoats(int[] people, int limit) {
    int n = people.length;
    boolean[] used = new boolean[n];
    int waiting = n;
    int boats = 0;
    while (waiting > 0) {
        int hi = -1;
        for (int i = 0; i < n; i++)
            if (!used[i] && (hi < 0 || people[i] > people[hi])) hi = i;
        used[hi] = true;
        waiting--;
        boats++;
        int lo = -1;
        for (int i = 0; i < n; i++)
            if (!used[i] && (lo < 0 || people[i] < people[lo])) lo = i;
        if (lo >= 0 && people[lo] + people[hi] <= limit) {
            used[lo] = true;
            waiting--;
        }
    }
    return boats;
}`,
    cpp: `int numRescueBoats(vector<int> people, int limit) {
    int n = (int)people.size();
    vector<bool> used(n, false);
    int waiting = n;
    int boats = 0;
    while (waiting > 0) {
        int hi = -1;
        for (int i = 0; i < n; i++)
            if (!used[i] && (hi < 0 || people[i] > people[hi])) hi = i;
        used[hi] = true;
        waiting--;
        boats++;
        int lo = -1;
        for (int i = 0; i < n; i++)
            if (!used[i] && (lo < 0 || people[i] < people[lo])) lo = i;
        if (lo >= 0 && people[lo] + people[hi] <= limit) {
            used[lo] = true;
            waiting--;
        }
    }
    return boats;
}`,
  },
  {
    name: "Sort, then empty the queue from both ends",
    summary:
      "Sort into a queue, then repeatedly take the person at the heavy end and, if they fit together, the one at the light end. The right pairing with the wrong container: removing from the front of a list shifts everything behind it, so a walk that should be linear becomes quadratic.",
    complexity: { time: "O(n^2)", space: "O(n)" },
    whyNow:
      "Rescanning finds the same extremes over and over: the weights never change, so n rounds of two full scans re-derive an ordering that one sort settles for good. Sorting once turns 'find the heaviest' into 'look at the end'.",
    python: `def num_rescue_boats(people: list[int], limit: int) -> int:
    waiting = sorted(people)
    boats = 0
    while waiting:
        heaviest = waiting.pop()
        boats += 1
        if waiting and waiting[0] + heaviest <= limit:
            waiting.pop(0)  # removing the front shifts everyone behind it
    return boats`,
    java: `public int numRescueBoats(int[] people, int limit) {
    int[] order = people.clone();
    Arrays.sort(order);
    List<Integer> waiting = new ArrayList<>();
    for (int w : order) waiting.add(w);
    int boats = 0;
    while (!waiting.isEmpty()) {
        int heaviest = waiting.remove(waiting.size() - 1);
        boats++;
        if (!waiting.isEmpty() && waiting.get(0) + heaviest <= limit) {
            waiting.remove(0);
        }
    }
    return boats;
}`,
    cpp: `int numRescueBoats(vector<int> people, int limit) {
    vector<int> waiting = people;
    sort(waiting.begin(), waiting.end());
    int boats = 0;
    while (!waiting.empty()) {
        int heaviest = waiting.back();
        waiting.pop_back();
        boats++;
        if (!waiting.empty() && waiting.front() + heaviest <= limit) {
            waiting.erase(waiting.begin());
        }
    }
    return boats;
}`,
  },
  {
    name: "Count the weights into buckets",
    summary:
      "Weights are small integers, so count how many people share each weight and walk one cursor down from the limit while another walks up. Linear in people plus the weight range, which beats sorting — and it is bought entirely with the bound on weights, so it disappears the moment that bound widens.",
    complexity: { time: "O(n + limit)", space: "O(limit)" },
    whyNow:
      "Taking a person off the front of a queue shifts every remaining person one slot, so the sorted version is still quadratic — the sort fixed the searching and left the removing. A bucket table removes a person by decrementing a counter, which is one write, and it never compares two weights at all.",
    python: `def num_rescue_boats(people: list[int], limit: int) -> int:
    count = [0] * (limit + 1)
    for w in people:
        count[w] += 1
    low, high = 1, limit
    waiting = len(people)
    boats = 0
    while waiting > 0:
        while count[high] == 0:
            high -= 1
        count[high] -= 1
        waiting -= 1
        boats += 1
        if waiting > 0:
            while low <= limit and count[low] == 0:
                low += 1
            if low <= limit and low + high <= limit:
                count[low] -= 1
                waiting -= 1
    return boats`,
    java: `public int numRescueBoats(int[] people, int limit) {
    int[] count = new int[limit + 1];
    for (int w : people) count[w]++;
    int low = 1, high = limit;
    int waiting = people.length;
    int boats = 0;
    while (waiting > 0) {
        while (count[high] == 0) high--;
        count[high]--;
        waiting--;
        boats++;
        if (waiting > 0) {
            while (low <= limit && count[low] == 0) low++;
            if (low <= limit && low + high <= limit) {
                count[low]--;
                waiting--;
            }
        }
    }
    return boats;
}`,
    cpp: `int numRescueBoats(vector<int> people, int limit) {
    vector<int> count(limit + 1, 0);
    for (int w : people) count[w]++;
    int low = 1, high = limit;
    int waiting = (int)people.size();
    int boats = 0;
    while (waiting > 0) {
        while (count[high] == 0) high--;
        count[high]--;
        waiting--;
        boats++;
        if (waiting > 0) {
            while (low <= limit && count[low] == 0) low++;
            if (low <= limit && low + high <= limit) {
                count[low]--;
                waiting--;
            }
        }
    }
    return boats;
}`,
  },
]
