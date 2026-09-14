// daily-warmer — which rungs to know cold, and the drills.
//
// Which two or three to have in recall, and why the rest are for understanding
// rather than for typing out under time.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

export const interview = `**Memorise cold: the monotonic stack, and the amortised argument that justifies it.** The loop is six
lines and you should be able to write it without hesitation, but writing it is only half of what is
being assessed.

> **In an interview.** The other half arrives as "there is a \`while\` inside a \`for\` — isn't that
> \`O(n²)\`?", and your answer must be immediate: *each index is pushed exactly once and popped at most
> once, so there are at most \`n\` pops in total across the whole run, however they clump*. Volunteer
> it before you are asked. Be ready with two more one-liners: what the stack holds — **indices whose
> answer is still unknown**, in decreasing temperature order — and why indices rather than
> temperatures, which is that the answer is a distance, so you need \`i - j\`.

**Memorise second: the family this belongs to, and the knobs that move within it.** Being able to say
"this is next-greater-element reported as a gap, and the same loop with \`>\` instead of \`<\` gives next
smaller, with the sweep reversed gives previous greater, and with a width multiplied in gives largest
rectangle" is worth more than any single implementation, because it converts four or five separate
problems into one thing you already know. Include the part that differs: what happens to whatever is
left on the stack at the end — nothing here, a flush with a sentinel in largest-rectangle.

**Understand but do not drill: the brute force and the backward scan.** The brute force is worth
stating and pricing — 5 × 10⁹ comparisons at the stated n = 10⁵ on a decreasing series — and then
leaving behind; its lasting value is as the reference your stress test compares against. The backward
scan is genuinely clever and genuinely linear, and it is still the wrong thing to reach for under
pressure: its correctness rests on a hop-counting argument that is harder to defend on a whiteboard
than "pushed once, popped once", and the O(n) stack it saves is rarely the constraint that matters.
Know that it exists, know why it works, and lead with the stack.

---`
