// Fails if any algorithm's generator leaves the array unsorted.
// Run: node js/test_sorts.js
const fs = require("fs");
const path = require("path");
const ALGORITHMS = eval(fs.readFileSync(path.join(__dirname, "algorithms.js"), "utf8") + ";ALGORITHMS");

const cases = {
  random: Array.from({ length: 30 }, () => Math.floor(Math.random() * 95) + 5),
  reversed: [9, 8, 7, 6, 5, 4, 3, 2, 1],
  duplicates: [5, 3, 5, 1, 3, 5, 1],
  single: [42],
  sorted: [1, 2, 3, 4, 5],
};

for (const [algoKey, algo] of Object.entries(ALGORITHMS)) {
  if (algo.kind === "search") continue; // searches don't sort; tested below
  for (const [caseName, input] of Object.entries(cases)) {
    const a = input.slice();
    for (const _ of algo.run(a)) {} // drain generator; mutates a
    const expected = input.slice().sort((x, y) => x - y);
    console.assert(
      JSON.stringify(a) === JSON.stringify(expected),
      `${algoKey}/${caseName}: got ${a}, want ${expected}`
    );
  }
}

// Binary search: last "sorted" step's index must hold the target; a miss ends
// with an empty-indices "discard" step and no "sorted" step.
function searchResult(a, target) {
  let found = null, missed = false;
  for (const s of ALGORITHMS.binary.run(a, target)) {
    if (s.type === "sorted") found = s.indices[0];
    if (s.type === "discard" && s.indices.length === 0) missed = true;
  }
  return { found, missed };
}

const sortedArr = [3, 8, 8, 15, 23, 42, 77, 91];
for (const t of sortedArr) {
  const { found, missed } = searchResult(sortedArr, t);
  console.assert(found !== null && sortedArr[found] === t && !missed, `binary/hit ${t}: got index ${found}`);
}
for (const t of [1, 9, 50, 100]) {
  const { found, missed } = searchResult(sortedArr, t);
  console.assert(found === null && missed, `binary/miss ${t}: got index ${found}`);
}
{
  const { found } = searchResult([42], 42);
  console.assert(found === 0, `binary/single: got index ${found}`);
}
console.log("all sorts + binary search OK");
