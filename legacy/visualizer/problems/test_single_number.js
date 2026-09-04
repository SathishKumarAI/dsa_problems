// Fails if any approach returns the wrong single number, or if a
// contract-breaking input crashes a generator (they must lie gracefully).
// Run: node problems/test_single_number.js
const fs = require("fs");
const path = require("path");
const src = fs.readFileSync(path.join(__dirname, "single-number-approaches.js"), "utf8");
const api = eval(src + ";({ runBrute, runHash, runSort, runXor, runStory, classifyInput })");
const RUNS = [["brute", api.runBrute], ["hash", api.runHash], ["sort", api.runSort], ["xor", api.runXor]];

function answerOf(gen) {
  let ans;
  for (const f of gen) if (f.answer !== undefined) ans = f.answer;
  return ans;
}

const cases = [
  [[2, 2, 1], 1],
  [[4, 1, 2, 1, 2], 4],
  [[1], 1],
  [[99, 5, 5], 99], // single is the max — sort's "last element" fallback path
  [[3, 7, 3], 7],
];
// larger randomized case with a known single
{
  const nums = [42];
  for (const v of [8, 19, 63, 77, 91]) nums.push(v, v);
  nums.sort(() => Math.random() - 0.5);
  cases.push([nums, 42]);
}

for (const [nums, expected] of cases) {
  console.assert(api.classifyInput(nums).ok, `classify/[${nums}]: valid input flagged broken`);
  for (const [name, run] of RUNS) {
    const got = answerOf(run(nums.slice()));
    console.assert(got === expected, `${name}/[${nums}]: got ${got}, want ${expected}`);
  }
}

// contract-breaking inputs: must classify as broken and drain without throwing
for (const nums of [[1, 2, 3, 3], [7, 7, 7, 2, 2], [5, 5]]) {
  console.assert(!api.classifyInput(nums).ok, `classify/[${nums}]: broken input not flagged`);
  for (const [name, run] of [...RUNS, ["story", api.runStory]]) {
    let threw = false;
    try {
      for (const _ of run(nums.slice())) {}
    } catch {
      threw = true;
    }
    console.assert(!threw, `${name}/[${nums}]: generator threw on broken input`);
  }
}

// the documented XOR lie: two singles → XOR of them, not a real answer
console.assert(answerOf(api.runXor([1, 2, 3, 3])) === 3, "xor lie changed — page copy documents 1^2=3");

console.log("single number OK");
