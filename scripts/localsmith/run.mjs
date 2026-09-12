// Differential runner (backlog B27): execute every Java and C++ block against
// the repo's own Python and compare the answers.
//
// The oracle is the Python that already ships. It is human-written, reviewed,
// and rendered on the page as the reference solution — so if a translation
// disagrees with it, one of the two is wrong and both are worth looking at.
// Nothing here hand-writes an expected value; vectors.mjs carries inputs only.
//
// Marshalling is done by emitting the arguments as LITERALS into a generated
// driver, rather than parsing JSON in three languages. The driver prints the
// answer in one canonical text form, and the three strings are compared.
//
// ONE DRIVER PER BLOCK, NOT PER CASE (B31). Every case for a rung goes into a
// single driver that prints one line each, so a block is compiled and launched
// once instead of once per case. That is ~4x fewer compiles, and it removes the
// Windows "refused to launch a freshly built .exe" flake that made this gate
// report a different number every run — 28 refusals one day, 66 the next.
// Isolation is kept by the driver rather than by the process: each case is
// wrapped in its own try/catch and prints "!ERROR ..." on the way out, and a
// process that dies outright still hands back the lines it flushed, so a crash
// is attributed to the case that caused it instead of hiding the rest.
//
// The one thing per-process isolation did better: a HARD crash (a C++ stack
// overflow is a crash, not an exception) also costs the cases queued behind it.
// They are reported as "!ERROR process died", never silently passed — and a
// crash is a finding in its own right — so the trade is a louder failure, not a
// quieter one. Measured: 7m17s and 508 builds became 1m38s and 120.
//
// Run:  node scripts/localsmith/run.mjs
//       node scripts/localsmith/run.mjs --id best-trade
//       node scripts/localsmith/run.mjs --keep      # leave the drivers on disk

import { execFileSync } from "node:child_process"
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { PROBLEMS } from "../../src/data/index.ts"
import { NOT_YET_RUNNABLE, VECTORS } from "./vectors.mjs"
import { NODES, toolchain } from "./verify.mjs"

const arg = (k, d) => {
  const i = process.argv.indexOf(k)
  return i > -1 ? (process.argv[i + 1] ?? true) : d
}
const has = (k) => process.argv.includes(k)

/** Windows virus scanning holds a lock on a just-written .exe, which surfaces
 *  as an UNKNOWN spawn error. Retrying briefly is the difference between a
 *  flaky gate and a useful one. */
function runExe(cmd, args, opts) {
  let last
  for (let t = 0; t < 4; t++) {
    try {
      return execFileSync(cmd, args, opts)
    } catch (e) {
      last = e
      if (!/UNKNOWN|EBUSY|EPERM|ETXTBSY/.test(String(e.message ?? e))) throw e
      // a real blocking sleep: the retry is pointless if it does not wait
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 300)
    }
  }
  throw last
}

/** run a driver and split its stdout into one line per case.
 *
 *  A C++ stack overflow is a crash, not an exception, so the process can die
 *  with some cases already printed. execFileSync still carries that output on
 *  the error, so read it: the lines that are missing name the case that killed
 *  the process, instead of the whole block reporting nothing. */
export function caseLines(run, n) {
  let out = ""
  let err = null
  try {
    out = run().toString()
  } catch (e) {
    out = String(e.stdout ?? "")
    // an empty stderr is an empty Buffer, and a Buffer is always truthy —
    // read it, then fall back to the spawn error itself
    err = String(e.stderr ?? "").trim() || String(e.message ?? e)
  }
  const lines = out.split(/\r?\n/)
  while (lines.length && lines.at(-1) === "") lines.pop()
  const why = err
    ? `!ERROR process died: ${err.slice(-140).replace(/\s+/g, " ")}`
    : "!ERROR no output for this case"
  while (lines.length < n) lines.push(why)
  return { lines, err }
}

// ---------- finding the entry point ----------

/** top-level definitions in a C-family block, as {name, text} */
function cDefs(src) {
  const out = []
  let depth = 0
  let start = 0
  for (let i = 0; i < src.length; i++) {
    if (src[i] === "{") depth++
    else if (src[i] === "}") {
      depth--
      if (depth === 0) {
        const text = src.slice(start, i + 1)
        const name = text.match(
          /([A-Za-z_]\w*)\s*\([^)]*\)\s*(?:const\s*)?\{/
        )?.[1]
        if (name) out.push({ name, text })
        start = i + 1
      }
    }
  }
  return out
}

/** python top-level defs */
function pyDefs(src) {
  const out = []
  const lines = src.split("\n")
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^def ([A-Za-z_]\w*)/)
    if (m) out.push({ name: m[1], at: i })
  }
  return out
}

/** the definition nobody else calls — the way in */
function entry(defs, srcOf) {
  if (defs.length === 1) return defs[0].name
  const called = new Set()
  for (const d of defs)
    for (const o of defs)
      if (o !== d && new RegExp(`\\b${o.name}\\s*\\(`).test(srcOf(d)))
        called.add(o.name)
  const roots = defs.filter((d) => !called.has(d.name))
  return (roots.at(-1) ?? defs.at(-1)).name
}

export const pyEntry = (src) => {
  const defs = pyDefs(src)
  if (!defs.length) return null
  const lines = src.split("\n")
  const bodyOf = (d) => {
    const next = defs.find((o) => o.at > d.at)
    return lines.slice(d.at, next ? next.at : lines.length).join("\n")
  }
  return entry(defs, bodyOf)
}
const cEntry = (src) => {
  const defs = cDefs(src)
  return defs.length ? entry(defs, (d) => d.text) : null
}

// ---------- literals ----------

/** a `list` argument is a row of ints, or `{list, cycle}` when the tail has to
 *  point back at index `cycle`. cycle-detect's input is a SHAPE rather than a
 *  value — the function takes one argument and the cycle is how it was built,
 *  so the construction detail rides along with the row instead of pretending
 *  to be a second parameter. */
const listOf = (v) =>
  Array.isArray(v)
    ? { cells: v, cycle: -1 }
    : { cells: v.list, cycle: v.cycle ?? -1 }

/** the node class the block's OWN signature names. This repo's Python calls a
 *  linked-list node `Node` and LeetCode calls it `ListNode`; both are declared
 *  (verify.mjs `NODES`) and different rungs of the same problem use different
 *  ones — reverse-list says Node, cycle-detect says ListNode. */
const nodeClass = (declared, fallback) =>
  /\b(Node|ListNode|TreeNode)\b/.exec(declared ?? "")?.[1] ?? fallback

/** level order, with an absent child spelled the way each language spells it */
const treeLit = {
  python: (a) => a.map((x) => (x === null ? "None" : String(x))).join(","),
  java: (a) => a.map((x) => (x === null ? "null" : String(x))).join(","),
  // C++ cannot put a null in a vector<int>, so an absent child is INT_MIN —
  // no problem in the set carries it as a value
  cpp: (a) => a.map((x) => (x === null ? "INT_MIN" : String(x))).join(","),
}

const lit = {
  python: (v, t) => {
    if (t === "list") {
      const { cells, cycle } = listOf(v)
      return `__mklist(${JSON.stringify(cells)}, ${cycle})`
    }
    if (t === "tree") return `__mktree([${treeLit.python(v)}])`
    return JSON.stringify(v)
  },
  java: (v, t, cls) => {
    if (t === "int") return String(v)
    if (t === "string") return JSON.stringify(v)
    if (t === "int[]") return `new int[]{${v.join(",")}}`
    if (t === "int[][]")
      return `new int[][]{${v.map((r) => `{${r.join(",")}}`).join(",")}}`
    if (t === "string[]")
      return `new String[]{${v.map((s) => JSON.stringify(s)).join(",")}}`
    if (t === "list") {
      const { cells, cycle } = listOf(v)
      return `__mk${cls}(new int[]{${cells.join(",")}}, ${cycle})`
    }
    if (t === "tree") return `__mkTree(new Integer[]{${treeLit.java(v)}})`
    throw new Error(`java literal for ${t}`)
  },
  cpp: (v, t, cls) => {
    if (t === "int") return String(v)
    if (t === "string") return JSON.stringify(v)
    if (t === "int[]") return `{${v.join(",")}}`
    if (t === "int[][]")
      return `{${v.map((r) => `{${r.join(",")}}`).join(",")}}`
    if (t === "string[]")
      return `{${v.map((s) => JSON.stringify(s)).join(",")}}`
    if (t === "list") {
      const { cells, cycle } = listOf(v)
      return `__mklist<${cls}>({${cells.join(",")}}, ${cycle})`
    }
    if (t === "tree") return `__mktree<${cls}>({${treeLit.cpp(v)}})`
    throw new Error(`cpp literal for ${t}`)
  },
}

// C++ argument types must be spelled out, because a literal alone is ambiguous.
// A structural argument is a pointer to whatever the block called its node, so
// it is resolved per block (`cppDecl`) rather than looked up here.
const CPP_TYPE = {
  int: "int",
  string: "string",
  "int[]": "vector<int>",
  "int[][]": "vector<vector<int>>",
  "string[]": "vector<string>",
}

/** the parameter types the block actually declares, e.g. `int[][]` against
 *  `List<List<Integer>>`, or `const TreeNode*` against `TreeNode*` */
function paramTypes(block, fn) {
  const sig = block.match(new RegExp(`\\b${fn}\\s*\\(([^)]*)\\)`))
  if (!sig) return null
  return sig[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/\s+\w+$/, "").trim())
}

// ---------- drivers ----------

export const PY_NODES = `
# A block is free to declare its own node class and most do; the three that
# CONSTRUCT one without declaring it (reverse-list's array rung, two merge
# rungs) would raise NameError with no scaffolding at all. Declared only when
# absent, so a block's own class always wins.
try: Node
except NameError:
    class Node:
        def __init__(self, val=0, next=None): self.val, self.next = val, next
try: ListNode
except NameError:
    class ListNode:
        def __init__(self, val=0, next=None): self.val, self.next = val, next
try: TreeNode
except NameError:
    class TreeNode:
        def __init__(self, val=0, left=None, right=None):
            self.val, self.left, self.right = val, left, right

# What the driver BUILDS with is private, because Python is duck-typed: every
# block walks .val/.next or .val/.left/.right and none of them checks a type.
class __LN:
    def __init__(self, v): self.val, self.next = v, None

class __TN:
    def __init__(self, v): self.val, self.left, self.right = v, None, None

def __mklist(vals, cyc=-1):
    if not vals: return None
    ns = [__LN(v) for v in vals]
    for a, b in zip(ns, ns[1:]): a.next = b
    if cyc >= 0: ns[-1].next = ns[cyc]
    return ns[0]

def __mktree(vals):
    if not vals or vals[0] is None: return None
    root = __TN(vals[0]); q = [root]; i = 0; k = 1
    while i < len(q) and k < len(vals):
        node = q[i]; i += 1
        if k < len(vals):
            x = vals[k]; k += 1
            if x is not None: node.left = __TN(x); q.append(node.left)
        if k < len(vals):
            x = vals[k]; k += 1
            if x is not None: node.right = __TN(x); q.append(node.right)
    return root
`

export const PY_CANON = `
def __canon_list(h):
    out = []
    while h is not None:
        if len(out) > 10000: return "!CYCLE"
        out.append(str(h.val)); h = h.next
    return "[" + ",".join(out) + "]"

def __canon_tree(t):
    out = []; q = [t]; i = 0
    while i < len(q) and len(q) < 4096:
        n = q[i]; i += 1
        if n is None:
            out.append("null"); continue
        out.append(str(n.val)); q.append(n.left); q.append(n.right)
    while out and out[-1] == "null": out.pop()
    return "[" + ",".join(out) + "]"

def __canon(v):
    if isinstance(v, bool): return "true" if v else "false"
    if isinstance(v, str): return v
    if v is None: return "null"
    if isinstance(v, (list, tuple)):
        return "[" + ",".join(__canon(x) for x in v) + "]"
    # a tree first: a TreeNode has no .next, but a node with .left is never a list
    if hasattr(v, "left") or hasattr(v, "right"): return __canon_tree(v)
    if hasattr(v, "next"): return __canon_list(v)
    return str(v)
`

/** a python literal for one argument of the named shape — the docs generator
 *  emits the same cases into its runnable script (scripts/gen-explained.mjs) */
export const pyLit = (v, t) => lit.python(v, t)

/** one line per case. The try/except is what per-process isolation used to buy:
 *  a case that raises still lets the next one run, and names itself. */
export function pythonDriver(src, fn, cases, params = []) {
  const body = cases
    .map((args) => {
      const call = `${fn}(${args
        .map((v, i) => lit.python(v, params[i]))
        .join(", ")})`
      return [
        `try:`,
        `    print(__canon(${call}).replace("\\n", "\\\\n"))`,
        `except BaseException as __e:`,
        `    print("!ERROR " + str(__e).replace("\\n", " "))`,
      ].join("\n")
    })
    .join("\n")
  return `${PY_NODES}\n${src}\n${PY_CANON}\n${body}\n`
}

const JAVA_PRINT = `
    static String canon(Object o) {
        if (o == null) return "null";
        if (o instanceof int[] a) {
            StringBuilder b = new StringBuilder("[");
            for (int i = 0; i < a.length; i++) { if (i > 0) b.append(","); b.append(a[i]); }
            return b.append("]").toString();
        }
        if (o instanceof int[][] a) {
            StringBuilder b = new StringBuilder("[");
            for (int i = 0; i < a.length; i++) { if (i > 0) b.append(","); b.append(canon(a[i])); }
            return b.append("]").toString();
        }
        if (o instanceof Object[] a) {
            StringBuilder b = new StringBuilder("[");
            for (int i = 0; i < a.length; i++) { if (i > 0) b.append(","); b.append(canon(a[i])); }
            return b.append("]").toString();
        }
        if (o instanceof java.util.Collection<?> c) {
            StringBuilder b = new StringBuilder("[");
            boolean first = true;
            for (Object x : c) { if (!first) b.append(","); first = false; b.append(canon(x)); }
            return b.append("]").toString();
        }
        if (o instanceof Node n) {
            StringBuilder b = new StringBuilder("[");
            int guard = 0;
            for (Node c = n; c != null; c = c.next) {
                if (++guard > 10000) return "!CYCLE";
                if (guard > 1) b.append(",");
                b.append(c.val);
            }
            return b.append("]").toString();
        }
        if (o instanceof ListNode n) {
            StringBuilder b = new StringBuilder("[");
            int guard = 0;
            for (ListNode c = n; c != null; c = c.next) {
                if (++guard > 10000) return "!CYCLE";
                if (guard > 1) b.append(",");
                b.append(c.val);
            }
            return b.append("]").toString();
        }
        if (o instanceof TreeNode t) {
            // level order with the absent children spelled out, trailing nulls
            // trimmed — the same shape the vectors are written in
            java.util.List<TreeNode> q = new java.util.LinkedList<>();
            java.util.List<String> out = new java.util.ArrayList<>();
            q.add(t);
            for (int i = 0; i < q.size() && q.size() < 4096; i++) {
                TreeNode n = q.get(i);
                if (n == null) { out.add("null"); continue; }
                out.add(String.valueOf(n.val));
                q.add(n.left); q.add(n.right);
            }
            while (!out.isEmpty() && out.get(out.size() - 1).equals("null")) out.remove(out.size() - 1);
            return "[" + String.join(",", out) + "]";
        }
        return String.valueOf(o);
    }
`

/** Java has no template, so a builder per list class. Node and ListNode carry
 *  the same two fields and different rungs of the same problem name different
 *  ones, so both are emitted and the block's own signature picks. */
const javaList = (cls) => `
    static ${cls} __mk${cls}(int[] v, int cyc) {
        if (v.length == 0) return null;
        ${cls}[] n = new ${cls}[v.length];
        for (int i = 0; i < v.length; i++) n[i] = new ${cls}(v[i]);
        for (int i = 0; i + 1 < v.length; i++) n[i].next = n[i + 1];
        if (cyc >= 0) n[v.length - 1].next = n[cyc];
        return n[0];
    }
`

const JAVA_BUILD = `${javaList("Node")}${javaList("ListNode")}
    static TreeNode __mkTree(Integer[] v) {
        if (v.length == 0 || v[0] == null) return null;
        TreeNode root = new TreeNode(v[0]);
        java.util.List<TreeNode> q = new java.util.ArrayList<>();
        q.add(root);
        int k = 1;
        for (int i = 0; i < q.size() && k < v.length; i++) {
            TreeNode node = q.get(i);
            if (k < v.length) { Integer x = v[k++]; if (x != null) { node.left = new TreeNode(x); q.add(node.left); } }
            if (k < v.length) { Integer x = v[k++]; if (x != null) { node.right = new TreeNode(x); q.add(node.right); } }
        }
        return root;
    }
`

/** a literal in whatever shape the block asked for */
function javaArg(v, want, declared) {
  if (/List<List</.test(declared))
    return `new ArrayList<>(List.of(${v
      .map((r) => `List.of(${r.join(",")})`)
      .join(",")}))`
  if (/List</.test(declared)) return `new ArrayList<>(List.of(${v.join(",")}))`
  return lit.java(v, want, nodeClass(declared, want === "tree" ? "TreeNode" : "ListNode"))
}

export function javaDriver(nodes, block, fn, cases, params) {
  const isStatic = new RegExp(`static\\s[^;{]*\\b${fn}\\s*\\(`).test(block)
  const declared = paramTypes(block, fn) ?? []
  // Throwable, not Exception: the flood fill B27 caught blew the stack on a
  // 1x1 grid, and a StackOverflowError is an Error.
  const body = cases
    .map((args) => {
      const call = `${isStatic ? "" : "new Solution()."}${fn}(${args
        .map((v, i) => javaArg(v, params[i], declared[i] ?? params[i]))
        .join(", ")})`
      return [
        `        try { System.out.println(canon(${call}).replace("\\n", "\\\\n")); }`,
        `        catch (Throwable __t) { System.out.println("!ERROR " + String.valueOf(__t).replace("\\n", " ")); }`,
      ].join("\n")
    })
    .join("\n")
  return `import java.util.*;
import java.util.function.*;
import java.util.stream.*;

${nodes}
public class Solution {
${block
  .split("\n")
  .map((l) => (l.trim() ? "    " + l : l))
  .join("\n")}
${JAVA_PRINT}${JAVA_BUILD}    public static void main(String[] a) {
${body}
    }
}
`
}

const CPP_PRINT = `
static string canon(int v) { return to_string(v); }
static string canon(long long v) { return to_string(v); }
static string canon(bool v) { return v ? "true" : "false"; }
static string canon(const string& v) { return v; }
template <class T> static string canon(const vector<T>& v) {
    string s = "[";
    for (size_t i = 0; i < v.size(); i++) { if (i) s += ","; s += canon(v[i]); }
    return s + "]";
}
template <class N> static string __canonList(const N* h) {
    if (!h) return "null";
    string s = "[";
    int guard = 0;
    for (const N* c = h; c; c = c->next) {
        if (++guard > 10000) return "!CYCLE";
        if (guard > 1) s += ",";
        s += to_string(c->val);
    }
    return s + "]";
}
static string canon(const Node* h) { return __canonList(h); }
static string canon(const ListNode* h) { return __canonList(h); }
/** level order with the absent children spelled out and trailing nulls
 *  trimmed — the same shape the vectors are written in */
static string canon(const TreeNode* t) {
    if (!t) return "null";
    vector<const TreeNode*> q{t};
    vector<string> out;
    for (size_t i = 0; i < q.size() && q.size() < 4096; i++) {
        const TreeNode* n = q[i];
        if (!n) { out.push_back("null"); continue; }
        out.push_back(to_string(n->val));
        q.push_back(n->left);
        q.push_back(n->right);
    }
    while (!out.empty() && out.back() == "null") out.pop_back();
    string s = "[";
    for (size_t i = 0; i < out.size(); i++) { if (i) s += ","; s += out[i]; }
    return s + "]";
}
/** a value carrying a newline would silently shift every later case up a line */
static string __esc(const string& s) {
    string o;
    for (char c : s) { if (c == '\\n') o += "\\\\n"; else o += c; }
    return o;
}
`

// C++ has templates, so one builder covers Node and ListNode both. `cyc` is the
// index the tail points back at, or -1 for a list that ends.
const CPP_BUILD = `
template <class N> static N* __mklist(const vector<int>& v, int cyc) {
    if (v.empty()) return nullptr;
    vector<N*> n;
    for (int x : v) n.push_back(new N(x));
    for (size_t i = 0; i + 1 < n.size(); i++) n[i]->next = n[i + 1];
    if (cyc >= 0) n.back()->next = n[cyc];
    return n[0];
}

template <class N> static N* __mktree(const vector<int>& v) {
    if (v.empty() || v[0] == INT_MIN) return nullptr;
    N* root = new N(v[0]);
    vector<N*> q{root};
    size_t k = 1;
    for (size_t i = 0; i < q.size() && k < v.size(); i++) {
        N* node = q[i];
        if (k < v.size()) { int x = v[k++]; if (x != INT_MIN) { node->left = new N(x); q.push_back(node->left); } }
        if (k < v.size()) { int x = v[k++]; if (x != INT_MIN) { node->right = new N(x); q.push_back(node->right); } }
    }
    return root;
}
`

export function cppDriver(headers, nodes, block, fn, cases, params) {
  const declared = paramTypes(block, fn) ?? []
  const cls = (i) =>
    nodeClass(declared[i], params[i] === "tree" ? "TreeNode" : "ListNode")
  // a structural argument is a pointer to the block's own node type; everything
  // else has one spelling, which is what CPP_TYPE holds
  const cType = (i) =>
    params[i] === "list" || params[i] === "tree"
      ? `${cls(i)}*`
      : CPP_TYPE[params[i]]
  // each case gets its own scope, so nothing a block mutates leaks sideways
  const body = cases
    .map((args, k) => {
      const decls = args.map(
        (v, i) =>
          `        ${cType(i)} a${k}_${i} = ${lit.cpp(v, params[i], cls(i))};`
      )
      const call = `${fn}(${args.map((_, i) => `a${k}_${i}`).join(", ")})`
      return [
        `    {`,
        decls.join("\n"),
        `        try { cout << __esc(canon(${call})) << endl; }`,
        `        catch (...) { cout << "!ERROR c++ threw" << endl; }`,
        `    }`,
      ].join("\n")
    })
    .join("\n")
  return `${headers}
${nodes}
${CPP_BUILD}
${block}
${CPP_PRINT}
int main() {
${body}
    return 0;
}
`
}

// ---------- a rung that is a CLASS, not a function (B62) ----------
//
// Some problems are a constructor plus a stream of calls, and this driver calls
// ONE entry point with a row of literals. The shape that fits both: a case is
// the constructor's arguments followed by the stream, and the ANSWER is the row
// of results — so a stateful rung still prints exactly one line per case and
// every comparison below works unchanged.
//
//   cases: [[3, [4, 5, 8, 2], [3, 5, 10, 9, 4]]]
//           ^ ctor args        ^ the stream       -> "[4,5,5,8,8]"

export function pythonClassDriver(src, spec, cases) {
  const body = cases
    .map((c) => {
      const args = spec.ctor.map((t, i) => lit.python(c[i], t)).join(", ")
      const stream = JSON.stringify(c[spec.ctor.length])
      return [
        `try:`,
        `    __o = ${spec.klass}(${args})`,
        `    print(__canon([__o.${spec.method}(__x) for __x in ${stream}]))`,
        `except BaseException as __e:`,
        `    print("!ERROR " + str(__e).replace("\\n", " "))`,
      ].join("\n")
    })
    .join("\n")
  return `${PY_NODES}\n${src}\n${PY_CANON}\n${body}\n`
}

export function javaClassDriver(nodes, block, spec, cases) {
  // a `public class` cannot share a file with `public class Solution`, and a
  // plain member class cannot be built from a static main — so it is nested
  // static. The block on screen is untouched; this is the driver's business.
  const nested = block.replace(/\bpublic\s+class\b/, "static class")
  const body = cases
    .map((c, k) => {
      const args = spec.ctor
        .map((v, i) => lit.java(c[i], v, "ListNode"))
        .join(", ")
      const stream = c[spec.ctor.length]
      return [
        `        try {`,
        `            ${spec.klass} o${k} = new ${spec.klass}(${args});`,
        `            int[] s${k} = new int[]{${stream.join(",")}};`,
        `            StringBuilder b${k} = new StringBuilder("[");`,
        `            for (int i = 0; i < s${k}.length; i++) { if (i > 0) b${k}.append(","); b${k}.append(o${k}.${spec.method}(s${k}[i])); }`,
        `            System.out.println(b${k}.append("]").toString());`,
        `        } catch (Throwable __t) { System.out.println("!ERROR " + String.valueOf(__t)); }`,
      ].join("\n")
    })
    .join("\n")
  return `import java.util.*;
import java.util.function.*;
import java.util.stream.*;

${nodes}
public class Solution {
${nested
  .split("\n")
  .map((l) => (l.trim() ? "    " + l : l))
  .join("\n")}
    public static void main(String[] a) {
${body}
    }
}
`
}

export function cppClassDriver(headers, nodes, block, spec, cases) {
  const body = cases
    .map((c, k) => {
      const args = spec.ctor.map((v, i) => lit.cpp(c[i], v, "ListNode")).join(", ")
      const stream = c[spec.ctor.length]
      return [
        `    {`,
        `        try {`,
        `            ${spec.klass} o(${args});`,
        `            vector<int> s = {${stream.join(",")}};`,
        `            string out = "[";`,
        `            for (size_t i = 0; i < s.size(); i++) { if (i) out += ","; out += to_string(o.${spec.method}(s[i])); }`,
        `            cout << out + "]" << endl;`,
        `        } catch (...) { cout << "!ERROR c++ threw" << endl; }`,
        `    }`,
      ].join("\n")
    })
    .join("\n")
  return `${headers}
${nodes}
${block}
int main() {
${body}
    return 0;
}
`
}

// ---------- comparison ----------

/** sort the elements of a one- or two-level list so order stops mattering */
function normalise(text, unordered) {
  if (!unordered) return text
  const inner = text.slice(1, -1)
  if (!inner) return text
  const parts = []
  let depth = 0
  let cur = ""
  for (const c of inner) {
    if (c === "[") depth++
    if (c === "]") depth--
    if (c === "," && depth === 0) {
      parts.push(cur)
      cur = ""
    } else cur += c
  }
  parts.push(cur)
  return "[" + parts.sort().join(",") + "]"
}

// ---------- the run ----------

function main() {
  const tools = toolchain()
  const python = (() => {
    for (const c of ["python", "python3", "py"]) {
      try {
        execFileSync(c, ["--version"], { stdio: "pipe" })
        return c
      } catch {
        /* next */
      }
    }
    return null
  })()
  if (!python) {
    console.error(
      "\n  RUN SKIPPED — no python on PATH; it is the oracle here.\n"
    )
    return
  }
  if (!tools.java && !tools.cpp) {
    console.error("\n  RUN SKIPPED — no javac and no g++.\n")
    return
  }

  const dir = mkdtempSync(join(tmpdir(), "dsa-run-"))
  // reuse verify.mjs's scaffolding so the two gates agree on what a block may assume
  const headers = `#include <algorithm>
#include <cctype>
#include <climits>
#include <cmath>
#include <deque>
#include <functional>
#include <iostream>
#include <limits>
#include <map>
#include <numeric>
#include <queue>
#include <set>
#include <stack>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <utility>
#include <vector>
using namespace std;`

  const only = arg("--id")
  const failures = []
  const unrunnable = []
  // a rung the driver could not find a way into. It used to `continue` in
  // silence, which reads exactly like a rung that passed.
  const noEntry = []
  let seq = 0
  let ran = 0
  let compared = 0
  let compiles = 0

  for (const p of PROBLEMS) {
    if (only && p.id !== only) continue
    const spec = VECTORS[p.id]
    if (!spec) continue
    const rungs = [
      { key: "optimal", code: p },
      ...(p.alternatives ?? []).map((a) => ({ key: a.name, code: a })),
    ]
    for (const r of rungs) {
      const isClass = spec.shape === "class"
      const pyFn = isClass ? spec.klass : pyEntry(r.code.python)
      if (!pyFn) {
        // silence here used to hide a whole rung: a Python block that declares
        // a class and no top-level def has no entry point this driver can call
        noEntry.push(`${p.id}/${r.key} [python] — no top-level def to call`)
        continue
      }
      const cases = spec.cases
      // one process now runs every case, so the budget has to grow with them
      const timeout = 20000 + 5000 * cases.length

      // 1. the oracle, once for the whole rung
      const f = join(dir, `oracle${seq++}.py`)
      writeFileSync(
        f,
        isClass
          ? pythonClassDriver(r.code.python, spec, cases)
          : pythonDriver(r.code.python, pyFn, cases, spec.params)
      )
      const oracle = caseLines(
        () => execFileSync(python, [f], { stdio: "pipe", timeout }),
        cases.length
      )
      const want = oracle.lines
      cases.forEach((args, i) => {
        if (want[i].startsWith("!ERROR"))
          failures.push(
            `${p.id}/${r.key} [python] on ${JSON.stringify(args)}: ${want[i]}`
          )
        else ran++
      })

      // 2. each translation, against it — compiled once, launched once
      for (const lang of ["java", "cpp"]) {
        const block = r.code[lang]
        if (!block || !tools[lang]) continue
        const fn = isClass ? spec.klass : cEntry(block)
        if (!fn) {
          noEntry.push(`${p.id}/${r.key} [${lang}] — no function to call`)
          continue
        }
        let got
        try {
          if (lang === "java") {
            const src = join(dir, "Solution.java")
            writeFileSync(
              src,
              isClass
                ? javaClassDriver(NODE_JAVA, block, spec, cases)
                : javaDriver(NODE_JAVA, block, fn, cases, spec.params)
            )
            execFileSync(tools.java, ["-nowarn", "-d", dir, src], {
              stdio: "pipe",
            })
            compiles++
            got = caseLines(
              () =>
                runExe(
                  join(tools.java, "..", "java.exe"),
                  ["-cp", dir, "Solution"],
                  { stdio: "pipe", timeout }
                ),
              cases.length
            )
          } else {
            // a fresh name per binary: Windows can still hold a lock on the
            // executable it just finished, and reusing one name turns that
            // into an intermittent UNKNOWN spawn error
            const stem = `prog${seq++}`
            const src = join(dir, `${stem}.cpp`)
            const exe = join(dir, `${stem}.exe`)
            writeFileSync(
              src,
              isClass
                ? cppClassDriver(headers, NODE_CPP, block, spec, cases)
                : cppDriver(headers, NODE_CPP, block, fn, cases, spec.params)
            )
            execFileSync(tools.cpp, ["-std=c++17", "-w", "-o", exe, src], {
              stdio: "pipe",
            })
            compiles++
            got = caseLines(
              () => runExe(exe, [], { stdio: "pipe", timeout }),
              cases.length
            )
          }
        } catch (e) {
          // a build that fails is one finding about the block, not one per case
          const msg = String(e.stderr ?? e.message ?? e)
          const list = /UNKNOWN|EBUSY|EPERM|ETXTBSY/.test(msg)
            ? unrunnable
            : failures
          list.push(
            `${p.id}/${r.key} [${lang}] would not build: ${msg.slice(-160).replace(/\s+/g, " ")}`
          )
          continue
        }
        // Windows refusing to launch says nothing about the code; keep it out
        // of the findings, and say so in the summary
        if (got.err && /UNKNOWN|EBUSY|EPERM|ETXTBSY/.test(got.err)) {
          unrunnable.push(
            `${p.id}/${r.key} [${lang}]: ${got.err.slice(-120).replace(/\s+/g, " ")}`
          )
          continue
        }
        cases.forEach((args, i) => {
          if (want[i].startsWith("!ERROR")) return // nothing to compare against
          compared++
          const mine = got.lines[i]
          if (mine.startsWith("!ERROR")) {
            failures.push(
              `${p.id}/${r.key} [${lang}] on ${JSON.stringify(args)}: ${mine}`
            )
            return
          }
          if (
            normalise(want[i], spec.unordered) !==
            normalise(mine, spec.unordered)
          )
            failures.push(
              `${p.id}/${r.key} [${lang}] on ${JSON.stringify(args)}: python said ${want[i]}, ${lang} said ${mine}`
            )
        })
      }
    }
  }

  if (!has("--keep")) rmSync(dir, { recursive: true, force: true })
  const skipped = Object.keys(NOT_YET_RUNNABLE).length
  console.log(
    `\n${ran} oracle runs, ${compared} translations compared, ${failures.length} disagreed`
  )
  console.log(
    `${compiles} drivers built — one per block, not one per case (B31)`
  )
  if (unrunnable.length)
    console.log(
      `${unrunnable.length} blocks could not be built or launched (Windows refusing a ` +
        `freshly built exe; these say nothing about the code):`
    )
  for (const u of unrunnable) console.log(`  · ${u}`)
  if (noEntry.length) {
    console.log(
      `${noEntry.length} rungs had no entry point the driver could call ` +
        `(reported, not skipped in silence):`
    )
    for (const n of noEntry) console.log(`  · ${n}`)
  }
  console.log(
    skipped
      ? `${skipped} problems not yet runnable this way:`
      : `every problem in VECTORS is runnable — NOT_YET_RUNNABLE is empty`
  )
  for (const [id, why] of Object.entries(NOT_YET_RUNNABLE))
    console.log(`  · ${id} — ${why}`)
  for (const f of failures) console.log(`  ✗ ${f}`)
  process.exitCode = failures.length ? 1 : 0
}

// The same declarations verify.mjs compiles against, so the two gates agree on
// what a bare block may assume. Unconditional: canon carries a branch per node
// type, and those branches have to compile in every driver, not only the
// structural ones.
const NODE_JAVA = NODES.java
const NODE_CPP = NODES.cpp

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main()
