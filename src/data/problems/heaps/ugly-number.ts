import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "ugly-number",
  title: "The nth Number Built Only From 2, 3 and 5",
  pattern: "heaps",
  difficulty: "medium",
  leetcode: "ugly-number-ii",
  brief: "Generate the nth number whose only prime factors are 2, 3 and 5.",
  statement:
    "A number is 'ugly' when its only prime factors are 2, 3 and 5. By convention 1 is the first such number. Given n, return the nth of them in increasing order.",
  constraints: [
    "1 <= n <= 1690, and the 1690th value still fits in a 32-bit integer",
    "1 counts as the first ugly number — it has no prime factors at all, so nothing forbidden divides it",
    "the sequence is strictly increasing, so duplicates have to be suppressed however they are generated",
    "every ugly number after the first is an earlier ugly number multiplied by 2, 3 or 5 — which is what makes generating cheaper than testing",
    "6 is reachable as 2 × 3 and as 3 × 2, so any generator must decide what to do when two routes produce one value",
  ],
  examples: [
    {
      input: "n = 10",
      output: "12",
      note: "1, 2, 3, 4, 5, 6, 8, 9, 10, 12 — note that 7 and 11 are missing.",
    },
    { input: "n = 1", output: "1" },
    {
      input: "n = 7",
      output: "8",
      note: "6 is produced twice (2 × 3 and 3 × 2). Counting it twice shifts every later answer by one.",
    },
  ],
  hints: [
    "Testing each integer for ugliness wastes almost all of its work: past 100 the ugly numbers are rare and getting rarer.",
    "Turn it around — build them. Every ugly number is 2, 3 or 5 times an earlier one, so the sequence generates itself.",
    "The next value is the smallest of three candidates: 2 × (the earliest value not yet doubled), 3 × (…tripled), 5 × (…quintupled). Advance every pointer that produced it.",
  ],
  whyNow:
    "A heap with a seen-set produces the sequence in order, but it pays a logarithm per value and stores up to three candidates per number extracted, and the duplicate 6 has to be recognised by memory. The three multipliers only ever consume the sequence in order, so each needs nothing more than an INDEX into what has already been produced — the heap collapses to three integers, and the duplicate disappears because both pointers advance on the same value instead of being remembered.",
  arc:
    "A test becomes a generator, and that is the whole idea. Checking integers one by one wastes almost all its work because the answers thin out — past a billion they are vanishingly rare — while every answer is 2, 3 or 5 times an earlier answer, so the sequence can build itself. Once you are generating, the heap is the obvious way to keep order and the three pointers are the observation that each multiplier only ever consumes the sequence in order, so a heap is more machinery than the job needs. Carry two things: when the valid values are sparse, generate instead of filter; and when a value can be produced by more than one route, decide deliberately whether to deduplicate by memory (a seen-set) or by construction (advance every pointer that tied) — the second is cheaper and is the reason 6 appears exactly once here.",
  approach:
    "Keep the sequence in an array and three indices, one per multiplier. The next value is the smallest of 2 × seq[i2], 3 × seq[i3] and 5 × seq[i5]; append it, then advance EVERY index whose product equals it — that is what stops 6 from being emitted twice. Each value costs three multiplications and three comparisons, so the whole sequence is linear in n with no ordering structure at all.",
  complexity: { time: "O(n)", space: "O(n)" },
  python: `def nth_ugly(n: int) -> int:
    seq = [1]
    i2 = i3 = i5 = 0
    while len(seq) < n:
        by2, by3, by5 = seq[i2] * 2, seq[i3] * 3, seq[i5] * 5
        nxt = min(by2, by3, by5)
        seq.append(nxt)
        # every pointer that produced it moves — 6 appears once, not twice
        if nxt == by2:
            i2 += 1
        if nxt == by3:
            i3 += 1
        if nxt == by5:
            i5 += 1
    return seq[n - 1]`,
  java: `public int nthUgly(int n) {
    int[] seq = new int[n];
    seq[0] = 1;
    int i2 = 0, i3 = 0, i5 = 0;
    for (int k = 1; k < n; k++) {
        int by2 = seq[i2] * 2, by3 = seq[i3] * 3, by5 = seq[i5] * 5;
        int next = Math.min(by2, Math.min(by3, by5));
        seq[k] = next;
        if (next == by2) i2++;
        if (next == by3) i3++;
        if (next == by5) i5++;
    }
    return seq[n - 1];
}`,
  cpp: `int nthUgly(int n) {
    vector<int> seq(n);
    seq[0] = 1;
    int i2 = 0, i3 = 0, i5 = 0;
    for (int k = 1; k < n; k++) {
        int by2 = seq[i2] * 2, by3 = seq[i3] * 3, by5 = seq[i5] * 5;
        int next = min(by2, min(by3, by5));
        seq[k] = next;
        if (next == by2) i2++;
        if (next == by3) i3++;
        if (next == by5) i5++;
    }
    return seq[n - 1];
}`,
  walkthrough: [
    {
      cells: {
        values: [1],
        marks: { 0: "focus" },
        labels: { 0: "i2 i3 i5" },
      },
      caption:
        "The sequence starts at 1, and all three pointers sit on it: the next candidates are 1×2, 1×3 and 1×5.",
    },
    {
      cells: {
        values: [1, 2],
        marks: { 0: "window", 1: "focus" },
        labels: { 0: "i3 i5", 1: "i2" },
      },
      caption:
        "The smallest candidate is 2, so it joins the sequence and only the doubling pointer advances. The 3 and 5 candidates are still waiting.",
    },
    {
      cells: {
        values: [1, 2, 3, 4],
        marks: { 3: "focus" },
        labels: { 1: "i3", 2: "i2" },
      },
      caption:
        "Then 3 (from 1×3) and 4 (from 2×2). Each value is produced exactly once because the pointer that produced it moves on.",
    },
    {
      cells: {
        values: [1, 2, 3, 4, 5, 6],
        marks: { 5: "compare" },
        labels: { 5: "2 routes" },
      },
      caption:
        "6 is the interesting one: it is 3×2 AND 2×3, so both candidates equal the minimum. Advancing both pointers appends it once — an `elif` here would emit it twice and shift every later answer.",
    },
    {
      cells: {
        values: [1, 2, 3, 4, 5, 6, 8, 9, 10, 12],
        marks: { 9: "focus" },
        labels: { 9: "n = 10" },
      },
      caption:
        "Ten values in, the answer is 12 — and 7 and 11 were never considered, because nothing generates them.",
    },
  ],
  alternatives: [
    {
      name: "Test every integer",
      summary:
        "Walk the integers from 1 upward. For each, divide out every factor of 2, 3 and 5 and check whether 1 is left; count the ones that pass until the nth.",
      complexity: { time: "O(m log m) over the integers scanned", space: "O(1)" },
      python: `def nth_ugly(n: int) -> int:
    def is_ugly(x: int) -> bool:
        for factor in (2, 3, 5):
            while x % factor == 0:
                x //= factor
        return x == 1

    found = 0
    x = 0
    while found < n:
        x += 1
        if is_ugly(x):
            found += 1
    return x`,
      java: `public int nthUgly(int n) {
    int found = 0, x = 0;
    while (found < n) {
        x++;
        int rest = x;
        int[] factors = {2, 3, 5};
        for (int factor : factors)
            while (rest % factor == 0) rest /= factor;
        if (rest == 1) found++;
    }
    return x;
}`,
      cpp: `int nthUgly(int n) {
    int found = 0, x = 0;
    while (found < n) {
        x++;
        int rest = x;
        int factors[3] = {2, 3, 5};
        for (int i = 0; i < 3; i++)
            while (rest % factors[i] == 0) rest /= factors[i];
        if (rest == 1) found++;
    }
    return x;
}`,
    },
    {
      name: "A heap of candidates",
      summary:
        "Generate instead of test: pop the smallest value from a min-heap, push it times 2, 3 and 5, and use a seen-set so a value produced by two routes is only counted once.",
      complexity: { time: "O(n log n)", space: "O(n)" },
      whyNow:
        "Ugly numbers thin out fast — the 1690th is over a billion, so testing integers one by one tests a billion numbers to find 1690 of them, and almost every test fails. Every ugly number is 2, 3 or 5 times a smaller one, so they can be BUILT in order instead of filtered out of the integers.",
      python: `import heapq

def nth_ugly(n: int) -> int:
    heap = [1]
    seen = {1}
    value = 1
    for _ in range(n):
        value = heapq.heappop(heap)
        for factor in (2, 3, 5):
            nxt = value * factor
            if nxt not in seen:      # 6 arrives from 2 and from 3
                seen.add(nxt)
                heapq.heappush(heap, nxt)
    return value`,
      java: `public int nthUgly(int n) {
    PriorityQueue<Long> heap = new PriorityQueue<>();
    Set<Long> seen = new HashSet<>();
    heap.add(1L);
    seen.add(1L);
    long value = 1;
    int[] factors = {2, 3, 5};
    for (int i = 0; i < n; i++) {
        value = heap.poll();
        for (int factor : factors) {
            long next = value * factor;
            if (seen.add(next)) heap.add(next);
        }
    }
    return (int) value;
}`,
      cpp: `int nthUgly(int n) {
    priority_queue<long long, vector<long long>, greater<long long>> heap;
    unordered_set<long long> seen;
    heap.push(1);
    seen.insert(1);
    long long value = 1;
    long long factors[3] = {2, 3, 5};
    for (int i = 0; i < n; i++) {
        value = heap.top();
        heap.pop();
        for (int f = 0; f < 3; f++) {
            long long next = value * factors[f];
            if (seen.insert(next).second) heap.push(next);
        }
    }
    return (int) value;
}`,
    },
  ],
}
