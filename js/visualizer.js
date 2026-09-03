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
    this.build();
  }

  setTarget(t) {
    this.target = t;
    this.build();
  }

  // Drain the generator into frames. Searches run on a sorted copy —
  // binary search's precondition, and the sorted bars make that visible.
  build() {
    this.stop();
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
