// The ledger must not go stale, and it must be idempotent.
//
// A generated file checked into the repo is a promise that it matches the
// source. `--check` is what keeps that promise; this test is what makes anyone
// run `--check`. It fails the moment a record gains or loses a field and the
// ledger was not regenerated — which is the one failure mode a generated doc
// has, and the one nobody notices by reading a diff.
import assert from "node:assert/strict"
import { test } from "node:test"
import { execFileSync } from "node:child_process"

test("docs/PAGE-BACKLOG.md is current", () => {
  try {
    execFileSync("node", ["scripts/page-backlog.mjs", "--check"], {
      stdio: "pipe",
    })
  } catch (e) {
    assert.fail(
      String(e.stderr ?? e.stdout ?? e.message).trim() ||
        "page-backlog --check failed"
    )
  }
})

// Idempotence is what makes `--check` meaningful rather than a diff of
// timestamps: run it twice, get the same bytes, or the gate is noise.
test("generating it twice produces the same bytes", () => {
  const once = execFileSync("node", ["scripts/page-backlog.mjs", "--pattern", "trie"], {
    encoding: "utf8",
  })
  const twice = execFileSync("node", ["scripts/page-backlog.mjs", "--pattern", "trie"], {
    encoding: "utf8",
  })
  assert.equal(once, twice)
  assert.match(once, /of 3 pages owe nothing/)
})
