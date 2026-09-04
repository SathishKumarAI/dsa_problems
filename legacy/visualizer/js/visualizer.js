// Rendering + playback engine. Owns the bars DOM, stats, pseudocode highlight,
// timeline scrubber. Does not know algorithm internals — consumes step objects
// from ALGORITHMS.
//
// Playback model: on every array/algorithm/target change the whole generator is
// drained up front into `frames` (one snapshot per step). Play/step/scrub are
// just moves along that array, which is what makes step-back and the timeline
// slider trivial.
// ponytail: full snapshots per frame, ~500KB worst case at size 60 — switch to
// diffs if sizes ever grow past a few hundred.

class Visualizer {
  constructor() {
    this.barsEl = document.getElementById("bars");
    this.codeEl = document.getElementById("pseudocode");
    this.explainEl = document.getElementById("explain");
    this.statCmp = document.getElementById("stat-comparisons");
    this.statSwp = document.getElementById("stat-swaps");
    this.statStep = document.getElementById("stat-step");
    this.statTotal = document.getElementById("stat-total");
    this.complexityEl = document.getElementById("complexity");
    this.scrubEl = document.getElementById("scrub");
    this.array = [];
    this.target = null;
    this.frames = [];
    this.pos = 0;
    this.timer = null;
    this.delay = 200;
    this.onFinish = null;

    this.scrubEl.oninput = () => {
      this.stop();
      this.show(Number(this.scrubEl.value));
    };
  }

  setArray(values) {
    this.array = values.slice();
    this.build();
  }

  setAlgorithm(algo) {
    this.algo = algo;
    this.codeEl.innerHTML = algo.pseudocode
      .map((l) => `<span class="line">${l}</span>`)
      .join("");
    this.complexityEl.textContent = algo.complexity;
    // stat labels follow the kind: graphs count visits/relaxations, not swaps
    const cmpLabel = document.getElementById("stat-cmp-label");
    const swpLabel = document.getElementById("stat-swp-label");
    if (cmpLabel) {
      cmpLabel.textContent = algo.kind === "graph" ? "visited:" : "comparisons:";
      swpLabel.textContent = algo.kind === "graph" ? "relaxations:" : "swaps:";
    }
    this.build();
  }

  setTarget(t) {
    this.target = t;
    this.build();
  }

  newGraph() {
    this.graph = makeGraph(9);
    this.build();
  }

  // Graph frames: visited/frontier sets, the edge being examined, dist labels.
  // Same drained-timeline model as bars — only the snapshot shape differs.
  buildGraph() {
    if (!this.graph) this.graph = makeGraph(9);
    const visited = new Set(), frontier = new Set();
    let visits = 0, relaxes = 0, dist = null, current = null;
    const frames = [{ visited: new Set(), frontier: new Set(), current, activeEdge: null, dist, line: -1, note: "", cmp: 0, swp: 0 }];
    for (const s of this.algo.run(this.graph)) {
      if (s.type === "visit") {
        visits++;
        frontier.delete(s.node);
        visited.add(s.node);
        current = s.node;
      } else if (s.type === "frontier") {
        frontier.add(s.node);
      } else if (s.type === "relax") {
        relaxes++;
      }
      if (s.dist) dist = s.dist;
      frames.push({
        visited: new Set(visited),
        frontier: new Set(frontier),
        current,
        activeEdge: s.edge || null,
        dist,
        line: s.line,
        note: s.note || "",
        cmp: visits,
        swp: relaxes,
      });
    }
    this.frames = frames;
    this.scrubEl.max = frames.length - 1;
    this.statTotal.textContent = frames.length - 1;
    this.show(0);
  }

  renderGraph(f) {
    const g = this.graph;
    const weighted = !!this.algo.weighted;
    const edges = g.edges
      .map(([u, v, w]) => {
        const a = g.nodes[u], b = g.nodes[v];
        const active =
          f.activeEdge &&
          ((f.activeEdge[0] === u && f.activeEdge[1] === v) || (f.activeEdge[0] === v && f.activeEdge[1] === u));
        return (
          `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="gedge${active ? " active" : ""}"></line>` +
          (weighted ? `<text x="${(a.x + b.x) / 2}" y="${(a.y + b.y) / 2}" class="gweight">${w}</text>` : "")
        );
      })
      .join("");
    const nodes = g.nodes
      .map((p, i) => {
        let cls = "gnode";
        if (f.visited.has(i)) cls += " visited";
        else if (f.frontier.has(i)) cls += " frontier";
        if (f.current === i && f.visited.has(i)) cls += " current";
        const d = f.dist ? (f.dist[i] === Infinity ? "∞" : f.dist[i]) : "";
        return (
          `<circle cx="${p.x}" cy="${p.y}" r="5" class="${cls}"></circle>` +
          `<text x="${p.x}" y="${p.y}" class="glabel">${i}</text>` +
          (f.dist ? `<text x="${p.x}" y="${p.y - 6.5}" class="gdist">${d}</text>` : "")
        );
      })
      .join("");
    this.barsEl.innerHTML = `<svg id="graph" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">${edges}${nodes}</svg>`;
  }

  // Drain the generator into frames. Searches run on a sorted copy —
  // binary search's precondition, and the sorted bars make that visible.
  build() {
    this.stop();
    if (this.algo && this.algo.kind === "graph") return this.buildGraph();
    const a = this.algo.kind === "search"
      ? this.array.slice().sort((x, y) => x - y)
      : this.array.slice();
    const sorted = new Set(), discard = new Set();
    let cmp = 0, swp = 0;
    const frames = [{ arr: a.slice(), marks: {}, sorted: new Set(), discard: new Set(), line: -1, note: "", cmp, swp }];
    for (const s of this.algo.run(a, this.target)) {
      const marks = {};
      if (s.type === "compare") {
        cmp++;
        s.indices.forEach((i) => (marks[i] = "compare"));
      } else if (s.type === "swap") {
        swp++;
        s.indices.forEach((i) => (marks[i] = "swap"));
      } else if (s.type === "set") {
        s.indices.forEach((i) => (marks[i] = "swap"));
      } else if (s.type === "pivot") {
        s.indices.forEach((i) => (marks[i] = "pivot"));
      } else if (s.type === "sorted") {
        s.indices.forEach((i) => sorted.add(i));
      } else if (s.type === "discard") {
        s.indices.forEach((i) => discard.add(i));
      }
      frames.push({ arr: a.slice(), marks, sorted: new Set(sorted), discard: new Set(discard), line: s.line, note: s.note || "", cmp, swp });
    }
    this.frames = frames;
    this.scrubEl.max = frames.length - 1;
    this.statTotal.textContent = frames.length - 1;
    this.show(0);
  }

  show(i) {
    this.pos = Math.max(0, Math.min(i, this.frames.length - 1));
    const f = this.frames[this.pos];
    if (this.algo && this.algo.kind === "graph") {
      this.renderGraph(f);
      this.codeEl.querySelectorAll(".line").forEach((el, k) => el.classList.toggle("active", k === f.line));
      this.explainEl.textContent = this.atEnd && !f.note ? "Done." : f.note;
      this.statCmp.textContent = f.cmp;
      this.statSwp.textContent = f.swp;
      this.statStep.textContent = this.pos;
      this.scrubEl.value = this.pos;
      return;
    }
    const max = Math.max(...f.arr, 1);
    this.barsEl.innerHTML = f.arr
      .map((v, k) => {
        let cls = "bar";
        if (f.sorted.has(k)) cls += " sorted";
        if (f.discard.has(k)) cls += " discard";
        if (f.marks[k]) cls += " " + f.marks[k];
        const label = f.arr.length <= 40 ? `<span>${v}</span>` : "";
        return `<div class="${cls}" style="height:${(v / max) * 92}%">${label}</div>`;
      })
      .join("");
    this.codeEl.querySelectorAll(".line").forEach((el, k) =>
      el.classList.toggle("active", k === f.line)
    );
    this.explainEl.textContent = this.atEnd && !f.note ? "Done." : f.note;
    this.statCmp.textContent = f.cmp;
    this.statSwp.textContent = f.swp;
    this.statStep.textContent = this.pos;
    this.scrubEl.value = this.pos;
  }

  get atEnd() {
    return this.pos >= this.frames.length - 1;
  }

  step() {
    if (this.atEnd) return false;
    this.show(this.pos + 1);
    return !this.atEnd;
  }

  stepBack() {
    this.show(this.pos - 1);
  }

  play() {
    if (this.timer) return;
    if (this.atEnd) this.show(0); // replay from start
    const tick = () => {
      if (this.step()) this.timer = setTimeout(tick, this.delay);
      else {
        this.timer = null;
        if (this.onFinish) this.onFinish();
      }
    };
    tick();
  }

  stop() {
    clearTimeout(this.timer);
    this.timer = null;
  }

  get playing() {
    return this.timer !== null;
  }

  reset() {
    this.stop();
    this.show(0);
  }

  setSpeed(v) {
    // slider 1..100 -> delay 800ms..5ms, log-ish feel
    this.delay = Math.round(800 / (1 + v * 0.6));
  }
}
