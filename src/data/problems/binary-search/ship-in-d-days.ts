import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "ship-in-d-days",
  title: "The Smallest Ship That Still Makes the Deadline",
  pattern: "binary-search",
  difficulty: "medium",
  leetcode: "capacity-to-ship-packages-within-d-days",
  brief:
    "Packages must ship in order within d days — find the smallest daily capacity that works.",
  statement:
    "Packages sit on a belt in a fixed order and must be shipped in that order. Each day you load packages onto the ship until the next one would exceed its capacity. Return the smallest capacity that gets everything shipped within d days.",
  constraints: [
    "1 <= packages.length <= 5 · 10^4, 1 <= d <= packages.length",
    "1 <= weight <= 500",
    "the ORDER is fixed — you may not repack the belt, only decide where the days break",
    "the capacity can never be smaller than the heaviest package, or that package can never be loaded at all",
    "a capacity equal to the total weight always works in one day, so an answer always exists between those two bounds",
  ],
  examples: [
    {
      input: "weights = [1,2,3,4,5,6,7,8,9,10], d = 5",
      output: "15",
      note: "1–5, 6–7, 8, 9, 10. A capacity of 14 needs six days.",
    },
    {
      input: "weights = [3,2,2,4,1,4], d = 3",
      output: "6",
      note: "3+2, 2+4, 1+4.",
    },
    {
      input: "weights = [1,2,3,1,1], d = 4",
      output: "3",
      note: "The corner case for the lower bound: the answer is exactly the heaviest package, so a search starting at 1 must still land on 3.",
    },
  ],
  hints: [
    "Stop trying to construct the packing. Ask a yes/no question instead: with capacity C, how many days does the fixed order take?",
    "Counting the days for a given capacity is one greedy pass — start a new day whenever the next package would overflow.",
    "The yes/no answer is MONOTONE: if C works, so does every capacity above it. That is the shape binary search needs.",
  ],
  whyNow:
    "Searching from 1 makes half the range meaningless: any capacity below the heaviest package can never ship it, so the simulation has to carry a special 'impossible' result and the search wastes its first steps on values that were never candidates. Anchoring the low end at the heaviest package makes every capacity in the range feasible-or-not by day COUNT alone — the predicate becomes a plain comparison, and the range shrinks to the one that can actually contain the answer.",
  arc: "This is the problem that teaches 'binary search the ANSWER'. The array is not sorted and nothing is being looked up; what is monotone is a yes/no question — can capacity C ship everything in time — which is false for a while and then true forever. Any question with that shape can be halved, and the pattern covers Koko eating bananas, split array largest sum, the smallest divisor, and most 'minimum X such that Y fits' phrasings. Two habits to take away: write the feasibility check as its own function and make it a plain simulation, because that is where the bugs live; and choose the bounds so that every candidate inside them is meaningful. Starting the range at the heaviest package rather than at 1 removes an entire class of impossible capacities and the special case they would need.",
  approach:
    "Binary search on the capacity itself, between the heaviest package and the total weight. For a candidate, sweep the packages once counting days: keep a running load, and when the next package would overflow, close the day and start a new one. If the day count fits within d the candidate works, so remember it and search lower; otherwise search higher. Each probe is one linear pass, and the range halves every probe.",
  complexity: { time: "O(n log(sum))", space: "O(1)" },
  python: `def ship_capacity(weights: list[int], days: int) -> int:
    def days_needed(capacity: int) -> int:
        used, load = 1, 0
        for w in weights:
            if load + w > capacity:
                used += 1          # this package starts a new day
                load = 0
            load += w
        return used

    low, high = max(weights), sum(weights)
    while low < high:
        mid = (low + high) // 2
        if days_needed(mid) <= days:
            high = mid             # mid works; nothing above it can be smaller
        else:
            low = mid + 1
    return low`,
  java: `public int shipCapacity(int[] weights, int days) {
    int low = 0, high = 0;
    for (int w : weights) {
        low = Math.max(low, w);
        high += w;
    }
    while (low < high) {
        int mid = low + (high - low) / 2;
        if (daysNeeded(weights, mid) <= days) high = mid;
        else low = mid + 1;
    }
    return low;
}

private int daysNeeded(int[] weights, int capacity) {
    int used = 1, load = 0;
    for (int w : weights) {
        if (load + w > capacity) {
            used++;
            load = 0;
        }
        load += w;
    }
    return used;
}`,
  cpp: `int daysNeededFor(const vector<int>& weights, int capacity) {
    int used = 1, load = 0;
    for (int w : weights) {
        if (load + w > capacity) {
            used++;
            load = 0;
        }
        load += w;
    }
    return used;
}

int shipCapacity(vector<int> weights, int days) {
    int low = 0, high = 0;
    for (int w : weights) {
        low = max(low, w);
        high += w;
    }
    while (low < high) {
        int mid = low + (high - low) / 2;
        if (daysNeededFor(weights, mid) <= days) high = mid;
        else low = mid + 1;
    }
    return low;
}`,
  walkthrough: [
    {
      cells: {
        values: [3, 2, 2, 4, 1, 4],
        marks: { 3: "focus" },
        labels: { 3: "heaviest" },
      },
      caption:
        "Six packages, d = 3. The search runs over CAPACITIES, not packages: no smaller than the heaviest (4) and no larger than the total (16).",
    },
    {
      cells: {
        values: [3, 2, 2, 4, 1, 4],
        marks: { 0: "window", 1: "window", 2: "compare" },
        labels: { 0: "cap 10" },
      },
      caption:
        "Probe the middle, capacity 10: the greedy pass packs 3+2+2 then 4+1+4 — two days, which is within 3. It works, so the answer is 10 or lower.",
    },
    {
      cells: {
        values: [3, 2, 2, 4, 1, 4],
        marks: { 0: "window", 1: "window", 3: "compare" },
        labels: { 0: "cap 7" },
      },
      caption:
        "Probe 7: 3+2+2, then 4+1, then 4 — three days, still within the deadline. The range narrows to 4…7.",
    },
    {
      cells: {
        values: [3, 2, 2, 4, 1, 4],
        marks: { 0: "compare", 3: "compare", 5: "compare" },
        labels: { 0: "cap 5" },
      },
      caption:
        "Probe 5: 3+2, 2, 4+1, 4 — four days, too many. So 5 fails and the answer is above it; the next probe, 6, succeeds and the range closes on 6.",
    },
    {
      cells: {
        values: [1, 2, 3, 1, 1],
        marks: { 2: "focus" },
        labels: { 2: "answer = 3" },
      },
      caption:
        "The lower-bound case: with d = 4 the answer is exactly the heaviest package. Starting the range at 1 would have to special-case every capacity below 3, where the sweep can never load that package at all.",
    },
  ],
  alternatives: [
    {
      name: "Try every capacity upward",
      summary:
        "Start at the heaviest package and increase the capacity one unit at a time, simulating the days for each, and stop at the first capacity that fits the deadline.",
      complexity: { time: "O(n · sum)", space: "O(1)" },
      python: `def ship_capacity(weights: list[int], days: int) -> int:
    def days_needed(capacity: int) -> int:
        used, load = 1, 0
        for w in weights:
            if load + w > capacity:
                used += 1
                load = 0
            load += w
        return used

    capacity = max(weights)
    while days_needed(capacity) > days:
        capacity += 1
    return capacity`,
      java: `public int shipCapacity(int[] weights, int days) {
    int capacity = 0;
    for (int w : weights) capacity = Math.max(capacity, w);
    while (countDays(weights, capacity) > days) capacity++;
    return capacity;
}

private int countDays(int[] weights, int capacity) {
    int used = 1, load = 0;
    for (int w : weights) {
        if (load + w > capacity) {
            used++;
            load = 0;
        }
        load += w;
    }
    return used;
}`,
      cpp: `int countDaysFor(const vector<int>& weights, int capacity) {
    int used = 1, load = 0;
    for (int w : weights) {
        if (load + w > capacity) {
            used++;
            load = 0;
        }
        load += w;
    }
    return used;
}

int shipCapacity(vector<int> weights, int days) {
    int capacity = 0;
    for (int w : weights) capacity = max(capacity, w);
    while (countDaysFor(weights, capacity) > days) capacity++;
    return capacity;
}`,
    },
    {
      name: "Binary search over every capacity from 1",
      summary:
        "Halve the range instead of walking it — but over the full span from 1 to the total weight, which means the simulation has to report 'impossible' for capacities smaller than some package.",
      complexity: { time: "O(n log(sum))", space: "O(1)" },
      whyNow:
        "Walking the capacities one at a time asks the same monotone question thousands of times: once a capacity works, every larger one works too, so the answers form a run of noes followed by a run of yeses. That is exactly the pattern binary search is for — and the deadline check costs one pass either way.",
      python: `def ship_capacity(weights: list[int], days: int) -> int:
    def fits(capacity: int) -> bool:
        used, load = 1, 0
        for w in weights:
            if w > capacity:
                return False       # this package can never be loaded
            if load + w > capacity:
                used += 1
                load = 0
            load += w
        return used <= days

    low, high = 1, sum(weights)
    while low < high:
        mid = (low + high) // 2
        if fits(mid):
            high = mid
        else:
            low = mid + 1
    return low`,
      java: `public int shipCapacity(int[] weights, int days) {
    int high = 0;
    for (int w : weights) high += w;
    int low = 1;
    while (low < high) {
        int mid = low + (high - low) / 2;
        if (fits(weights, mid, days)) high = mid;
        else low = mid + 1;
    }
    return low;
}

private boolean fits(int[] weights, int capacity, int days) {
    int used = 1, load = 0;
    for (int w : weights) {
        if (w > capacity) return false;
        if (load + w > capacity) {
            used++;
            load = 0;
        }
        load += w;
    }
    return used <= days;
}`,
      cpp: `bool fitsCapacity(const vector<int>& weights, int capacity, int days) {
    int used = 1, load = 0;
    for (int w : weights) {
        if (w > capacity) return false;
        if (load + w > capacity) {
            used++;
            load = 0;
        }
        load += w;
    }
    return used <= days;
}

int shipCapacity(vector<int> weights, int days) {
    int high = 0;
    for (int w : weights) high += w;
    int low = 1;
    while (low < high) {
        int mid = low + (high - low) / 2;
        if (fitsCapacity(weights, mid, days)) high = mid;
        else low = mid + 1;
    }
    return low;
}`,
    },
  ],
}
