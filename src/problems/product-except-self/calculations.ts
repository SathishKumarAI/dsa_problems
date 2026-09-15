// product-except-self — the symbol table, and how to trace it by hand
//
// Converted from docs/deep/product-except-self_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const calculations = `This is the first problem in the set whose optimal solution is genuinely hard to *read*. Not hard to
write — it is nine lines — but hard to look at and believe, because the same array is used as an
output buffer and as a scratch pad, and because the crucial line writes a value **before** the
variable it is built from has been updated. Almost every bug here is an ordering bug, so this section
is about ordering.

### The symbol table

| You will see | It computes | Why it is written that way | If it were wrong |
|---|---|---|---|
| \`EMPTY_PRODUCT = 1\` | the product of *no* numbers | Multiplying by \`1\` changes nothing, which is exactly what "nothing has joined yet" should mean. (\`0\` is the equivalent for sums) | Start at \`0\` and every answer is \`0\` |
| \`left[i]\` | product of everything **strictly before** \`i\` | "Strictly" is the whole contract. \`left[0]\` is the empty product, because nothing is before position \`0\` | Include \`nums[i]\` and every answer is the product of the whole array |
| \`left[i] = left[i - 1] * nums[i - 1]\` | extend the previous prefix | Note the **two different indices**: writing at \`i\`, reading \`nums\` at \`i - 1\`. That offset *is* the word "strictly" | \`nums[i]\` here folds each element into its own answer — the most common bug in this problem |
| \`right[i] = right[i + 1] * nums[i + 1]\` | the mirror image | Same offset, other direction | — |
| \`out[i] = left[i] * right[i]\` | everything except \`i\` | The two halves never overlap and together cover everything else, so their product is the answer | — |
| \`out[i] = running\` **then** \`running *= nums[i]\` | the fold, forward | **Write before you update.** The value stored is the prefix *not yet* including \`nums[i]\` | Swap the two lines and \`out[i]\` includes \`nums[i]\` — the same bug as above, in disguise |
| \`out[i] *= running\` **then** \`running *= nums[i]\` | the fold, backward | \`*=\` because \`out[i]\` already holds the prefix; this multiplies the suffix into it | \`=\` overwrites the prefix and the answer becomes the suffix alone |
| \`range(n - 1, -1, -1)\` | \`n-1\` down to \`0\` | The \`-1\` end is exclusive, so it stops *after* \`0\` | \`range(n - 1, 0, -1)\` never visits position \`0\` — which is left holding a prefix of \`1\` and no suffix, silently wrong at exactly one index |

### The one rearrangement

Start from the definition and split it. The answer at \`i\` is the product of everything except \`i\`:

\`\`\`
answer[i]  =  nums[0] * nums[1] * … * nums[i-1]  *  nums[i+1] * … * nums[n-1]
              \\___________  ___________/            \\_________  _________/
                          \\/                                  \\/
                   everything LEFT of i                everything RIGHT of i

answer[i]  =  left[i] * right[i]
\`\`\`

That is the entire idea, and it is worth seeing why it is a *rearrangement* rather than a trick. The
naive reading treats each \`answer[i]\` as its own product, so the \`n\` answers share nothing. This
reading says the answers are all built from two **running** quantities that each change by one factor
per step — so the \`n\` answers share almost everything, and the sharing is what turns \`n²\` into \`n\`.

The division approach is the same equation solved the other way: \`answer[i] = total / nums[i]\`. It is
algebraically correct and it is not defined when \`nums[i]\` is \`0\`, which is why the statement bans it
and why the split above is the durable version. Division needs the whole product and then undoes
part of it; the split never builds the whole product in the first place.

### How to hand-trace it

\`nums = [1, 2, 3, 4]\`. The folded version, both passes, on one array. Every row below is printed by
the script at the foot of this document.

**Forward pass** — store the running prefix, *then* extend it:

| \`i\` | \`out[i] = running\` | then \`running *= nums[i]\` |
|---|---|---|
| 0 | \`out[0] = 1\` | \`running = 1\` |
| 1 | \`out[1] = 1\` | \`running = 2\` |
| 2 | \`out[2] = 2\` | \`running = 6\` |
| 3 | \`out[3] = 6\` | \`running = 24\` |

\`out\` is now \`[1, 1, 2, 6]\` — each slot holding the product of everything to its left. The final
\`running = 24\` is computed and never read, which is the detail the 32-bit note at the top refers to.

**Backward pass** — \`running\` resets to \`1\` and the same dance runs the other way:

| \`i\` | \`out[i] *= running\` | then \`running *= nums[i]\` |
|---|---|---|
| 3 | \`6 * 1 = 6\` | \`running = 4\` |
| 2 | \`2 * 4 = 8\` | \`running = 12\` |
| 1 | \`1 * 12 = 12\` | \`running = 24\` |
| 0 | \`1 * 24 = 24\` | \`running = 24\` |

\`out = [24, 12, 8, 6]\`. Check one by hand: position \`1\` should be \`1·3·4 = 12\`, and it is — the \`1\`
came from the forward pass, the \`12\` from the backward one, and \`nums[1] = 2\` was never multiplied in
by either, because both passes write before they update.

**The recipe, for any input:** sweep left storing the running product *before* folding in the current
element; reset; sweep right multiplying the running product *into* what is already there, again
before folding in the current element. The phrase "before folding in the current element", said
twice, is the entire algorithm.

---`
