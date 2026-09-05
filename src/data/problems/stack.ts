import type { Problem } from "../types.ts"

export const stack: Problem[] = [
  {
    id: "balanced-brackets",
    title: "Balanced Brackets",
    pattern: "stack",
    difficulty: "easy",
    leetcode: "valid-parentheses",
    brief: "Is every bracket opened and closed in the right order?",
    statement:
      "Given a string of the characters ()[]{} only, decide whether it is well-formed: every opener has a matching closer of the same kind, closed in last-opened-first-closed order.",
    constraints: [
      "1 <= s.length <= 10^4",
      "s holds only the six characters ()[]{}",
      "every closer must match the most recent unclosed opener",
    ],
    examples: [
      { input: 's = "([{}])"', output: "true" },
      { input: 's = "(]"', output: "false" },
      { input: 's = "("', output: "false", note: "Unclosed opener left over." },
    ],
    hints: [
      '"Last opened, first closed" is the literal definition of a stack.',
      "Push openers. On a closer, the top of the stack must be its partner.",
      "Two failure modes: mismatch mid-string, and a non-empty stack at the end.",
    ],
    approach:
      "Scan once. Push each opening bracket. For each closing bracket, the stack must be non-empty and its top must be the corresponding opener — otherwise the string is invalid. After the scan the stack must be empty, or some opener was never closed.",
    complexity: { time: "O(n)", space: "O(n)" },
    python: `def is_balanced(s: str) -> bool:
    partner = {")": "(", "]": "[", "}": "{"}
    st: list[str] = []
    for ch in s:
        if ch in partner:
            if not st or st.pop() != partner[ch]:
                return False
        else:
            st.append(ch)
    return not st`,
    walkthrough: [
      {
        text: "s = ( [ { } ] )\n\nstack: []",
        caption: "Openers push; closers must match the top.",
      },
      {
        text: "read ( → push\nread [ → push\nread { → push\n\nstack: ( [ {",
        caption: "Three openers stacked, newest on top.",
      },
      {
        text: "read } → top is { ✓ pop\nread ] → top is [ ✓ pop\nread ) → top is ( ✓ pop\n\nstack: []",
        caption:
          "Each closer pops its exact partner — last opened, first closed.",
      },
      {
        text: 'end of string, stack empty → valid\n\ncounter-example "(]":\nread ( → push;  read ] → top is ( ✗ invalid',
        caption:
          "Empty stack at the end = balanced. Mismatch fails immediately.",
      },
    ],
    alternatives: [
      {
        name: "Repeated replace",
        summary:
          'Keep deleting adjacent matched pairs ("()", "[]", "{}") until nothing changes; valid iff empty. Cute one-liner logic, quadratic runtime — good to know why it\'s worse, not to use.',
        complexity: { time: "O(n²)", space: "O(n)" },
        python: `def is_balanced(s: str) -> bool:
    prev = None
    while prev != s:
        prev = s
        s = s.replace("()", "").replace("[]", "").replace("{}", "")
    return s == ""`,
      },
    ],
  },
  {
    id: "daily-warmer",
    title: "Days Until Warmer",
    pattern: "stack",
    difficulty: "medium",
    leetcode: "daily-temperatures",
    brief: "For each day, how many days until a strictly warmer one?",
    statement:
      "Given daily temperatures, return an array where answer[i] is the number of days you wait after day i for a strictly warmer temperature, or 0 if it never comes.",
    constraints: [
      "1 <= temperatures.length <= 10^5",
      "30 <= temperatures[i] <= 100",
      "a day with no warmer day ahead answers 0",
    ],
    examples: [
      {
        input: "temps = [73, 74, 75, 71, 69, 72, 76, 73]",
        output: "[1, 1, 4, 2, 1, 1, 0, 0]",
      },
    ],
    hints: [
      'Brute force re-scans the future for every day. Notice which days are still "waiting".',
      "Keep waiting days on a stack. A new temperature resolves every colder day on top of it.",
      "The stack stays in decreasing temperature order — that invariant is the whole trick (monotonic stack).",
    ],
    approach:
      "Hold a stack of indices whose warmer day hasn't arrived, always in decreasing temperature order. Each new day pops every index with a colder temperature — the gap in indices is that day's answer — then pushes itself. Every index is pushed and popped at most once, so the pass is linear.",
    complexity: { time: "O(n)", space: "O(n)" },
    python: `def daily_warmer(temps: list[int]) -> list[int]:
    answer = [0] * len(temps)
    waiting: list[int] = []  # indices, temps decreasing
    for i, t in enumerate(temps):
        while waiting and temps[waiting[-1]] < t:
            j = waiting.pop()
            answer[j] = i - j
        waiting.append(i)
    return answer`,
    walkthrough: [
      {
        cells: { values: [73, 74, 75, 71, 69, 72, 76, 73] },
        caption: "For each day: how long until strictly warmer?",
      },
      {
        cells: {
          values: [73, 74, 75, 71, 69, 72, 76, 73],
          marks: { 0: "window", 1: "focus" },
        },
        caption:
          "74 arrives: 73 on the stack is colder → pop it, answer[0] = 1.",
      },
      {
        cells: {
          values: [73, 74, 75, 71, 69, 72, 76, 73],
          marks: { 2: "window", 3: "window", 4: "window" },
        },
        caption:
          "After 75: stack [75]. Then 71, 69 stack up — decreasing order held.",
      },
      {
        cells: {
          values: [73, 74, 75, 71, 69, 72, 76, 73],
          marks: { 3: "compare", 4: "compare", 5: "focus" },
        },
        caption:
          "72 arrives: pops 69 (answer[4]=1) and 71 (answer[3]=2). Stack: [75, 72].",
      },
      {
        cells: {
          values: [73, 74, 75, 71, 69, 72, 76, 73],
          marks: { 2: "compare", 5: "compare", 6: "focus" },
        },
        caption: "76 pops 72 (answer[5]=1) and 75 (answer[2]=4). Stack: [76].",
      },
      {
        cells: {
          values: [73, 74, 75, 71, 69, 72, 76, 73],
          marks: { 6: "done", 7: "done" },
        },
        caption:
          "76 and final 73 never resolve → 0. Answers: [1,1,4,2,1,1,0,0].",
      },
    ],
    alternatives: [
      {
        name: "Brute force",
        summary: "For each day, scan forward until something warmer shows up.",
        complexity: { time: "O(n²)", space: "O(1)" },
        python: `def daily_warmer(temps: list[int]) -> list[int]:
    n = len(temps)
    answer = [0] * n
    for i in range(n):
        for j in range(i + 1, n):
            if temps[j] > temps[i]:
                answer[i] = j - i
                break
    return answer`,
      },
      {
        name: "Backward scan",
        summary:
          "Iterate right-to-left; from day i, hop through already-computed answers to skip runs of colder days. Same worst case on paper, but each hop jumps a whole resolved block — a nice trick when a stack feels heavyweight.",
        complexity: { time: "O(n) amortized", space: "O(1) extra" },
        python: `def daily_warmer(temps: list[int]) -> list[int]:
    n = len(temps)
    answer = [0] * n
    for i in range(n - 2, -1, -1):
        j = i + 1
        while j < n and temps[j] <= temps[i]:
            if answer[j] == 0:
                j = n  # nothing warmer ever again
            else:
                j += answer[j]
        answer[i] = j - i if j < n else 0
    return answer`,
      },
    ],
  },
  {
    id: "largest-rectangle",
    title: "Largest Rectangle in Histogram",
    pattern: "stack",
    difficulty: "hard",
    leetcode: "largest-rectangle-in-histogram",
    brief: "Biggest rectangle fitting under a histogram's bars.",
    statement:
      "Given bar heights of a histogram (all width 1), return the area of the largest axis-aligned rectangle that fits entirely under the bars.",
    constraints: [
      "1 <= heights.length <= 10^5",
      "0 <= heights[i] <= 10^4",
      "the rectangle must span consecutive bars and is capped by the shortest of them",
    ],
    examples: [
      {
        input: "heights = [2, 1, 5, 6, 2, 3]",
        output: "10",
        note: "Height 5 spanning the 5 and 6 bars.",
      },
    ],
    hints: [
      "For each bar, the best rectangle using its full height extends to the first shorter bar on each side.",
      "A monotonic increasing stack finds both boundaries: a bar is finalized the moment a shorter one arrives.",
      "Append a sentinel height 0 so every bar gets flushed at the end.",
    ],
    approach:
      "Sweep with a stack of indices whose heights are non-decreasing. When the incoming bar is shorter than the stack top, the top bar's rectangle is now bounded: its right edge is the current index, its left edge is the element below it on the stack. Pop, compute area, repeat; then push the current bar. A trailing zero-height sentinel drains the stack. Each bar is pushed and popped exactly once.",
    complexity: { time: "O(n)", space: "O(n)" },
    python: `def largest_rectangle(heights: list[int]) -> int:
    best = 0
    st: list[int] = []  # indices, heights non-decreasing
    for i, h in enumerate(heights + [0]):
        while st and heights[st[-1]] > h:
            height = heights[st.pop()]
            left = st[-1] + 1 if st else 0
            best = max(best, height * (i - left))
        st.append(i)
    return best`,
    walkthrough: [
      {
        cells: { values: [2, 1, 5, 6, 2, 3] },
        caption: "Bars of a histogram. Find the largest rectangle under them.",
      },
      {
        cells: {
          values: [2, 1, 5, 6, 2, 3],
          marks: { 0: "compare", 1: "focus" },
        },
        caption: "1 < 2 → bar 0 is bounded. Area: 2 × 1 = 2. Pop it, push 1.",
      },
      {
        cells: {
          values: [2, 1, 5, 6, 2, 3],
          marks: { 1: "window", 2: "window", 3: "window" },
        },
        caption: "1, 5, 6 stack in increasing order — none bounded yet.",
      },
      {
        cells: {
          values: [2, 1, 5, 6, 2, 3],
          marks: { 2: "compare", 3: "compare", 4: "focus" },
        },
        caption:
          "2 arrives: pop 6 → area 6×1 = 6; pop 5 → area 5×2 = 10. New best.",
      },
      {
        cells: {
          values: [2, 1, 5, 6, 2, 3],
          marks: { 1: "window", 4: "window", 5: "window" },
        },
        caption: "Push 2, then 3. Sentinel 0 at the end will flush everything.",
      },
      {
        cells: { values: [2, 1, 5, 6, 2, 3], marks: { 2: "done", 3: "done" } },
        caption:
          "Flush: 3×1, 2×4, 1×6 — none beat 10. Answer 10 (height 5 over bars 2–3).",
      },
    ],
    alternatives: [
      {
        name: "Brute force",
        summary:
          'For each bar, expand left and right while neighbours are at least as tall, using the bar\'s own height. Quadratic but makes the "first shorter bar on each side" idea concrete.',
        complexity: { time: "O(n²)", space: "O(1)" },
        python: `def largest_rectangle(heights: list[int]) -> int:
    best = 0
    n = len(heights)
    for i, h in enumerate(heights):
        left = i
        while left > 0 and heights[left - 1] >= h:
            left -= 1
        right = i
        while right < n - 1 and heights[right + 1] >= h:
            right += 1
        best = max(best, h * (right - left + 1))
    return best`,
      },
      {
        name: "Divide & conquer",
        summary:
          "Best rectangle is either fully left of the minimum bar, fully right of it, or spans it at the minimum's height. Recurse both halves. O(n log n) typical, O(n²) if the array is sorted — the stack solution dominates it.",
        complexity: { time: "O(n log n) avg", space: "O(log n)" },
        python: `def largest_rectangle(heights: list[int]) -> int:
    def solve(lo: int, hi: int) -> int:
        if lo > hi:
            return 0
        m = min(range(lo, hi + 1), key=heights.__getitem__)
        spanning = heights[m] * (hi - lo + 1)
        return max(spanning, solve(lo, m - 1), solve(m + 1, hi))

    return solve(0, len(heights) - 1)`,
      },
    ],
  },
]
