// balanced-brackets — approach 2 — One pass with a stack (optimal)
//
// Converted from docs/deep/balanced-brackets_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "stack",
  title: "One pass with a stack (optimal)",
  idea: `*The previous rung deletes an innermost pair and then rescans from the start — can the string be
decided in a single left-to-right pass?* Yes. Instead of physically deleting matched pairs, keep a
record of the openers that are still unmatched, in the order they were opened. When a closer arrives,
the opener it must match is by definition the last one you recorded, so check it and discard it. This
fixes the repeated-replace rung's exact weakness — **rescanning the whole string once per nesting
level** — by remembering what is still open as you go.`,
  intuition: `> **Intuition.** Read the string aloud while holding a stack of **plates**. Every opening bracket,
> put a plate on top with that bracket drawn on it. Every closing bracket, look at the top plate: if
> it is the matching opener the pair is settled, so throw that plate away; if it is the wrong kind,
> or there is no plate at all, the string is broken and you stop. At the end the stack must be bare —
> a plate still sitting there is a bracket you opened and never closed.

The stack is not a trick applied to the problem. It is a literal record of *what is still open*, and
the problem's rule says the answer always concerns the top of that record.`,
  worked: `\`s = "([{}])"\`, traced character by character. The rightmost column is the stack with its **top on
the right**.

| k | \`s[k]\` | Action | Stack after |
|---|---|---|---|
| 0 | \`(\` | opener → push | \`(\` |
| 1 | \`[\` | opener → push | \`([\` |
| 2 | \`{\` | opener → push | \`([{\` |
| 3 | \`}\` | closer; top is \`{\`, which is its partner → pop | \`([\` |
| 4 | \`]\` | closer; top is \`[\`, which is its partner → pop | \`(\` |
| 5 | \`)\` | closer; top is \`(\`, which is its partner → pop | *(empty)* |

End of string, stack empty → **true**.

Watch the stack grow to \`([{\` and then unwind in exactly the reverse order: \`}\`, \`]\`, \`)\`. That
mirroring is not a coincidence of this input, it is what the problem's rule forces. And note how
cheap each step is compared with the previous approach: at step 3, deciding the \`}\` cost one
dictionary lookup and one comparison against the top of the stack, where the repeated-replace rung
spent a full rebuild of the string to settle the very same pair.

Now watch where the same trace detects each failure mode, by changing one character:

- \`([{)])\` — at k = 3 the closer is \`)\`, the top is \`{\`, they are not partners → **failure 2**, stop.
- \`([{}]))\` — at k = 6 a \`)\` arrives and the stack is already empty → **failure 1**, stop.
- \`([{}]\` — the scan ends with \`(\` still on the stack → **failure 3**, false.`,
  code: `def balanced_brackets_stack(s: str) -> bool:
    st: list[str] = []  # the openers still unmatched, in the order they were opened
    for ch in s:
        if ch in PAIRS:
            if not st or st.pop() != PAIRS[ch]:  # failure 1: empty; failure 2: wrong kind
                return False
        else:
            st.append(ch)
    return not st  # failure 3: an opener never closed`,
  codeNote: `\`PAIRS\` is keyed by the **closer**, not the opener, and that is deliberate: the lookup you actually
perform is "I am holding a \`]\`, what should be underneath it?", so keying it the other way would force
a search of the values on every closing bracket.

> **Why it works.** The loop maintains one invariant: **\`st\` holds exactly the openers read so far
> that are still unmatched, oldest at the bottom.** A push preserves it because a new opener is by
> definition unmatched; a pop preserves it because the closer just consumed the most recent unmatched
> opener, which is the only one the rule permits it to match. Since the invariant holds after the last
> character, \`st\` empty is *precisely* the statement "nothing was left open" — which is why the final
> check is a test of the invariant rather than an extra rule bolted on.`,
  mistake: `Ending the function with \`return True\` instead of \`return not st\`. Everything else is correct: both
in-loop checks are there, the map is right, the pops are right — and the function still gets \`(\`
wrong. Running that variant returns \`True\` for \`"("\`, and \`True\` for \`"((("\`, both unbalanced.

> **Watch out.** The misconception is that **"nothing went wrong" means "everything was resolved"**.
> Every other check in this function fires *inside* the loop, so the whole loop can complete without a
> single one of them tripping — on a string that was never finished. The leftover stack is the only
> evidence that an opener was abandoned, and that evidence exists only *after* the loop ends. This is
> **failure mode 3**, and it is the most common bug on this problem.

The other classic is dropping the emptiness guard and writing \`if st.pop() != PAIRS[ch]\`. That is
**failure mode 1**, and it does not produce a wrong answer — it raises \`IndexError: pop from empty
list\` on \`")"\` and on \`"([{}])]"\`. A crash is friendlier than a wrong answer but still a failed
submission, and the \`not st or\` that fixes it must come *first* in the \`or\`, so Python's short-circuit
stops before the \`pop\`.`,
  cost: `**Time O(n), space O(n).** Time is one pass with O(1) work per character — a dictionary lookup and at
most one push or one pop — and each character is visited exactly once. The space is the stack, which
in the worst case holds every character: \`((((((\` at full length pushes n openers and pops none, so
the bound is tight and cannot be improved for the general three-kind problem.

This is the answer to ship. It is also the template you will reuse for the rest of the stack pattern:
\`decode-string\`, the basic calculator with parentheses, and \`simplify-path\` are all this loop with
something more interesting than a single character stored on the stack.

---`,
}
