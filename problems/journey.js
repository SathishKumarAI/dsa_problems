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

if (typeof document !== "undefined") {
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

  function setAct(key) {
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
          buildJourney();
          setAct(next);
          journeyEl.querySelector(`.jnode[data-act="${next}"]`)?.classList.add("revealed");
          player.els.idea.classList.add("revealed");
          setTimeout(() => player.els.idea.classList.remove("revealed"), 1300);
        };
        nextBtn.hidden = false;
      };
      const quiz = player.ap.quiz;
      if (quiz && quiz.length && quizEl.hidden) showQuiz(quiz, reveal);
      else if (!quiz || !quiz.length) reveal();
    }
  };

  document.addEventListener("challenge-pass", () => {
    player.ap._passed = true;
    player.onFinish();
  });

  document.addEventListener("keydown", (e) => {
    if (["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName)) return;
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

  // startup: land on the story act
  document.getElementById("resources").innerHTML =
    "same problem elsewhere: " + RESOURCES.map((r) => `<a href="${r.url}" target="_blank" rel="noopener">${r.label}</a>`).join(" · ");
  buildJourney();
  player.setSpeed(Number(speedEl.value));
  applyData(PAGE.presets[presetEl.value].make(), PAGE.presets[presetEl.value].info || "");
  setAct(ACT_ORDER[0]);
}
