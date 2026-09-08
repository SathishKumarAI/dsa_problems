import type { Problem } from "../../types.ts"

export const problem: Problem = {
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
  whyNow:
    "Those hops still depend on the shape of the data. A stack of days still waiting for something warmer gives every day exactly one push and one pop, whatever the input looks like.",
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
  java: `public int[] dailyWarmer(int[] temps) {
    int n = temps.length;
    int[] answer = new int[n];
    int[] stack = new int[n];
    int sp = 0;
    for (int i = 0; i < n; i++) {
        while (sp > 0 && temps[stack[sp - 1]] < temps[i]) {
            int j = stack[--sp];
            answer[j] = i - j;
        }
        stack[sp++] = i;
    }
    return answer;
}
`,
  cpp: `vector<int> dailyWarmer(const vector<int>& temps) {
    int n = (int)temps.size();
    vector<int> answer(n);
    vector<int> stack; stack.reserve(n);
    for (int i = 0; i < n; i++) {
        while (!stack.empty() && temps[stack.back()] < temps[i]) {
            int j = stack.back(); stack.pop_back();
            answer[j] = i - j;
        }
        stack.push_back(i);
    }
    return answer;
}
`,
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
      caption: "74 arrives: 73 on the stack is colder → pop it, answer[0] = 1.",
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
      caption: "76 and final 73 never resolve → 0. Answers: [1,1,4,2,1,1,0,0].",
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
      java: `public int[] dailyWarmer(int[] temps) {
    int n = temps.length;
    int[] answer = new int[n];
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (temps[j] > temps[i]) {
                answer[i] = j - i;
                break;
            }
        }
    }
    return answer;
}
`,
      cpp: `vector<int> dailyWarmer(const vector<int>& temps) {
    int n = (int)temps.size();
    vector<int> answer(n, 0);
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (temps[j] > temps[i]) {
                answer[i] = j - i;
                break;
            }
        }
    }
    return answer;
}
`,
    },
    {
      name: "Backward scan",
      whyNow:
        "Scanning forward from every day re-walks the same runs of cold days. Going right to left lets each day hop over stretches that already have answers.",
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
      java: `public int[] dailyWarmer(int[] temps) {
    int n = temps.length;
    int[] answer = new int[n];
    for (int i = n - 2; i >= 0; i--) {
        int j = i + 1;
        while (j < n && temps[j] <= temps[i]) {
            if (answer[j] == 0) {
                j = n;
            } else {
                j += answer[j];
            }
        }
        answer[i] = (j < n) ? (j - i) : 0;
    }
    return answer;
}
`,
      cpp: `vector<int> dailyWarmer(const vector<int>& temps) {
    int n = (int)temps.size();
    vector<int> answer(n, 0);
    for (int i = n - 2; i >= 0; --i) {
        int j = i + 1;
        while (j < n && temps[j] <= temps[i]) {
            if (answer[j] == 0) {
                j = n;
            } else {
                j += answer[j];
            }
        }
        answer[i] = (j < n) ? (j - i) : 0;
    }
    return answer;
}
`,
    },
  ],
}
