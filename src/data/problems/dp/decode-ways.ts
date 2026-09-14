import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "decode-ways",
  title: "How Many Ways to Read the Digits",
  pattern: "dp",
  difficulty: "medium",
  leetcode: "decode-ways",
  brief:
    "Count the ways a digit string splits into letters, where 1–26 map to A–Z.",
  statement:
    "Letters are encoded as numbers: A is 1, B is 2, …, Z is 26. Given a string of digits, count how many different letter strings could have produced it. A digit string that cannot be decoded at all counts zero.",
  constraints: [
    "1 <= length <= 100",
    "every character is a digit, so the only question is where the splits go",
    "a piece of one digit is valid unless it is '0' — there is no letter numbered 0",
    "a piece of two digits is valid only from '10' to '26', so '27' and '06' are both dead ends",
    "a leading '0' makes the whole string undecodable, and so does any '0' that is not preceded by a 1 or a 2",
  ],
  examples: [
    { input: 's = "12"', output: "2", note: '"AB" from 1|2, or "L" from 12.' },
    {
      input: 's = "226"',
      output: "3",
      note: "2|2|6, 22|6 and 2|26. The count is over splits, not over letters.",
    },
    {
      input: 's = "06"',
      output: "0",
      note: "The corner case. 0 is not a letter and 06 is not a two-digit code, so nothing decodes.",
    },
    {
      input: 's = "10"',
      output: "1",
      note: "The 0 can only be read as part of 10 — a solution that treats every digit as independently decodable counts 2 here.",
    },
  ],
  hints: [
    "Stand at one position and ask what the NEXT piece is: one digit, or two. Each choice leaves a shorter string with the same question.",
    "So ways(i) = ways(i + 1) if the single digit is valid, plus ways(i + 2) if the pair is valid. The base case is 'past the end', which is one complete decoding.",
    "Every call only ever needs the two positions after it, so the table collapses to two numbers.",
  ],
  whyNow:
    "The table is linear but stores a hundred numbers to read exactly two of them: position i depends on i + 1 and i + 2 and never on anything further. Keeping those two in variables makes the memory constant and makes the recurrence visible in a single line — and there is no traceback to reconstruct afterwards, because the answer is a count, not a decoding.",
  arc: "Every rung is the same recurrence — ways(i) = ways(i+1) plus, when the pair is legal, ways(i+2) — and the ladder is only about where those two numbers are stored: recomputed, cached, tabled, or carried in variables. That progression (brute force, memoise, tabulate, roll the window) is the standard route through almost every one-dimensional dynamic programming question, and it is worth practising as a route rather than as four separate solutions. The content lesson is the zero: it is the only character that can make a whole string undecodable, and it is the reason this is not simply the Fibonacci sequence in disguise. When a problem has a character that kills a branch, write its rule first and the recurrence second — the other way round is how '10' ends up counted twice.",
  approach:
    "Walk from the end of the string towards the front, carrying two numbers: the count of decodings starting one position ahead and two positions ahead. At each position, a '0' contributes nothing (no single digit works and it cannot start a pair); otherwise the count is the one-ahead value, plus the two-ahead value when the current digit and the next one form a number between 10 and 26. Shift the pair and continue. The front of the string ends up holding the answer.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def decode_ways(s: str) -> int:
    ahead1, ahead2 = 1, 0     # ways from just past the end, and one beyond that
    for i in range(len(s) - 1, -1, -1):
        if s[i] == "0":
            here = 0          # no letter is numbered 0, and 0x is never a pair
        else:
            here = ahead1
            if i + 1 < len(s) and int(s[i : i + 2]) <= 26:
                here += ahead2
        ahead1, ahead2 = here, ahead1
    return ahead1`,
  java: `public int decodeWays(String s) {
    int ahead1 = 1, ahead2 = 0;
    for (int i = s.length() - 1; i >= 0; i--) {
        int here;
        if (s.charAt(i) == '0') {
            here = 0;
        } else {
            here = ahead1;
            if (i + 1 < s.length() && (s.charAt(i) - '0') * 10 + (s.charAt(i + 1) - '0') <= 26)
                here += ahead2;
        }
        ahead2 = ahead1;
        ahead1 = here;
    }
    return ahead1;
}`,
  cpp: `int decodeWays(string s) {
    int ahead1 = 1, ahead2 = 0;
    for (int i = (int)s.size() - 1; i >= 0; i--) {
        int here;
        if (s[i] == '0') {
            here = 0;
        } else {
            here = ahead1;
            if (i + 1 < (int)s.size() && (s[i] - '0') * 10 + (s[i + 1] - '0') <= 26)
                here += ahead2;
        }
        ahead2 = ahead1;
        ahead1 = here;
    }
    return ahead1;
}`,
  walkthrough: [
    {
      cells: {
        values: [2, 2, 6],
        marks: { 2: "focus" },
        labels: { 2: "i" },
      },
      caption:
        'The string "226", walked from the right. Past the end counts as one complete decoding, so the two carried numbers start at 1 and 0.',
    },
    {
      cells: {
        values: [2, 2, 6],
        marks: { 2: "done" },
        labels: { 2: "1 way" },
      },
      caption:
        "At the last 6: not a zero, so it can stand alone — one way. There is no digit after it to pair with. Carried: 1 and 1.",
    },
    {
      cells: {
        values: [2, 2, 6],
        marks: { 1: "compare", 2: "done" },
        labels: { 1: "2 ways" },
      },
      caption:
        'At the middle 2: alone it leaves "6" (1 way), and paired as "26" it leaves the empty tail (1 way). Total 2.',
    },
    {
      cells: {
        values: [2, 2, 6],
        marks: { 0: "focus", 1: "done", 2: "done" },
        labels: { 0: "3 ways" },
      },
      caption:
        'At the first 2: alone it leaves "26" (2 ways), and paired as "22" it leaves "6" (1 way). Total 3 — the answer, held in one variable.',
    },
    {
      cells: {
        values: [1, 0],
        marks: { 1: "compare", 0: "focus" },
        labels: { 1: "zero" },
      },
      caption:
        'The corner case "10": standing on the 0 gives zero ways, so the 1 cannot use its single-digit option — only the pair "10" survives, and the answer is 1 rather than 2.',
    },
  ],
  alternatives: [
    {
      name: "Try every split",
      summary:
        "Recursion straight from the definition: at each position take one digit if it is valid, take two if they are valid, and count the ways the rest of the string decodes. Running off the end is one complete decoding.",
      complexity: { time: "O(2^n)", space: "O(n)" },
      python: `def decode_ways(s: str) -> int:
    def ways(i: int) -> int:
        if i == len(s):
            return 1
        if s[i] == "0":
            return 0
        total = ways(i + 1)
        if i + 1 < len(s) and int(s[i : i + 2]) <= 26:
            total += ways(i + 2)
        return total

    return ways(0)`,
      java: `public int decodeWays(String s) {
    return ways(s, 0);
}

private int ways(String s, int i) {
    if (i == s.length()) return 1;
    if (s.charAt(i) == '0') return 0;
    int total = ways(s, i + 1);
    if (i + 1 < s.length() && (s.charAt(i) - '0') * 10 + (s.charAt(i + 1) - '0') <= 26)
        total += ways(s, i + 2);
    return total;
}`,
      cpp: `int waysFrom(const string& s, int i) {
    if (i == (int)s.size()) return 1;
    if (s[i] == '0') return 0;
    int total = waysFrom(s, i + 1);
    if (i + 1 < (int)s.size() && (s[i] - '0') * 10 + (s[i + 1] - '0') <= 26)
        total += waysFrom(s, i + 2);
    return total;
}

int decodeWays(string s) {
    return waysFrom(s, 0);
}`,
    },
    {
      name: "The same recursion, remembered",
      summary:
        "Identical logic with a cache keyed by position. The first call for a position computes it; every later call reads it back.",
      complexity: { time: "O(n)", space: "O(n)" },
      whyNow:
        "The two branches overlap almost completely: taking one digit then two lands on the same position as taking two then one, so the same suffix is recounted along every route that reaches it — a hundred digits of 1s and 2s is a Fibonacci-sized number of calls. The answer for a position never depends on how the walk arrived there, which is exactly the condition that makes caching sound.",
      python: `def decode_ways(s: str) -> int:
    cache: dict[int, int] = {}

    def ways(i: int) -> int:
        if i == len(s):
            return 1
        if s[i] == "0":
            return 0
        if i in cache:
            return cache[i]
        total = ways(i + 1)
        if i + 1 < len(s) and int(s[i : i + 2]) <= 26:
            total += ways(i + 2)
        cache[i] = total
        return total

    return ways(0)`,
      java: `public int decodeWays(String s) {
    int[] cache = new int[s.length() + 1];
    Arrays.fill(cache, -1);
    return waysCached(s, 0, cache);
}

private int waysCached(String s, int i, int[] cache) {
    if (i == s.length()) return 1;
    if (s.charAt(i) == '0') return 0;
    if (cache[i] >= 0) return cache[i];
    int total = waysCached(s, i + 1, cache);
    if (i + 1 < s.length() && (s.charAt(i) - '0') * 10 + (s.charAt(i + 1) - '0') <= 26)
        total += waysCached(s, i + 2, cache);
    cache[i] = total;
    return total;
}`,
      cpp: `int waysCached(const string& s, int i, vector<int>& cache) {
    if (i == (int)s.size()) return 1;
    if (s[i] == '0') return 0;
    if (cache[i] >= 0) return cache[i];
    int total = waysCached(s, i + 1, cache);
    if (i + 1 < (int)s.size() && (s[i] - '0') * 10 + (s[i + 1] - '0') <= 26)
        total += waysCached(s, i + 2, cache);
    cache[i] = total;
    return total;
}

int decodeWays(string s) {
    vector<int> cache((int)s.size() + 1, -1);
    return waysCached(s, 0, cache);
}`,
    },
    {
      name: "A table filled from the end",
      summary:
        "Drop the recursion: allocate one slot per position plus a sentinel past the end, fill it right to left with the same rule, and read the answer at position 0.",
      complexity: { time: "O(n)", space: "O(n)" },
      whyNow:
        "Caching fixed the repeated work but kept the call stack, which is as deep as the string — and the recursion computes positions right to left anyway. Writing that order out as a loop removes the stack entirely and makes the dependency obvious: every slot reads only the two slots after it.",
      python: `def decode_ways(s: str) -> int:
    n = len(s)
    ways = [0] * (n + 1)
    ways[n] = 1
    for i in range(n - 1, -1, -1):
        if s[i] == "0":
            continue
        ways[i] = ways[i + 1]
        if i + 1 < n and int(s[i : i + 2]) <= 26:
            ways[i] += ways[i + 2]
    return ways[0]`,
      java: `public int decodeWays(String s) {
    int n = s.length();
    int[] ways = new int[n + 1];
    ways[n] = 1;
    for (int i = n - 1; i >= 0; i--) {
        if (s.charAt(i) == '0') continue;
        ways[i] = ways[i + 1];
        if (i + 1 < n && (s.charAt(i) - '0') * 10 + (s.charAt(i + 1) - '0') <= 26)
            ways[i] += ways[i + 2];
    }
    return ways[0];
}`,
      cpp: `int decodeWays(string s) {
    int n = (int)s.size();
    vector<int> ways(n + 1, 0);
    ways[n] = 1;
    for (int i = n - 1; i >= 0; i--) {
        if (s[i] == '0') continue;
        ways[i] = ways[i + 1];
        if (i + 1 < n && (s[i] - '0') * 10 + (s[i + 1] - '0') <= 26)
            ways[i] += ways[i + 2];
    }
    return ways[0];
}`,
    },
  ],
}
