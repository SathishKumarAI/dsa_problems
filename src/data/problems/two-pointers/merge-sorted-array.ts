import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "merge-sorted-array",
  title: "Merge the Second Array Into the First",
  pattern: "two-pointers",
  difficulty: "easy",
  leetcode: "merge-sorted-array",
  brief: "Two sorted arrays, one of them already big enough to hold both.",
  statement:
    "You are handed two arrays sorted in non-decreasing order. The first one is already the right size for the finished job: its first m slots hold its own values and the last n slots are padding. Fill it so it holds all m + n values in sorted order, and return it.",
  constraints: [
    "0 <= m, n <= 200 and 1 <= m + n; a has exactly m + n slots",
    "a's first m values and all n of b's are each already sorted non-decreasing",
    "the last n slots of a are padding you are free to overwrite — that spare room at the BACK is the whole trick, because writing forward from index 0 would land on a value of a that has not been placed yet, while writing backward only ever lands on padding or on a slot already read",
    "m = 0 (a is nothing but padding) and n = 0 (nothing to merge in) are both legal, and the second one must leave a alone rather than reading b at all",
    "values may repeat, within one array and across both — equal values are interchangeable, so ties can go either way",
  ],
  examples: [
    {
      input: "a = [1, 2, 3, 0, 0, 0], m = 3, b = [2, 5, 6], n = 3",
      output: "[1, 2, 2, 3, 5, 6]",
      note: "b's 5 and 6 are larger than everything in a, so the first two writes come straight off b's end and a's values never move.",
    },
    {
      input: "a = [1], m = 1, b = [], n = 0",
      output: "[1]",
      note: "There is no padding and nothing to merge — the loop must not run once.",
    },
    {
      input: "a = [0], m = 0, b = [1], n = 1",
      output: "[1]",
      note: "a is pure padding. The read index into a starts at -1 and must never be dereferenced.",
    },
  ],
  hints: [
    "Merging two sorted runs is easy when there is somewhere to put the result. Look at where the free space in a actually is.",
    "Filling from the front overwrites a[0] before you have read it. Which end of a can be written without destroying anything?",
    "Start three indices — the last real value of a, the last value of b, and the last slot of a — take the larger of the two values, write it, and step that index back. When b runs dry you can stop: whatever is left of a is already sitting where it belongs.",
  ],
  whyNow:
    "Merging forward still needs a private copy of a's live prefix, because the very first write to a[0] would clobber a value that has not been placed yet. That copy is only needed because of the direction of travel. Turn around and the problem disappears: the last slot of a is padding, every later write moves further left into space that has just been vacated, and the merge runs with no scratch memory at all.",
  approach:
    "Walk both arrays from their largest values and fill a from its last slot backwards. Compare a's current value with b's, write whichever is larger into the write slot, and step that index back one. Writing backwards is safe by construction: the write index starts on padding and is always at least as far right as the read index into a, so it can never overwrite a value still waiting to be placed. The loop only has to run until b is exhausted — if a runs out first the rest of b is copied straight down, and if b runs out first everything left in a is already in its final position and needs no work. One pass over m + n slots, nothing allocated.",
  complexity: { time: "O(m + n)", space: "O(1)" },
  python: `def merge_sorted(a: list[int], m: int, b: list[int], n: int) -> list[int]:
    i, j, write = m - 1, n - 1, m + n - 1
    while j >= 0:
        if i >= 0 and a[i] > b[j]:
            a[write] = a[i]
            i -= 1
        else:
            a[write] = b[j]
            j -= 1
        write -= 1
    return a`,
  java: `public int[] mergeSorted(int[] a, int m, int[] b, int n) {
    int i = m - 1, j = n - 1, write = m + n - 1;
    while (j >= 0) {
        if (i >= 0 && a[i] > b[j]) {
            a[write] = a[i];
            i--;
        } else {
            a[write] = b[j];
            j--;
        }
        write--;
    }
    return a;
}`,
  cpp: `vector<int> mergeSorted(vector<int> a, int m, vector<int> b, int n) {
    int i = m - 1, j = n - 1, write = m + n - 1;
    while (j >= 0) {
        if (i >= 0 && a[i] > b[j]) {
            a[write] = a[i];
            i--;
        } else {
            a[write] = b[j];
            j--;
        }
        write--;
    }
    return a;
}`,
  walkthrough: [
    {
      cells: {
        values: [1, 2, 3, 0, 0, 0],
        marks: { 2: "focus", 3: "window", 4: "window", 5: "window" },
        labels: { 2: "i", 5: "w" },
      },
      caption:
        "a = [1,2,3,_,_,_], b = [2,5,6]. i is on a's last real value, w on a's last slot, and j (not drawn) on b's 6.",
    },
    {
      cells: {
        values: [1, 2, 3, 0, 0, 6],
        marks: { 2: "focus", 5: "done", 3: "window", 4: "window" },
        labels: { 2: "i", 4: "w" },
      },
      caption:
        "6 beats 3, so it goes into the last slot and j steps back to b's 5. i has not moved — a's 3 is still waiting.",
    },
    {
      cells: {
        values: [1, 2, 3, 0, 5, 6],
        marks: { 2: "focus", 4: "done", 5: "done", 3: "window" },
        labels: { 2: "i", 3: "w" },
      },
      caption:
        "5 beats 3 too. Notice w is still to the RIGHT of i — that gap is why nothing has been destroyed.",
    },
    {
      cells: {
        values: [1, 2, 3, 3, 5, 6],
        marks: { 3: "done", 4: "done", 5: "done", 1: "focus" },
        labels: { 1: "i", 2: "w" },
      },
      caption:
        "Now 3 beats b's 2, so a's own value is copied rightwards onto padding and i steps back to the 2.",
    },
    {
      cells: {
        values: [1, 2, 2, 3, 5, 6],
        marks: { 2: "done", 3: "done", 4: "done", 5: "done" },
        labels: { 1: "i/w" },
      },
      caption:
        "b's 2 ties with a's 2; the tie goes to b and j hits -1. The loop stops with [1,2] already in place — untouched, because they were never in the way.",
    },
  ],
  alternatives: [
    {
      name: "Insert one at a time",
      summary:
        "Take each value of b in turn, find where it belongs among a's live values, and shift everything after it one slot right to open a gap.",
      complexity: { time: "O(n * (m + n))", space: "O(1)" },
      python: `def merge_sorted(a: list[int], m: int, b: list[int], n: int) -> list[int]:
    live = m
    for j in range(n):
        at = 0
        while at < live and a[at] <= b[j]:
            at += 1
        for k in range(live, at, -1):
            a[k] = a[k - 1]
        a[at] = b[j]
        live += 1
    return a`,
      java: `public int[] mergeSorted(int[] a, int m, int[] b, int n) {
    int live = m;
    for (int j = 0; j < n; j++) {
        int at = 0;
        while (at < live && a[at] <= b[j]) at++;
        for (int k = live; k > at; k--) a[k] = a[k - 1];
        a[at] = b[j];
        live++;
    }
    return a;
}`,
      cpp: `vector<int> mergeSorted(vector<int> a, int m, vector<int> b, int n) {
    int live = m;
    for (int j = 0; j < n; j++) {
        int at = 0;
        while (at < live && a[at] <= b[j]) at++;
        for (int k = live; k > at; k--) a[k] = a[k - 1];
        a[at] = b[j];
        live++;
    }
    return a;
}`,
    },
    {
      name: "Append and sort",
      summary:
        "Drop b's values into a's padding without thinking about order, then sort the whole array and let the sort work out the interleaving.",
      complexity: { time: "O((m + n) log(m + n))", space: "O(1)" },
      whyNow:
        "Inserting one value at a time re-shifts a growing tail for every element of b, so a large b pays roughly n * (m + n) moves — and the shifting is pure bookkeeping, not comparison. Handing the whole thing to a sort replaces all of it with one call whose cost grows only logarithmically.",
      python: `def merge_sorted(a: list[int], m: int, b: list[int], n: int) -> list[int]:
    for j in range(n):
        a[m + j] = b[j]
    a.sort()
    return a`,
      java: `public int[] mergeSorted(int[] a, int m, int[] b, int n) {
    for (int j = 0; j < n; j++) {
        a[m + j] = b[j];
    }
    Arrays.sort(a);
    return a;
}`,
      cpp: `vector<int> mergeSorted(vector<int> a, int m, vector<int> b, int n) {
    for (int j = 0; j < n; j++) {
        a[m + j] = b[j];
    }
    sort(a.begin(), a.end());
    return a;
}`,
    },
    {
      name: "Merge into a scratch array",
      summary:
        "Do a textbook forward merge of the two runs into a brand new array of size m + n, then copy the result back over a.",
      complexity: { time: "O(m + n)", space: "O(m + n)" },
      whyNow:
        "The sort throws away the one fact the input is handing you for free — both halves are already ordered — and pays log(m + n) per element to rediscover it. A merge exploits it: each comparison places one value for good, so the whole thing is linear.",
      python: `def merge_sorted(a: list[int], m: int, b: list[int], n: int) -> list[int]:
    out = [0] * (m + n)
    i, j = 0, 0
    for w in range(m + n):
        if j >= n or (i < m and a[i] <= b[j]):
            out[w] = a[i]
            i += 1
        else:
            out[w] = b[j]
            j += 1
    for w in range(m + n):
        a[w] = out[w]
    return a`,
      java: `public int[] mergeSorted(int[] a, int m, int[] b, int n) {
    int[] out = new int[m + n];
    int i = 0, j = 0;
    for (int w = 0; w < m + n; w++) {
        if (j >= n || (i < m && a[i] <= b[j])) {
            out[w] = a[i];
            i++;
        } else {
            out[w] = b[j];
            j++;
        }
    }
    for (int w = 0; w < m + n; w++) a[w] = out[w];
    return a;
}`,
      cpp: `vector<int> mergeSorted(vector<int> a, int m, vector<int> b, int n) {
    vector<int> out(m + n);
    int i = 0, j = 0;
    for (int w = 0; w < m + n; w++) {
        if (j >= n || (i < m && a[i] <= b[j])) {
            out[w] = a[i];
            i++;
        } else {
            out[w] = b[j];
            j++;
        }
    }
    for (int w = 0; w < m + n; w++) a[w] = out[w];
    return a;
}`,
    },
    {
      name: "Copy only a's prefix",
      summary:
        "Save just a's m live values in a small buffer, then merge that buffer with b forward into a — the padding is never copied.",
      complexity: { time: "O(m + n)", space: "O(m)" },
      whyNow:
        "The scratch array is sized m + n and then copied back wholesale, so every value is written twice and n of the copied slots were empty padding to begin with. Only a's own prefix is actually at risk of being overwritten, so only the prefix needs saving: the buffer shrinks to m and the copy-back disappears.",
      python: `def merge_sorted(a: list[int], m: int, b: list[int], n: int) -> list[int]:
    left = a[:m]
    i, j = 0, 0
    for w in range(m + n):
        if j >= n or (i < m and left[i] <= b[j]):
            a[w] = left[i]
            i += 1
        else:
            a[w] = b[j]
            j += 1
    return a`,
      java: `public int[] mergeSorted(int[] a, int m, int[] b, int n) {
    int[] left = Arrays.copyOf(a, m);
    int i = 0, j = 0;
    for (int w = 0; w < m + n; w++) {
        if (j >= n || (i < m && left[i] <= b[j])) {
            a[w] = left[i];
            i++;
        } else {
            a[w] = b[j];
            j++;
        }
    }
    return a;
}`,
      cpp: `vector<int> mergeSorted(vector<int> a, int m, vector<int> b, int n) {
    vector<int> left(a.begin(), a.begin() + m);
    int i = 0, j = 0;
    for (int w = 0; w < m + n; w++) {
        if (j >= n || (i < m && left[i] <= b[j])) {
            a[w] = left[i];
            i++;
        } else {
            a[w] = b[j];
            j++;
        }
    }
    return a;
}`,
    },
  ],
}
