// reverse-list — which rungs to know cold, and the drills
//
// Converted from docs/deep/reverse-list_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `> **In an interview.** State the invariant before you write the loop: *"\`prev\` heads the reversed part,
> \`curr\` heads the untouched part, and I save \`curr.next\` first because the very next line destroys
> it."* That one sentence pre-empts the two things an interviewer probes for — whether you know why
> \`nxt\` exists, and whether the empty list needs a special case (it does not, because \`prev\` starts
> \`None\`). The standard follow-up is **"now do it recursively"**, so have \`head.next.next = head\`
> ready along with its \`O(n)\` stack cost; the sharper follow-up is **"reverse only nodes \`m\` through
> \`n\`"**, which is this same loop run on a window behind a dummy head.

**Memorize cold — the three-pointer loop.** Five lines, asked directly at least as often as any other
linked-list question, and — the real reason — it is a **subroutine** inside half the harder list
problems. Palindrome-check reverses the second half. Reorder-list reverses the second half.
Reverse-in-k-groups reverses a window at a time. If you have to think about \`prev, curr, nxt\` during
one of those, you have spent your thinking budget before reaching the actual problem.

**Memorize cold — the recursive version, as a second answer.** Not because you would ship it, but
because "can you do it recursively?" is the standard follow-up and \`head.next.next = head\` is the kind
of line that is obvious once seen and impossible to derive under pressure. Being able to write it *and*
immediately name its \`O(n)\` stack cost is a stronger signal than either alone.

**Not worth memorizing — copy-to-array.** Its value is rhetorical. Opening with "the obvious thing is
to dump the values and rebuild, which is \`O(n)\` time but allocates a second list and is not in place"
shows you know what the requirement is *for* before you satisfy it. You can derive the code in seconds,
so spend the memorization budget elsewhere.

---`
