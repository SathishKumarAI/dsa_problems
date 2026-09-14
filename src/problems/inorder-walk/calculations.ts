// inorder-walk — the symbol table, and how to trace it by hand.
//
// Ten of 127 documents have this section. It is the one a reader who follows
// the prose and then stalls at the arithmetic has nowhere to go without.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

export const calculations = `There is almost no arithmetic in this problem. What there is instead is **bookkeeping**, and the
thing to be able to read is a stack changing shape.

### The symbol table

| You will see | It computes | Why it is written that way | If it were wrong |
|---|---|---|---|
| \`out\` | the answer, in order | Appended to exactly once per node | — |
| \`stack\` | the nodes **walked past but not yet recorded** | These are the ancestors you owe a visit on the way back up | A queue instead of a stack gives level order, a different traversal |
| \`node\` | the cursor — where the walk is *now* | It is \`None\` whenever the last descent ran out of tree | — |
| \`while stack or node\` | "there is something owed, **or** somewhere still to go" | Both halves are needed: at the start the stack is empty and \`node\` is the root | \`while stack:\` alone never enters the loop, and every tree returns \`[]\` |
| \`node = node.right\` after a pop | "that subtree is done; start the same descent one subtree over" | Popping records a node, and its right subtree is the only part of it still unvisited | Assigning \`node = None\` skips every right subtree |
| \`pred.right is not node\` | "this thread is mine, not a real edge" (Morris only) | The one test that tells a temporary link from a real one | Without it the walk loops forever on its own thread |

### The one rule, and what it forces

\`\`\`
inorder(node) = inorder(node.left) ++ [node.val] ++ inorder(node.right)
\`\`\`

Read what that demands: before \`node\` may be recorded, **all of its left subtree must already be
done** — and \`node\` itself must survive that whole excursion. So a node is met, set aside, and
collected later. The set-aside pile is the entire subject of this document:

| Approach | Where the unfinished work is kept |
|---|---|
| Rebuild at every node | in the **return values** — every call hands back a whole list |
| One list, handed down | in the **call stack** — which is what recursion is for |
| Explicit stack | in a **list you own** — the same thing with the lid off |
| Morris | in the **tree's own empty pointers** — borrowed, then returned |

### How to trace it by hand

Two columns and a cursor:

\`\`\`
  step   action                     stack        out
\`\`\`

1. While the cursor points at a node: **push it and go left.** You are walking past nodes you owe.
2. When the cursor is empty: **pop, record that value, and move the cursor to the popped node's
   right child.** That restarts the same descent one subtree over.
3. Stop when the stack is empty **and** the cursor is empty.

On \`[1, null, 2, 3]\` — every line printed by the script:

| Step | Action | \`stack\` after | \`out\` |
|---|---|---|---|
| 1 | push \`1\`, go left | \`[1]\` | \`[]\` |
| 2 | pop \`1\`, record it | \`[]\` | \`[1]\` |
| 3 | push \`2\`, go left | \`[2]\` | \`[1]\` |
| 4 | push \`3\`, go left | \`[2, 3]\` | \`[1]\` |
| 5 | pop \`3\`, record it | \`[2]\` | \`[1, 3]\` |
| 6 | pop \`2\`, record it | \`[]\` | \`[1, 3, 2]\` |

Step 2 is the one worth staring at: \`1\` is recorded **before** the walk has seen \`2\` or \`3\` at all,
because \`1\` has no left subtree. Inorder is not "smallest first"; it is "left subtree first".

### Reading a complexity out loud

Every approach is \`O(n)\` time — each node is met a constant number of times. **The whole ladder is
about space**, and here the four answers genuinely differ:

| Approach | Space | Which means |
|---|---|---|
| Rebuild | \`O(n²)\` | a new list at every node, and each \`+\` copies both sides |
| Handed down | \`O(h)\` | one call frame per level of the current path |
| Explicit stack | \`O(h)\` | the same, in a list you can bound and inspect |
| Morris | \`O(1)\` | no extra structure at all — it borrows the tree's own null pointers |

\`O(h)\` is the one to read carefully: **the height, not the node count and not the widest level.**
Measured peak stack depth — a balanced tree of \`1 023\` nodes never holds more than \`10\`, while a
spine of \`500\` holds all \`500\`. The stack holds one root-to-cursor **path**.

---`
