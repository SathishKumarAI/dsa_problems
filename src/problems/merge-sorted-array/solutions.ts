// merge-sorted-array — the ladder: every way in, worst first.
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

export const approach = "Walk both arrays from their largest values and fill a from its last slot backwards. Compare a's current value with b's, write whichever is larger into the write slot, and step that index back one. Writing backwards is safe by construction: the write index starts on padding and is always at least as far right as the read index into a, so it can never overwrite a value still waiting to be placed. The loop only has to run until b is exhausted — if a runs out first the rest of b is copied straight down, and if b runs out first everything left in a is already in its final position and needs no work. One pass over m + n slots, nothing allocated."

export const whyNow = "Merging forward still needs a private copy of a's live prefix, because the very first write to a[0] would clobber a value that has not been placed yet. That copy is only needed because of the direction of travel. Turn around and the problem disappears: the last slot of a is padding, every later write moves further left into space that has just been vacated, and the merge runs with no scratch memory at all."

export const arc = "Merging is easy; merging IN PLACE is the exercise. Writing from the front would overwrite values not yet read, so the whole ladder converges on one observation: the end of the first array is spare room, so filling from the BACK writes only into cells already consumed or empty. That is the generalisable move — when in-place writing collides with reading, reverse the direction. Two details pay off: the loop can stop as soon as the second array is exhausted, because the rest of the first array is already where it belongs; and the case where the second array's values are all smaller is the one that exercises the leftover copy, so it belongs in your test list."

export const complexity = { time: "O(m + n)", space: "O(1)" }

export const python = `def merge_sorted(a: list[int], m: int, b: list[int], n: int) -> list[int]:
    i, j, write = m - 1, n - 1, m + n - 1
    while j >= 0:
        if i >= 0 and a[i] > b[j]:
            a[write] = a[i]
            i -= 1
        else:
            a[write] = b[j]
            j -= 1
        write -= 1
    return a`

export const java = `public int[] mergeSorted(int[] a, int m, int[] b, int n) {
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
}`

export const cpp = `vector<int> mergeSorted(vector<int> a, int m, vector<int> b, int n) {
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
}`

export const alternatives: Solution[] = [
  {
    name: "Insert one at a time",
    summary:
      "Take each value of b, find its place among the live values of a, and shift the tail right to make room. Faithful to the picture of inserting into a sorted list, and the shifting is quadratic — every insertion moves elements the next insertion will move again.",
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
      "Drop b into the padding of a without thinking, then sort the whole thing. Two lines, hard to get wrong, and it pays a full sort to rediscover an order both inputs already had — the sort is being asked to find structure that was handed to it.",
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
      "The textbook forward merge into a fresh array of size m plus n, then copied back. Linear, and the first rung that actually uses both inputs being sorted; the price is the scratch array, which exists only because writing forward into a would overwrite values not yet read.",
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
      "Save the m live values of a in a small buffer, then merge that buffer with b forward into a. The padding is never copied, so the extra memory drops from m plus n to m — and it is still a copy, made for the same reason: a forward merge writes onto ground it has not read.",
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
]
