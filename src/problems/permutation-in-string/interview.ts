// permutation-in-string — which rungs to know cold, and the drills
//
// Converted from docs/deep/permutation-in-string_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `**Know cold — the fixed-width observation itself.** *A rearrangement of \`s1\` has \`s1\`'s length, so the
window width is known before you start.* Everything else is downstream of that sentence, and saying it
in the first thirty seconds is what turns an open-ended search into a one-parameter one.

**Know cold — the tally window, in whichever of the two forms you can write correctly under pressure.**

> **In an interview.** State the skeleton before writing: *"a fixed-width window, one letter in, one
> letter out, and the only question is how I test it."* Then offer both tests explicitly — the 26-slot
> comparison and the \`agree\` counter — and say which you are writing and why. The follow-up is almost
> always **find-all-anagrams**, so pre-empt it: *"this is the same machinery; returning every start
> index instead of the first hit is a one-line change."* The other likely probe is *why only two
> letters need updating* — because counts move by one, so a letter can only just-reach or just-leave
> its target, never skip across it.

**Understand, do not memorize — sorting every window.** Worth ten seconds to state and price, because
it is the clearest statement of what "rearrangement" means and it motivates everything after it. It is
also the oracle you cross-check against. Do not submit it.

**Understand, do not memorize — the set-based shortcut, as a thing to reject.** Recognising that a set
answers *which letters* while the problem asks *how many* is the one-sentence version of this problem's
main trap, and being able to name it before you are caught by it is worth more than the code.

---`
