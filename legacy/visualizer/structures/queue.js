// Queue explorer — journey content: the NEED (a fair printer), the mechanics
// (FIFO enqueue/dequeue), then the application (round-robin scheduling).
// Data is an array of job durations; every act reads the same input.
// DOM-free at load; playback lives in ../problems/journey.js.

function* runStory(nums) {
  yield { hold: 3, noChips: true, note: "Five people send documents to one office printer. Whoever sent FIRST should print first — anything else starts a fistfight. The structure that remembers arrivals must give back the OLDEST thing it holds." };
  yield { hold: 3, noChips: true, note: "That's FIFO — first in, first out. A queue is an array with the opposite promise from a stack: add at one end, remove from the OTHER. Fairness, encoded." };
  yield { hold: 3, note: `Here are ${nums.length} print jobs, sized in pages, in arrival order. Watch fairness happen mechanically.` };
}

function* runOps(nums) {
  const q = [];
  for (let i = 0; i < nums.length; i++) {
    q.push(nums[i]);
    yield { line: 1, i, q: q.slice(), note: `enqueue job of ${nums[i]} page${nums[i] === 1 ? "" : "s"} — it joins the BACK of the line` };
  }
  yield { hold: 2, line: 2, i: nums.length - 1, q: q.slice(), note: `front of the line: the ${q[0]}-page job — the FIRST one that arrived. Nobody jumps the queue.` };
  while (q.length) {
    const j = q.shift();
    yield { line: 3, q: q.slice(), served: nums.length - q.length - 1, note: `dequeue → the ${j}-page job prints. Everyone else moves up one place.` };
  }
  yield { hold: 2, line: 4, q: [], note: "line empty. In n, out n, SAME order — a queue preserves arrival order like a stack reverses it." };
}

function* runRoundRobin(nums) {
  // quantum-1 round robin: every job gets one tick, then goes to the back
  const q = nums.map((n, i) => ({ i, left: n }));
  let tick = 0;
  yield { hold: 2, line: 0, q: q.map((j) => j.left), busy: null, remaining: nums.slice(), note: "sharper need: jobs shouldn't hog the printer. Round-robin: serve ONE page, requeue if unfinished. The queue makes preemption fair automatically." };
  const remaining = nums.slice();
  while (q.length) {
    const job = q.shift();
    job.left--;
    tick++;
    remaining[job.i] = job.left;
    if (job.left > 0) {
      q.push(job);
      yield { line: 3, q: q.map((j) => j.left), busy: job.i, remaining: remaining.slice(), note: `tick ${tick}: one page of job #${job.i} — ${job.left} left, back of the line it goes` };
    } else {
      yield { line: 5, q: q.map((j) => j.left), busy: job.i, doneJob: job.i, remaining: remaining.slice(), note: `tick ${tick}: job #${job.i} finishes and leaves the line 🎉` };
    }
  }
  yield { hold: 3, line: 6, q: [], remaining: remaining.slice(), answer: nums.map((_, k) => k), note: `all done in ${tick} ticks (= total pages — no printer time wasted). No job ever waited more than one full rotation. That fairness is the queue, not the scheduler's cleverness.` };
}

const ACT_ORDER = ["story", "ops", "app"];

const RESOURCES = [
  { label: "GeeksforGeeks: queue", url: "https://www.geeksforgeeks.org/dsa/queue-data-structure/" },
  { label: "Round-robin scheduling", url: "https://en.wikipedia.org/wiki/Round-robin_scheduling" },
];

function queuePanel(q, label = "the queue (left end = front)") {
  return (
    `<div class="panel-label">${label}</div>` +
    `<div class="chip-row">${
      q.length ? chipRow(q, { anchor: new Set([0]) }) : `<span class="map-chip">empty</span>`
    }</div>`
  );
}

const APPROACHES = {
  story: {
    name: "The Need",
    short: "start here",
    complexity: "no code yet — just the promise",
    insight: "",
    idea: "Before the name 'queue': feel the need. Printers, web servers, BFS frontiers, message brokers — all must serve requests in ARRIVAL order or chaos follows. One array + one promise (in at the back, out at the front) encodes fairness.",
    pseudocode: [
      "need: give back the OLDEST thing",
      "structure: an array, in at back, out at front",
      "enqueue(x): join the back  # O(1)",
      "dequeue(): serve the front # O(1)*",
    ],
    python: null,
    takeaways: [
      "queue = fairness made mechanical: FIFO, first in, first out",
      "stack and queue differ by ONE decision: which end things leave from",
      "*array.shift() is O(n); real queues use a deque or ring buffer — same promise, honest O(1)",
    ],
    run: runStory,
    render(f, els, data) {
      if (f.noChips) {
        els.array.innerHTML = "";
        els.panel.innerHTML = `<div class="story-scene">🖨️ → 🧑‍🤝‍🧑 → ❓</div>`;
        return;
      }
      els.array.innerHTML = chipRow(data.nums);
      els.panel.innerHTML = "";
    },
  },

  ops: {
    name: "Enqueue & Dequeue",
    short: "the mechanics",
    complexity: "enqueue O(1) · dequeue O(1) with a deque",
    insight: "In at the back, out at the front — arrival order survives.",
    idea: "The same stream that a stack would reverse comes out of a queue UNCHANGED. Watch the front marker: it only ever serves the oldest job. That single difference from a stack — which end you remove from — flips reversal into preservation.",
    pseudocode: [
      "queue = []",
      "enqueue(x): queue.append(x)",
      "front(): queue[0]",
      "dequeue(): queue.remove_first()",
      "empty when len == 0",
    ],
    python: [
      "from collections import deque; q = deque()",
      "q.append(x)",
      "front = q[0]",
      "x = q.popleft()",
      "done = len(q) == 0",
    ],
    takeaways: [
      "enqueue all then dequeue all = the sequence comes back in the SAME order",
      "the front never waits on anyone behind it — that's the fairness guarantee",
      "one design decision (exit end) separates queue from stack entirely",
    ],
    run: runOps,
    render(f, els, data) {
      const dim = new Set();
      const focus = new Set();
      if (f.i !== undefined) {
        for (let k = 0; k < f.i; k++) dim.add(k);
        focus.add(f.i);
      }
      if (f.served !== undefined) for (let k = 0; k <= f.served; k++) dim.add(k);
      els.array.innerHTML = chipRow(data.nums, { dim, focus });
      els.panel.innerHTML = queuePanel(f.q || []);
    },
  },

  app: {
    name: "Round-Robin",
    short: "use it",
    complexity: "O(total work) — every tick serves a real page",
    insight: "Serve one unit, requeue the rest — the queue turns hogging into taking turns.",
    idea: "A 9-page job shouldn't freeze a 1-page job behind it. Round-robin: the front job gets ONE page of printer time; unfinished jobs rejoin the back. The queue does the scheduling — no priorities, no bookkeeping, and the short jobs escape early. This exact shape runs your CPU's process scheduler.",
    pseudocode: [
      "q = all jobs, arrival order",
      "while q not empty:",
      "  job = dequeue()",
      "  job.work -= 1   # one quantum",
      "  if job.work > 0: enqueue(job)",
      "  else: job leaves 🎉",
      "no job waits more than one rotation",
    ],
    python: [
      "q = deque(jobs)",
      "while q:",
      "    job = q.popleft()",
      "    job.work -= 1",
      "    if job.work > 0: q.append(job)",
      "    else: pass  # finished",
      "# fairness: bounded wait per rotation",
    ],
    takeaways: [
      "round-robin = dequeue, serve one unit, requeue — the queue IS the scheduler",
      "short jobs escape early with zero prioritization logic; fairness produces smartness",
      "your OS runs this exact loop over processes; BFS runs it over graph nodes",
    ],
    quiz: [
      {
        q: "Why does the 1-page job finish long before the 9-page job that arrived first?",
        choices: [
          "the queue sorts by size",
          "each rotation gives every job one page — small jobs simply run out of pages sooner",
          "big jobs are deprioritized",
        ],
        answer: 1,
        explain: "Nothing is sorted or prioritized. Equal turns + unequal sizes = short jobs escape early. Fairness produces the 'smart' behavior for free.",
      },
    ],
    run: runRoundRobin,
    render(f, els, data) {
      const focus = new Set(f.busy !== undefined && f.busy !== null ? [f.busy] : []);
      const answer = new Set(f.answer || []);
      const dim = new Set((f.remaining || []).map((left, k) => (left === 0 ? k : -1)).filter((k) => k >= 0 && !answer.has(k)));
      els.array.innerHTML = chipRow(f.remaining || data.nums, { focus, dim, answer });
      els.panel.innerHTML = queuePanel(f.q || [], "pages left, in line order (front serves next)");
    },
  },
};

// ---------- page config ----------

const PAGE = {
  presets: {
    random: { make: () => ({ nums: Array.from({ length: randInt(4, 6) }, () => randInt(1, 6)) }) },
    hog: {
      make: () => ({ nums: [9, 1, 1, 2] }),
      info: "The hog: a 9-page job arrived first. FIFO alone would starve the tiny jobs — watch round-robin free them.",
    },
    equal: {
      make: () => ({ nums: [3, 3, 3] }),
      info: "Equal jobs: round-robin finishes them in arrival order — with equal sizes, FIFO and round-robin agree.",
    },
  },
  classify: (d) =>
    d.nums.every((n) => Number.isInteger(n) && n >= 1 && n <= 20)
      ? { ok: true }
      : { ok: false, warning: "Job sizes should be 1–20 pages — zero-page jobs don't print and 500-page jobs get you fired." },
  describe: (d) => d.nums.join(", "),
  parseCustom: (text) => {
    const nums = text
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number)
      .filter((v) => Number.isInteger(v) && v >= 1 && v <= 20);
    return nums.length ? { nums } : null;
  },
};

// ---------- schema v2 ----------

const PROBLEM = {
  slug: "queue",
  title: "Queue",
  kind: "structure",
  approaches: APPROACHES,
  actOrder: ACT_ORDER,
  resources: RESOURCES,
  page: PAGE,
  challenge: null,
  sample: { nums: [3, 1, 2] },
};
