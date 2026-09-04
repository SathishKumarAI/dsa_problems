// Fails if any approach returns wrong indices, or if a contract-breaking
// input crashes a generator. Run: node problems/test_two_sum.js
const fs = require("fs");
const path = require("path");
const src = fs.readFileSync(path.join(__dirname, "two-sum-approaches.js"), "utf8");
const api = eval(src + ";({ runBrute, runTwoPointer, runTwoPassHash, runHash, runStory, classifyTwoSum })");
const RUNS = [["brute", api.runBrute], ["twoptr", api.runTwoPointer], ["twopass", api.runTwoPassHash], ["hash", api.runHash]];

function answerOf(gen) {
  let ans;
  for (const f of gen) if (f.answer !== undefined) ans = f.answer;
  return ans;
}

const cases = [
  [[2, 7, 11, 15], 9, [0, 1]],
  [[3, 2, 4], 6, [1, 2]],
  [[3, 3], 6, [0, 1]], // equal-values pair — hash must check before storing
  [[5, 75, 25], 100, [1, 2]],
  [[3, 1, 3, 8], 6, [0, 2]], // the duplicates preset
  [[1, 9, 4, 6, 30], 31, [0, 4]], // answer at the extremes — two-pointer first probe
];

for (const [nums, target, expected] of cases) {
  console.assert(api.classifyTwoSum(nums, target).ok, `classify/[${nums}] t=${target}: valid input flagged broken`);
  for (const [name, run] of RUNS) {
    const got = answerOf(run(nums.slice(), target));
    const sorted = got && [...got].sort((a, b) => a - b);
    console.assert(
      JSON.stringify(sorted) === JSON.stringify(expected),
      `${name}/[${nums}] t=${target}: got ${got}, want ${expected}`
    );
  }
}

// contract-breaking inputs: flagged, and every generator drains without throwing
for (const [nums, target] of [[[1, 2, 5, 11], 99], [[1, 4, 2, 3], 5]]) {
  console.assert(!api.classifyTwoSum(nums, target).ok, `classify/[${nums}] t=${target}: broken input not flagged`);
  for (const [name, run] of [...RUNS, ["story", api.runStory]]) {
    let threw = false;
    try {
      for (const _ of run(nums.slice(), target)) {}
    } catch {
      threw = true;
    }
    console.assert(!threw, `${name}/[${nums}]: generator threw on broken input`);
  }
}

// no-solution inputs must yield NO answer frame
for (const [name, run] of RUNS) {
  console.assert(answerOf(run([1, 2, 5, 11], 99)) === undefined, `${name}: invented an answer for an unsolvable input`);
}

console.log("two sum OK");
