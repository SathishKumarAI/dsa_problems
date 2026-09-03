// Content-schema validator: fails loudly if any content file's PROBLEM object
// is malformed — missing fields, act keys not in approaches, code tabs whose
// line count breaks pseudocode↔highlight sync, bad quiz/predict shapes, or a
// generator that throws on the sample input. Run: node problems/validate.js
const fs = require("fs");
const path = require("path");

const FILES = [
  ...fs.readdirSync(__dirname).filter((f) => f.endsWith("-approaches.js")).map((f) => path.join(__dirname, f)),
  ...fs.readdirSync(path.join(__dirname, "..", "patterns"))
    .filter((f) => f.endsWith(".js") && !f.startsWith("test_"))
    .map((f) => path.join(__dirname, "..", "patterns", f)),
];

// journey.js provides the DOM-free helpers (chipRow, randInt, …) content relies on
const journeySrc = fs.readFileSync(path.join(__dirname, "journey.js"), "utf8");

let failures = 0;
function check(cond, msg) {
  if (!cond) {
    failures++;
    console.error("  ✗ " + msg);
  }
}

for (const file of FILES) {
  const name = path.basename(file);
  console.log(name);
  const src = fs.readFileSync(file, "utf8");
  let P;
  try {
    P = new Function(journeySrc + ";" + src + ";return typeof PROBLEM !== 'undefined' ? PROBLEM : null;")();
  } catch (e) {
    check(false, `file does not eval: ${e.message}`);
    continue;
  }
  check(P, "no PROBLEM object");
  if (!P) continue;

  for (const field of ["slug", "title", "approaches", "actOrder", "resources", "page", "sample"]) {
    check(P[field] !== undefined, `PROBLEM.${field} missing`);
  }
  const { approaches = {}, actOrder = [], resources = [], page = {}, sample = {} } = P;

  check(Array.isArray(actOrder) && actOrder.length > 0, "actOrder empty");
  for (const k of actOrder) check(approaches[k], `act "${k}" not in approaches`);
  for (const r of resources) check(r.label && r.url, `resource missing label/url: ${JSON.stringify(r)}`);
  check(page.presets && Object.keys(page.presets).length, "page.presets empty");
  check(typeof page.classify === "function", "page.classify not a function");
  check(typeof page.describe === "function", "page.describe not a function");
  check(Array.isArray(sample.nums), "sample.nums missing");

  const runArgs = page.runArgs ? page.runArgs(sample) : [];

  for (const [k, a] of Object.entries(approaches)) {
    const at = (m) => `${k}: ${m}`;
    check(typeof a.name === "string" && a.name, at("name missing"));
    check(typeof a.short === "string", at("short missing"));
    check(typeof a.complexity === "string", at("complexity missing"));
    check(typeof a.idea === "string" && a.idea, at("idea missing"));
    check(Array.isArray(a.pseudocode) && a.pseudocode.every((l) => typeof l === "string"), at("pseudocode not string[]"));
    check(Array.isArray(a.takeaways) && a.takeaways.length, at("takeaways missing"));
    check(typeof a.run === "function", at("run missing"));
    check(typeof a.render === "function", at("render missing"));

    // every language tab must match pseudocode line-for-line — highlight sync
    const tabs = { python: a.python, ...(a.langs || {}) };
    for (const [lang, lines] of Object.entries(tabs)) {
      if (lines == null) continue;
      check(
        Array.isArray(lines) && lines.length === a.pseudocode.length,
        at(`${lang} has ${lines && lines.length} lines, pseudocode has ${a.pseudocode.length} — highlight sync breaks`)
      );
    }

    if (a.quiz) {
      for (const [i, q] of a.quiz.entries()) {
        check(typeof q.q === "string" && q.q, at(`quiz[${i}].q missing`));
        check(Array.isArray(q.choices) && q.choices.length >= 2, at(`quiz[${i}].choices needs >= 2`));
        check(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < (q.choices || []).length, at(`quiz[${i}].answer out of range`));
        check(typeof q.explain === "string" && q.explain, at(`quiz[${i}].explain missing`));
      }
    }

    // drain the generator on the sample: must not throw, frames must be sane
    try {
      let n = 0;
      for (const f of a.run(sample.nums.slice(), ...runArgs)) {
        n++;
        check(typeof f.note === "string" && f.note, at(`frame ${n} has no note`));
        if (f.predict) {
          check(typeof f.predict.q === "string", at(`frame ${n} predict.q missing`));
          check(Array.isArray(f.predict.choices) && f.predict.choices.length >= 2, at(`frame ${n} predict.choices needs >= 2`));
          check(
            Number.isInteger(f.predict.answer) && f.predict.answer >= 0 && f.predict.answer < f.predict.choices.length,
            at(`frame ${n} predict.answer out of range`)
          );
        }
        if (n > 10000) {
          check(false, at("generator did not terminate within 10000 frames"));
          break;
        }
      }
      check(n > 0, at("generator yielded no frames on the sample"));
    } catch (e) {
      check(false, at(`generator threw on sample: ${e.message}`));
    }
  }

  if (P.challenge) {
    check(typeof P.challenge.starter === "string", "challenge.starter missing");
    check(Array.isArray(P.challenge.cases) && P.challenge.cases.length, "challenge.cases empty");
    for (const [i, c] of (P.challenge.cases || []).entries()) {
      check(Array.isArray(c.nums) && Array.isArray(c.expected), `challenge.cases[${i}] needs nums + expected`);
    }
  }
}

if (failures) {
  console.error(`\n${failures} schema failure(s)`);
  process.exit(1);
}
console.log("\nall content files valid");
