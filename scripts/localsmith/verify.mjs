// Compile every Java and C++ block in the practice set.
//
// The blocks in src/data/problems/*.ts are deliberately bare — a single free
// function, no imports, no class, no includes — because that is what a learner
// should read. That also means they are not, on their own, compilable units.
// This harness supplies the missing scaffolding (a wrapper class with the
// usual java.util imports; a translation unit with the usual headers and a
// using-directive) and asks a real compiler whether the body inside is valid.
//
// It does NOT run them. Compiling catches the errors a translation actually
// makes — a wrong method name, a type mismatch, a missing return, an unbalanced
// generic — which is the gap that shape-checking and cross-model agreement
// could only approximate. Executing them needs test vectors per problem, and
// that is a separate backlog item.
//
// Skips loudly rather than passing quietly when no toolchain is installed, the
// way test:ui does when there is no Chrome.
//
// Run:  node scripts/localsmith/verify.mjs            # everything
//       node scripts/localsmith/verify.mjs --id best-trade
//       node scripts/localsmith/verify.mjs --keep     # leave the temp dir

import { execFileSync, execSync } from "node:child_process"
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { homedir, tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { PROBLEMS } from "../../src/data/index.ts"

const arg = (k, d) => {
  const i = process.argv.indexOf(k)
  return i > -1 ? (process.argv[i + 1] ?? true) : d
}
const has = (k) => process.argv.includes(k)

// This machine manages runtimes with mise, so a JDK installed the house way is
// reachable through a shim rather than sitting on PATH. Ask PATH first, then
// mise, before concluding a toolchain is missing.
function resolve(cmd, probe) {
  try {
    execFileSync(cmd, [probe], { stdio: "pipe" })
    return cmd
  } catch {
    /* not on PATH */
  }
  try {
    const p = execSync(`mise which ${cmd}`, {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim()
    if (p) {
      execFileSync(p, [probe], { stdio: "pipe" })
      return p
    }
  } catch {
    /* mise does not have it either */
  }
  // scoop puts a shim in ~/scoop/shims but only adds it to the user PATH,
  // which an already-open shell has not picked up yet
  for (const dir of ["shims", "apps/gcc/current/bin"]) {
    try {
      const p = join(homedir(), "scoop", dir, `${cmd}.exe`)
      execFileSync(p, [probe], { stdio: "pipe" })
      return p
    } catch {
      /* not there */
    }
  }
  return null
}

export function toolchain() {
  const found = {}
  for (const [lang, cmd, probe] of [
    ["java", "javac", "-version"],
    ["cpp", "g++", "--version"],
  ]) {
    const path = resolve(cmd, probe)
    if (path) found[lang] = path
  }
  return found
}

// The scaffolding a teaching snippet leaves out. Kept in one place so the
// blocks stay bare and the compiler still sees valid code.
//
// Exported: the differential runner (run.mjs) needs the same declarations to
// BUILD a list or a tree, and two copies of a node type is how the two gates
// start disagreeing about what a block may assume.
//
// ListNode and TreeNode belong here rather than in the snippets: every linked
// list and tree problem in the set references them, they are given by the
// judge rather than written by the candidate, and putting them in each block
// would bury the four lines a learner is meant to read.
// This repo's Python calls the linked-list node `Node`, so its translations do
// too; `ListNode` and `TreeNode` are the names the same problems carry on
// LeetCode. Both are declared, because a block is free to use either.
export const NODES = {
  java: `class Node {
    int val; Node next;
    Node() {}
    Node(int v) { val = v; }
    Node(int v, Node n) { val = v; next = n; }
}

class ListNode {
    int val; ListNode next;
    ListNode() {}
    ListNode(int v) { val = v; }
    ListNode(int v, ListNode n) { val = v; next = n; }
}

class TreeNode {
    int val; TreeNode left, right;
    TreeNode() {}
    TreeNode(int v) { val = v; }
    TreeNode(int v, TreeNode l, TreeNode r) { val = v; left = l; right = r; }
}
`,
  cpp: `struct Node {
    int val; Node* next;
    Node(int v = 0, Node* n = nullptr) : val(v), next(n) {}
};

struct ListNode {
    int val; ListNode* next;
    ListNode(int v = 0, ListNode* n = nullptr) : val(v), next(n) {}
};

struct TreeNode {
    int val; TreeNode* left; TreeNode* right;
    TreeNode(int v = 0) : val(v), left(nullptr), right(nullptr) {}
};
`,
}

const WRAP = {
  java: (body) => `import java.util.*;
import java.util.function.*;
import java.util.stream.*;

${NODES.java}
class Solution {
${body
  .split("\n")
  .map((l) => (l.trim() ? "    " + l : l))
  .join("\n")}
}
`,
  cpp: (body) => `#include <algorithm>
#include <cctype>
#include <climits>
#include <cmath>
#include <deque>
#include <functional>
#include <limits>
#include <map>
#include <numeric>
#include <queue>
#include <set>
#include <stack>
#include <string>
#include <unordered_map>
#include <utility>
#include <unordered_set>
#include <vector>
using namespace std;

${NODES.cpp}
${body}
`,
}

const rungs = (p) => [
  { key: "optimal", code: p },
  ...(p.alternatives ?? []).map((a) => ({ key: a.name, code: a })),
]

function compile(dir, lang, cmd, name, body) {
  const file = join(dir, lang === "java" ? "Solution.java" : `${name}.cpp`)
  writeFileSync(file, WRAP[lang](body))
  const args =
    lang === "java"
      ? ["-nowarn", "-d", dir, file]
      : ["-fsyntax-only", "-std=c++17", "-w", file]
  try {
    execFileSync(cmd, args, { stdio: "pipe" })
    return null
  } catch (e) {
    const out = `${e.stdout ?? ""}${e.stderr ?? ""}`
    return (
      out
        .split("\n")
        .filter((l) => /error/i.test(l))
        .slice(0, 3)
        .join(" | ") || out.slice(0, 200)
    )
  }
}

function main() {
  const tools = toolchain()
  const langs = ["java", "cpp"].filter((l) => tools[l])
  if (!langs.length) {
    // a check nobody can run is a check that is off — say so loudly
    console.error(
      "\n  COMPILE VERIFY SKIPPED — no javac and no g++ on PATH.\n" +
        "  Install them with: mise use -g java@temurin-21 && scoop install main/gcc\n"
    )
    process.exitCode = 0
    return
  }
  for (const l of ["java", "cpp"])
    if (!tools[l])
      console.error(
        `  (no ${l === "java" ? "javac" : "g++"} — ${l} blocks skipped)`
      )

  const targets = arg("--id")
    ? PROBLEMS.filter((p) => p.id === arg("--id"))
    : PROBLEMS
  const dir = mkdtempSync(join(tmpdir(), "dsa-verify-"))
  const failures = []
  let compiled = 0

  for (const p of targets)
    for (const r of rungs(p))
      for (const lang of langs) {
        const body = r.code[lang]
        if (!body) continue
        const err = compile(
          dir,
          lang,
          tools[lang],
          p.id.replace(/-/g, "_"),
          body
        )
        compiled++
        if (err) failures.push(`${p.id}/${r.key} [${lang}] ${err}`)
      }

  if (!has("--keep")) rmSync(dir, { recursive: true, force: true })
  console.log(`\ncompiled ${compiled} blocks, ${failures.length} failed`)
  for (const f of failures) console.log(`  ✗ ${f}`)
  process.exitCode = failures.length ? 1 : 0
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main()
