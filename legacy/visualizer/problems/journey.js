// Shared playback engine + wiring for problem journey pages.
// A page loads its content file FIRST, defining these globals, then this file:
//   APPROACHES  — { key: { name, short, complexity, insight, idea, pseudocode,
//                          python|null, takeaways, run*(nums, ...args), render(f, els, data) } }
//   ACT_ORDER   — act keys in learning order (first one is the story act)
//   RESOURCES   — [{ label, url }]
//   PAGE        — { presets: { key: { make(): data, info? } },
//                   classify(data) -> { ok, warning? },
//                   describe(data) -> custom-input text,
//                   parseCustom(text) -> data | null,
//                   runArgs?(data) -> extra args for run() after nums,
//                   onData?(data) — page hook (e.g. render a target badge) }
// data is { nums, ...page extras }. Generators/helpers here are DOM-free so
// node can eval content files without this one.

function randInt(lo, hi) {
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

function shuffled(nums) {
  for (let i = nums.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  return nums;
}

function distinct(count, lo = 1, hi = 99) {
  const pool = [];
  while (pool.length < count) {
    const v = randInt(lo, hi);
    if (!pool.includes(v)) pool.push(v);
  }
  return pool;
}

function chipRow(values, { focus = new Set(), anchor = new Set(), dim = new Set(), answer = new Set(), subs = null } = {}) {
  return values
    .map((v, i) => {
      let cls = "chip";
      if (dim.has(i)) cls += " done";
      if (anchor.has(i)) cls += " anchor";
      if (focus.has(i)) cls += " focus";
      if (answer.has(i)) cls += " answer";
      const sub = subs ? `<span class="oi">${subs[i]}</span>` : "";
      // data-k identifies a chip across frames so re-renders can morph, not teleport
      const key = subs ? "s" + subs[i] : "i" + i;
      return `<div class="${cls}" data-k="${key}">${v}${sub}</div>`;
    })
    .join("");
}

// ---------- code-challenge harness (shared by problem + pattern pages) ----------
// Content defines CHALLENGE { fname, signature, starter, cases, reference?,
// hintsless? } and an act whose render calls renderChallengeUI(els.panel).
// DOM-lazy: definitions are safe under node; document is only touched when
// called. currentData/lastTrace are script-globals so content generators can
// replay the learner's trace ("your code is the animation").
let currentData = null;
let lastTrace = null;
let challengeAttempts = 0; // this page visit; adaptive difficulty reads it

const CHALLENGE_WORKER_SRC = `onmessage = (e) => {
  const { code, cases, mode, nums, target } = e.data;
  let fn;
  try { fn = new Function("nums", "target", code); }
  catch (err) { postMessage({ error: String(err.message) }); return; }
  if (mode === "trace") {
    const events = [];
    const arr = nums.slice();
    const proxied = new Proxy(arr, {
      get(t, p) { if (/^\\d+$/.test(p) && events.length < 400) events.push({ op: "get", i: +p, v: t[p] }); return t[p]; },
      set(t, p, v) { if (/^\\d+$/.test(p) && events.length < 400) events.push({ op: "set", i: +p, v }); t[p] = v; return true; },
    });
    let result = null, error = null;
    try { result = fn(proxied, target); } catch (err) { error = String(err.message); }
    postMessage({ trace: { events, result, error } });
    return;
  }
  // test mode counts array touches for the learner AND the reference —
  // step-efficiency is part of the scorecard, not just pass/fail
  const counter = (arr, bump) => new Proxy(arr, {
    get(t, p) { if (/^\\d+$/.test(p)) bump(); return t[p]; },
    set(t, p, v) { if (/^\\d+$/.test(p)) bump(); t[p] = v; return true; },
  });
  let refFn = null;
  try { refFn = new Function("nums", "target", e.data.reference || ""); } catch {}
  postMessage({ results: cases.map((c) => {
    let touches = 0, refTouches = 0;
    try {
      const got = fn(counter(c.nums.slice(), () => touches++), c.target);
      if (refFn) { try { refFn(counter(c.nums.slice(), () => refTouches++), c.target); } catch {} }
      const isPair = Array.isArray(got) && got.length === 2;
      const ok = c.expected.length === 0
        ? Array.isArray(got) && got.length === 0
        : c.anyPair
          ? isPair && got[0] !== got[1] && c.nums[got[0]] + c.nums[got[1]] === c.target
          : isPair && [...got].sort((a, b) => a - b).join() === c.expected.join();
      return { ok, got: JSON.stringify(got), touches, refTouches };
    } catch (err) { return { ok: false, got: String(err.message), touches, refTouches }; }
  }) });
};`;

function challengeWorker(msg, onMessage, verdict) {
  const w = new Worker(URL.createObjectURL(new Blob([CHALLENGE_WORKER_SRC], { type: "text/javascript" })));
  const timer = setTimeout(() => {
    w.terminate();
    verdict.textContent = "⏱ timed out — infinite loop?";
    verdict.className = "miss";
  }, 3000);
  w.onmessage = (e) => {
    clearTimeout(timer);
    w.terminate();
    onMessage(e.data);
  };
  w.postMessage(msg);
}

function renderChallengeUI(panel) {
  if (document.getElementById("challenge-box")) return;
  panel.innerHTML = `<div id="challenge-box">
    <div class="challenge-sig">${CHALLENGE.signature}</div>
    <textarea id="challenge-code" rows="9" spellcheck="false" aria-label="your solution">${CHALLENGE.starter}</textarea>
    <div class="challenge-sig">}</div>
    <div class="challenge-controls">
      <button id="challenge-run">▶ Run tests</button>
      <button id="challenge-trace">👁 Watch my code on this input</button>
      <span id="challenge-verdict"></span>
    </div>
    <div id="challenge-cases"></div>
  </div>`;
  document.getElementById("challenge-run").onclick = runChallenge;
  document.getElementById("challenge-trace").onclick = traceChallenge;
}

function traceChallenge() {
  const code = document.getElementById("challenge-code").value;
  const verdict = document.getElementById("challenge-verdict");
  verdict.textContent = "tracing…";
  verdict.className = "";
  challengeWorker(
    { mode: "trace", code, nums: currentData.nums, target: currentData.target },
    (data) => {
      if (data.error) {
        verdict.textContent = "syntax error: " + data.error;
        verdict.className = "miss";
        return;
      }
      lastTrace = data.trace;
      verdict.textContent = `traced ${data.trace.events.length} array accesses — press ▶ Play to watch YOUR code`;
      document.dispatchEvent(new CustomEvent("act-rebuild"));
    },
    verdict
  );
}

function runChallenge() {
  challengeAttempts++;
  const code = document.getElementById("challenge-code").value;
  const verdict = document.getElementById("challenge-verdict");
  const casesEl = document.getElementById("challenge-cases");
  verdict.textContent = "running…";
  // the learner's code runs in a Worker: main thread stays responsive and
  // eval-free; an infinite loop just gets its worker terminated
  challengeWorker({ code, cases: CHALLENGE.cases, reference: CHALLENGE.reference }, (data) => {
    if (data.error) {
      verdict.textContent = "syntax error: " + data.error;
      verdict.className = "miss";
      casesEl.innerHTML = "";
      return;
    }
    const results = data.results;
    casesEl.innerHTML = results
      .map((r, i) => {
        const c = CHALLENGE.cases[i];
        const want = c.expected.length === 0 ? "[]" : c.anyPair ? `any pair hitting ${c.target}` : `[${c.expected}]`;
        return `<div class="challenge-case ${r.ok ? "pass" : "fail"}">
          ${r.ok ? "✓" : "✗"} ${CHALLENGE.fname}([${c.nums}], ${c.target}) → ${r.got}${r.ok ? "" : ` <small>want ${want}</small>`}
        </div>`;
      })
      .join("");
    const passed = results.filter((r) => r.ok).length;
    if (passed === results.length) {
      verdict.textContent = `all ${passed} cases pass — you wrote it 🎉`;
      verdict.className = "hit";
      document.dispatchEvent(new CustomEvent("challenge-pass"));
    } else {
      verdict.textContent = `${passed}/${results.length} passing`;
      verdict.className = "miss";
    }
    renderScorecard(results, passed);
    if (passed === results.length) {
      renderSelfReview(code);
      offerBigSet();
    }
  }, verdict);
}

// dual test sets (Code Jam mechanic): small n passed — now the same code
// meets a big input, and the touch counter explodes on screen next to the
// reference's. Complexity felt, not asserted.
function offerBigSet() {
  if (!CHALLENGE.big || document.getElementById("challenge-big")) return;
  const box = document.createElement("div");
  box.id = "challenge-big";
  box.innerHTML = `<button id="big-run">⚡ Set 2: same code, n = ${CHALLENGE.big.n}</button><div id="big-result"></div>`;
  document.getElementById("challenge-cases").parentNode.appendChild(box);
  box.querySelector("#big-run").onclick = () => {
    // read the editor NOW — the learner may have rewritten since the offer
    const code = document.getElementById("challenge-code").value;
    const result = box.querySelector("#big-result");
    result.innerHTML = `<span class="panel-label">running ${CHALLENGE.big.n} elements…</span>`;
    const bigCase = CHALLENGE.big.make();
    challengeWorker(
      { code, cases: [bigCase], reference: CHALLENGE.reference },
      (data) => {
        if (data.error) {
          result.innerHTML = `<span class="miss">syntax error: ${data.error}</span>`;
          return;
        }
        const r = data.results[0];
        const max = Math.max(r.touches, r.refTouches, 1);
        const bar = (n, cls) =>
          `<div class="big-row"><span class="big-label">${cls === "you" ? "your code" : "reference"}</span>
             <span class="big-bar ${cls}" style="width:${Math.max(1, (n / max) * 100)}%"></span>
             <span class="big-val">${n.toLocaleString()} touches</span></div>`;
        const ratio = r.refTouches ? (r.touches / r.refTouches).toFixed(1) : "—";
        result.innerHTML =
          `<div class="panel-label">${r.ok ? "still correct" : "✗ wrong on the big input"} at n = ${CHALLENGE.big.n}</div>` +
          bar(r.touches, "you") +
          bar(r.refTouches, "ref") +
          `<p class="big-note">${
            r.touches > r.refTouches * 5
              ? `${ratio}× the reference's work — THIS gap is what O-notation was trying to tell you. It only gets worse.`
              : `within ${ratio}× of the reference — your shape scales. This is what a good complexity feels like.`
          }</p>`;
      },
      result
    );
  };
}

// structured self-review (Exercism's mentor review, automated): after a green
// run, diff the learner's code against what a reviewer would ask. Items with
// check(code) get auto-verdicts; items without become honest checkboxes —
// review is where the learning consolidates.
function renderSelfReview(code) {
  const items = CHALLENGE.review || [];
  if (!items.length) return;
  const box = document.getElementById("challenge-review") || document.createElement("div");
  box.id = "challenge-review";
  box.innerHTML =
    `<div class="panel-label">self-review — what a mentor would ask</div>` +
    items
      .map((it, i) => {
        if (!it.check) {
          return `<label class="review-item"><input type="checkbox"> ${it.q}</label>`;
        }
        let v;
        try { v = it.check(code); } catch { v = undefined; }
        if (v === undefined) return `<label class="review-item"><input type="checkbox"> ${it.q}</label>`;
        return `<div class="review-item ${v ? "hit" : "miss"}">${v ? "✓" : "✗"} ${it.q}${v ? "" : " <small>— worth a second look</small>"}</div>`;
      })
      .join("");
  (document.getElementById("challenge-scorecard") || document.getElementById("challenge-cases")).after(box);
}

// skill scorecard (Ropes-style mirror): HOW you solved, not just pass/fail.
// History lives in localStorage so improvement shows as growth, never shame.
function renderScorecard(results, passed) {
  const touches = results.reduce((s, r) => s + (r.touches || 0), 0);
  const refTouches = results.reduce((s, r) => s + (r.refTouches || 0), 0);
  const edges = CHALLENGE.cases
    .map((c, i) => ({ tag: c.tag, ok: results[i].ok }))
    .filter((e) => e.tag);
  const KEY = "scorecard:" + location.pathname;
  const hist = JSON.parse(localStorage.getItem(KEY) || "[]");
  const bestTouches = hist.filter((h) => h.allPass).reduce((m, h) => Math.min(m, h.touches), Infinity);
  hist.push({ date: new Date().toISOString().slice(0, 10), passed, allPass: passed === results.length, touches });
  localStorage.setItem(KEY, JSON.stringify(hist.slice(-50)));

  let growth = "";
  if (passed === results.length && bestTouches !== Infinity) {
    growth =
      touches < bestTouches
        ? `<span class="hit">new best — previous was ${bestTouches} touches</span>`
        : `<span>your best: ${bestTouches} touches</span>`;
  }
  const box = document.getElementById("challenge-scorecard") || document.createElement("div");
  box.id = "challenge-scorecard";
  box.innerHTML = `
    <div class="panel-label">scorecard — how you solved it</div>
    <div class="score-row">correctness <b>${passed}/${results.length}</b></div>
    <div class="score-row">array touches <b>${touches}</b> <small>reference: ${refTouches}</small></div>
    <div class="score-row">edge cases ${edges.map((e) => `<span class="${e.ok ? "hit" : "miss"}">${e.ok ? "✓" : "✗"} ${e.tag}</span>`).join(" ")}</div>
    ${growth ? `<div class="score-row">${growth}</div>` : ""}`;
  document.getElementById("challenge-cases").after(box);
}

// the wiring below needs the full journey markup; harness-only pages
// (challenge mode) load this file just for the helpers above
if (typeof document !== "undefined" && document.getElementById("journey")) {
  // Manim-style morphs: renders replace innerHTML (teleporting), so before a
  // render we snapshot every keyed chip's rect + background, and after it we
  // FLIP-animate survivors from old to new and scale-fade newcomers in.
  // ponytail: same-key matching only, no cross-container morphs — revisit if
  // the sort step ever needs chips to fly from the input row to the sorted row.
  const CHIP_SEL = "#array-row [data-k], #panel [data-k]";
  const chipKey = (el) => (el.closest("#panel") ? "P:" : "A:") + el.dataset.k;

  function snapChips() {
    const m = new Map();
    document.querySelectorAll(CHIP_SEL).forEach((el) => {
      m.set(chipKey(el), { rect: el.getBoundingClientRect(), bg: getComputedStyle(el).backgroundColor });
    });
    return m;
  }

  function morphChips(prev, delay) {
    if (document.documentElement.classList.contains("reduce-motion")) return;
    if (!Element.prototype.animate) return; // no WAAPI (jsdom smoke tests)
    const dur = Math.max(80, Math.min(280, delay * 0.4)); // never outlast the step
    document.querySelectorAll(CHIP_SEL).forEach((el) => {
      const old = prev.get(chipKey(el));
      if (!old) {
        el.animate(
          [{ opacity: 0, transform: "scale(0.5)" }, { opacity: 1, transform: "scale(1)" }],
          { duration: dur, easing: "ease-out" }
        );
        return;
      }
      const now = el.getBoundingClientRect();
      const dx = old.rect.left - now.left;
      const dy = old.rect.top - now.top;
      if (dx || dy) {
        el.animate(
          [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }],
          { duration: dur, easing: "ease-in-out" }
        );
      }
      const bg = getComputedStyle(el).backgroundColor;
      if (old.bg !== bg) {
        el.animate([{ backgroundColor: old.bg }, { backgroundColor: bg }], { duration: dur, easing: "ease-in-out" });
      }
    });
  }

  class Player {
    constructor() {
      this.els = {
        array: document.getElementById("array-row"),
        panel: document.getElementById("panel"),
        code: document.getElementById("pseudocode"),
        idea: document.getElementById("idea"),
        takeaways: document.getElementById("takeaways"),
        codeTabs: document.getElementById("code-tabs"),
        explain: document.getElementById("explain"),
        step: document.getElementById("stat-step"),
        total: document.getElementById("stat-total"),
        complexity: document.getElementById("complexity"),
        scrub: document.getElementById("scrub"),
      };
      this.frames = [];
      this.pos = 0;
      this.timer = null;
      this.delay = 1100;
      this.codeMode = "pseudo";
      this.onFinish = null;
      this.els.scrub.oninput = () => {
        this.stop();
        if (this.hidePredict) this.hidePredict();
        this.show(Number(this.els.scrub.value));
      };
    }

    // every language's lines are written line-for-line against the pseudocode,
    // so frame.line highlights the right row in any tab
    codes() {
      return {
        pseudo: this.ap.pseudocode,
        ...(this.ap.python ? { python: this.ap.python } : {}),
        ...(this.ap.langs || {}),
      };
    }

    setApproach(key) {
      this.key = key;
      this.ap = APPROACHES[key];
      const codes = this.codes();
      if (!codes[this.codeMode]) this.codeMode = "pseudo";
      const LABELS = { pseudo: "pseudocode", python: "Python 3", java: "Java", cpp: "C++" };
      this.els.codeTabs.hidden = Object.keys(codes).length < 2;
      this.els.codeTabs.innerHTML = Object.keys(codes)
        .map((m) => `<button class="code-tab${m === this.codeMode ? " active" : ""}" data-mode="${m}">${LABELS[m] || m}</button>`)
        .join("");
      this.els.codeTabs.querySelectorAll(".code-tab").forEach((btn) => {
        btn.onclick = () => {
          this.els.codeTabs.querySelectorAll(".code-tab").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          this.setCodeMode(btn.dataset.mode);
        };
      });
      this.renderCode();
      const insight = this.ap.insight ? `<b>${this.ap.insight}</b><br>` : "";
      this.els.idea.innerHTML = insight + this.ap.idea;
      this.els.takeaways.innerHTML =
        `<div class="panel-label">what to understand</div><ul>` +
        this.ap.takeaways.map((t) => `<li>${t}</li>`).join("") +
        `</ul>`;
      this.els.complexity.textContent = this.ap.complexity;
      this.build();
    }

    renderCode() {
      const lines = this.codes()[this.codeMode] || this.ap.pseudocode;
      // escape: Java/C++ generics like Map<Integer, Integer> are not HTML tags
      const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      this.els.code.innerHTML = lines.map((l) => `<span class="line">${esc(l)}</span>`).join("");
    }

    setCodeMode(mode) {
      this.codeMode = mode;
      this.renderCode();
      this.show(this.pos);
    }

    runArgs() {
      return PAGE.runArgs ? PAGE.runArgs(this.data) : [];
    }

    build() {
      this.stop();
      const frames = [...this.ap.run(this.data.nums.slice(), ...this.runArgs())];
      this.frames = [
        // inherit noChips so a need-first story opens on an empty stage
        { line: -1, noChips: frames[0]?.noChips, note: "press play — or step through at your own pace" },
        ...frames,
      ];
      this.els.scrub.max = this.frames.length - 1;
      this.els.total.textContent = this.frames.length - 1;
      this.show(0);
    }

    show(i) {
      this.pos = Math.max(0, Math.min(i, this.frames.length - 1));
      const f = this.frames[this.pos];
      const prev = snapChips();
      this.ap.render(f, this.els, this.data);
      morphChips(prev, this.delay);
      if (this.onShow) this.onShow();
      this.els.code.querySelectorAll(".line").forEach((el, k) =>
        el.classList.toggle("active", k === f.line)
      );
      this.els.explain.textContent = f.note;
      this.els.step.textContent = this.pos;
      this.els.scrub.value = this.pos;
    }

    get atEnd() {
      return this.pos >= this.frames.length - 1;
    }

    // predict mode (Brilliant learn-by-doing): a frame with a `predict` field
    // pauses playback BEFORE it renders and asks the learner to call the move.
    // Asked once per build; scrubbing skips predictions (scrubbing is review).
    tryPredict() {
      const nf = this.frames[this.pos + 1];
      if (!nf || !nf.predict || nf.predictDone || !this.showPredict) return false;
      const wasPlaying = this.playing;
      this.stop();
      this.showPredict(nf.predict, () => {
        nf.predictDone = true;
        this.show(this.pos + 1);
        if (this.atEnd && this.onFinish) this.onFinish();
        else if (wasPlaying) this.play();
      });
      return true;
    }

    step() {
      if (this.atEnd) return false;
      if (this.tryPredict()) return false; // paused for a prediction
      this.show(this.pos + 1);
      // finishing by manual stepping counts the same as playing to the end
      if (this.atEnd && this.onFinish) this.onFinish();
      return !this.atEnd;
    }

    stepBack() {
      this.show(this.pos - 1);
    }

    play() {
      if (this.timer) return;
      if (this.atEnd) this.show(0);
      const tick = () => {
        if (this.step()) {
          // narrative frames declare hold > 1 so they stay up long enough to read
          const hold = this.frames[this.pos].hold || 1;
          this.timer = setTimeout(tick, this.delay * hold);
        } else {
          this.timer = null; // step() already fired onFinish at the end
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

    setSpeed(v) {
      // slider 1..100 -> ~2s..0.1s per step; default 50 ≈ 1.1s, slow enough to read
      this.delay = Math.max(100, 2100 - v * 20);
    }
  }

  // progressive disclosure: approaches unlock one at a time — the learner
  // finishes an act, admits they've got it, and only then sees what's next.
  // Locked acts are invisible (a lone "?" hints at more); names never spoil.
  const UNLOCK_KEY = "unlocked:" + location.pathname;
  let unlocked = Math.min(
    Math.max(Number(localStorage.getItem(UNLOCK_KEY)) || 1, 1),
    ACT_ORDER.length
  );

  const player = new Player();
  const playBtn = document.getElementById("btn-play");
  const nextBtn = document.getElementById("btn-next");
  const speedEl = document.getElementById("speed");
  const customEl = document.getElementById("custom");
  const presetEl = document.getElementById("preset");
  const warningEl = document.getElementById("warning");
  const journeyEl = document.getElementById("journey");
  const chartEl = document.getElementById("chart");

  function setPlayLabel(playing) {
    playBtn.textContent = playing ? "⏸ Pause" : "▶ Play";
    playBtn.classList.toggle("playing", playing);
  }

  function buildJourney() {
    journeyEl.innerHTML =
      ACT_ORDER.slice(0, unlocked)
        .map((key, i) => {
          const ap = APPROACHES[key];
          const arrow = i ? `<span class="jarrow" title="${ap.insight}">→</span>` : "";
          return `${arrow}<button class="jnode" data-act="${key}"><b>${ap.name}</b><small>${ap.short}</small></button>`;
        })
        .join("") +
      (unlocked < ACT_ORDER.length
        ? `<span class="jarrow">→</span><span class="jnode locked" title="finish this act to unlock"><b>?</b><small>locked</small></span>`
        : "");
    journeyEl.querySelectorAll("button.jnode").forEach((btn) => {
      btn.onclick = () => setAct(btn.dataset.act);
    });
  }

  // one bar per approach: steps taken on the CURRENT input. Single measure,
  // single hue; the active act's bar gets the accent. Direct-labeled, no legend.
  function buildChart() {
    const acts = ACT_ORDER.slice(1, unlocked) // skip the story act; never spoil locked ones
      .filter((k) => APPROACHES[k].chart !== false); // challenge/recap acts aren't algorithms
    if (!acts.length) {
      chartEl.innerHTML = "";
      return;
    }
    const counts = acts.map((k) => {
      let n = 0;
      for (const _ of APPROACHES[k].run(player.data.nums.slice(), ...player.runArgs())) n++;
      return { k, n };
    });
    const max = Math.max(...counts.map((c) => c.n), 1);
    chartEl.innerHTML =
      `<div class="panel-label">work on this input (steps)</div>` +
      counts
        .map(
          ({ k, n }) =>
            `<div class="crow${k === player.key ? " active" : ""}">
               <span class="clabel">${APPROACHES[k].name}</span>
               <span class="cbar" style="width:${(n / max) * 100}%"></span>
               <span class="cval">${n}</span>
             </div>`
        )
        .join("");
  }

  // stall analytics, all local: seconds spent + quits per act, so the
  // dashboard can show which explanation is failing. No network, ever.
  let stallAct = null;
  let stallStart = 0;
  function stallFlush(quit) {
    if (!stallAct) return;
    const secs = Math.round((Date.now() - stallStart) / 1000);
    const all = JSON.parse(localStorage.getItem("stalls") || "{}");
    const k = location.pathname + "|" + stallAct;
    const e = (all[k] = all[k] || { name: APPROACHES[stallAct].name, secs: 0, quits: 0, step: 0 });
    if (secs >= 3) e.secs += secs;
    if (quit) {
      e.quits += 1;
      e.step = player.pos; // where they were when they left
    }
    localStorage.setItem("stalls", JSON.stringify(all));
    stallStart = Date.now();
  }
  addEventListener("pagehide", () => {
    // leaving mid-journey counts as a quit on the current act
    stallFlush(unlocked < ACT_ORDER.length);
  });

  function setAct(key) {
    stallFlush(false);
    stallAct = key;
    stallStart = Date.now();
    hintTier = 0;
    quizWrongs = 0;
    hintEl.hidden = true;
    player.setApproach(key);
    journeyEl.querySelectorAll(".jnode").forEach((b) => b.classList.toggle("active", b.dataset.act === key));
    nextBtn.hidden = true;
    quizEl.hidden = true;
    predictEl.hidden = true;
    setPlayLabel(false);
    buildChart();
  }

  function applyData(d, extraInfo = "") {
    player.data = d;
    currentData = d;
    lastTrace = null; // a stale trace on new data would lie
    customEl.value = PAGE.describe(d);
    if (PAGE.onData) PAGE.onData(d);
    const verdict = PAGE.classify(d);
    if (!verdict.ok) {
      warningEl.textContent = "⚠ " + verdict.warning;
      warningEl.className = "bad";
    } else if (extraInfo) {
      warningEl.textContent = extraInfo;
      warningEl.className = "info";
    } else {
      warningEl.textContent = "";
      warningEl.className = "";
    }
    warningEl.hidden = !warningEl.textContent;
    nextBtn.hidden = true;
    quizEl.hidden = true;
    predictEl.hidden = true;
    setPlayLabel(false);
    if (player.ap) {
      player.build();
      buildChart();
    }
  }

  function applyPreset() {
    const p = PAGE.presets[presetEl.value];
    applyData(p.make(), p.info || "");
  }

  presetEl.onchange = applyPreset;
  document.getElementById("btn-new").onclick = applyPreset;
  document.getElementById("btn-apply").onclick = () => {
    const d = PAGE.parseCustom(customEl.value);
    if (d) applyData(d);
  };
  customEl.onkeydown = (e) => {
    if (e.key === "Enter") document.getElementById("btn-apply").onclick();
  };

  playBtn.onclick = () => {
    if (player.playing) {
      player.stop();
      setPlayLabel(false);
    } else {
      player.play();
      setPlayLabel(true);
    }
  };
  document.getElementById("btn-step").onclick = () => {
    player.stop();
    setPlayLabel(false);
    player.step();
  };
  document.getElementById("btn-back").onclick = () => {
    player.stop();
    player.hidePredict();
    setPlayLabel(false);
    player.stepBack();
  };
  document.getElementById("btn-reset").onclick = () => {
    player.stop();
    player.hidePredict();
    setPlayLabel(false);
    player.show(0);
  };
  speedEl.oninput = () => player.setSpeed(Number(speedEl.value));

  // progress tracking for the dashboard: which acts' quizzes were passed on
  // this page, and which calendar days saw any learning (streak source)
  const QUIZ_KEY = "quizzes:" + location.pathname;
  function recordQuizPass(act) {
    const passed = new Set(JSON.parse(localStorage.getItem(QUIZ_KEY) || "[]"));
    passed.add(act);
    localStorage.setItem(QUIZ_KEY, JSON.stringify([...passed]));
  }
  function recordActivity() {
    const days = new Set(JSON.parse(localStorage.getItem("activity-days") || "[]"));
    days.add(new Date().toISOString().slice(0, 10));
    localStorage.setItem("activity-days", JSON.stringify([...days]));
  }
  recordActivity(); // opening a journey page counts as showing up

  // spaced repetition: finishing a journey schedules reviews on a decay
  // ladder; the roadmap surfaces what's due. ponytail: visiting a due page
  // counts as the review — upgrade to "challenge re-passed" when that lies.
  const SRS_INTERVALS = [1, 3, 7, 14, 30]; // days until next review, by stage
  const srsAll = () => JSON.parse(localStorage.getItem("srs") || "{}");
  const srsSave = (all) => localStorage.setItem("srs", JSON.stringify(all));
  const inDays = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);

  function srsSchedule() {
    const all = srsAll();
    if (all[location.pathname]) return; // already on the ladder
    all[location.pathname] = { stage: 0, due: inDays(SRS_INTERVALS[0]), earned: inDays(0) };
    srsSave(all);
  }

  // a due page being opened = review done, climb the ladder
  {
    const all = srsAll();
    const entry = all[location.pathname];
    if (entry && entry.due <= inDays(0)) {
      entry.stage = Math.min(entry.stage + 1, SRS_INTERVALS.length - 1);
      entry.due = inDays(SRS_INTERVALS[entry.stage]);
      srsSave(all);
    }
  }

  // XP + celebration (Brilliant-style, kept tasteful): a header badge and a
  // floating "+n XP" burst on earn; reduce-motion gets the number, no motion
  const xpBadge = document.createElement("span");
  xpBadge.id = "xp-badge";
  const paintXP = () => {
    xpBadge.textContent = `★ ${Number(localStorage.getItem("xp") || 0)} XP`;
  };
  paintXP();
  document.querySelector("header")?.appendChild(xpBadge);

  function awardXP(n, anchor) {
    localStorage.setItem("xp", Number(localStorage.getItem("xp") || 0) + n);
    paintXP();
    if (document.documentElement.classList.contains("reduce-motion")) return;
    if (!Element.prototype.animate) return; // no WAAPI (jsdom smoke tests)
    const float = document.createElement("span");
    float.className = "xp-float";
    float.textContent = `+${n} XP`;
    const r = (anchor || xpBadge).getBoundingClientRect();
    float.style.left = r.left + r.width / 2 + "px";
    float.style.top = r.top + "px";
    document.body.appendChild(float);
    float
      .animate(
        [
          { opacity: 0, transform: "translate(-50%, 0) scale(0.7)" },
          { opacity: 1, transform: "translate(-50%, -1.2rem) scale(1.1)", offset: 0.3 },
          { opacity: 0, transform: "translate(-50%, -2.6rem) scale(1)" },
        ],
        { duration: 1100, easing: "ease-out" }
      )
      .finished.then(() => float.remove());
    xpBadge.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }],
      { duration: 400, easing: "ease-out" }
    );
  }

  // hint ladder (Ropes-style, inverted for learning): stuck detection offers
  // tiered hints — nudge → concept → line to stare at. Never the answer.
  // Triggers: 45s with no playback progress, or 2+ wrong quiz answers.
  const hintEl = document.createElement("div");
  hintEl.id = "hints";
  hintEl.hidden = true;
  let hintTier = 0;
  let idleTimer = null;
  let quizWrongs = 0;
  let pageWrongs = 0; // across every act this visit; adaptive difficulty reads it

  function renderHints() {
    const hints = player.ap.hints || [];
    hintEl.innerHTML =
      `<div class="panel-label">stuck? earn it with a smaller push</div>` +
      hints.slice(0, hintTier).map((h) => `<p class="hint">${h}</p>`).join("") +
      (hintTier < hints.length
        ? `<button id="hint-more">${hintTier === 0 ? "give me a nudge" : "a bigger hint"}</button>`
        : "");
    const more = hintEl.querySelector("#hint-more");
    if (more) {
      more.onclick = () => {
        hintTier++;
        renderHints();
      };
    }
  }

  function offerHint() {
    if (!player.ap || !player.ap.hints || !player.ap.hints.length) return;
    if (!hintEl.hidden) return;
    hintEl.hidden = false;
    renderHints();
  }

  function resetHintIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(offerHint, 45000);
  }

  // quiz gate (Khan/AlgoMonster style): before the unlock button appears the
  // learner answers the act's check questions. Wrong answer → explanation,
  // retry; no penalty, but no skipping. Injected div — pages need no markup.
  const quizEl = document.createElement("div");
  quizEl.id = "quiz";
  quizEl.hidden = true;
  document.getElementById("explain").after(quizEl);

  // predict panel: same look as the quiz, but asked mid-playback
  const predictEl = document.createElement("div");
  predictEl.id = "predict";
  predictEl.hidden = true;
  document.getElementById("explain").after(predictEl);
  document.getElementById("explain").after(hintEl);

  player.hidePredict = () => {
    predictEl.hidden = true;
  };
  player.showPredict = (p, cont) => {
    setPlayLabel(false);
    predictEl.innerHTML =
      `<div class="panel-label">you drive — predict the next move</div>
       <p class="quiz-q">${p.q}</p>
       <div class="quiz-choices">${p.choices
         .map((c, i) => `<button class="quiz-choice" data-i="${i}">${c}</button>`)
         .join("")}</div>
       <p class="quiz-feedback" hidden></p>`;
    predictEl.hidden = false;
    const feedback = predictEl.querySelector(".quiz-feedback");
    predictEl.querySelectorAll(".quiz-choice").forEach((btn) => {
      btn.onclick = () => {
        const right = Number(btn.dataset.i) === p.answer;
        predictEl.querySelectorAll(".quiz-choice").forEach((b) => {
          b.disabled = true;
          if (Number(b.dataset.i) === p.answer) b.classList.add("right");
        });
        if (!right) btn.classList.add("wrong");
        feedback.textContent = right ? "exactly — watch:" : "not quite — watch what actually happens:";
        feedback.hidden = false;
        setTimeout(() => {
          predictEl.hidden = true;
          cont();
        }, right ? 700 : 1600);
      };
    });
  };

  function showQuiz(quiz, onPass) {
    let qi = 0;
    const ask = () => {
      const q = quiz[qi];
      quizEl.innerHTML =
        `<div class="panel-label">check yourself (${qi + 1}/${quiz.length})</div>
         <p class="quiz-q">${q.q}</p>
         <div class="quiz-choices">${q.choices
           .map((c, i) => `<button class="quiz-choice" data-i="${i}">${c}</button>`)
           .join("")}</div>
         <p class="quiz-feedback" hidden></p>`;
      quizEl.hidden = false;
      const feedback = quizEl.querySelector(".quiz-feedback");
      quizEl.querySelectorAll(".quiz-choice").forEach((btn) => {
        btn.onclick = () => {
          if (Number(btn.dataset.i) === q.answer) {
            btn.classList.add("right");
            qi++;
            if (qi < quiz.length) {
              setTimeout(ask, 500);
            } else {
              quizEl.hidden = true;
              onPass();
            }
          } else {
            btn.classList.add("wrong");
            feedback.textContent = q.explain;
            feedback.hidden = false;
            pageWrongs++;
            if (++quizWrongs >= 2) offerHint(); // struggling — offer the ladder
          }
        };
      });
    };
    ask();
  }

  player.onFinish = () => {
    setPlayLabel(false);
    // acts with gate:"pass" (code challenge) unlock on green tests, not on
    // reaching the last frame; content dispatches "challenge-pass" when done
    if (player.ap.gate === "pass" && !player.ap._passed) return;
    journeyEl.querySelector(`.jnode[data-act="${player.key}"]`)?.classList.add("done");
    const idx = ACT_ORDER.indexOf(player.key);
    const next = ACT_ORDER[idx + 1];
    if (!next) return;
    if (idx + 1 < unlocked) {
      // already unlocked on an earlier visit — plain navigation
      nextBtn.textContent = `Next: ${APPROACHES[next].name} ▸`;
      nextBtn.onclick = () => setAct(next);
      nextBtn.hidden = false;
    } else {
      // the reveal moment: quiz first (if the act has one), then the opt-in
      const reveal = () => {
        nextBtn.textContent =
          player.ap.nextLabel ||
          (idx === 0
            ? "I understand the problem — try solving it ▸"
            : "I get it — what's the weakness? ▸");
        nextBtn.onclick = () => {
          unlocked = idx + 2;
          localStorage.setItem(UNLOCK_KEY, unlocked);
          awardXP(10, nextBtn);
          if (unlocked >= ACT_ORDER.length) srsSchedule(); // journey done → review ladder
          buildJourney();
          setAct(next);
          journeyEl.querySelector(`.jnode[data-act="${next}"]`)?.classList.add("revealed");
          player.els.idea.classList.add("revealed");
          setTimeout(() => player.els.idea.classList.remove("revealed"), 1300);
        };
        nextBtn.hidden = false;
      };
      const quiz = player.ap.quiz;
      if (quiz && quiz.length && quizEl.hidden) {
        showQuiz(quiz, () => {
          recordQuizPass(player.key);
          awardXP(5, quizEl);
          reveal();
        });
      } else if (!quiz || !quiz.length) reveal();
    }
  };

  // content can ask for a frame rebuild of the current act (e.g. after a
  // learner-code trace arrives, so playback runs THEIR execution)
  document.addEventListener("act-rebuild", () => player.build());

  document.addEventListener("challenge-pass", () => {
    const first = !player.ap._passed;
    if (first) awardXP(25, nextBtn);
    player.ap._passed = true;
    player.onFinish();
    // adaptive difficulty (Ropes' harder follow-ups): flawless quizzes + a
    // first-try green run earns the harder input, offered, never forced
    if (first && pageWrongs === 0 && challengeAttempts === 1 && PAGE.harder && PAGE.presets[PAGE.harder.preset]) {
      const up = document.createElement("div");
      up.id = "adaptive-up";
      up.innerHTML = `<span>🔥 Flawless — no wrong answers, first-try green.</span>
        <button id="adaptive-go">${PAGE.harder.label}</button>`;
      document.getElementById("explain").after(up);
      up.querySelector("#adaptive-go").onclick = () => {
        presetEl.value = PAGE.harder.preset;
        applyPreset();
        up.remove();
      };
    }
  });

  document.addEventListener("keydown", (e) => {
    if (["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName)) return;
    if (document.querySelector("dialog[open]")) return; // shortcut overlay owns the keys
    if (e.key === " ") {
      e.preventDefault();
      playBtn.onclick();
    } else if (e.key === "ArrowRight") {
      player.stop();
      setPlayLabel(false);
      player.step();
    } else if (e.key === "ArrowLeft") {
      player.stop();
      player.hidePredict();
      setPlayLabel(false);
      player.stepBack();
    } else if (e.key === "r") {
      player.stop();
      player.hidePredict();
      setPlayLabel(false);
      player.show(0);
    }
  });

  // first-visit tour: 3 spotlights on the controls newcomers never find.
  // Dismiss or finish → localStorage tourDone, never shown again.
  if (!localStorage.getItem("tourDone")) {
    const TOUR = [
      { sel: "#btn-play", text: "Play walks the algorithm one narrated step at a time. Space bar works too — and ←/→ let you step by hand." },
      { sel: "#scrub", text: "This is a timeline, not a progress bar — drag it to scrub anywhere in the run, even backwards." },
      { sel: "#btn-focus", text: "Focus mode hides everything but the visualization. Press f to enter, Esc to leave." },
    ];
    const overlay = document.createElement("div");
    overlay.className = "tour-overlay";
    document.body.appendChild(overlay);
    let ti = 0;
    let target = null;
    const endTour = () => {
      localStorage.setItem("tourDone", "1");
      overlay.remove();
      target?.classList.remove("tour-target");
    };
    const showStep = () => {
      target?.classList.remove("tour-target");
      const t = TOUR[ti];
      target = document.querySelector(t.sel);
      if (!target) return endTour();
      target.classList.add("tour-target");
      const r = target.getBoundingClientRect();
      overlay.innerHTML = `<div class="tour-tip">
        <p>${t.text}</p>
        <div class="tour-nav">
          <span>${ti + 1}/${TOUR.length}</span>
          <button class="tour-skip">skip</button>
          <button class="tour-next">${ti < TOUR.length - 1 ? "next ▸" : "got it ✓"}</button>
        </div>
      </div>`;
      const tip = overlay.querySelector(".tour-tip");
      // above the controls bar, roughly over the target
      tip.style.left = Math.max(12, Math.min(r.left, innerWidth - 320)) + "px";
      tip.style.bottom = innerHeight - r.top + 14 + "px";
      overlay.querySelector(".tour-skip").onclick = endTour;
      overlay.querySelector(".tour-next").onclick = () => {
        ti++;
        if (ti >= TOUR.length) endTour();
        else showStep();
      };
    };
    showStep();
  }

  // deep links: ?act=brute&step=12 — the URL always mirrors the current
  // moment (debounced replaceState), so any position is shareable. The input
  // itself isn't encoded: a link restores the act/step on fresh data.
  let urlTimer;
  player.onShow = () => {
    resetHintIdle(); // any shown frame counts as progress
    clearTimeout(urlTimer);
    urlTimer = setTimeout(() => {
      const u = new URL(location);
      u.searchParams.set("act", player.key);
      u.searchParams.set("step", player.pos);
      history.replaceState(null, "", u);
    }, 300);
  };

  // startup: land on the story act — or on the act/step a shared link names,
  // if that act is already unlocked (links never bypass the earn)
  document.getElementById("resources").innerHTML =
    "same problem elsewhere: " + RESOURCES.map((r) => `<a href="${r.url}" target="_blank" rel="noopener">${r.label}</a>`).join(" · ");
  buildJourney();
  player.setSpeed(Number(speedEl.value));
  applyData(PAGE.presets[presetEl.value].make(), PAGE.presets[presetEl.value].info || "");
  const params = new URLSearchParams(location.search);
  const linkedAct = params.get("act");
  if (linkedAct && ACT_ORDER.indexOf(linkedAct) > -1 && ACT_ORDER.indexOf(linkedAct) < unlocked) {
    setAct(linkedAct);
    const st = Number(params.get("step"));
    if (st > 0) player.show(st);
  } else {
    setAct(ACT_ORDER[0]);
  }
}
