// inorder-walk — which rungs to know cold, and the drills.
//
// Which two or three to have in recall, and why the rest are for understanding
// rather than for typing out under time.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

export const interview = `**Know cold:** the explicit stack. It is what "do it iteratively" means, it is the one that survives
a deep tree, and its two-line shape — *descend left pushing, then pop-record-step-right* — is the
same skeleton as the k-th smallest in a BST and the BST iterator.

**Know, and be able to derive:** the recursive version, and the fact that **moving one line** turns
it into preorder or postorder. That is a better answer to "what is a traversal" than three memorised
functions.

**Understand, do not memorise:** Morris. Be able to say what it borrows and why that pointer is free,
and name its real cost — it mutates the tree and only restores it if it completes.

> **In an interview.** Say where the memory is going before you write: *"inorder means I have to walk
> past a node and come back to it, so something has to hold it — the call stack, or a stack I keep."*
> Expect the follow-ups: **without recursion** (approach 3), **\`O(1)\` space** (approach 4, with its
> caveat volunteered), and **the k-th smallest in a BST** — which is approach 3 with a counter, and
> which is exactly why the ability to stop early is worth more than the constant factor.`

export const fluent = `1. **Write the three-line recursion and move the middle line twice.** Above both walks, between
   them, below both. **Done when** you can say which traversal each produces without running it.

2. **Hand-trace the explicit stack on \`[1, null, 2, 3]\`,** six steps, until your table matches the
   one above. **Done when** you can explain step 2 — why \`1\` is recorded before \`2\` and \`3\` are even
   seen.

3. **Break the loop condition on purpose.** Change \`while stack or node\` to \`while stack\` and run it.
   **Done when** you can say why every tree returns \`[]\`, and what each half of that condition is
   protecting.

4. **Count, do not time, then time.** Instrument the rebuild rung to count lists allocated (a spine
   of \`200\` builds \`401\`), then time it against the stack on spines of \`200 / 400 / 800\`. **Done
   when** you have produced the \`795µs\` against \`37µs\` yourself and can say where the extra work is —
   copying, not visiting.

5. **Do the siblings.** *Kth Smallest in a BST* is approach 3 with a counter and an early return —
   and the early return is what rules Morris out. *BST Iterator* is approach 3 turned inside out,
   with the descent loop in \`next()\`. *Validate a BST* is this walk keeping only the previous value.
   **Done when** you can say which of the three needs to stop early and why that decides the rung.

6. **A month later, the one sentence that should come back:** *every traversal is the same walk; what
   differs is where you keep the nodes you have walked past and still owe.*`
