import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "counting-bits",
  title: "Set Bits for Every Number up to n",
  pattern: "dp",
  difficulty: "easy",
  leetcode: "counting-bits",
  brief: "How many 1 bits each number from 0 to n has.",
  statement:
    "Given n, return an array of length n + 1 where entry i is the number of 1 bits in the binary representation of i.",
  constraints: [
    "0 <= n <= 10^5",
    "the answer has n + 1 entries, so n = 0 returns [0] rather than an empty array",
    "entry 0 is 0 — zero has no set bits, and it is the base every other entry rests on",
    "counting bits per number independently is allowed but wastes the answers already computed",
  ],
  examples: [
    { input: "n = 2", output: "[0, 1, 1]", note: "0, 1, 10 in binary." },
    {
      input: "n = 5",
      output: "[0, 1, 1, 2, 1, 2]",
      note: "4 is 100 — a power of two drops back to a single bit.",
    },
  ],
  hints: [
    "Every number is some smaller number with one more bit's worth of information. Which smaller number?",
    "Shifting i right by one drops its lowest bit. So bits(i) = bits(i >> 1) plus whether that lowest bit was set.",
    "i >> 1 is always less than i, so the entry you need is always already filled.",
  ],
  whyNow:
    "Counting the bits of each number separately re-walks up to 32 positions for every entry, and it re-derives facts the array already holds. Removing one bit lands on a smaller number whose answer is written down — so each entry costs a shift, an and, and a lookup, and the whole array is one pass.",
  arc: "The naive rung is not wrong, it is forgetful: it walks up to seventeen bit positions for every number while the array it is filling already holds the answer for a smaller one. The DP move is to find that smaller number, and the arithmetic hands it over — shifting right drops the lowest bit and lands on i >> 1, which is strictly smaller and therefore already written down, so each entry costs a shift, an and, and one lookup. That is the pattern in miniature: an overlapping subproblem is just a smaller instance you can name, and naming it is the entire creative step. Entry 0 needs no special case because it is the base every other entry rests on. Worth knowing alongside it is the other decomposition, best[i] = best[i & (i − 1)] + 1, which strips the LOWEST SET bit rather than the last bit; the same identity drives Brian Kernighan's popcount loop, and recognising i & (i − 1) on sight pays across every bit problem.",
  approach:
    "Fill left to right with best[i] = best[i >> 1] + (i & 1). Shifting right removes the lowest bit and lands on a strictly smaller index, which has already been computed — that is the whole recurrence, and it is why a single loop suffices. The `& 1` recovers the bit that the shift discarded. Entry 0 is 0 and needs no special case beyond being the starting point.",
  complexity: { time: "O(n)", space: "O(n)" },
  python: `def count_bits(n: int) -> list[int]:
    best = [0] * (n + 1)
    for i in range(1, n + 1):
        best[i] = best[i >> 1] + (i & 1)
    return best`,
  java: `public int[] countBits(int n) {
    int[] best = new int[n + 1];
    for (int i = 1; i <= n; i++) {
        best[i] = best[i >> 1] + (i & 1);
    }
    return best;
}`,
  cpp: `vector<int> countBits(int n) {
    vector<int> best(n + 1, 0);
    for (int i = 1; i <= n; i++) {
        best[i] = best[i >> 1] + (i & 1);
    }
    return best;
}`,
  alternatives: [
    {
      name: "Count each number's bits",
      summary:
        "For every number from 0 to n, shift it right until it reaches zero, adding up the low bit each time.",
      complexity: { time: "O(n log n)", space: "O(n)" },
      python: `def count_bits(n: int) -> list[int]:
    out = []
    for i in range(n + 1):
        count = 0
        x = i
        while x > 0:
            count += x & 1
            x >>= 1
        out.append(count)
    return out`,
      java: `public int[] countBits(int n) {
    int[] out = new int[n + 1];
    for (int i = 0; i <= n; i++) {
        int count = 0;
        int x = i;
        while (x > 0) {
            count += x & 1;
            x >>= 1;
        }
        out[i] = count;
    }
    return out;
}`,
      cpp: `vector<int> countBits(int n) {
    vector<int> out(n + 1, 0);
    for (int i = 0; i <= n; i++) {
        int count = 0;
        int x = i;
        while (x > 0) {
            count += x & 1;
            x >>= 1;
        }
        out[i] = count;
    }
    return out;
}`,
    },
  ],
}
