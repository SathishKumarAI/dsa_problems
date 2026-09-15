// backspace-compare — "Understanding the Problem", and the constraints table.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

import type { Unlock } from "../../content/types.ts"

export const understanding = `Someone types a string into an empty text box, except that \`'#'\` is not a character — it is the
backspace key. Two people type two different strings this way. Do they end up staring at the same
text?

\`"ab#c"\` is typed as \`a\`, \`b\`, backspace, \`c\`, which leaves \`"ac"\`. \`"ad#c"\` is typed as \`a\`, \`d\`,
backspace, \`c\`, which also leaves \`"ac"\`. Different keystrokes, same text, so the answer is \`true\`.

**The core question: which characters survive?** The naive approaches are slow because they answer it
by *building both finished texts in full* — and the expensive versions build them by rebuilding a
string every time a backspace lands, turning a linear number of keystrokes into quadratic work.

### The misconception: "just delete the previous character"

The instinct is a single left-to-right pass that drops the character before each \`'#'\`. Two things
break it, and both are worth naming before any code.

Underneath both is the real structural problem:

> **Watch out.** Reading left to right, **a character's fate is decided by things that have not
> happened yet.** When you meet \`'b'\` in \`"ab#c"\` you cannot say whether it survives — that depends on
> a keystroke three positions away. Every forward-reading approach below has to cope with this by
> doing work and then undoing it.

That is not a flaw in any one implementation; it is a property of the reading direction. The last two
approaches fix it by changing direction.

### The worked example, used in every section below

\`\`\`
s = "abc##d"     typed: a b c ⌫ ⌫ d   ->  "ad"
t = "ad#d"       typed: a d ⌫ d       ->  "ad"
answer: true
\`\`\`

Indices, since every trace below refers to them:

It is a variation on the statement's first example, chosen because \`s\` carries a **run of two
hashes**. That run is where the hardest rung's off-by-ones live, and an example without one lets a
wrong implementation look right.

---`

export const unlocks: Unlock[] = [
    {
        "constraint": "a `'#'` always deletes the character immediately to its left",
        "what": "It deletes the previous **survivor**, not the previous character. In `\"ab##c\"` the second `'#'` must delete `'a'`, which is two positions away, because `'b'` is already gone."
    },
    {
        "constraint": "a `'#'` always deletes *something*",
        "what": "A `'#'` with nothing typed before it is a no-op. In `\"#a\"` the hash deletes nothing and vanishes, leaving `\"a\"` — so blindly dropping the previous character either crashes or eats the wrong one."
    },
    {
        "constraint": "Constraint",
        "what": "What it unlocks"
    },
    {
        "constraint": "---",
        "what": "---"
    },
    {
        "constraint": "`0 <= s.length, t.length <= 200`",
        "what": "Short enough that every rung here finishes instantly, so this problem is **never about time** — it is about the follow-up, which asks for `O(1)` space. It also means **the empty string is legal**, and a string of nothing but `'#'` finishes empty, so \"both texts are empty\" must compare `true`."
    },
    {
        "constraint": "every character is a lowercase letter or `'#'`",
        "what": "A **bounded, two-way alphabet**: everything is either a keystroke that survives or the delete key. No escaping, no other control character, so a single boolean test `ch == HASH` classifies every character."
    },
    {
        "constraint": "a `'#'` with nothing before it deletes nothing",
        "what": "**The permission slip for the empty-stack guard and for the `skip` counter clamp.** It is why the stack rung tests `if keep:` before popping and why the backward rung uses `elif skip > 0` rather than an unconditional decrement."
    },
    {
        "constraint": "one `'#'` removes exactly one surviving character, so a **run** of them removes that many",
        "what": "**The permission slip for a counter rather than a flag.** A boolean \"the next character dies\" cannot represent a debt of three. This single sentence is the difference between the correct backward pass and the most common wrong one."
    },
    {
        "constraint": "the answer is a single **boolean**",
        "what": "**The permission slip for the last rung.** The finished texts never have to exist anywhere — only the comparison does, which is what makes constant space reachable and early exit possible."
    },
    {
        "constraint": "",
        "what": "0"
    },
    {
        "constraint": "---",
        "what": "---"
    },
    {
        "constraint": "`s`",
        "what": "`a`"
    },
    {
        "constraint": "`t`",
        "what": "`a`"
    }
]
