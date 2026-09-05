// Fails if the bracket checker mis-judges balance, or round-robin loses a
// page or a job. Run: node structures/test_structures.js
const fs = require("fs");
const path = require("path");
const journey = fs.readFileSync(path.join(__dirname, "..", "problems", "journey.js"), "utf8");

const stack = new Function(journey + ";" + fs.readFileSync(path.join(__dirname, "stack.js"), "utf8") + ";return { runBrackets, runOps, runStory };")();
const queue = new Function(journey + ";" + fs.readFileSync(path.join(__dirname, "queue.js"), "utf8") + ";return { runRoundRobin, runOps, runStory };")();

function bracketVerdict(chars) {
  let balanced = false, failed = false;
  for (const f of stack.runBrackets(chars.slice())) {
    if (f.answer) balanced = true;
    if (f.fail !== undefined) failed = true;
  }
  return { balanced, failed };
}

for (const [s, want] of [
  ["([])", true],
  ["()[]{}", true],
  ["", true],
  ["([)]", false], // the counter-fooler
  ["((", false],   // unclosed opener
  [")(", false],   // closer first
  ["([]{})", true],
]) {
  const { balanced, failed } = bracketVerdict(s.split(""));
  console.assert(balanced === want, `brackets/"${s}": balanced=${balanced}, want ${want}`);
  // unclosed-opener inputs are unbalanced WITHOUT a fail frame — end-check catches them
  if (want) console.assert(!failed, `brackets/"${s}": flagged a fail on balanced input`);
}

// round-robin: total ticks = total pages, every job finishes exactly once
for (const jobs of [[9, 1, 1, 2], [3, 3, 3], [1], [5, 2]]) {
  let ticks = 0, finished = [];
  for (const f of queue.runRoundRobin(jobs.slice())) {
    if (f.busy !== undefined && f.busy !== null) ticks++;
    if (f.doneJob !== undefined) finished.push(f.doneJob);
  }
  const total = jobs.reduce((a, b) => a + b, 0);
  console.assert(ticks === total, `rr/[${jobs}]: ${ticks} ticks, want ${total}`);
  console.assert(
    finished.length === jobs.length && new Set(finished).size === jobs.length,
    `rr/[${jobs}]: finished ${finished}, want each job once`
  );
}

// every generator drains on edge inputs without throwing
for (const [api, input] of [[stack, ["("]], [stack, []], [queue, [1]], [queue, []]]) {
  for (const run of Object.values(api)) {
    let threw = false;
    try {
      for (const _ of run(input.slice())) {}
    } catch {
      threw = true;
    }
    console.assert(!threw, `${run.name}/[${input}]: threw`);
  }
}

console.log("structures OK");
