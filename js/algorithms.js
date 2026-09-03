// Sort/search algorithms as generators yielding step objects. No DOM here.
// Step shape: { type, indices?, values?, line, note }
//   compare  — indices being compared
//   swap     — indices swapped (array already mutated)
//   set      — index written with value (merge sort)
//   pivot    — index marked as pivot / current range bounds
//   sorted   — indices now in final position (or search hit)
//   discard  — indices eliminated from the search range (search only)
// Each algo has: name, complexity, pseudocode (array of lines), run(array, target?) generator.
// kind: "search" means the visualizer sorts the array first and passes a target.

const ALGORITHMS = {
  bubble: {
    name: "Bubble Sort",
    complexity: "O(n²) time · O(1) space",
    pseudocode: [
      "for i = 0 .. n-2",
      "  for j = 0 .. n-2-i",
      "    if a[j] > a[j+1]",
      "      swap a[j], a[j+1]",
      "  // a[n-1-i] is in place",
    ],
    *run(a) {
      const n = a.length;
      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - 1 - i; j++) {
          yield { type: "compare", indices: [j, j + 1], line: 2, note: `compare ${a[j]} and ${a[j + 1]}` };
          if (a[j] > a[j + 1]) {
            [a[j], a[j + 1]] = [a[j + 1], a[j]];
            yield { type: "swap", indices: [j, j + 1], line: 3, note: `${a[j + 1]} > ${a[j]}, swap` };
          }
        }
        yield { type: "sorted", indices: [n - 1 - i], line: 4, note: `largest of the pass bubbled to position ${n - 1 - i}` };
      }
      yield { type: "sorted", indices: [0], line: 4, note: "done" };
    },
  },

  selection: {
    name: "Selection Sort",
    complexity: "O(n²) time · O(1) space",
    pseudocode: [
      "for i = 0 .. n-2",
      "  min = i",
      "  for j = i+1 .. n-1",
      "    if a[j] < a[min]: min = j",
      "  swap a[i], a[min]",
    ],
    *run(a) {
      const n = a.length;
      for (let i = 0; i < n - 1; i++) {
        let min = i;
        yield { type: "pivot", indices: [i], line: 1, note: `find minimum of a[${i}..${n - 1}]` };
        for (let j = i + 1; j < n; j++) {
          yield { type: "compare", indices: [j, min], line: 3, note: `is ${a[j]} < ${a[min]}?` };
          if (a[j] < a[min]) min = j;
        }
        if (min !== i) {
          [a[i], a[min]] = [a[min], a[i]];
          yield { type: "swap", indices: [i, min], line: 4, note: `swap minimum ${a[i]} into position ${i}` };
        }
        yield { type: "sorted", indices: [i], line: 4, note: `position ${i} fixed` };
      }
      yield { type: "sorted", indices: [n - 1], line: 4, note: "done" };
    },
  },

  insertion: {
    name: "Insertion Sort",
    complexity: "O(n²) time · O(1) space",
    pseudocode: [
      "for i = 1 .. n-1",
      "  key = a[i]; j = i-1",
      "  while j >= 0 and a[j] > key",
      "    a[j+1] = a[j]; j--",
      "  a[j+1] = key",
    ],
    *run(a) {
      const n = a.length;
      yield { type: "sorted", indices: [0], line: 0, note: "first element is a sorted prefix" };
      for (let i = 1; i < n; i++) {
        const key = a[i];
        let j = i - 1;
        yield { type: "pivot", indices: [i], line: 1, note: `insert ${key} into sorted prefix` };
        while (j >= 0 && a[j] > key) {
          yield { type: "compare", indices: [j, j + 1], line: 2, note: `${a[j]} > ${key}, shift right` };
          a[j + 1] = a[j];
          yield { type: "set", indices: [j + 1], values: [a[j]], line: 3, note: `shift ${a[j + 1]}` };
          j--;
        }
        a[j + 1] = key;
        yield { type: "set", indices: [j + 1], values: [key], line: 4, note: `place ${key} at position ${j + 1}` };
        yield { type: "sorted", indices: Array.from({ length: i + 1 }, (_, k) => k), line: 4, note: `prefix a[0..${i}] sorted` };
      }
    },
  },

  merge: {
    name: "Merge Sort",
    complexity: "O(n log n) time · O(n) space",
    pseudocode: [
      "mergeSort(lo, hi):",
      "  if hi - lo < 1: return",
      "  mid = (lo + hi) / 2",
      "  mergeSort(lo, mid); mergeSort(mid+1, hi)",
      "  merge the two sorted halves",
    ],
    *run(a) {
      const n = a.length;
      function* sort(lo, hi) {
        if (hi - lo < 1) return;
        const mid = (lo + hi) >> 1;
        yield { type: "pivot", indices: [mid], line: 2, note: `split a[${lo}..${hi}] at ${mid}` };
        yield* sort(lo, mid);
        yield* sort(mid + 1, hi);
        const merged = [];
        let i = lo, j = mid + 1;
        while (i <= mid && j <= hi) {
          yield { type: "compare", indices: [i, j], line: 4, note: `compare ${a[i]} and ${a[j]}` };
          merged.push(a[i] <= a[j] ? a[i++] : a[j++]);
        }
        while (i <= mid) merged.push(a[i++]);
        while (j <= hi) merged.push(a[j++]);
        for (let k = 0; k < merged.length; k++) {
          a[lo + k] = merged[k];
          yield { type: "set", indices: [lo + k], values: [merged[k]], line: 4, note: `write ${merged[k]} to position ${lo + k}` };
        }
      }
      yield* sort(0, n - 1);
      yield { type: "sorted", indices: Array.from({ length: n }, (_, k) => k), line: 4, note: "done" };
    },
  },

  quick: {
    name: "Quick Sort",
    complexity: "O(n log n) avg, O(n²) worst · O(log n) space",
    pseudocode: [
      "quickSort(lo, hi):",
      "  if lo >= hi: return",
      "  pivot = a[hi]",
      "  partition: smaller left, bigger right",
      "  quickSort(lo, p-1); quickSort(p+1, hi)",
    ],
    *run(a) {
      function* sort(lo, hi) {
        if (lo >= hi) {
          if (lo === hi) yield { type: "sorted", indices: [lo], line: 1, note: `position ${lo} fixed` };
          return;
        }
        const pivot = a[hi];
        yield { type: "pivot", indices: [hi], line: 2, note: `pivot = ${pivot}` };
        let p = lo;
        for (let j = lo; j < hi; j++) {
          yield { type: "compare", indices: [j, hi], line: 3, note: `is ${a[j]} < pivot ${pivot}?` };
          if (a[j] < pivot) {
            if (p !== j) {
              [a[p], a[j]] = [a[j], a[p]];
              yield { type: "swap", indices: [p, j], line: 3, note: `move ${a[p]} left of pivot` };
            }
            p++;
          }
        }
        [a[p], a[hi]] = [a[hi], a[p]];
        yield { type: "swap", indices: [p, hi], line: 3, note: `pivot ${pivot} to position ${p}` };
        yield { type: "sorted", indices: [p], line: 4, note: `pivot fixed at ${p}` };
        yield* sort(lo, p - 1);
        yield* sort(p + 1, hi);
      }
      yield* sort(0, a.length - 1);
    },
  },

  heap: {
    name: "Heap Sort",
    complexity: "O(n log n) time · O(1) space",
    pseudocode: [
      "build max-heap from array",
      "for end = n-1 .. 1",
      "  swap a[0], a[end]  // max to back",
      "  siftDown(0, end-1)",
    ],
    *run(a) {
      const n = a.length;
      function* siftDown(i, end, line) {
        while (true) {
          const l = 2 * i + 1, r = 2 * i + 2;
          let big = i;
          if (l <= end) {
            yield { type: "compare", indices: [l, big], line, note: `compare child ${a[l]} with ${a[big]}` };
            if (a[l] > a[big]) big = l;
          }
          if (r <= end) {
            yield { type: "compare", indices: [r, big], line, note: `compare child ${a[r]} with ${a[big]}` };
            if (a[r] > a[big]) big = r;
          }
          if (big === i) return;
          [a[i], a[big]] = [a[big], a[i]];
          yield { type: "swap", indices: [i, big], line, note: "sift down" };
          i = big;
        }
      }
      for (let i = (n >> 1) - 1; i >= 0; i--) yield* siftDown(i, n - 1, 0);
      for (let end = n - 1; end >= 1; end--) {
        [a[0], a[end]] = [a[end], a[0]];
        yield { type: "swap", indices: [0, end], line: 2, note: `max ${a[end]} to position ${end}` };
        yield { type: "sorted", indices: [end], line: 2, note: `position ${end} fixed` };
        yield* siftDown(0, end - 1, 3);
      }
      yield { type: "sorted", indices: [0], line: 3, note: "done" };
    },
  },

  binary: {
    name: "Binary Search",
    kind: "search",
    complexity: "O(log n) time · O(1) space",
    pseudocode: [
      "lo = 0, hi = n-1",
      "while lo <= hi",
      "  mid = (lo + hi) / 2",
      "  if a[mid] == target: found",
      "  if a[mid] < target: lo = mid+1",
      "  else: hi = mid-1",
      "not found",
    ],
    *run(a, target) {
      const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, k) => lo + k);
      let lo = 0, hi = a.length - 1;
      yield { type: "pivot", indices: [lo, hi], line: 0, note: `search for ${target} in a[${lo}..${hi}]` };
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        yield { type: "compare", indices: [mid], line: 3, note: `mid = ${mid}: is a[mid] = ${a[mid]} equal to ${target}?` };
        if (a[mid] === target) {
          yield { type: "sorted", indices: [mid], line: 3, note: `found ${target} at index ${mid}` };
          return;
        }
        if (a[mid] < target) {
          yield { type: "discard", indices: range(lo, mid), line: 4, note: `${a[mid]} < ${target} — target can't be in a[${lo}..${mid}], discard left half` };
          lo = mid + 1;
        } else {
          yield { type: "discard", indices: range(mid, hi), line: 5, note: `${a[mid]} > ${target} — target can't be in a[${mid}..${hi}], discard right half` };
          hi = mid - 1;
        }
        if (lo <= hi) yield { type: "pivot", indices: [lo, hi], line: 1, note: `range narrowed to a[${lo}..${hi}]` };
      }
      yield { type: "discard", indices: [], line: 6, note: `range empty — ${target} is not in the array` };
    },
  },
};
