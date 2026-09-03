// Two Pointers — pattern page content: the *shape* itself, problem-agnostic.
// Acts: shape (why order enables elimination) → converge (opposite ends) →
// chase (same-direction slow/fast). DOM-free at load so node can eval it.
// Playback/wiring lives in ../problems/journey.js (shared), which provides
// chipRow/randInt/shuffled/distinct.

// ---------- generators ----------

function* runShape(nums, target) {
  const n = nums.length;
  yield { hold: 3, note: `A sorted line of ${n} values. Sorting cost something — what did it buy? In an unsorted pile, one comparison tells you about ONE pair. In a sorted line, one comparison tells you about MANY.` };
  yield { hold: 3, L: 0, R: n - 1, note: `Probe the two ends: ${nums[0]} + ${nums[n - 1]}. If that sum is too small, ${nums[0]} is too small with its BEST possible partner — so it's too small with every partner. One probe eliminates a whole position.` };
  yield { hold: 3, L: 1, R: n - 1, dimmed: [0], note: `Discard it and never look back. Every probe kills a position from one end — n positions, n probes, linear time. That elimination step is the entire pattern.` };
  yield { hold: 3, L: 1, R: n - 1, dimmed: [0], note: `Two pointers = "order lets one comparison discard many candidates". Two classic shapes follow: pointers converging from opposite ends, and a slow/fast pair chasing in the same direction.` };
}

function* runConverge(nums, target) {
  let L = 0, R = nums.length - 1;
  yield { hold: 2, line: 0, L, R, note: "a pointer at each end of the sorted line" };
  while (L < R) {
    const sum = nums[L] + nums[R];
    yield { line: 2, L, R, sum, note: `${nums[L]} + ${nums[R]} = ${sum}` };
    if (sum === target) {
      yield { hold: 2, line: 3, L, R, sum, answer: [L, R], note: `hit — positions ${L} and ${R}. Found without trying every pair.` };
      return;
    }
    if (sum < target) {
      L++;
      yield { line: 4, L, R, note: `${sum} < ${target} — the left value can't work with anyone (its best partner just failed), left pointer moves in` };
    } else {
      R--;
      yield { line: 4, L, R, note: `${sum} > ${target} — the right value overshoots with everyone, right pointer moves in` };
    }
  }
  yield { hold: 2, line: 5, L, R, note: "pointers met — no pair sums to the target, proven in one linear squeeze" };
}

function* runChase(nums) {
  if (!nums.length) {
    yield { hold: 2, line: 5, note: "empty input — nothing to keep" };
    return;
  }
  let s = 0;
  yield { hold: 2, line: 0, s, f: 0, row: nums.slice(), note: "same direction now: SLOW marks the end of the kept region, FAST scouts ahead for the next new value" };
  for (let f = 1; f < nums.length; f++) {
    const dup = nums[f] === nums[s];
    yield { line: 2, s, f, row: nums.slice(), note: `fast sees ${nums[f]} — ${dup ? `same as ${nums[s]}, a duplicate: fast walks on, slow stays` : `new! slow steps forward and keeps it`}` };
    if (!dup) {
      s++;
      if (s !== f) nums[s] = nums[f];
      yield { line: 3, s, f, row: nums.slice(), note: `kept region grows to ${s + 1} value${s ? "s" : ""}` };
    }
  }
  yield { hold: 2, line: 5, s, row: nums.slice(), answer: Array.from({ length: s + 1 }, (_, i) => i), note: `done in one pass: the first ${s + 1} slots hold the unique values. Slow only ever advances — that's why it's linear.` };
}

// ---------- the acts ----------

const ACT_ORDER = ["shape", "converge", "chase", "build"];

// ---------- capstone (CodeCrafters model): BUILD the scan you just watched ----------

const CHALLENGE = {
  fname: "pairInSorted",
  signature: "function pairInSorted(nums, target) {   // nums is SORTED",
  starter: "// return indices of ANY pair summing to target, or [] if none\nlet L = 0, R = nums.length - 1;\n\n",
  cases: [
    { nums: [1, 3, 4, 6, 9], target: 10, expected: [0, 4], anyPair: true },
    { nums: [2, 5, 8, 11], target: 19, expected: [2, 3], anyPair: true, tag: "answer inside" },
    { nums: [1, 2, 3, 4], target: 3, expected: [0, 1], anyPair: true, tag: "smallest pair" },
    { nums: [2, 2, 5, 9], target: 4, expected: [0, 1], anyPair: true, tag: "equal values" },
    { nums: [1, 2, 4, 8], target: 100, expected: [], tag: "no pair — prove absence" },
  ],
  // reference: the converge scan itself, measured with the same touch counter
  reference:
    "let L = 0, R = nums.length - 1;\n" +
    "while (L < R) {\n" +
    "  const s = nums[L] + nums[R];\n" +
    "  if (s === target) return [L, R];\n" +
    "  if (s < target) L++; else R--;\n" +
    "}\nreturn [];",
};

const RESOURCES = [
  { label: "Two Sum (apply this pattern)", url: "../problems/two-sum.html" },
  { label: "LeetCode 167: Two Sum II (sorted)", url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/" },
  { label: "LeetCode 26: Remove Duplicates", url: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/" },
];

function sumEq(a, b, sum, target) {
  const ok = sum === target;
  return `<div class="sum-eq">${a} + ${b} = <b class="${ok ? "hit" : "miss"}">${sum}</b><span class="target-note">target ${target}</span></div>`;
}

const APPROACHES = {
  shape: {
    name: "The Shape",
    short: "start here",
    complexity: "no code yet — just the idea",
    insight: "",
    idea: "This page teaches a PATTERN, not a problem. Two pointers is what sorted order buys you: one comparison can eliminate a whole position, so a quadratic \"try every pair\" collapses into a linear walk. Feel the elimination step here; the two classic shapes follow.",
    pseudocode: [
      "given: values in sorted order",
      "observation: comparing an END tells you",
      "  about every pair that end belongs to",
      "so: each probe discards a position",
      "n positions → n probes → linear",
    ],
    python: null,
    takeaways: [
      "the pattern is the elimination step — order makes one comparison speak for many pairs",
      "if the input isn't sorted, sorting first is the admission price: O(n log n)",
      "quadratic pair-checking collapsing to a linear walk is the tell that two pointers applies",
    ],
    run: runShape,
    render(f, els, data) {
      const anchor = new Set(f.L !== undefined ? [f.L] : []);
      const focus = new Set(f.R !== undefined ? [f.R] : []);
      const dim = new Set(f.dimmed || []);
      els.array.innerHTML = chipRow(data.nums, { anchor, focus, dim });
      els.panel.innerHTML = "";
    },
  },

  converge: {
    name: "Converge",
    short: "opposite ends",
    complexity: "O(n) time · O(1) space (after sorting)",
    insight: "Start at both ends and squeeze — the sum can only be fixed by moving one specific pointer.",
    idea: "A pointer at each end. Sum too small → only the LEFT moving right can raise it; too big → only the RIGHT moving left can lower it. There is never a choice, and each move permanently retires a position. Use it when the answer is about a PAIR and the input is (or can be) sorted: pair sums, containers, palindromes.",
    pseudocode: [
      "L = 0, R = n-1",
      "while L < R:",
      "  s = nums[L] + nums[R]",
      "  if s == target: return [L, R]",
      "  s < target ? L += 1 : R -= 1",
      "no pair",
    ],
    python: [
      "L, R = 0, len(nums) - 1",
      "while L < R:",
      "    s = nums[L] + nums[R]",
      "    if s == target: return [L, R]",
      "    L, R = (L + 1, R) if s < target else (L, R - 1)",
      "return []",
    ],
    takeaways: [
      "converging pointers fit answers about a pair/range in sorted data",
      "the move is forced — that's why nothing gets skipped",
      "each iteration retires one position: at most n iterations, guaranteed",
    ],
    run: runConverge,
    render(f, els, data) {
      const nums = data.nums;
      const answer = new Set(f.answer || []);
      const dim = new Set();
      nums.forEach((_, k) => {
        if (f.L !== undefined && (k < f.L || k > f.R) && !answer.has(k)) dim.add(k);
      });
      const anchor = new Set(f.L !== undefined && !f.answer ? [f.L] : []);
      const focus = new Set(f.R !== undefined && !f.answer ? [f.R] : []);
      els.array.innerHTML = chipRow(nums, { anchor, focus, dim, answer });
      els.panel.innerHTML = f.sum !== undefined ? sumEq(nums[f.L], nums[f.R], f.sum, data.target) : "";
    },
  },

  chase: {
    name: "Chase",
    short: "slow / fast",
    complexity: "O(n) time · O(1) space",
    insight: "Both pointers can run the SAME direction — one marks kept work, one scouts ahead.",
    idea: "Slow marks the boundary of the finished region; fast scans every element once. Fast only moves forward, slow only moves forward — so the whole thing is one pass with no extra array. The demo removes duplicates in place; the same shape powers \"move zeroes\", linked-list cycle detection, and every in-place filter.",
    pseudocode: [
      "s = 0            # end of kept region",
      "for f in 1..n-1:",
      "  if nums[f] != nums[s]:",
      "    s += 1; nums[s] = nums[f]",
      "",
      "first s+1 slots are the answer",
    ],
    python: [
      "s = 0",
      "for f in range(1, len(nums)):",
      "    if nums[f] != nums[s]:",
      "        s += 1; nums[s] = nums[f]",
      "",
      "return s + 1",
    ],
    takeaways: [
      "same-direction pointers split the array into finished | unknown — slow guards the boundary",
      "both pointers only advance: n steps total, in place, no second array",
      "spot it when a filter/compaction must happen without extra memory",
    ],
    run: runChase,
    render(f, els, data) {
      // chase mutates its copy, so every frame carries its own row snapshot
      const nums = f.row || data.nums;
      const answer = new Set(f.answer || []);
      const anchor = new Set(f.s !== undefined && !f.answer ? [f.s] : []);
      const focus = new Set(f.f !== undefined && !f.answer ? [f.f] : []);
      const dim = new Set();
      if (f.answer) nums.forEach((_, k) => { if (!answer.has(k)) dim.add(k); });
      els.array.innerHTML = chipRow(nums, { anchor, focus, dim, answer });
      els.panel.innerHTML = "";
    },
  },

  build: {
    name: "Build It",
    short: "capstone",
    complexity: "your turn — implement the converge scan",
    insight: "Using a structure teaches; implementing it cements.",
    idea: "Write <b>pairInSorted(nums, target)</b> in the editor: the squeeze you just watched, from memory. Return ANY pair of indices summing to the target, or [] when none exists. The no-pair case is the real test — your loop must PROVE absence, not just fail to find. 👁 trace it to watch your own pointers walk.",
    pseudocode: [
      "L = 0, R = n-1",
      "while L < R:",
      "  s = nums[L] + nums[R]",
      "  if s == target: return [L, R]",
      "  s < target ? L += 1 : R -= 1",
      "no pair: return []",
    ],
    python: null,
    takeaways: [
      "the empty-array return is load-bearing: pointers meeting IS the proof of absence",
      "compare your touch count to the reference — a matching shape reads the array identically",
      "if you wrote a nested loop instead, it still passes; the scorecard will tattle",
    ],
    gate: "pass",
    chart: false,
    hints: [
      "One pointer at each end. What single fact decides which one moves?",
      "Sum too small → only L moving right can raise it. Too big → only R moving left can lower it. No other move is ever useful.",
      "Skeleton: <b>while (L < R)</b> → compute s → hit? return [L, R] → <b>s < target ? L++ : R--</b> → after the loop, return [].",
    ],
    nextLabel: "Built it ▸",
    run: function* (nums, target) {
      if (!lastTrace) {
        yield { hold: 2, line: -1, note: "implement the scan in the editor below — then 👁 trace it and watch YOUR pointers squeeze" };
        return;
      }
      const { events, result, error } = lastTrace;
      if (!events.length) {
        yield { hold: 2, note: "your code never touched nums 🤨" };
      }
      for (let n = 0; n < events.length; n++) {
        const e = events[n];
        yield { i: e.i, op: e.op, note: `access #${n + 1}: your code ${e.op === "get" ? `read nums[${e.i}] (${e.v})` : `wrote nums[${e.i}] = ${e.v}`}` };
      }
      if (error) {
        yield { hold: 2, note: `then it threw: ${error}` };
      } else {
        const ok = Array.isArray(result) && result.length === 2 && nums[result[0]] + nums[result[1]] === target;
        const none = Array.isArray(result) && result.length === 0;
        yield {
          hold: 3,
          answer: ok ? [...result].sort((a, b) => a - b) : undefined,
          note: ok
            ? `returned [${result}] — a valid pair, found in ${events.length} touches.`
            : none
              ? `returned [] after ${events.length} touches — if no pair exists on this input, that's the proof done right.`
              : `returned ${JSON.stringify(result)} — not a valid pair for target ${target}.`,
        };
      }
    },
    render(f, els, data) {
      const focus = new Set(f.op === "get" ? [f.i] : []);
      const anchor = new Set(f.op === "set" ? [f.i] : []);
      const answer = new Set(f.answer || []);
      els.array.innerHTML = chipRow(data.nums, { focus, anchor, answer });
      renderChallengeUI(els.panel);
    },
  },
};

// ---------- page config consumed by journey.js (browser only) ----------

function makePattern(withDups) {
  const nums = withDups
    ? shuffled(distinct(6, 1, 40)).flatMap((v) => (randInt(0, 1) ? [v, v] : [v])).slice(0, 8)
    : distinct(8, 1, 40);
  nums.sort((a, b) => a - b);
  const i = randInt(0, nums.length - 2);
  const j = randInt(i + 1, nums.length - 1);
  return { nums, target: nums[i] + nums[j] };
}

const PAGE = {
  presets: {
    random: { make: () => makePattern(false) },
    dups: {
      make: () => makePattern(true),
      info: "Duplicates in the line — Converge still works, and Chase finally has something to remove.",
    },
    nopair: {
      make: () => {
        const d = makePattern(false);
        d.target = 999;
        return d;
      },
      info: "No pair reaches 999 — watch Converge PROVE absence in one squeeze instead of trying every pair.",
    },
  },
  classify: () => ({ ok: true }),
  describe: (d) => d.nums.join(", "),
  runArgs: (d) => [d.target],
  parseCustom: (text) => {
    const nums = text
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number)
      .filter((v) => Number.isInteger(v) && v >= 0 && v <= 999)
      .sort((a, b) => a - b);
    const target = Number(document.getElementById("target-input").value);
    return nums.length >= 2 && Number.isInteger(target) ? { nums, target } : null;
  },
  onData: (d) => {
    document.getElementById("target-input").value = d.target;
    document.getElementById("databar").innerHTML = `sorted input · target = <b>${d.target}</b>`;
  },
};

// ---------- schema v2: one aggregate object per content file ----------
// validate with: node problems/validate.js

const PROBLEM = {
  slug: "two-pointers",
  title: "Pattern: Two Pointers",
  kind: "pattern",
  approaches: APPROACHES,
  actOrder: ACT_ORDER,
  resources: RESOURCES,
  page: PAGE,
  challenge: CHALLENGE,
  sample: { nums: [1, 3, 6, 9], target: 10 },
};
