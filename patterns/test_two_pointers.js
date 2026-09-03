// Fails if converge returns a wrong pair, chase keeps the wrong slots, or a
// no-solution input crashes a generator. Run: node patterns/test_two_pointers.js
const fs = require("fs");
const path = require("path");
const src = fs.readFileSync(path.join(__dirname, "two-pointers.js"), "utf8");
const api = eval(src + ";({ runShape, runConverge, runChase })");

function answerOf(gen) {
  let ans;
  for (const f of gen) if (f.answer !== undefined) ans = f.answer;
  return ans;
}

// converge: sorted input, answer = positions of the pair
for (const [nums, target, expected] of [
  [[1, 3, 4, 6, 9], 10, [0, 4]],
  [[1, 3, 4, 6, 9], 7, [0, 3]], // squeeze finds 1+6 before 3+4
  [[2, 2, 5], 4, [0, 1]],
]) {
  const got = answerOf(api.runConverge(nums.slice(), target));
  console.assert(
    got && nums[got[0]] + nums[got[1]] === target && got[0] < got[1],
    `converge/[${nums}] t=${target}: got ${got}`
  );
  console.assert(JSON.stringify(got) === JSON.stringify(expected), `converge/[${nums}] t=${target}: got ${got}, want ${expected}`);
}
console.assert(answerOf(api.runConverge([1, 2, 3], 99)) === undefined, "converge invented a pair");

// chase: answer = indices of the kept (unique) prefix
for (const [nums, uniq] of [
  [[1, 1, 2, 3, 3, 3, 7], 4],
  [[1, 2, 3], 3],
  [[5, 5, 5], 1],
  [[], 0],
]) {
  const got = answerOf(api.runChase(nums.slice()));
  const n = got ? got.length : 0;
  console.assert(n === uniq, `chase/[${nums}]: kept ${n}, want ${uniq}`);
}

// every generator drains without throwing on edge inputs
for (const run of [api.runShape, api.runConverge, api.runChase]) {
  for (const nums of [[], [7], [1, 2]]) {
    let threw = false;
    try {
      for (const _ of run(nums.slice(), 99)) {}
    } catch {
      threw = true;
    }
    console.assert(!threw, `${run.name}/[${nums}]: threw`);
  }
}

console.log("two pointers pattern OK");
