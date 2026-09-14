import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "boats-to-save",
  title: "Fewest Boats for Everyone",
  pattern: "two-pointers",
  difficulty: "medium",
  leetcode: "boats-to-save-people",
  brief:
    "Every boat seats two and has a weight limit. How few boats carry everyone?",
  statement:
    "Each person has a weight, and every boat carries at most two people whose weights together do not exceed a shared limit. Return the smallest number of boats that gets everybody across.",
  constraints: [
    "1 <= people.length <= 5 * 10^4",
    "1 <= people[i] <= limit <= 3 * 10^4 — nobody is heavier than a boat can carry, so a one-person boat always exists and the answer is never impossible",
    "a boat holds at most TWO people, which is what makes this a pairing question rather than a bin-packing one",
    "everyone must be carried, so the count is over all the people, not a chosen subset",
    "the heaviest person's boat is the decision that matters: either somebody rides with them or a seat sails empty",
  ],
  examples: [
    { input: "people = [1, 2], limit = 3", output: "1" },
    {
      input: "people = [3, 2, 2, 1], limit = 3",
      output: "3",
      note: "The 3 sails alone, 1 rides with a 2, and the other 2 sails alone. Pairing greedily from the light end instead would strand the 3 and cost the same or more.",
    },
    {
      input: "people = [3, 5, 3, 4], limit = 5",
      output: "4",
      note: "The trap: nobody can share with anybody, so every seat but one sails empty. A solution that assumes pairs are usually available still has to count these correctly.",
    },
  ],
  hints: [
    "The heaviest person is going on a boat no matter what. The only open question is who, if anyone, joins them.",
    "If anyone at all can ride with the heaviest person, the lightest person can — so pairing those two never costs a boat you would otherwise have saved.",
    "Sort once, then walk one index in from each end. Every step launches exactly one boat.",
  ],
  whyNow:
    "Counting weights into buckets is fast, but the table is sized by the weight LIMIT rather than by the crowd: a limit of 30000 allocates 30000 counters to ferry two people, and the walk still has to skip over every empty weight in between. Sorting the array once puts the same weights in the same order using memory proportional to the people who actually exist, and the whole remaining state is two indices.",
  arc: "The greedy sits on one sentence: the heaviest person is boarding a boat no matter what, so the only decision is whether the lightest person rides with them. If the lightest cannot, nobody can; if they can, pairing them there never blocks a pairing that mattered, because any other partner is heavier and therefore harder to place. That exchange argument is the proof, and being able to state it is the difference between guessing and knowing. The bucket rung is a good foil — it is linear in the crowd but allocates by the weight LIMIT, which is a reminder that 'linear' means nothing until you say linear in what. Sorting plus two converging pointers is the version to remember.",
  approach:
    "Sort the weights, then put one index at the lightest person and one at the heaviest. Each round launches exactly one boat for the heaviest person still waiting. If the lightest person fits alongside them, that person boards too and the light index advances; otherwise the heaviest sails alone. Either way the heavy index steps back and the boat count goes up. The greedy choice is safe because the lightest person is the easiest passenger to place: if they cannot ride with the heaviest, nobody can, and if they can, using them here never blocks a pairing that mattered later.",
  complexity: { time: "O(n log n)", space: "O(1)" },
  python: `def num_rescue_boats(people: list[int], limit: int) -> int:
    order = sorted(people)
    i, j = 0, len(order) - 1
    boats = 0
    while i <= j:
        if order[i] + order[j] <= limit:
            i += 1  # the lightest fits alongside the heaviest, so they share
        j -= 1
        boats += 1
    return boats`,
  java: `public int numRescueBoats(int[] people, int limit) {
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
}`,
  cpp: `int numRescueBoats(vector<int> people, int limit) {
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
}`,
  walkthrough: [
    {
      cells: {
        values: [1, 2, 2, 3],
        marks: { 0: "focus", 3: "focus" },
        labels: { 0: "i", 3: "j" },
      },
      caption:
        "limit = 3, weights sorted. The lightest is 1, the heaviest is 3. Boat 1 is for the 3 — the only question is whether the 1 joins.",
    },
    {
      cells: {
        values: [1, 2, 2, 3],
        marks: { 0: "compare", 3: "done" },
        labels: { 0: "i", 2: "j" },
      },
      caption:
        "1 + 3 = 4, over the limit. Nobody lighter exists, so nobody can ride with the 3: it sails alone and only the heavy index moves. Boats: 1.",
    },
    {
      cells: {
        values: [1, 2, 2, 3],
        marks: { 0: "window", 2: "window", 3: "done" },
        labels: { 0: "i", 2: "j" },
      },
      caption:
        "1 + 2 = 3, exactly the limit — a full boat. Both indices move inward. Boats: 2.",
    },
    {
      cells: {
        values: [1, 2, 2, 3],
        marks: { 0: "done", 1: "focus", 2: "done", 3: "done" },
        labels: { 1: "i/j" },
      },
      caption:
        "One person left, and the two indices have met on them. 2 + 2 would be over the limit, but there is no second 2 left anyway.",
    },
    {
      cells: {
        values: [1, 2, 2, 3],
        marks: { 0: "done", 1: "done", 2: "done", 3: "done" },
      },
      caption:
        "That last boat carries them alone. i passes j and the walk ends: 3 boats, one per round, four people placed.",
    },
  ],
  alternatives: [
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
  ],
}
