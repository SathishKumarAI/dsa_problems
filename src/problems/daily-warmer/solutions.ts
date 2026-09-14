// daily-warmer — the ladder: every way in, worst first.
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

export const approach = "Hold a stack of indices whose warmer day hasn't arrived, always in decreasing temperature order. Each new day pops every index with a colder temperature — the gap in indices is that day's answer — then pushes itself. Every index is pushed and popped at most once, so the pass is linear."

export const whyNow = "Those hops still depend on the shape of the data. A stack of days still waiting for something warmer gives every day exactly one push and one pop, whatever the input looks like."

export const arc = "The monotonic stack, learned once and reused forever. The stack holds indices whose answer is still unknown, kept in decreasing temperature order, and the moment a warmer day arrives it resolves every index it beats — each index enters and leaves exactly once, which is why an inner while loop is still linear overall. The backward rung is the same information travelling the other way, and comparing the two is the best way to see that this is 'next greater element' in disguise. Learn to recognise the family: next greater, next smaller, previous greater, span problems, and largest rectangle are one technique with the comparison and the direction changed."

export const complexity = { time: "O(n)", space: "O(n)" }

export const python = `def daily_warmer(temps: list[int]) -> list[int]:
    answer = [0] * len(temps)
    waiting: list[int] = []  # indices, temps decreasing
    for i, t in enumerate(temps):
        while waiting and temps[waiting[-1]] < t:
            j = waiting.pop()
            answer[j] = i - j
        waiting.append(i)
    return answer`

export const java = `public int[] dailyWarmer(int[] temps) {
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
`

export const cpp = `vector<int> dailyWarmer(const vector<int>& temps) {
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
`

export const alternatives: Solution[] = [
  {
    name: "Brute force",
    summary:
      "For each day, walk forward until a strictly warmer day appears. Quadratic when temperatures trend downward, because every day scans the whole tail and finds nothing — and it repeats work its neighbour already did, since a day too cold for you was too cold for the day before you.",
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
]
