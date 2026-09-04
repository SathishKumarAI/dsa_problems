// Wiring and startup only. No rendering, no algorithm logic.

const viz = new Visualizer();

const sizeEl = document.getElementById("size");
const speedEl = document.getElementById("speed");
const playBtn = document.getElementById("btn-play");
const targetEl = document.getElementById("target");
const targetWrap = document.getElementById("target-wrap");

function randInt(lo, hi) {
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

const generators = {
  random: (n) => Array.from({ length: n }, () => randInt(5, 99)),
  nearly: (n) => {
    const a = Array.from({ length: n }, (_, i) => 5 + Math.round((i * 94) / (n - 1)));
    for (let k = 0; k < Math.max(1, n >> 3); k++) {
      const i = randInt(0, n - 2);
      [a[i], a[i + 1]] = [a[i + 1], a[i]];
    }
    return a;
  },
  reversed: (n) => Array.from({ length: n }, (_, i) => 5 + Math.round(((n - 1 - i) * 94) / (n - 1))),
  few: (n) => {
    const vals = [15, 40, 65, 90];
    return Array.from({ length: n }, () => vals[randInt(0, 3)]);
  },
};

function newArray(kind) {
  // graph mode: every "new data" button deals a fresh random graph
  // (size slider is ignored there — 9 nodes stays readable)
  if (viz.algo && viz.algo.kind === "graph") {
    viz.newGraph();
    setPlayLabel(false);
    return;
  }
  const a = generators[kind](Number(sizeEl.value));
  // default target to an existing element so a search demo usually hits;
  // the user can type any value to see the miss path
  viz.target = a[randInt(0, a.length - 1)];
  targetEl.value = viz.target;
  viz.setArray(a);
  setPlayLabel(false);
}

function setPlayLabel(playing) {
  playBtn.textContent = playing ? "⏸ Pause" : "▶ Play";
  playBtn.classList.toggle("playing", playing);
}

document.getElementById("btn-random").onclick = () => newArray("random");
document.getElementById("btn-nearly").onclick = () => newArray("nearly");
document.getElementById("btn-reversed").onclick = () => newArray("reversed");
document.getElementById("btn-few").onclick = () => newArray("few");

sizeEl.oninput = () => newArray("random");
speedEl.oninput = () => viz.setSpeed(Number(speedEl.value));

playBtn.onclick = () => {
  if (viz.playing) {
    viz.stop();
    setPlayLabel(false);
  } else {
    viz.play();
    setPlayLabel(true);
  }
};

document.getElementById("btn-step").onclick = () => {
  viz.stop();
  setPlayLabel(false);
  viz.step();
};

document.getElementById("btn-back").onclick = () => {
  viz.stop();
  setPlayLabel(false);
  viz.stepBack();
};

document.getElementById("btn-reset").onclick = () => {
  viz.reset();
  setPlayLabel(false);
};

targetEl.onchange = () => {
  viz.setTarget(Number(targetEl.value));
  setPlayLabel(false);
};

document.querySelectorAll("#algo-tabs button").forEach((btn) => {
  btn.onclick = () => {
    document.querySelectorAll("#algo-tabs button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const algo = ALGORITHMS[btn.dataset.algo];
    targetWrap.hidden = algo.kind !== "search";
    viz.setAlgorithm(algo);
    setPlayLabel(false);
  };
});

document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") return; // don't hijack sliders/number input
  if (document.querySelector("dialog[open]")) return; // shortcut overlay owns the keys
  if (e.key === " ") {
    e.preventDefault();
    playBtn.onclick();
  } else if (e.key === "ArrowRight") {
    viz.stop();
    setPlayLabel(false);
    viz.step();
  } else if (e.key === "ArrowLeft") {
    viz.stop();
    setPlayLabel(false);
    viz.stepBack();
  } else if (e.key === "r") {
    viz.reset();
    setPlayLabel(false);
  }
});

viz.onFinish = () => setPlayLabel(false);

// startup
viz.setSpeed(Number(speedEl.value));
viz.array = generators.random(Number(sizeEl.value));
viz.target = viz.array[randInt(0, viz.array.length - 1)];
targetEl.value = viz.target;
viz.setAlgorithm(ALGORITHMS.bubble);
