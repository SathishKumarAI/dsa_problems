// Two Sum (LeetCode 1) — journey content: story act + three approaches
// (brute → two pointers → hash map) as frame generators, narrative, presets
// and input validation. DOM-free at load so node can eval it for tests.
// Playback/wiring lives in journey.js (shared), which also provides
// chipRow/randInt/shuffled/distinct.

// ---------- input validation (the "promise" of the problem) ----------

function allPairs(nums, target) {
  const pairs = [];
  for (let i = 0; i < nums.length; i++)
    for (let j = i + 1; j < nums.length; j++)
      if (nums[i] + nums[j] === target) pairs.push([i, j]);
  return pairs;
}

function classifyTwoSum(nums, target) {
  const pairs = allPairs(nums, target);
  if (pairs.length === 1) return { ok: true, pair: pairs[0] };
  if (pairs.length === 0)
    return { ok: false, warning: `Contract broken: no pair sums to ${target}. Every approach comes home empty-handed — watch each one's "no solution" ending.` };
  return { ok: false, warning: `Contract broken: ${pairs.length} pairs sum to ${target}. "Exactly one solution" is the promise — the approaches may return DIFFERENT (equally valid) pairs depending on their search order.` };
}

// ---------- generators (one frame per step; hold = extra read time) ----------

function* runStory(nums, target) {
  yield { hold: 3, note: `A gift card worth exactly ${target}. The shelf holds ${nums.length} priced items. Buy exactly two items that spend the card to zero — and report WHICH shelf slots they sit in, not their prices.` };
  const pairs = allPairs(nums, target);
  if (pairs.length) {
    const [i, j] = pairs[0];
    yield { hold: 3, pair: [i, j], note: `${nums[i]} + ${nums[j]} = ${target} — this pair exists, and the promise says it's the only one. The game: find it without trying every combination.` };
    yield { hold: 3, pair: [i, j], answer: [i, j], note: `The answer is the indices [${i}, ${j}], not the values ${nums[i]} and ${nums[j]}. Interviews dock points for returning values — remember that when we sort later.` };
  } else {
    yield { hold: 3, note: "…no pair spends the card exactly. The promise is broken — keep that in mind, it will matter." };
  }
}

function* runBrute(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      const sum = nums[i] + nums[j];
      yield { line: 2, i, j, sum, note: `${nums[i]} + ${nums[j]} = ${sum}${sum === target ? ` — that's the target!` : ` — not ${target}, keep looking`}` };
      if (sum === target) {
        yield { hold: 2, line: 3, i, j, sum, answer: [i, j], note: `return [${i}, ${j}] — the positions of ${nums[i]} and ${nums[j]}` };
        return;
      }
    }
  }
  yield { hold: 2, line: 4, note: "tried every pair — no solution, the promise was broken" };
}

function* runTwoPointer(nums, target) {
  const order = nums.map((_, i) => i).sort((a, b) => nums[a] - nums[b]);
  const s = order.map((i) => nums[i]);
  let L = 0, R = s.length - 1;
  yield { hold: 2, line: 0, order, s, L, R, note: "sort — but drag each value's ORIGINAL index along (the tiny #numbers), because the answer must be positions" };
  while (L < R) {
    const sum = s[L] + s[R];
    yield { line: 3, order, s, L, R, sum, note: `${s[L]} + ${s[R]} = ${sum}` };
    if (sum === target) {
      const ans = [order[L], order[R]].sort((a, b) => a - b);
      yield { hold: 2, line: 4, order, s, L, R, sum, answer: ans, note: `hit! sorted slots ${L} and ${R} map back to original indices [${ans}]` };
      return;
    }
    if (sum < target) {
      L++;
      yield { line: 5, order, s, L, R, note: `${sum} < ${target} — need more, the left pointer walks right onto a bigger value` };
    } else {
      R--;
      yield { line: 5, order, s, L, R, note: `${sum} > ${target} — too much, the right pointer walks left onto a smaller value` };
    }
  }
  yield { hold: 2, line: 5, order, s, L, R, note: "pointers met — no solution, the promise was broken" };
}

function* runHash(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    const hit = seen.has(need);
    yield { line: 3, i, need, seen: [...seen], hit, note: `at ${nums[i]}: I need ${need} — ${hit ? `and I've SEEN it, at index ${seen.get(need)}!` : "haven't seen it yet"}` };
    if (hit) {
      yield { hold: 2, line: 3, i, need, seen: [...seen], hit, answer: [seen.get(need), i], note: `return [${seen.get(need)}, ${i}] — one pass, done` };
      return;
    }
    seen.set(nums[i], i);
    yield { line: 4, i, seen: [...seen], note: `remember: ${nums[i]} lives at index ${i}` };
  }
  yield { hold: 2, line: 4, seen: [], note: "scanned everything — no solution, the promise was broken" };
}

function* runTwoPassHash(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    map.set(nums[i], i); // duplicates overwrite — pass 2's j != i guard handles it
    yield { line: 2, i, seen: [...map], note: `pass 1: file ${nums[i]} under index ${i}` };
  }
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    const j = map.get(need);
    const hit = map.has(need) && j !== i;
    yield {
      line: 4, i, need, seen: [...map], hit,
      note: `pass 2: at ${nums[i]} I need ${need} — ${!map.has(need) ? "not in the map" : j === i ? `the map points at index ${j}… that's MYSELF. The j != i guard saves us` : `the map says index ${j}`}`,
    };
    if (hit) {
      const ans = [i, j].sort((a, b) => a - b);
      yield { hold: 2, line: 5, i, need, seen: [...map], hit, answer: ans, note: `return [${ans}]` };
      return;
    }
  }
  yield { hold: 2, line: 5, note: "no complement found — the promise was broken" };
}

// ---------- the acts, in learning order ----------

const ACT_ORDER = ["story", "brute", "twoptr", "twopass", "hash"];

const RESOURCES = [
  { label: "LeetCode 1", url: "https://leetcode.com/problems/two-sum/" },
  { label: "Rahul Varma: 3 methods, C++/Java/Python (this page's source)", url: "https://leetcode.com/problems/two-sum/solutions/3619262/3-methods-c-java-python-beginner-friendl-x595" },
  { label: "GeeksforGeeks: two sum", url: "https://www.geeksforgeeks.org/dsa/check-if-pair-with-given-sum-exists-in-array/" },
];

function sumEq(a, b, sum, target) {
  const ok = sum === target;
  return `<div class="sum-eq">${a} + ${b} = <b class="${ok ? "hit" : "miss"}">${sum}</b><span class="target-note">target ${target}</span></div>`;
}

const APPROACHES = {
  story: {
    name: "The Problem",
    short: "start here",
    complexity: "no code yet — just the promise",
    insight: "",
    idea: "In plain words: given prices and a target, find the TWO positions whose values add to the target. Promises: exactly one such pair exists, and you can't use the same element twice. Return indices, not values — that detail shapes every solution below.",
    pseudocode: [
      "given: nums and a target",
      "promise: exactly one pair sums to target",
      "you may not use the same element twice",
      "task: return the two indices",
    ],
    python: null,
    takeaways: [
      "the answer is indices, not values — index bookkeeping is half the problem",
      "\"exactly one solution\" is a promise the fast solutions lean on",
      "same element twice is forbidden: j starts at i+1, maps check before storing",
    ],
    run: runStory,
    render(f, els, data) {
      const focus = new Set(f.pair && !f.answer ? f.pair : []);
      const answer = new Set(f.answer || []);
      els.array.innerHTML = chipRow(data.nums, { focus, answer });
      els.panel.innerHTML = "";
    },
  },

  brute: {
    name: "Brute Force",
    short: "O(n²)",
    complexity: "O(n²) time · O(1) space",
    insight: "First instinct — try every pair.",
    idea: "Hold each item (orange) and try it against every later item (yellow). j starts at i+1, not 0 — that halves the work and enforces \"no element twice\" for free. Still O(n²): fine for a shelf, hopeless for a warehouse.",
    pseudocode: [
      "for i in 0..n-1:",
      "  for j in i+1..n-1:",
      "    if nums[i] + nums[j] == target:",
      "      return [i, j]",
      "no solution",
    ],
    python: [
      "for i in range(len(nums)):",
      "    for j in range(i + 1, len(nums)):",
      "        if nums[i] + nums[j] == target:",
      "            return [i, j]",
      "return []",
    ],
    langs: {
      java: [
        "for (int i = 0; i < nums.length; i++)",
        "    for (int j = i + 1; j < nums.length; j++)",
        "        if (nums[i] + nums[j] == target)",
        "            return new int[]{ i, j };",
        "return new int[]{};",
      ],
      cpp: [
        "for (int i = 0; i < n - 1; i++)",
        "    for (int j = i + 1; j < n; j++)",
        "        if (nums[i] + nums[j] == target)",
        "            return { i, j };",
        "return {};",
      ],
    },
    takeaways: [
      "the pair-checking nested loop is the O(n²) shape — learn to see it instantly",
      "starting j at i+1 both halves the work and bans using an element twice",
      "always know the brute force: it is the baseline every trick must beat",
    ],
    run: runBrute,
    render(f, els, data) {
      const nums = data.nums;
      const anchor = new Set(f.i !== undefined && !f.answer ? [f.i] : []);
      const focus = new Set(f.j !== undefined && !f.answer ? [f.j] : []);
      const dim = new Set();
      for (let k = 0; k < (f.i ?? 0); k++) dim.add(k);
      const answer = new Set(f.answer || []);
      if (f.answer) dim.clear();
      els.array.innerHTML = chipRow(nums, { anchor, focus, dim, answer });
      els.panel.innerHTML = f.sum !== undefined ? sumEq(nums[f.i], nums[f.j], f.sum, data.target) : "";
    },
  },

  twoptr: {
    name: "Two Pointers",
    short: "O(n log n)",
    complexity: "O(n log n) time · O(n) space (index map)",
    insight: "Trying every pair repeats work — order the values and walk inward.",
    idea: "Sort, then squeeze: a pointer at each end. Sum too small → only moving the LEFT pointer up can help; too big → only the RIGHT down. Each probe kills a whole pointer position, so the walk is linear after the sort. The trap: sorting scrambles positions — carry each value's original index along or you'll return the wrong thing.",
    pseudocode: [
      "order = indices sorted by value",
      "L = 0, R = n-1",
      "while L < R:",
      "  s = val[L] + val[R]",
      "  if s == target: return their indices",
      "  s < target ? L += 1 : R -= 1",
    ],
    python: [
      "order = sorted(range(len(nums)), key=lambda i: nums[i])",
      "L, R = 0, len(nums) - 1",
      "while L < R:",
      "    s = nums[order[L]] + nums[order[R]]",
      "    if s == target: return [order[L], order[R]]",
      "    L, R = (L + 1, R) if s < target else (L, R - 1)",
    ],
    langs: {
      java: [
        "int[][] p = valueIndexPairs(nums); Arrays.sort(p, (a, b) -> a[0] - b[0]);",
        "int L = 0, R = p.length - 1;",
        "while (L < R) {",
        "    int s = p[L][0] + p[R][0];",
        "    if (s == target) return new int[]{ p[L][1], p[R][1] };",
        "    if (s < target) L++; else R--; }",
      ],
      cpp: [
        "vector<array<int,2>> p; /* {value, index} */ sort(p.begin(), p.end());",
        "int L = 0, R = n - 1;",
        "while (L < R) {",
        "    int s = p[L][0] + p[R][0];",
        "    if (s == target) return { p[L][1], p[R][1] };",
        "    s < target ? L++ : R--; }",
      ],
    },
    takeaways: [
      "sorted + two pointers squeezing inward = linear scan; the sort is the cost",
      "each comparison eliminates a whole position — that's why it can't miss",
      "index-recovery trap: sort scrambles positions, so sort the INDICES by value",
    ],
    run: runTwoPointer,
    render(f, els, data) {
      const nums = data.nums;
      const answer = new Set(f.answer || []);
      const dim = new Set(nums.map((_, k) => k).filter((k) => !answer.has(k)));
      els.array.innerHTML = chipRow(nums, { dim, answer });
      if (!f.s) {
        els.panel.innerHTML = "";
        return;
      }
      const sdim = new Set();
      f.s.forEach((_, k) => {
        if (k < f.L || k > f.R) sdim.add(k);
      });
      const sAnchor = new Set([f.L]);
      const sFocus = new Set([f.R]);
      const sAns = new Set(f.answer ? [f.L, f.R] : []);
      els.panel.innerHTML =
        `<div class="panel-label">sorted view (tiny number = original index)</div>` +
        `<div class="chip-row">${chipRow(f.s, { anchor: sAnchor, focus: sFocus, dim: sdim, answer: sAns, subs: f.order.map((o) => "#" + o) })}</div>` +
        (f.sum !== undefined ? sumEq(f.s[f.L], f.s[f.R], f.sum, data.target) : "");
    },
  },

  twopass: {
    name: "Two-Pass Hash",
    short: "O(n) / O(n)",
    complexity: "O(n) time · O(n) space — two passes",
    insight: "Sorting was only for finding things fast — a map finds in O(1) with no sort. Build the whole index first.",
    idea: "Pass 1: file every value under its index, like building a phone book. Pass 2: for each value, look up its complement. New trap: the map now contains YOU, so target = 2x can match an element with itself — the j != i guard is mandatory. Duplicates survive because later entries overwrite earlier ones.",
    pseudocode: [
      "map = empty (value → index)",
      "for i, x in nums:   # pass 1",
      "  map[x] = i",
      "for i, x in nums:   # pass 2",
      "  j = map.get(target - x)",
      "  if j exists and j != i: return [i, j]",
    ],
    python: [
      "seen = {}",
      "for i, x in enumerate(nums):",
      "    seen[x] = i",
      "for i, x in enumerate(nums):",
      "    j = seen.get(target - x)",
      "    if j is not None and j != i: return [i, j]",
    ],
    langs: {
      java: [
        "Map<Integer, Integer> map = new HashMap<>();",
        "for (int i = 0; i < nums.length; i++)",
        "    map.put(nums[i], i);",
        "for (int i = 0; i < nums.length; i++) {",
        "    Integer j = map.get(target - nums[i]);",
        "    if (j != null && j != i) return new int[]{ i, j }; }",
      ],
      cpp: [
        "unordered_map<int, int> numMap;",
        "for (int i = 0; i < n; i++)",
        "    numMap[nums[i]] = i;",
        "for (int i = 0; i < n; i++) {",
        "    int complement = target - nums[i];",
        "    if (numMap.count(complement) && numMap[complement] != i) return { i, numMap[complement] }; }",
      ],
    },
    takeaways: [
      "build-then-lookup: two clean O(n) passes — easier to reason about than one-pass",
      "the j != i guard is mandatory: during pass 2 the map contains the current element",
      "duplicates work because later entries overwrite — [3,3] keeps index 1, and index 0 finds it",
    ],
    run: runTwoPassHash,
    render(f, els, data) {
      const nums = data.nums;
      const focus = new Set(f.i !== undefined && !f.answer ? [f.i] : []);
      const dim = new Set();
      const answer = new Set(f.answer || []);
      if (f.answer) {
        nums.forEach((_, k) => {
          if (!answer.has(k)) dim.add(k);
        });
      }
      els.array.innerHTML = chipRow(nums, { focus, dim, answer });
      const chips = (f.seen || [])
        .map(([v, idx]) => {
          let cls = "map-chip";
          if (f.hit && v === f.need) cls += " answer";
          return `<span class="${cls}">${v} @ ${idx}</span>`;
        })
        .join("");
      const phase = f.need === undefined ? "pass 1 — building the map" : "pass 2 — looking up complements";
      const needLine =
        f.need !== undefined
          ? `<div class="sum-eq">need <b class="${f.hit ? "hit" : "miss"}">${f.need}</b><span class="target-note">${data.target} − ${nums[f.i]}</span></div>`
          : "";
      els.panel.innerHTML = `<div class="panel-label">${phase}</div><div class="map-row">${chips}</div>` + needLine;
    },
  },

  hash: {
    name: "One-Pass Hash",
    short: "O(n) / O(n)",
    complexity: "O(n) time · O(n) space — the interview answer",
    insight: "Why two trips? Check for the complement WHILE building the map.",
    idea: "Walk once. At each value x, ask the map: \"has target − x walked past already?\" If yes, done — the map remembers where. If no, file x under its index and continue. One pass, O(1) lookups. Order matters: CHECK before you STORE, or x could match itself when target = 2x.",
    pseudocode: [
      "seen = empty map (value → index)",
      "for i, x in nums:",
      "  need = target - x",
      "  if need in seen: return [seen[need], i]",
      "  seen[x] = i",
    ],
    python: [
      "seen = {}",
      "for i, x in enumerate(nums):",
      "    need = target - x",
      "    if need in seen: return [seen[need], i]",
      "    seen[x] = i",
    ],
    langs: {
      java: [
        "Map<Integer, Integer> seen = new HashMap<>();",
        "for (int i = 0; i < nums.length; i++) {",
        "    int need = target - nums[i];",
        "    if (seen.containsKey(need)) return new int[]{ seen.get(need), i };",
        "    seen.put(nums[i], i); }",
      ],
      cpp: [
        "unordered_map<int, int> numMap;",
        "for (int i = 0; i < n; i++) {",
        "    int complement = target - nums[i];",
        "    if (numMap.count(complement)) return { numMap[complement], i };",
        "    numMap[nums[i]] = i; }",
      ],
    },
    takeaways: [
      "\"have I seen my complement?\" — THE hash-map interview pattern, memorize the shape",
      "check the map BEFORE storing, or target = 2x matches an element with itself",
      "one pass, O(n) time, O(n) space — beats two pointers by skipping the sort",
    ],
    run: runHash,
    render(f, els, data) {
      const nums = data.nums;
      const focus = new Set(f.i !== undefined && !f.answer ? [f.i] : []);
      const dim = new Set();
      for (let k = 0; k < (f.i ?? 0); k++) dim.add(k);
      const answer = new Set(f.answer || []);
      if (f.answer) {
        dim.clear();
        nums.forEach((_, k) => {
          if (!answer.has(k)) dim.add(k);
        });
      }
      els.array.innerHTML = chipRow(nums, { focus, dim, answer });
      const chips = (f.seen || [])
        .map(([v, idx]) => {
          let cls = "map-chip";
          if (f.hit && v === f.need) cls += " answer";
          return `<span class="${cls}">${v} @ ${idx}</span>`;
        })
        .join("");
      const needLine =
        f.need !== undefined
          ? `<div class="sum-eq">need <b class="${f.hit ? "hit" : "miss"}">${f.need}</b><span class="target-note">${data.target} − ${nums[f.i]}</span></div>`
          : "";
      els.panel.innerHTML = `<div class="panel-label">seen (value @ index)</div><div class="map-row">${chips}</div>` + needLine;
    },
  },
};

// ---------- page config consumed by journey.js (browser only) ----------

function makeTwoSum(n, lo = 1, hi = 50) {
  for (let tries = 0; tries < 30; tries++) {
    const nums = shuffled(distinct(n, lo, hi));
    const i = randInt(0, nums.length - 2);
    const j = randInt(i + 1, nums.length - 1);
    const target = nums[i] + nums[j];
    if (classifyTwoSum(nums, target).ok) return { nums, target };
  }
  return { nums: [2, 7, 11, 15], target: 9 };
}

const PAGE = {
  presets: {
    random: { make: () => makeTwoSum(randInt(6, 9)) },
    ends: {
      make: () => {
        for (let tries = 0; tries < 30; tries++) {
          const nums = shuffled(distinct(7, 1, 50));
          const target = Math.min(...nums) + Math.max(...nums);
          if (classifyTwoSum(nums, target).ok) return { nums, target };
        }
        return { nums: [3, 9, 14, 1, 27, 6], target: 28 };
      },
      info: "Best case for Two Pointers: the answer is min + max, found on the very first probe. Watch its chart bar shrink.",
    },
    duplicates: {
      make: () => ({ nums: [3, 1, 3, 8], target: 6 }),
      info: "LC's favorite trap: the pair is two EQUAL values (3 + 3). The hash map must CHECK for the complement before STORING the current value — swap those lines and 3 matches itself.",
    },
    big: {
      make: () => makeTwoSum(20, 1, 99),
      info: "n = 20 — the chart: brute force probes ~n²/2 pairs while the hash map stays linear. That gap IS O(n²) vs O(n).",
    },
    nosolution: { make: () => ({ nums: [1, 2, 5, 11], target: 99 }) },
    multi: { make: () => ({ nums: [1, 4, 2, 3], target: 5 }) },
  },
  classify: (d) => classifyTwoSum(d.nums, d.target),
  describe: (d) => d.nums.join(", "),
  runArgs: (d) => [d.target],
  parseCustom: (text) => {
    const nums = text
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number)
      .filter((v) => Number.isInteger(v) && v >= 0 && v <= 999);
    const target = Number(document.getElementById("target-input").value);
    return nums.length >= 2 && Number.isInteger(target) ? { nums, target } : null;
  },
  onData: (d) => {
    document.getElementById("target-input").value = d.target;
    document.getElementById("databar").innerHTML = `target = <b>${d.target}</b>`;
  },
};
