// DOM smoke tests (jsdom): every page boots with zero console/page errors,
// and the journey unlock state round-trips through localStorage into the DOM.
// Run: node problems/test_dom.js   (needs: npm i — jsdom is a devDependency)
const path = require("path");
const fs = require("fs");
const { JSDOM, VirtualConsole } = require("jsdom");

const ROOT = path.join(__dirname, "..");

// jsdom 30 has no ResourceLoader; inline every <script src> from disk instead
// (CSS links are dropped — jsdom doesn't lay out anyway). The page then runs
// under a fake http://localhost origin so localStorage works.
function inlineAssets(file) {
  const dir = path.dirname(path.join(ROOT, file));
  return fs
    .readFileSync(path.join(ROOT, file), "utf8")
    .replace(/<script src="([^"]+)"><\/script>/g, (_, src) =>
      "<script>" + fs.readFileSync(path.join(dir, src), "utf8") + "</script>"
    )
    .replace(/<link rel="stylesheet"[^>]*>/g, "");
}

// [file, seed localStorage before scripts run, assertions after load]
const PAGES = [
  ["index.html", null, (w) => {
    assert(w.document.querySelectorAll("#hero-cards .hero-card").length >= 3, "hero cards missing");
    assert(w.document.querySelectorAll("#algo-tabs button").length >= 6, "algo tabs missing");
  }],
  ["problems/index.html", null, (w) => {
    assert(w.document.querySelectorAll(".rcard").length >= 3, "roadmap cards missing");
    assert(w.document.querySelectorAll(".stat-tile").length === 5, "dashboard tiles missing");
  }],
  ["problems/two-sum.html", null, (w) => {
    // fresh visit: story node + locked "?" only — progressive disclosure holds
    assert(w.document.querySelectorAll("#journey .jnode").length === 2, "fresh journey should show 2 nodes");
    assert(w.document.querySelector("#journey .jnode.locked"), "locked ? node missing");
  }],
  ["problems/two-sum.html?unlocked=3", (ls) => ls.setItem("unlocked:/problems/two-sum.html", "3"), (w) => {
    // unlock round-trip: localStorage=3 → 3 real nodes + the locked hint
    assert(w.document.querySelectorAll("#journey .jnode").length === 4, "unlocked=3 should show 3 acts + locked");
    assert(w.document.querySelectorAll("#journey button.jnode").length === 3, "3 clickable acts expected");
  }],
  ["problems/single-number.html", null, (w) => {
    assert(w.document.querySelectorAll("#journey .jnode").length === 2, "single-number fresh journey");
  }],
  ["patterns/two-pointers.html", null, (w) => {
    assert(w.document.querySelectorAll("#journey .jnode").length === 2, "pattern fresh journey");
  }],
  ["structures/stack.html", null, (w) => {
    assert(w.document.querySelectorAll("#journey .jnode").length === 2, "stack fresh journey");
  }],
  ["structures/queue.html", null, (w) => {
    assert(w.document.querySelectorAll("#journey .jnode").length === 2, "queue fresh journey");
  }],
  ["challenge.html", null, (w) => {
    // fresh profile: clearance gate, not the mission
    assert(w.document.getElementById("locked"), "challenge page should be gated for fresh profiles");
  }],
  ["challenge.html?cleared", (ls) => ls.setItem("unlocked:/problems/two-sum.html", "7"), (w) => {
    assert(w.document.getElementById("accept"), "cleared profile should see the accept button");
  }],
];

let failures = 0;
function assert(cond, msg) {
  if (!cond) {
    failures++;
    console.error("  ✗ " + msg);
  }
}
(async () => {
  for (const [page, seed, checks] of PAGES) {
    const file = page.split("?")[0];
    console.log(page);
    const errors = [];
    const vc = new VirtualConsole();
    vc.on("jsdomError", (e) => errors.push("jsdomError: " + e.message));
    vc.on("error", (...a) => errors.push("console.error: " + a.join(" ")));

    const dom = new JSDOM(inlineAssets(file), {
      url: "http://localhost/" + page,
      runScripts: "dangerously",
      pretendToBeVisual: true,
      virtualConsole: vc,
      beforeParse(window) {
        // jsdom 30 ships no matchMedia; ui-prefs.js needs it for theme/motion
        if (!window.matchMedia) {
          window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
        }
        window.addEventListener("error", (e) => errors.push("page error: " + e.message));
        if (seed) seed(window.localStorage);
      },
    });

    await new Promise((resolve) => {
      dom.window.addEventListener("load", () => setTimeout(resolve, 150));
      setTimeout(resolve, 5000); // load never fired — errors will say why
    });

    // jsdom has no layout/CSS parser for everything; ignore its css noise
    const real = errors.filter((e) => !/Could not parse CSS/.test(e));
    assert(real.length === 0, `errors on ${page}:\n    ` + real.join("\n    "));
    try {
      checks(dom.window);
    } catch (e) {
      assert(false, `checks threw on ${page}: ${e.message}`);
    }
    dom.window.close();
  }

  if (failures) {
    console.error(`\n${failures} smoke failure(s)`);
    process.exit(1);
  }
  console.log("\nall pages boot clean");
})();
