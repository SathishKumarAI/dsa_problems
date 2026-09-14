// backspace-compare — the teaching document, as data.
//
// Converted from docs/deep/backspace-compare_explained.md by
// scripts/md-to-content.mjs. Every byte of prose carried through unchanged;
// what changed is that the STRUCTURE is now a type (src/content/types.ts)
// rather than a heading convention a script had to grep for.
//
// Reached only through `lib/content.ts`'s glob — never import this file.

import type { TeachingDoc } from "./types.ts"

export const doc: TeachingDoc = {
  problemId: "backspace-compare",
  understanding: `Someone types a string into an empty text box, except that \`'#'\` is not a character — it is the
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

---`,
  unlocks: [
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
  ],
  approaches: [
  {
    rung: "recursion-one-cancel-at-a-time",
    title: "Recursion: cancel one `'#'` at a time",
    idea: `*Can I make the problem smaller?* Find the first \`'#'\`, delete it together with the character to its
left, and hand the shorter pair back to yourself. When neither string has a \`'#'\` left, both are
finished text and a plain equality test answers the question.`,
    intuition: `> **Intuition.** Editing a document by repeatedly hitting "find and fix the first mistake". Each pass
> removes one backspace and its victim, the document gets two characters shorter, and eventually no
> mistakes remain and you can just read what is left. It is the most literal possible reading of the
> rules, which makes it the easiest to believe and the easiest to get right — and each "pass" copies
> the whole document, which makes it the most expensive.`,
    worked: `| depth | \`s\` | \`t\` | first \`'#'\` | action |
|---|---|---|---|---|
| 0 | \`"abc##d"\` | \`"ad#d"\` | in \`s\` at index 3 | delete index 3 and index 2 → \`s = "ab#d"\` |
| 1 | \`"ab#d"\` | \`"ad#d"\` | in \`s\` at index 2 | delete index 2 and index 1 → \`s = "ad"\` |
| 2 | \`"ad"\` | \`"ad#d"\` | \`s\` clean; in \`t\` at index 2 | delete index 2 and index 1 → \`t = "ad"\` |
| 3 | \`"ad"\` | \`"ad"\` | none left | compare: \`"ad" == "ad"\` → **true** ✅ |

Notice depth 0 → 1. The run of two hashes is handled by the recursion *one at a time*: the first pass
removes \`#\` and \`c\`, which brings the second \`#\` next to \`b\`, and the next pass removes that pair. The
"delete the previous survivor" rule is never stated — it emerges from repeatedly applying the simple
rule to a shortened string.`,
    code: `HASH = "#"


def backspace_compare_recursion(s: str, t: str) -> bool:
    at = s.find(HASH)
    if at >= 0:
        head = s[: at - 1] if at > 0 else ""   # a '#' at index 0 has nothing to its left
        return backspace_compare_recursion(head + s[at + 1 :], t)
    at = t.find(HASH)
    if at >= 0:
        head = t[: at - 1] if at > 0 else ""
        return backspace_compare_recursion(s, head + t[at + 1 :])
    return s == t`,
    mistake: `> **Watch out.** Dropping the \`if at > 0 else ""\` guard and writing \`head = s[: at - 1]\` outright. The
> misconception is that "the part before the victim" is always \`s[:at-1]\`. When \`at == 0\` there is no
> victim, and \`s[:-1]\` in Python does not mean "empty" — it means **everything except the last
> character**, silently deleting from the wrong end of the string.

Measured on \`s = "#a"\`, \`t = "a"\`: \`at = 0\`, so \`head = "#"\`, and \`head + s[1:]\` reconstructs \`"#a"\`
exactly. The recursion makes no progress and Python raises \`RecursionError\`. It is a rare mercy — a
loud failure instead of a quiet wrong answer — and it is why the leading-\`'#'\` case is in every test
list in this document.`,
    cost: `**Time \`O((n + m)²)\`** — each \`'#'\` costs a \`find\` plus two slices that copy the whole string, and
there can be \`n + m\` of them. **Space \`O(n + m)\`** — one call frame per deletion, each holding its own
freshly copied string, so 200 hashes means 200 nested frames.

Use it to *state* the rule, and to convince yourself the rule is what you think it is. Nothing else.
Its value here is that it makes the next rung's motivation concrete: the algorithm is right and the
machinery around it is wrong.

---`,
  },
  {
    rung: "rebuild-the-text-by-slicing",
    title: "Type it out, trimming with a slice",
    idea: `*The recursion opens a call frame per deletion and copies both strings each time — can the same cancel
rule run in a flat loop over one string at a time?* Yes: walk the keystrokes forward, appending
letters to a growing text and trimming the last character whenever a \`'#'\` arrives. This fixes the
recursion's weakness — **call depth, and re-scanning both strings for every single backspace** — by
touching one string per pass with no recursion at all.`,
    intuition: `> **Intuition.** Actually typing into the box. You hold the text so far; a letter goes on the end, a
> backspace takes one off the end. There is no lookahead and no cleverness — the code is a
> transcription of what the text editor does, which is why it is the first version most people
> believe on sight. What it hides is that in an immutable-string language, "take one off the end"
> builds a brand-new string every time.`,
    worked: `\`s = "abc##d"\`:

| \`i\` | \`ch\` | \`out\` before | \`out\` after |
|---|---|---|---|
| 0 | \`'a'\` | \`""\` | \`"a"\` |
| 1 | \`'b'\` | \`"a"\` | \`"ab"\` |
| 2 | \`'c'\` | \`"ab"\` | \`"abc"\` |
| 3 | \`'#'\` | \`"abc"\` | \`"ab"\` |
| 4 | \`'#'\` | \`"ab"\` | \`"a"\` |
| 5 | \`'d'\` | \`"a"\` | \`"ad"\` |

\`t = "ad#d"\`:

| \`i\` | \`ch\` | \`out\` before | \`out\` after |
|---|---|---|---|
| 0 | \`'a'\` | \`""\` | \`"a"\` |
| 1 | \`'d'\` | \`"a"\` | \`"ad"\` |
| 2 | \`'#'\` | \`"ad"\` | \`"a"\` |
| 3 | \`'d'\` | \`"a"\` | \`"ad"\` |

\`"ad" == "ad"\` → **true** ✅

Read the \`out\` column of the first table and the waste is visible: \`'b'\` and \`'c'\` were written and
then thrown away, and \`"abc"\` was rebuilt as \`"ab"\` and then as \`"a"\`. **Every character here was
touched at least twice.**`,
    code: `def backspace_compare_slicing(s: str, t: str) -> bool:
    typed: list[str] = []
    for text in (s, t):
        out = ""
        for ch in text:
            if ch == HASH:
                out = out[:-1]        # slicing an empty string is a silent no-op in Python
            else:
                out = out + ch
        typed.append(out)
    return typed[0] == typed[1]`,
    mistake: `> **Watch out.** Declaring \`out = ""\` **outside** the \`for text in (s, t)\` loop. The misconception is
> that \`typed.append(out)\` "captures" the text and starts fresh — it does not; the next string keeps
> typing into the same box, so the second text is the first one with more keystrokes appended.

Measured on the worked example it returns \`False\`: \`s\` finishes as \`"ad"\`, then \`t\`'s keystrokes are
appended to it, giving \`"adad"\`, and \`"ad" != "adad"\`. It returns \`False\` on \`"ab#c"\` / \`"ad#c"\` and on
\`"#a"\` / \`"a"\` too — in fact it returns \`False\` on essentially every \`true\` case, which at least makes
it easy to spot. Scoping a per-iteration accumulator inside the loop is the fix, and it is worth
noticing that the bug is invisible in the diff and obvious in the trace.

There is also a **language trap** hiding in the correct version. \`out[:-1]\` on an empty string is
\`""\` in Python — a silent no-op, which happens to be exactly the rule for a leading \`'#'\`. The same
line written in Java as \`out.substring(0, out.length() - 1)\` throws
\`StringIndexOutOfBoundsException\`. The Python version is correct by luck; the next rung states the
rule outright with an explicit guard, which is better.`,
    cost: `**Time \`O(n² + m²)\`** — each \`'#'\` rebuilds the entire text so far, so text typed and deleted
repeatedly costs quadratic work for a linear number of keystrokes. **Space \`O(n + m)\`** — both
finished texts, plus a discarded intermediate at each step.

Never ship it. It earns its rung because it makes one thing concrete that the recursion obscured: the
algorithm here is already linear in *keystrokes*, and all the cost is in the **container**. That
framing is what makes the fix obvious.

---`,
  },
  {
    rung: "cancel-with-a-stack",
    title: "Cancel with a stack",
    idea: `*Rebuilding the whole prefix on every backspace is the cost — is there a container where removing the
last element is cheap?* A stack. Push every letter; on \`'#'\`, pop one if there is one. A pop from an
empty stack is simply ignored, which is exactly what a backspace on empty text does. This fixes the
slicing rung's weakness: **\`O(n)\` work per backspace instead of \`O(1)\`.**`,
    intuition: `> **Intuition.** A spike file — the spike on a café counter that receipts get impaled on. A letter
> goes on the spike; a backspace lifts the top receipt off. Nothing below the top is ever disturbed,
> so each keystroke costs one operation regardless of how much is already there. The empty-spike case
> is a rule rather than an accident: reaching for a receipt that is not there simply does nothing.`,
    worked: `\`s = "abc##d"\`:

| \`i\` | \`ch\` | action | stack before | stack after |
|---|---|---|---|---|
| 0 | \`'a'\` | push | \`[]\` | \`['a']\` |
| 1 | \`'b'\` | push | \`['a']\` | \`['a','b']\` |
| 2 | \`'c'\` | push | \`['a','b']\` | \`['a','b','c']\` |
| 3 | \`'#'\` | pop | \`['a','b','c']\` | \`['a','b']\` |
| 4 | \`'#'\` | pop | \`['a','b']\` | \`['a']\` |
| 5 | \`'d'\` | push | \`['a']\` | \`['a','d']\` |

\`t = "ad#d"\`:

| \`i\` | \`ch\` | action | stack before | stack after |
|---|---|---|---|---|
| 0 | \`'a'\` | push | \`[]\` | \`['a']\` |
| 1 | \`'d'\` | push | \`['a']\` | \`['a','d']\` |
| 2 | \`'#'\` | pop | \`['a','d']\` | \`['a']\` |
| 3 | \`'d'\` | push | \`['a']\` | \`['a','d']\` |

\`['a','d'] == ['a','d']\` → **true** ✅

The run of two hashes is handled naturally — each one is one pop — and no character is ever copied.
But look at rows 1 through 4 of the first table: \`'b'\` and \`'c'\` were **pushed and then popped**. The
stack did work it later undid, because at the moment it met \`'b'\` it could not know \`'b'\` was doomed.
That is the reading-direction problem showing up as measurable waste, and it is what the next rung
removes.`,
    code: `def backspace_compare_stack(s: str, t: str) -> bool:
    typed: list[list[str]] = []
    for text in (s, t):
        keep: list[str] = []
        for ch in text:
            if ch == HASH:
                if keep:              # a backspace on empty text deletes nothing
                    keep.pop()
            else:
                keep.append(ch)
        typed.append(keep)
    return typed[0] == typed[1]`,
    mistake: `> **Watch out.** Popping without the \`if keep:\` guard. The misconception is that a \`'#'\` always has a
> victim — the constraints say explicitly that one with nothing typed before it is a **no-op, not an
> error**, and an unguarded \`pop()\` treats "nothing to delete" as "crash".

Measured on \`s = "#a"\`, \`t = "a"\`: \`IndexError: pop from empty list\`. Unlike the slicing rung, where
Python's \`out[:-1]\` silently did the right thing, a list pop is strict — which is a feature. The guard
is not defensive padding; it is the leading-\`'#'\` rule written down.`,
    cost: `**Time \`O(n + m)\`** — one push or one pop per keystroke, each touching a single element; the final
comparison is one pass. **Space \`O(n + m)\`** — both finished texts held in full.

This is a perfectly good answer and the one to write if the follow-up is never asked: it is short, it
is obviously correct, and its one edge case is stated explicitly in the code rather than relying on a
language quirk. It is also where the interesting question begins, because the trace above shows it
spending work it throws away — which is the opening the last two rungs exploit.

---`,
  },
  {
    rung: "backward-pass-with-a-skip-counter",
    title: "Read backwards with a debt counter",
    idea: `*The stack pushes every letter before it can know whether that letter lives — can the reading order be
changed so each character is decidable on sight?* Read right to left. Then the \`'#'\` arrives
**before** its victim, so a counter of deletions still owed is enough: a \`'#'\` raises the debt, a
letter with debt outstanding pays one off and dies, a letter with no debt survives. This fixes the
stack's weakness — **work it later undoes** — and nothing is ever pushed only to be popped.`,
    intuition: `> **Intuition.** Reading a bank statement from the bottom up. You see the withdrawals before the
> deposits they cancel, so by the time you reach a deposit you already know whether it has been spent.
> The number you carry is a **debt**: how many surviving characters are still owed to backspaces you
> have already passed. Every character you meet is judged immediately and finally — there is no
> pending state, no undo, and nothing to revisit.`,
    worked: `\`s = "abc##d"\`, read from index 5 down to 0:

| \`i\` | \`ch\` | debt before | debt after | verdict | survivors so far (reverse order) |
|---|---|---|---|---|---|
| 5 | \`'d'\` | 0 | 0 | **survives** | \`['d']\` |
| 4 | \`'#'\` | 0 | 1 | debt +1 | \`['d']\` |
| 3 | \`'#'\` | 1 | 2 | debt +1 | \`['d']\` |
| 2 | \`'c'\` | 2 | 1 | dies, pays one | \`['d']\` |
| 1 | \`'b'\` | 1 | 0 | dies, pays one | \`['d']\` |
| 0 | \`'a'\` | 0 | 0 | **survives** | \`['d','a']\` |

\`t = "ad#d"\`, read from index 3 down to 0:

| \`i\` | \`ch\` | debt before | debt after | verdict | survivors so far |
|---|---|---|---|---|---|
| 3 | \`'d'\` | 0 | 0 | **survives** | \`['d']\` |
| 2 | \`'#'\` | 0 | 1 | debt +1 | \`['d']\` |
| 1 | \`'d'\` | 1 | 0 | dies, pays one | \`['d']\` |
| 0 | \`'a'\` | 0 | 0 | **survives** | \`['d','a']\` |

\`['d','a'] == ['d','a']\` → **true** ✅ Both lists are in reverse order, and both consistently so, which
is why they can be compared directly without reversing either.

Rows \`i=4\` and \`i=3\` of the first table are the run of hashes, and the debt climbing to \`2\` is the
whole point: a flag would have stopped at "yes, delete something".`,
    code: `def backspace_compare_backward_pass(s: str, t: str) -> bool:
    survivors: list[list[str]] = []
    for text in (s, t):
        out: list[str] = []
        skip = 0
        for i in range(len(text) - 1, -1, -1):
            if text[i] == HASH:
                skip += 1             # a COUNTER, not a flag: a run of hashes owes that many
            elif skip > 0:
                skip -= 1
            else:
                out.append(text[i])
        survivors.append(out)
    return survivors[0] == survivors[1]`,
    mistake: `> **Watch out.** Using a boolean flag instead of a counter — \`skip = True\` on a \`'#'\`, \`skip = False\`
> on the next letter. The misconception is that a backspace is a *state* ("the next character dies")
> rather than a *quantity*. A boolean cannot hold "two characters are owed", so a **run of hashes
> deletes only one character**.

Measured on the worked example it returns \`False\`. Traced: reading \`"abc##d"\` backwards, \`'d'\`
survives, the first \`'#'\` sets the flag, the second \`'#'\` sets the already-set flag (the second
deletion is lost), \`'c'\` clears the flag and dies, and then \`'b'\` and \`'a'\` both **survive** — giving
\`"abd"\` instead of \`"ad"\`, against \`t\`'s correct \`"ad"\`.

It also mis-handles over-deletion in the other direction: on \`s = "ab##"\`, \`t = "a"\` it returns \`True\`
where the answer is \`False\`, because only one of the two trailing hashes was honoured, leaving \`"a"\`.
And on \`s = "abcdef#####g"\`, \`t = "ag"\` it returns \`False\`. Note that it is **correct** on
\`"ab#c"\` / \`"ad#c"\`, which has no run — testing without a run of hashes cannot catch this.`,
    cost: `**Time \`O(n + m)\`** — one pass per string, one decision per character, and no character is ever
revisited. **Space \`O(n + m)\`** — the two survivor lists.

Its asymptotic cost matches the stack, so on paper it is not an improvement — and that is exactly why
it matters. The gain is not the complexity class but the **idea**: a counter replaced a container
because the reading direction made each decision final. Keep that idea and drop the lists, and the
next rung is what remains.

---`,
    notes: [
      { title: "why it works", body: `> **Why it works.** The claim is that \`skip\` — the count of unpaid hashes seen so far, reading right
> to left from the end — is **complete information** about whether the next character survives. Why:
> the editor's rule is that a \`'#'\` deletes the nearest surviving character to its *left*. So for a
> character at position \`i\`, whether it survives depends entirely on the hashes at positions \`> i\` and
> the characters between them — that is, entirely on the suffix you have **already read**. Reading
> backwards, the suffix is exactly your history, so no future input can change a verdict you have
> issued.
>
> Contrast the forward direction. There, the fate of the character at \`i\` depends on the hashes at
> positions \`> i\` — the part you have **not read yet**. That is why every forward approach must keep
> the character around provisionally: not because it is written badly, but because the information
> needed to decide has not arrived. The stack is not a poor choice for a forward pass; it is the
> *right* choice, and the forward pass is the wrong direction.
>
> The debt must be a **counter and not a flag**, because \`skip\` has to represent "three characters are
> still owed", and that is exactly what a run of hashes produces. The clamp \`elif skip > 0\` is the
> other half: a letter met with no debt outstanding survives, which is what makes a leading \`'#'\`
> harmless — its debt is simply never collected.
>
> The general lesson: **when a rule refers to what comes after, try walking the other way.** Here it
> turns an undo-heavy container into a single integer.` },
    ],
  },
  {
    rung: "optimal",
    title: "Two backward cursors, constant space (optimal)",
    idea: `*Every rung so far builds both finished texts in full — up to 400 characters of memory to produce one
bit — and none can stop early when the very first survivors already disagree. Do the texts need to
exist at all?* No. Run two independent backward walks in lockstep, each skipping its own debts, and
compare survivors as they surface. This fixes the previous rung's last weakness — **storing two full
texts to answer a boolean** — and adds early exit for free.`,
    intuition: `> **Intuition.** Two people proof-reading the same paragraph from the end, each with their own copy
> and their own pencil. Each scans back to the next word that actually counts, they hold it up, and
> they compare. If the words differ they stop immediately; if one of them runs out of paragraph while
> the other still has a word, the texts had different lengths and they stop too. Nothing is written
> down, ever — the only state is where each finger is.`,
    worked: `\`s = "abc##d"\`, \`t = "ad#d"\`. Both cursors start at the last index owing nothing.

| round | start \`i\`, \`j\` | what \`prev_survivor\` consumes in \`s\` | what it consumes in \`t\` | lands at | compare |
|---|---|---|---|---|---|
| 1 | \`i=5\`, \`j=3\` | \`i=5\` \`'d'\` survives at once | \`j=3\` \`'d'\` survives at once | \`i=5\`, \`j=3\` | \`'d'\` vs \`'d'\` — **match** |
| 2 | \`i=4\`, \`j=2\` | \`i=4\` \`'#'\` debt→1; \`i=3\` \`'#'\` debt→2; \`i=2\` \`'c'\` dies (2→1); \`i=1\` \`'b'\` dies (1→0); \`i=0\` \`'a'\` **survives** | \`j=2\` \`'#'\` debt→1; \`j=1\` \`'d'\` dies (1→0); \`j=0\` \`'a'\` **survives** | \`i=0\`, \`j=0\` | \`'a'\` vs \`'a'\` — **match** |
| 3 | \`i=-1\`, \`j=-1\` | loop condition \`i >= 0 or j >= 0\` is false | | — | both ran out together → **true** ✅ |

Round 2 is the entire lesson. On the \`s\` side, one call to \`prev_survivor\` consumed **five** indices —
two hashes and the two characters they killed, then the survivor — before returning. A version that
stepped once per round would have compared \`'c'\` against something, and \`'c'\` does not exist in the
finished text. The two sides consumed different numbers of indices (five and three) in the same round,
which is fine and expected: the rounds are counted in *survivors*, not in characters.

Note also that the two finished texts were never built. The only state at any moment is \`i\`, \`j\` and
one \`skip\` inside the helper.`,
    code: `HASH = "#"


def prev_survivor(text: str, i: int) -> int:
    """Walk left from \`i\` to the next character that survives; -1 if there is none.

    The whole constant-space trick lives here: reading right to left, a '#'
    arrives BEFORE its victim, so \`skip\` is a debt counter and every character
    can be judged on sight. A run of hashes raises the debt by that many, and
    the loop must consume the WHOLE run before it can return.
    """
    skip = 0
    while i >= 0:
        if text[i] == HASH:
            skip += 1
            i -= 1
        elif skip > 0:                # this character pays off one pending delete and dies
            skip -= 1
            i -= 1
        else:
            return i                  # owes nothing: it survives
    return -1


def backspace_compare_two_cursors(s: str, t: str) -> bool:
    i, j = len(s) - 1, len(t) - 1
    while i >= 0 or j >= 0:
        i = prev_survivor(s, i)
        j = prev_survivor(t, j)
        if i >= 0 and j >= 0:
            if s[i] != t[j]:
                return False
        elif i >= 0 or j >= 0:
            # one side ran out of survivors while the other still has one
            return False
        i -= 1
        j -= 1
    return True`,
    mistake: `> **Watch out.** Omitting the \`elif i >= 0 or j >= 0: return False\` branch. The misconception is that
> comparing the survivors is enough — it checks that the texts *agree where they overlap*, and says
> nothing about one being longer. Without it, a shorter text that is a suffix of the longer one
> compares equal.

Measured on \`s = "c"\`, \`t = "ac"\`: it returns \`True\` where the answer is \`False\`. Round 1 matches
\`'c'\` against \`'c'\`; in round 2, \`s\` has fallen off the front while \`t\` still has \`'a'\`, and with the
branch missing the loop simply steps both cursors past the end and reports success. It returns \`True\`
on \`s = "ab##"\`, \`t = "a"\` for the same reason.

The other classic is the one the helper exists to prevent: writing the skip logic as \`if\` rather than
\`while\`, so a \`'#'\` is handled once per round instead of consuming its whole run. Measured on the
worked example that returns \`False\`, and on \`s = "abcdef#####g"\`, \`t = "ag"\` it also returns \`False\` —
in both cases the cursor stops on a condemned character and compares it. Keeping the walk in one named
function with one loop is the cheapest way to never write that bug.`,
    cost: `**Time \`O(n + m)\`** — each index of each string is visited exactly once across all rounds, because
\`prev_survivor\` only ever moves its cursor left and never revisits. The early return on a mismatch
often finishes far sooner. **Space \`O(1)\`** — \`i\`, \`j\` and one \`skip\` inside the helper; nothing
allocated scales with the input.

> **In an interview.** Say the direction insight before writing a line: *"reading forwards, a
> character's fate depends on keystrokes that have not arrived yet, which is why a stack has to push
> things it later pops — so I will read backwards, where the \`'#'\` comes first and a counter decides
> each character on sight."* That sentence is the whole interview. Write the stack version if you need
> a warm-up, price it at \`O(n + m)\` space, and then do this one. Expect two follow-ups: *"why a
> counter and not a boolean?"* (a run of hashes owes more than one) and *"what if the strings have
> different lengths after deletion?"* (the \`elif\` branch — say it out loud, because it is the part
> most candidates leave out and it is the only thing standing between \`"c"\` and \`"ac"\` comparing
> equal).

---`,
    notes: [
      { title: "why it works", body: `> **Why it works.** Two guarantees, and both come from the direction of travel.
>
> **1. Each survivor is final when it surfaces.** By the argument in approach 4, a character's fate
> depends only on the suffix already read, so \`prev_survivor\` returning index \`i\` is a permanent
> verdict: \`text[i]\` *is* the next character of the finished text, reading from the end. That means
> comparing the two surfaced characters is comparing the finished texts one position at a time, from
> the back — which is a valid equality test, since two strings are equal exactly when they are equal
> read backwards.
>
> **2. The termination test catches length mismatches.** Each round advances both walks by exactly
> one survivor. If both cursors fall off the front in the same round, both texts ran out together, so
> they had the same length and every compared pair matched — \`true\`. If exactly one still has a
> survivor, one text is longer, so they differ — \`false\`, and no further comparison is needed. That
> is what the \`elif i >= 0 or j >= 0\` branch is for, and dropping it is the classic bug below.
>
> **The fiddly part is consuming a whole run of hashes before comparing.** \`prev_survivor\` must loop
> until the debt is paid in full, not step once. If it returns after handling a single \`'#'\`, the
> cursor is left sitting on a character that is already condemned, and it gets compared. This is where
> every off-by-one in this problem lives, and lifting the walk into its own named function is the
> cheapest defence: the loop has one job and one exit condition, stated once and used twice.` },
    ],
  },
  ],
  arc: `The principle every step here chases is *stop doing work you will have to undo, and the way to stop is
to change the direction you read in*. The difficulty is present before any code: the editor's rule
says a \`'#'\` deletes the nearest **surviving** character to its left, so reading left to right the
fate of any character depends on keystrokes that have not arrived yet, and every forward approach must
therefore hold characters provisionally. The recursion is the most literal reading of the rule —
find the first \`'#'\`, delete it and its victim, hand yourself a shorter problem — and it is correct,
and it pays for that literalness by copying both strings and opening a call frame for every single
deletion. Flattening it into a loop that types the text out removes the recursion and keeps the worst
of the cost, because trimming the last character of an immutable string rebuilds the whole prefix, so
a linear number of keystrokes becomes quadratic work; what that rung makes visible, though, is that
the *algorithm* was already linear and all the expense was in the **container**. Swapping in a stack
fixes exactly that — one push or one pop per keystroke, with a pop from empty stated explicitly as the
no-op the constraints promise — and gives the first genuinely linear solution. But the trace of that
stack shows \`'b'\` and \`'c'\` pushed and then popped, work done and undone, and the reason is not the
container but the direction: at the moment the stack met \`'b'\` the information needed to judge \`'b'\`
did not yet exist. Reverse the reading and that changes completely, because the hashes arrive before
their victims, so a character's fate now depends only on the suffix already consumed; a single integer
counting **deletions still owed** replaces the container entirely, and it must be a counter rather
than a flag precisely because a run of hashes owes more than one. That leaves two survivor lists
holding two full texts in order to answer a single boolean, which is the last thing to go: run the two
backward walks in lockstep instead, compare each pair of survivors as they surface, and stop at the
first disagreement or at the moment one side runs out while the other has not. The fiddly part, and
the only genuinely hard line in the problem, is that each walk must consume an entire **run** of
hashes before it may report a survivor — step once and you compare a character that the finished text
does not contain — which is why that walk is worth lifting into its own named function with one loop
and one exit. The transferable habit is short enough to keep: **when a rule refers to what comes
after, try walking the other way**, and when an algorithm is already linear but slow, suspect the
container before the logic.

---`,
  comparison: {
      "head": [
          "Approach",
          "Time",
          "Space",
          "Core trade-off",
          "Best used when"
      ],
      "rows": [
          [
              "Recursion, one cancel at a time",
              "`O((n + m)²)`",
              "`O(n + m)` frames",
              "The most literal statement of the rule; copies both strings and opens a frame per deletion",
              "Convincing yourself what the rule actually means — never for running"
          ],
          [
              "Rebuild by slicing",
              "`O(n² + m²)`",
              "`O(n + m)`",
              "Flat and readable, but every `'#'` rebuilds the whole prefix",
              "Showing that the cost is the container, not the algorithm"
          ],
          [
              "Cancel with a stack",
              "`O(n + m)`",
              "`O(n + m)`",
              "One operation per keystroke; still pushes characters it later pops, because forwards it cannot know",
              "The follow-up is not asked; short, obviously correct, edge case stated in code"
          ],
          [
              "Backward pass with a debt counter",
              "`O(n + m)`",
              "`O(n + m)`",
              "Same cost as the stack, but each character is decided once and finally — a counter replaces a container",
              "The step that carries the idea; ship the next one instead"
          ],
          [
              "Two backward cursors",
              "`O(n + m)`, early exit",
              "`O(1)`",
              "Never builds either text; compares survivors as they surface, at the price of the fiddliest loop here",
              "The expected answer once `O(1)` space is asked for — which it will be"
          ]
      ]
  },
  interview: `**Know cold: the two backward cursors.** This problem exists for its constant-space follow-up, and an
answer that stops at the stack stops one question early. What must be automatic is the helper's loop
— consume the **whole** run of hashes before returning a survivor — and the length-mismatch branch,
which is the single most commonly omitted line in this problem and the only thing preventing \`"c"\` and
\`"ac"\` from comparing equal.

**Know cold: why backwards works and forwards does not.** *"Forwards, a character's fate depends on
keystrokes that have not happened yet; backwards, the \`'#'\` arrives first, so a debt counter decides
each character on sight."* Say that before writing anything. It is the transferable idea, it explains
every rung below it in one sentence, and it is what the question is screening for.

**Understand but do not drill: the recursion, the slicing version and the stack.** The stack is worth
being able to write quickly as a warm-up or a fallback — it is linear, obviously correct, and states
the leading-\`'#'\` rule explicitly with \`if keep:\` — but say its \`O(n + m)\` space out loud and then
improve on it. The recursion and the slicing version are each worth one sentence: the first to fix the
rule in your head, the second to locate the cost in the container rather than the logic.

---`,
  scriptNote: `All five approaches in one file. \`HASH\` is a module constant and \`prev_survivor\` is lifted out of the
final rung because its walk is needed twice, once per string — and because keeping that loop in one
place is the cheapest defence against the off-by-one it is prone to. \`typed_text\` is **reference
scaffolding, not an answer**: it types a string out the obvious way so every approach can be checked
against something independent.

Tests cover the worked example with its run of hashes, all three of the statement's examples including
the leading \`'#'\`, the smallest legal input (both empty), a string of nothing but hashes against an
empty string, both sides deleted down to nothing, repeated letters, a long run of hashes, and three
distinct \`false\` shapes — same length with different text, one text a suffix of the other, and one side
emptied entirely. The \`false\` cases *are* the no-valid-answer case here: the answer is a boolean, so
"no match" is a legitimate result rather than an absent one. The stress test runs 4000 random pairs
over a deliberately hash-heavy alphabet, with 30 % of them forced equal so \`true\` cases are common,
cross-checked against the reference.`,
  script: `"""Two Strings After the Backspaces - every approach in one file, cross-checked.

Run: python backspace_compare.py
"""

from __future__ import annotations

import random

HASH = "#"


def backspace_compare_recursion(s: str, t: str) -> bool:
    at = s.find(HASH)
    if at >= 0:
        head = s[: at - 1] if at > 0 else ""   # a '#' at index 0 has nothing to its left
        return backspace_compare_recursion(head + s[at + 1 :], t)
    at = t.find(HASH)
    if at >= 0:
        head = t[: at - 1] if at > 0 else ""
        return backspace_compare_recursion(s, head + t[at + 1 :])
    return s == t


def backspace_compare_slicing(s: str, t: str) -> bool:
    typed: list[str] = []
    for text in (s, t):
        out = ""
        for ch in text:
            if ch == HASH:
                out = out[:-1]        # slicing an empty string is a silent no-op in Python
            else:
                out = out + ch
        typed.append(out)
    return typed[0] == typed[1]


def backspace_compare_stack(s: str, t: str) -> bool:
    typed: list[list[str]] = []
    for text in (s, t):
        keep: list[str] = []
        for ch in text:
            if ch == HASH:
                if keep:              # a backspace on empty text deletes nothing
                    keep.pop()
            else:
                keep.append(ch)
        typed.append(keep)
    return typed[0] == typed[1]


def backspace_compare_backward_pass(s: str, t: str) -> bool:
    survivors: list[list[str]] = []
    for text in (s, t):
        out: list[str] = []
        skip = 0
        for i in range(len(text) - 1, -1, -1):
            if text[i] == HASH:
                skip += 1             # a COUNTER, not a flag: a run of hashes owes that many
            elif skip > 0:
                skip -= 1
            else:
                out.append(text[i])
        survivors.append(out)
    return survivors[0] == survivors[1]


def prev_survivor(text: str, i: int) -> int:
    """Walk left from \`i\` to the next character that survives; -1 if there is none.

    The whole constant-space trick lives here: reading right to left, a '#'
    arrives BEFORE its victim, so \`skip\` is a debt counter and every character
    can be judged on sight. A run of hashes raises the debt by that many, and
    the loop must consume the WHOLE run before it can return.
    """
    skip = 0
    while i >= 0:
        if text[i] == HASH:
            skip += 1
            i -= 1
        elif skip > 0:                # this character pays off one pending delete and dies
            skip -= 1
            i -= 1
        else:
            return i                  # owes nothing: it survives
    return -1


def backspace_compare_two_cursors(s: str, t: str) -> bool:
    i, j = len(s) - 1, len(t) - 1
    while i >= 0 or j >= 0:
        i = prev_survivor(s, i)
        j = prev_survivor(t, j)
        if i >= 0 and j >= 0:
            if s[i] != t[j]:
                return False
        elif i >= 0 or j >= 0:
            # one side ran out of survivors while the other still has one
            return False
        i -= 1
        j -= 1
    return True


def typed_text(text: str) -> str:
    """The reference: just type it out."""
    out: list[str] = []
    for ch in text:
        if ch == "#":
            if out:
                out.pop()
        else:
            out.append(ch)
    return "".join(out)


def reference(s: str, t: str) -> bool:
    return typed_text(s) == typed_text(t)


APPROACHES = [
    ("recursion", backspace_compare_recursion),
    ("slicing", backspace_compare_slicing),
    ("stack", backspace_compare_stack),
    ("backward pass", backspace_compare_backward_pass),
    ("two cursors", backspace_compare_two_cursors),
]


def run_case(label: str, s: str, t: str) -> bool:
    want = reference(s, t)
    results = [(name, fn(s, t)) for name, fn in APPROACHES]
    agree = all(got == want for _, got in results)
    print(label)
    print(f"  s={s!r} -> {typed_text(s)!r}   t={t!r} -> {typed_text(t)!r}   (reference {want})")
    for name, got in results:
        print(f"    {name:<14} -> {got}")
    print(f"    all agree with the reference: {agree}")
    return agree


def main() -> None:
    ok = True

    # The document's worked example: a RUN of hashes on one side.
    ok &= run_case("the document's worked example", "abc##d", "ad#d")

    ok &= run_case("statement 1", "ab#c", "ad#c")
    ok &= run_case("statement 2 - a false case", "a#c", "b")
    ok &= run_case("statement 3 - a leading '#'", "#a", "a")

    # Smallest legal input.
    ok &= run_case("both empty", "", "")
    ok &= run_case("one empty, one all hashes", "", "###")
    ok &= run_case("everything deleted on both sides", "abc###", "xy##")

    # Duplicates and repeated letters.
    ok &= run_case("repeated letters", "aaa#a", "aa#aa")
    ok &= run_case("a long run of hashes", "abcdef#####g", "ag")

    # False cases: same length, different text; and different lengths.
    ok &= run_case("same length, different text", "xy", "xz")
    ok &= run_case("one side is a suffix of the other", "c", "ac")
    ok &= run_case("prefix survives, suffix does not", "ab##", "a")

    random.seed(5)
    bad = 0
    for _ in range(4000):
        def gen() -> str:
            n = random.randint(0, 14)
            # heavy on '#' so runs of them, and deletes on empty text, happen constantly
            return "".join(random.choice("aab#c#") for _ in range(n))

        s, t = gen(), gen()
        if random.random() < 0.3:       # force plenty of TRUE cases, not just random FALSEs
            t = s
        want = reference(s, t)
        for name, fn in APPROACHES:
            got = fn(s, t)
            if got != want:
                bad += 1
                ok = False
                print(f"  STRESS DISAGREEMENT {name} s={s!r} t={t!r}: got {got}, want {want}")
    print(f"stress: 4000 random string pairs (<= 14 chars, hash-heavy), all five approaches, {bad} disagreements")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok else "APPROACHES DISAGREED - see above.")


if __name__ == "__main__":
    main()`,
  scriptOutput: `\`\`\`
the document's worked example
  s='abc##d' -> 'ad'   t='ad#d' -> 'ad'   (reference True)
    recursion      -> True
    slicing        -> True
    stack          -> True
    backward pass  -> True
    two cursors    -> True
    all agree with the reference: True
statement 1
  s='ab#c' -> 'ac'   t='ad#c' -> 'ac'   (reference True)
    recursion      -> True
    slicing        -> True
    stack          -> True
    backward pass  -> True
    two cursors    -> True
    all agree with the reference: True
statement 2 - a false case
  s='a#c' -> 'c'   t='b' -> 'b'   (reference False)
    recursion      -> False
    slicing        -> False
    stack          -> False
    backward pass  -> False
    two cursors    -> False
    all agree with the reference: True
statement 3 - a leading '#'
  s='#a' -> 'a'   t='a' -> 'a'   (reference True)
    recursion      -> True
    slicing        -> True
    stack          -> True
    backward pass  -> True
    two cursors    -> True
    all agree with the reference: True
both empty
  s='' -> ''   t='' -> ''   (reference True)
    recursion      -> True
    slicing        -> True
    stack          -> True
    backward pass  -> True
    two cursors    -> True
    all agree with the reference: True
one empty, one all hashes
  s='' -> ''   t='###' -> ''   (reference True)
    recursion      -> True
    slicing        -> True
    stack          -> True
    backward pass  -> True
    two cursors    -> True
    all agree with the reference: True
everything deleted on both sides
  s='abc###' -> ''   t='xy##' -> ''   (reference True)
    recursion      -> True
    slicing        -> True
    stack          -> True
    backward pass  -> True
    two cursors    -> True
    all agree with the reference: True
repeated letters
  s='aaa#a' -> 'aaa'   t='aa#aa' -> 'aaa'   (reference True)
    recursion      -> True
    slicing        -> True
    stack          -> True
    backward pass  -> True
    two cursors    -> True
    all agree with the reference: True
a long run of hashes
  s='abcdef#####g' -> 'ag'   t='ag' -> 'ag'   (reference True)
    recursion      -> True
    slicing        -> True
    stack          -> True
    backward pass  -> True
    two cursors    -> True
    all agree with the reference: True
same length, different text
  s='xy' -> 'xy'   t='xz' -> 'xz'   (reference False)
    recursion      -> False
    slicing        -> False
    stack          -> False
    backward pass  -> False
    two cursors    -> False
    all agree with the reference: True
one side is a suffix of the other
  s='c' -> 'c'   t='ac' -> 'ac'   (reference False)
    recursion      -> False
    slicing        -> False
    stack          -> False
    backward pass  -> False
    two cursors    -> False
    all agree with the reference: True
prefix survives, suffix does not
  s='ab##' -> ''   t='a' -> 'a'   (reference False)
    recursion      -> False
    slicing        -> False
    stack          -> False
    backward pass  -> False
    two cursors    -> False
    all agree with the reference: True
stress: 4000 random string pairs (<= 14 chars, hash-heavy), all five approaches, 0 disagreements

ALL APPROACHES AGREED ON EVERY CASE.
\`\`\``,
}

export default doc
