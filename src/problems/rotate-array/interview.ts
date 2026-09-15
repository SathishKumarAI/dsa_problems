// rotate-array — which rungs to know cold, and the drills
//
// Converted from docs/deep/rotate-array_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `**Know cold — three reversals.** The expected answer to the follow-up, and you should be able to
write *and justify* it in under a minute.

> **In an interview.** Say \`k %= n\` out loud before you write a line — it is what separates a
> solution from a crash, and interviewers watch for it. Then give the one-sentence argument:
> *"reversing the whole array puts the two blocks on the correct sides with each written backwards,
> and reversing each block repairs it."* The follow-up is usually "can you do it with one write per
> element?", which is the cyclic rung — and its follow-up is "how many chains?", which is
> \`gcd(n, k)\`.

**Know cold — cut and rejoin.** One line, impossible to get wrong once \`k %= n\` is in place, and the
correct production answer when memory is not constrained. It is also the sentence that makes the
reversal trick explainable: you cannot argue "reversing swaps the blocks" until you have said the
answer is two blocks.

**Know cold — cyclic replacements, mostly for its lesson.** You are unlikely to submit it, but it is
the only rung exposing the \`gcd(n, k)\` cycle structure. Being able to say *"stepping by \`k\` around
\`n\` slots returns to the start after \`n / gcd(n, k)\` steps, so the array splits into \`gcd(n, k)\`
disjoint cycles"* is a genuinely strong signal; not being able to makes the follow-up uncomfortable.

**Understand, do not memorize — copy into a second array.** Useful as the stepping stone that
introduces \`(i + k) % n\`, and genuinely right when you may return a new array. Offer it as your final
answer and you will be asked for constant space, so you may as well get there yourself.

**Understand, do not memorize — one step at a time.** Ten seconds of naming and rejecting. Its value
is the observation it provokes: the intermediate positions were never required.

---`
