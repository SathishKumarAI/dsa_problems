// Stack explorer — journey content: the NEED (undo), the mechanics (LIFO
// push/pop), then the classic application (balanced brackets). Data is an
// array of bracket characters; every act reads the same input. DOM-free at
// load; playback lives in ../problems/journey.js.

const OPENS = { "(": ")", "[": "]", "{": "}" };
const isOpen = (c) => c in OPENS;

function* runStory(chars) {
  yield { hold: 3, noChips: true, note: "You're typing in an editor and hit Ctrl+Z. The editor must undo the MOST RECENT edit — not the first one, not a random one. Whatever remembers those edits needs one superpower: give back the LAST thing it was given." };
  yield { hold: 3, noChips: true, note: "That discipline has a name: LIFO — last in, first out. A stack is nothing but an array you promise to touch only at one end. The promise is the structure." };
  yield { hold: 3, note: `Here's a stream of events arriving in order — ${chars.length} of them. Watch what 'only touch the top' buys us.` };
}

function* runOps(chars) {
  const stack = [];
  for (let i = 0; i < chars.length; i++) {
    stack.push(chars[i]);
    yield { line: 1, i, stack: stack.slice(), op: "push", note: `push '${chars[i]}' — it lands on TOP of everything before it` };
  }
  yield { hold: 2, line: 2, i: chars.length - 1, stack: stack.slice(), note: `peek: the top is '${stack[stack.length - 1]}' — the LAST thing pushed. O(1), no searching.` };
  while (stack.length) {
    const c = stack.pop();
    yield { line: 3, stack: stack.slice(), op: "pop", note: `pop → '${c}' — exactly reverse arrival order. That reversal IS the stack's gift.` };
  }
  yield { hold: 2, line: 4, stack: [], note: "empty again. Push n, pop n: everything comes back mirrored. Undo, back-buttons, call stacks — all this one move." };
}

function* runBrackets(chars) {
  const stack = [];
  yield { hold: 2, line: 0, stack: [], note: "the classic use: are these brackets balanced? Openers wait on the stack; each closer must match the MOST RECENT opener — a LIFO problem by nature." };
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (isOpen(c)) {
      stack.push(c);
      yield { line: 2, i, stack: stack.slice(), note: `'${c}' opens — push it and keep reading` };
    } else {
      const top = stack[stack.length - 1];
      if (top && OPENS[top] === c) {
        stack.pop();
        yield { line: 4, i, stack: stack.slice(), note: `'${c}' closes '${top}' — the top matches, pop it. The nesting resolves inside-out.` };
      } else {
        yield { hold: 3, line: 5, i, stack: stack.slice(), fail: i, note: top ? `'${c}' arrived but the top is '${top}' — wrong closer. Unbalanced, stop here.` : `'${c}' arrived with an EMPTY stack — nothing to close. Unbalanced.` };
        return;
      }
    }
  }
  if (stack.length) {
    yield { hold: 3, line: 6, stack: stack.slice(), note: `input ended but ${stack.length} opener(s) still wait unclosed: ${stack.join(" ")}. Unbalanced.` };
  } else {
    yield { hold: 3, line: 6, stack: [], answer: chars.map((_, k) => k), note: "input done, stack empty — every opener met its closer in the right order. Balanced ✓" };
  }
}

const ACT_ORDER = ["story", "ops", "app"];

const RESOURCES = [
  { label: "LeetCode 20: Valid Parentheses", url: "https://leetcode.com/problems/valid-parentheses/" },
  { label: "GeeksforGeeks: stack", url: "https://www.geeksforgeeks.org/dsa/stack-data-structure/" },
];

function stackPanel(stack, label = "the stack (right end = top)") {
  return (
    `<div class="panel-label">${label}</div>` +
    `<div class="chip-row">${
      stack.length
        ? chipRow(stack, { anchor: new Set([stack.length - 1]) })
        : `<span class="map-chip">empty</span>`
    }</div>`
  );
}

const APPROACHES = {
  story: {
    name: "The Need",
    short: "start here",
    complexity: "no code yet — just the promise",
    insight: "",
    idea: "Before the name 'stack': feel the need. Undo buttons, browser back, function calls — all demand the same thing: give me back the LAST thing that happened. One array + one promise (touch only the top) delivers it in O(1).",
    pseudocode: [
      "need: give back the MOST RECENT thing",
      "structure: an array, touched only at one end",
      "push(x): put x on top      # O(1)",
      "pop(): remove + return top # O(1)",
    ],
    python: null,
    takeaways: [
      "a structure is a PROMISE about how you'll touch memory, not a new kind of memory",
      "LIFO = last in, first out — the discipline undo/back/calls all share",
      "restricting yourself to the top is what makes both operations O(1)",
    ],
    run: runStory,
    render(f, els, data) {
      if (f.noChips) {
        els.array.innerHTML = "";
        els.panel.innerHTML = `<div class="story-scene">⌨️ → ↩️ → 🤔</div>`;
        return;
      }
      els.array.innerHTML = chipRow(data.nums);
      els.panel.innerHTML = "";
    },
  },

  ops: {
    name: "Push & Pop",
    short: "the mechanics",
    complexity: "push O(1) · pop O(1) · peek O(1)",
    insight: "Touch only the top, and every operation is constant time.",
    idea: "Watch the input stream flow onto the stack and back off. Nothing is ever searched, shifted or scanned — the top is always just… there. Pop order is the mirror of push order; that reversal is the whole trick.",
    pseudocode: [
      "stack = []",
      "push(x): stack.append(x)",
      "peek(): stack[-1]",
      "pop(): stack.remove_last()",
      "empty when len == 0",
    ],
    python: [
      "stack = []",
      "stack.append(x)",
      "top = stack[-1]",
      "x = stack.pop()",
      "done = len(stack) == 0",
    ],
    takeaways: [
      "push then pop everything = the sequence comes back reversed",
      "no operation ever looks below the top — that's why nothing is O(n)",
      "an array IS a stack the moment you promise to only use one end",
    ],
    run: runOps,
    render(f, els, data) {
      const dim = new Set();
      const focus = new Set();
      if (f.i !== undefined) {
        for (let k = 0; k < f.i; k++) dim.add(k);
        if (f.op === "push") focus.add(f.i);
      }
      els.array.innerHTML = chipRow(data.nums, { dim, focus });
      els.panel.innerHTML = stackPanel(f.stack || []);
    },
  },

  app: {
    name: "Balanced Brackets",
    short: "use it",
    complexity: "O(n) time · O(n) space — LeetCode 20",
    insight: "Each closer must match the MOST RECENT opener — nesting is LIFO by nature.",
    idea: "Read left to right. Openers wait on the stack; a closer must match the top (the most recent unclosed opener) or the input is unbalanced. Balanced = input ends AND the stack is empty — both halves of that check matter.",
    pseudocode: [
      "stack = []",
      "for each char c:",
      "  if c opens: push c",
      "  else:",
      "    if top matches c: pop",
      "    else: unbalanced ✗",
      "balanced iff stack ends empty",
    ],
    python: [
      "stack = []",
      "for c in s:",
      "    if c in '([{': stack.append(c)",
      "    else:",
      "        if stack and MATCH[stack[-1]] == c: stack.pop()",
      "        else: return False",
      "return len(stack) == 0",
    ],
    takeaways: [
      "balanced needs BOTH checks: no bad closer mid-stream AND an empty stack at the end",
      "'([)]' defeats any counter — only the stack remembers WHICH opener is unclosed",
      "whenever 'most recent unfinished thing' decides what happens next, reach for a stack",
    ],
    quiz: [
      {
        q: "Input ended and the stack still holds '(' — balanced?",
        choices: ["yes — every closer matched", "no — an opener was never closed", "depends on the opener"],
        answer: 1,
        explain: "Balanced needs BOTH: no bad closer along the way AND an empty stack at the end. '((' fails only the second check.",
      },
      {
        q: "Why a stack and not a counter?",
        choices: ["a counter can't go negative", "a counter loses WHICH opener is unclosed — '([)]' fools it", "stacks are faster"],
        answer: 1,
        explain: "'([)]' has matching counts but wrong nesting. Only the stack remembers the ORDER of unclosed openers.",
      },
    ],
    run: runBrackets,
    render(f, els, data) {
      const dim = new Set();
      const focus = new Set(f.fail !== undefined ? [] : f.i !== undefined ? [f.i] : []);
      const answer = new Set(f.answer || []);
      if (f.i !== undefined) for (let k = 0; k < f.i; k++) dim.add(k);
      if (f.fail !== undefined) focus.add(f.fail);
      els.array.innerHTML = chipRow(data.nums, { dim, focus, answer });
      els.panel.innerHTML = stackPanel(f.stack || [], "waiting openers (top = most recent)");
    },
  },
};

// ---------- page config ----------

function makeBrackets(balanced) {
  const opens = Object.keys(OPENS);
  const build = (depth) => {
    if (depth <= 0 || Math.random() < 0.3) return "";
    const o = opens[randInt(0, 2)];
    return o + build(depth - 1) + OPENS[o] + (Math.random() < 0.5 ? build(depth - 1) : "");
  };
  let s = "";
  while (s.length < 4 || s.length > 12) s = build(3);
  if (!balanced) {
    const i = randInt(1, s.length - 1);
    s = s.slice(0, i) + (Math.random() < 0.5 ? ")" : s.slice(i + 1) ? "" : "(") + s.slice(i + 1);
    if (s.length < 2) s = "([)]";
  }
  return { nums: s.split("") };
}

const PAGE = {
  presets: {
    balanced: { make: () => makeBrackets(true) },
    broken: {
      make: () => makeBrackets(false),
      info: "Something is off in this one — watch the stack catch the exact character where nesting breaks.",
    },
    sneaky: {
      make: () => ({ nums: "([)]".split("") }),
      info: "The counter-fooler: counts match, order doesn't. Only the stack sees it.",
    },
    unclosed: {
      make: () => ({ nums: "({[]}".split("") }),
      info: "No bad closer anywhere — but the end-of-input check still says unbalanced.",
    },
  },
  classify: (d) => (d.nums.every((c) => "()[]{}".includes(c)) ? { ok: true } : { ok: false, warning: "Only brackets ()[]{} make sense here — other characters are ignored by no one and confuse everyone." }),
  describe: (d) => d.nums.join(""),
  parseCustom: (text) => {
    const nums = text.split("").filter((c) => "()[]{}".includes(c));
    return nums.length ? { nums } : null;
  },
};

// ---------- schema v2 ----------

const PROBLEM = {
  slug: "stack",
  title: "Stack",
  kind: "structure",
  approaches: APPROACHES,
  actOrder: ACT_ORDER,
  resources: RESOURCES,
  page: PAGE,
  challenge: null,
  sample: { nums: "([])".split("") },
};
