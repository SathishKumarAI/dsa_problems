// char-replacement — which rungs to know cold, and the drills
//
// Converted from docs/deep/char-replacement_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `**Know cold — the window with the stale maximum.** Nine lines, written without hesitation. But the code
is the smaller half of what is being tested.

> **In an interview.** The follow-up is always some form of *"your \`most\` is wrong there — why is the
> answer still right?"* Have this ready: **a stale \`most\` only ever makes the window refuse to shrink,
> which lets it hold a width the record already contains; since the answer is the widest window ever
> reached, refusing to shrink at a moment that could not have beaten the record costs nothing.** Being
> able to add *why the \`while\` never iterates twice* — the window loses at most one character per
> right-move — is the bonus answer that ends the line of questioning.

**Know cold — the affordability rule, independently of the code.** *Length minus the count of the most
frequent letter is the number of rewrites the stretch needs.* Deriving that in the first minute is what
separates solving this problem from having seen it. Everything else follows mechanically, and if you
blank on the window you can still write the quadratic version and price it honestly.

**Understand, do not memorize — the recomputed-max window.** Worth explaining, because it makes the
final version's cleverness visible by contrast, and because it is the fallback if the affordability
rule ever becomes something that genuinely cannot be maintained incrementally. Write it if unsure; it
is \`O(26n)\` and it passes. Just say out loud that you know the scan can be dropped, and why.

**Understand, do not memorize — brute force.** Ten seconds to state and price. Its real value is as the
oracle you cross-check against and the thing you visibly improve *from*.

---`
