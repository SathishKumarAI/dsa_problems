// What a teaching document's code FENCE needs before it can run on its own.
//
// A fence is an excerpt, not a file. It is lifted out of a document that
// declares its imports and its node classes once at the top, so on its own it
// raises NameError before reaching a single line of the algorithm. Measured in
// a real browser on 2026-09-15, pressing Run:
//
//   max-depth      NameError: name 'Optional' is not defined
//   reverse-list   NameError: name 'ListNode' is not defined
//
// Both PREDATE the Run button doing anything useful — the block failed the same
// way when it printed nothing, and nobody noticed because nothing was printed
// either way.
//
// The node half is VERBATIM from scripts/localsmith/run.mjs's PY_NODES, which
// is the scaffolding the Java and C++ gates already drive Python with, so a
// block runs the same way on the page as it does in CI. The builders at the end
// (__mklist, __mktree) are what let a linked-list or tree problem be called in
// one line at all. py-preamble.test.ts asserts the two copies still match.
//
// Prepended ONLY to a fence — a block that does not start itself. A full
// runnable script declares everything it needs and runs exactly as written.

/** the typing names the corpus annotates with, and nothing else */
// FIRST LINE, always. Python requires it, and it is what makes an annotation
// lazy — `Optional[TreeNode]` is never evaluated, so a fence annotated with a
// name it does not import stops raising NameError before it reaches a single
// line of the algorithm. The typing import below is belt and braces for the
// blocks that use those names in a real expression.
const FUTURE = "from __future__ import annotations"
const TYPING = "from typing import Any, Dict, List, Optional, Set, Tuple"

/** verbatim from scripts/localsmith/run.mjs's PY_NODES */
export const PY_NODES = `# A block is free to declare its own node class and most do; the three that
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
    return root`

export const PREAMBLE = `${FUTURE}\n${TYPING}\n${PY_NODES}\n`

/** A `from __future__` line must be the FIRST statement in a program, so a
 *  second one further down is a SyntaxError — and every teaching script opens
 *  with one. The preamble already carries it, so strip it from anything that
 *  follows. */
export const stripFuture = (src: string) =>
  src.replace(/^from __future__ import [^\n]*\n?/gm, "")
