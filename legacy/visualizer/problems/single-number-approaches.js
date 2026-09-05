// Single Number (LeetCode 136) — the learning journey's content: story act,
// four approaches (naive → optimal) as frame generators, per-act narrative,
// resources, presets and input validation. DOM-free at load so node can eval
// it for tests; render()/PAGE only run in the browser.
// Playback/wiring lives in journey.js (shared), which also provides
// chipRow/randInt/shuffled/distinct.

const BITS = 7; // values stay under 128

function bitRow(tag, value, flipMask = 0) {
  let cells = "";
  for (let b = BITS - 1; b >= 0; b--) {
    const on = (value >> b) & 1;
    let cls = "bit" + (on ? " on" : "") + ((flipMask >> b) & 1 ? " flip" : "");
    cells += `<span class="${cls}">${on}</span>`;
  }
  return `<div class="bits"><span class="tag">${tag}</span>${cells}<span class="dec">= ${value}</span></div>`;
}

// ---------- input validation (the "promise" of the problem) ----------

// Classifies input against the problem's contract. Broken inputs are allowed
// through on purpose — watching an approach fail teaches why the contract matters.
function classifyInput(nums) {
  const counts = new Map();
  for (const v of nums) counts.set(v, (counts.get(v) || 0) + 1);
  const singles = [...counts].filter(([, c]) => c === 1).map(([v]) => v);
  const odd = [...counts].filter(([, c]) => c !== 1 && c !== 2);
  if (singles.length === 1 && odd.length === 0) return { ok: true, single: singles[0] };
  if (singles.length > 1)
    return { ok: false, warning: `Contract broken: ${singles.join(" and ")} both lack partners. XOR will return ${singles.reduce((a, b) => a ^ b)} — their XOR, possibly a value not even in the array. The promise "exactly one single" is what makes XOR safe.` };
  if (odd.length > 0)
    return { ok: false, warning: `Contract broken: ${odd[0][0]} appears ${odd[0][1]}×. Brute force and hash see "has a partner" and find no answer; XOR treats the odd copy as a loner. Same code, different lies.` };
  return { ok: false, warning: "Contract broken: no value appears exactly once — there is no answer to find." };
}

// ---------- generators (one frame per step; hold = extra read time) ----------

function* runStory(nums) {
  yield { hold: 3, note: "A drawer of socks: every sock came in a pair, but one lost its twin. The drawer is shuffled. Your job: find the lonely one." };
  const where = new Map();
  nums.forEach((v, i) => (where.get(v) || where.set(v, []).get(v)).push(i));
  const dim = [];
  for (const [v, idxs] of where) {
    if (idxs.length === 2) {
      yield { hold: 2, pair: idxs, dim: [...dim], note: `${v} and ${v} — a pair. Pairs are noise; ignore them.` };
      dim.push(...idxs);
    }
  }
  const single = [...where].find(([, ix]) => ix.length === 1);
  if (single) {
    yield { hold: 3, single: single[1][0], dim: [...dim], note: `${single[0]} stands alone — that is what every approach below must find. The question is only: at what cost in time and memory?` };
  } else {
    yield { hold: 3, dim: [...dim], note: "…this input has no loner. The problem's promise is broken — keep that in mind, it will matter later." };
  }
}

function* runBrute(nums) {
  for (let i = 0; i < nums.length; i++) {
    let found = false;
    for (let j = 0; j < nums.length && !found; j++) {
      if (j === i) continue;
      yield { line: 3, i, j, note: `is nums[${j}] = ${nums[j]} the partner of nums[${i}] = ${nums[i]}?` };
      if (nums[j] === nums[i]) {
        found = true;
        yield { line: 3, i, j, note: `${nums[i]} has a partner at index ${j} — not our loner, move on` };
      }
    }
    if (!found) {
      yield { hold: 2, line: 4, i, answer: nums[i], note: `${nums[i]} searched the whole drawer and found no partner — answer!` };
      return;
    }
  }
  yield { hold: 2, line: 4, note: "every element found a partner — the input broke the problem's promise" };
}

function* runHash(nums) {
  const counts = new Map();
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i];
    counts.set(x, (counts.get(x) || 0) + 1);
    yield { line: 2, i, counts: [...counts], note: `counts[${x}] is now ${counts.get(x)}` };
  }
  for (const [x, c] of counts) {
    if (c === 1) {
      yield { hold: 2, line: 4, scanX: x, counts: [...counts], answer: x, note: `counts[${x}] = 1 — ${x} is the single number` };
      return;
    }
    yield { line: 4, scanX: x, counts: [...counts], note: `counts[${x}] = ${c} — not 1, keep scanning` };
  }
  yield { hold: 2, line: 4, counts: [...counts], note: "no count of exactly 1 — the input broke the problem's promise" };
}

function* runSort(nums) {
  const s = nums.slice().sort((a, b) => a - b);
  yield { hold: 2, line: 0, sorted: s, passed: 0, note: "sort a copy — duplicates become adjacent, the order does the matching" };
  for (let i = 0; i + 1 < s.length; i += 2) {
    if (s[i] !== s[i + 1]) {
      yield { line: 2, sorted: s, pair: [i, i + 1], passed: i, note: `${s[i]} ≠ ${s[i + 1]} — the pair pattern broke` };
      yield { hold: 2, line: 3, sorted: s, single: i, passed: i, answer: s[i], note: `${s[i]} has no partner — answer` };
      return;
    }
    yield { line: 2, sorted: s, pair: [i, i + 1], passed: i, note: `${s[i]} = ${s[i + 1]} — a matched pair, skip both` };
  }
  const last = s.length - 1;
  yield { hold: 2, line: 4, sorted: s, single: last, passed: last, answer: s[last], note: `every pair matched — last element ${s[last]} is the single` };
}

function* runXor(nums) {
  let acc = 0;
  yield { line: 0, i: -1, x: null, acc, note: "start with acc = 0 (XOR identity: 0 XOR x = x)" };
  for (let i = 0; i < nums.length; i++) {
    const before = acc;
    acc ^= nums[i];
    yield { line: 2, i, x: nums[i], acc, note: `${before} XOR ${nums[i]} = ${acc} — equal bits cancel to 0` };
  }
  yield { hold: 2, line: 3, i: nums.length, x: null, acc, answer: acc, note: `all pairs annihilated — acc = ${acc} is the single number` };
}

// ---------- the acts, in learning order ----------

const ACT_ORDER = ["story", "brute", "hash", "sort", "xor"];

const RESOURCES = [
  { label: "LeetCode 136", url: "https://leetcode.com/problems/single-number/" },
  { label: "GeeksforGeeks: element that appears once", url: "https://www.geeksforgeeks.org/dsa/find-the-element-that-appears-once/" },
  { label: "Wikipedia: XOR properties", url: "https://en.wikipedia.org/wiki/Exclusive_or#Properties" },
];

const APPROACHES = {
  story: {
    name: "The Problem",
    short: "start here",
    complexity: "no code yet — just the promise",
    insight: "",
    idea: "In plain words: a shuffled drawer where every value appears exactly twice, except one loner. Return the loner. The promise — exactly one single, everything else paired — is not decoration; it is what the clever solutions will lean on.",
    pseudocode: [
      "given: nums, length n",
      "promise: every value appears twice…",
      "…except exactly one value, once",
      "task: return that lone value",
    ],
    python: null,
    takeaways: [
      "the promise — exactly one single, all else paired — is a rule you may lean on",
      "correctness is not the game; every approach below is correct",
      "the game is cost: how much time, how much memory",
    ],
    run: runStory,
    render(f, els, data) {
      const nums = data.nums;
      const focus = new Set(f.pair || []);
      const dim = new Set(f.dim || []);
      const answer = new Set(f.single !== undefined ? [f.single] : []);
      els.array.innerHTML = chipRow(nums, { focus, dim, answer });
      els.panel.innerHTML = "";
    },
  },

  brute: {
    name: "Brute Force",
    short: "O(n²)",
    complexity: "O(n²) time · O(1) space",
    insight: "First instinct — no cleverness, just check everything.",
    idea: "Pick up each sock and rummage through the whole drawer for its twin. For each of n elements you scan up to n others: n² looks. Fine for 9 socks, hopeless for a million. Watch the chart below — this bar explodes as the array grows.",
    pseudocode: [
      "for i in 0..n-1:",
      "  found = false",
      "  for j ≠ i:",
      "    if nums[j] == nums[i]: found",
      "  if not found: return nums[i]",
    ],
    python: [
      "for i in range(len(nums)):",
      "    found = False",
      "    for j in range(len(nums)):",
      "        if j != i and nums[j] == nums[i]: found = True",
      "    if not found: return nums[i]",
    ],
    langs: {
      java: [
        "for (int i = 0; i < nums.length; i++) {",
        "    boolean found = false;",
        "    for (int j = 0; j < nums.length; j++)",
        "        if (j != i && nums[j] == nums[i]) found = true;",
        "    if (!found) return nums[i]; }",
      ],
      cpp: [
        "for (int i = 0; i < n; i++) {",
        "    bool found = false;",
        "    for (int j = 0; j < n; j++)",
        "        if (j != i && nums[j] == nums[i]) found = true;",
        "    if (!found) return nums[i]; }",
      ],
    },
    takeaways: [
      "nested loop over the same data = O(n²) — the shape to recognize",
      "correct but wasteful: it re-searches the whole drawer for every element",
      "always know the brute force first; it is the baseline every trick must beat",
    ],
    run: runBrute,
    render(f, els, data) {
      const nums = data.nums;
      const anchor = new Set(f.i !== undefined ? [f.i] : []);
      const focus = new Set(f.j !== undefined ? [f.j] : []);
      const dim = new Set();
      for (let k = 0; k < (f.i ?? 0); k++) dim.add(k);
      const answer = new Set(f.answer !== undefined ? [f.i] : []);
      if (f.answer !== undefined) anchor.clear();
      els.array.innerHTML = chipRow(nums, { focus, anchor, dim, answer });
      els.panel.innerHTML = "";
    },
  },

  hash: {
    name: "Hash Map",
    short: "O(n) / O(n)",
    complexity: "O(n) time · O(n) space",
    insight: "Brute force repeats work — what if we remembered what we've seen?",
    idea: "Keep a tally as you go: one pass to count every value, one pass over the tally to find the count of 1. We bought speed with memory — n² looks became n, but now a whole map rides along.",
    pseudocode: [
      "counts = empty map",
      "for x in nums:",
      "  counts[x] += 1",
      "for (x, c) in counts:",
      "  if c == 1: return x",
    ],
    python: [
      "counts = {}",
      "for x in nums:",
      "    counts[x] = counts.get(x, 0) + 1",
      "for x, c in counts.items():",
      "    if c == 1: return x",
    ],
    langs: {
      java: [
        "Map<Integer, Integer> counts = new HashMap<>();",
        "for (int x : nums)",
        "    counts.merge(x, 1, Integer::sum);",
        "for (var e : counts.entrySet())",
        "    if (e.getValue() == 1) return e.getKey();",
      ],
      cpp: [
        "unordered_map<int, int> counts;",
        "for (int x : nums)",
        "    counts[x]++;",
        "for (auto& [x, c] : counts)",
        "    if (c == 1) return x;",
      ],
    },
    takeaways: [
      "a dict is the 'remember what I saw' tool — it turns re-searching into lookup",
      "memory buys speed: n² comparisons became one pass + one scan",
      "in Python, collections.Counter(nums) does the first loop in one line",
    ],
    run: runHash,
    render(f, els, data) {
      const nums = data.nums;
      const focus = new Set(f.scanX === undefined && f.i !== undefined ? [f.i] : []);
      const dim = new Set();
      const answer = new Set();
      if (f.scanX !== undefined || f.line === 4) {
        nums.forEach((v, i) => (v === f.answer ? answer.add(i) : dim.add(i)));
      } else {
        for (let k = 0; k < (f.i ?? 0); k++) dim.add(k);
      }
      els.array.innerHTML = chipRow(nums, { focus, dim, answer });
      const chips = (f.counts || [])
        .map(([x, c]) => {
          let cls = "map-chip";
          if (x === f.scanX) cls += f.answer === x ? " answer" : " scan";
          return `<span class="${cls}" data-k="m${x}">${x} ×${c}</span>`;
        })
        .join("");
      els.panel.innerHTML = `<div class="panel-label">counts (the memory we pay for)</div><div class="map-row">${chips}</div>`;
    },
  },

  sort: {
    name: "Sort & Scan",
    short: "O(n log n)",
    complexity: "O(n log n) time · O(1) extra space",
    insight: "The map costs memory — what if the drawer organized itself?",
    idea: "Sort it: twins end up adjacent, so pairs occupy positions (0,1), (2,3), … until the single breaks the pattern. No map — the order does the matching. Slower than counting (n log n), but lean. Already-sorted input changes nothing: the sort still runs.",
    pseudocode: [
      "sorted = sort(nums)",
      "for i = 0, 2, 4, ...",
      "  if sorted[i] != sorted[i+1]:",
      "    return sorted[i]",
      "return sorted[n-1]",
    ],
    python: [
      "s = sorted(nums)",
      "for i in range(0, len(s) - 1, 2):",
      "    if s[i] != s[i + 1]:",
      "        return s[i]",
      "return s[-1]",
    ],
    langs: {
      java: [
        "int[] s = nums.clone(); Arrays.sort(s);",
        "for (int i = 0; i + 1 < s.length; i += 2)",
        "    if (s[i] != s[i + 1])",
        "        return s[i];",
        "return s[s.length - 1];",
      ],
      cpp: [
        "vector<int> s(nums); sort(s.begin(), s.end());",
        "for (int i = 0; i + 1 < (int)s.size(); i += 2)",
        "    if (s[i] != s[i + 1])",
        "        return s[i];",
        "return s.back();",
      ],
    },
    takeaways: [
      "ordering is information — sorting makes duplicates adjacent for free",
      "trade: O(n log n) time to avoid the map's O(n) memory",
      "edge to remember: if every pair matches, the single is the last element",
    ],
    run: runSort,
    render(f, els, data) {
      const nums = data.nums;
      els.array.innerHTML = chipRow(nums, { dim: new Set(nums.keys()) });
      if (!f.sorted) {
        els.panel.innerHTML = "";
        return;
      }
      const focus = new Set(f.pair || []);
      const dim = new Set();
      for (let k = 0; k < (f.passed ?? 0); k++) if (k !== f.single) dim.add(k);
      const answer = new Set(f.single !== undefined ? [f.single] : []);
      els.panel.innerHTML = `<div class="panel-label">sorted copy</div><div class="chip-row">${chipRow(f.sorted, { focus, dim, answer })}</div>`;
    },
  },

  xor: {
    name: "XOR",
    short: "O(n) / O(1)",
    complexity: "O(n) time · O(1) space — the follow-up answer",
    insight: "One pass AND no memory — can math do the matching for us?",
    idea: "x XOR x = 0, and XOR doesn't care about order. So XOR everything: each pair annihilates bit by bit, and only the loner's bits survive. One variable, one pass. This leans entirely on the promise — feed it two singles and it lies confidently.",
    pseudocode: [
      "acc = 0",
      "for x in nums:",
      "  acc = acc XOR x",
      "return acc",
    ],
    python: [
      "acc = 0",
      "for x in nums:",
      "    acc ^= x",
      "return acc",
    ],
    langs: {
      java: [
        "int acc = 0;",
        "for (int x : nums)",
        "    acc ^= x;",
        "return acc;",
      ],
      cpp: [
        "int acc = 0;",
        "for (int x : nums)",
        "    acc ^= x;",
        "return acc;",
      ],
    },
    takeaways: [
      "x ^ x = 0, x ^ 0 = x, and order never matters — pairs annihilate",
      "O(n) time AND O(1) space — this is the interview answer",
      "it leans entirely on the promise: broken input makes it lie confidently",
    ],
    run: runXor,
    render(f, els, data) {
      const nums = data.nums;
      const focus = new Set(f.i >= 0 && f.i < nums.length ? [f.i] : []);
      const dim = new Set();
      const answer = new Set();
      for (let k = 0; k < Math.min(f.i ?? 0, nums.length); k++) dim.add(k);
      if (f.answer !== undefined) {
        dim.clear();
        nums.forEach((v, i) => (v === f.answer ? answer.add(i) : dim.add(i)));
      }
      els.array.innerHTML = chipRow(nums, { focus, dim, answer });
      const rows = [];
      if (f.x !== null && f.x !== undefined) rows.push(bitRow("x", f.x));
      rows.push(bitRow("acc", f.acc ?? 0, f.x ?? 0)); // red outline = bits x just flipped
      els.panel.innerHTML = `<div class="panel-label">accumulator (bit view)</div>${rows.join("")}`;
    },
  },
};

// ---------- page config consumed by journey.js (browser only) ----------

function pairsPlusSingle(pairs) {
  const pool = distinct(pairs + 1);
  return shuffled([pool[0], ...pool.slice(1).flatMap((v) => [v, v])]);
}

const PAGE = {
  presets: {
    random: { make: () => ({ nums: pairsPlusSingle(randInt(3, 5)) }) },
    single: {
      make: () => ({ nums: [randInt(1, 99)] }),
      info: "Best case for everything: loops barely run. n = 1 is the edge every solution must survive.",
    },
    max: {
      make: () => {
        const pool = distinct(5).sort((a, b) => a - b);
        return { nums: shuffled([pool[4], ...pool.slice(0, 4).flatMap((v) => [v, v])]) };
      },
      info: "The single is the largest value — Sort & Scan's pair loop matches everything and its fallback line (return sorted[n-1]) finally fires.",
    },
    big: {
      make: () => ({ nums: pairsPlusSingle(12) }),
      info: "n = 25. Same code — but look at the chart: brute force's bar explodes while the others barely move. That gap IS O(n²) vs O(n).",
    },
    twosingles: {
      make: () => {
        const pool = distinct(5);
        return { nums: shuffled([pool[0], pool[1], ...pool.slice(2).flatMap((v) => [v, v])]) };
      },
    },
    triple: {
      make: () => {
        const pool = distinct(4);
        return { nums: shuffled([pool[0], pool[1], pool[1], pool[2], pool[2], pool[2]]) };
      },
    },
  },
  classify: (d) => classifyInput(d.nums),
  describe: (d) => d.nums.join(", "),
  parseCustom: (text) => {
    const nums = text
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number)
      .filter((v) => Number.isInteger(v) && v >= 0 && v < 128);
    return nums.length ? { nums } : null;
  },
};

// ---------- schema v2: one aggregate object per content file ----------
// validate with: node problems/validate.js

const PROBLEM = {
  slug: "single-number",
  title: "Single Number",
  approaches: APPROACHES,
  actOrder: ACT_ORDER,
  resources: RESOURCES,
  page: PAGE,
  challenge: null,
  sample: { nums: [2, 2, 3] },
};
