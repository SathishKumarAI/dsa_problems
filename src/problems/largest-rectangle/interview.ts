// largest-rectangle — which rungs to know cold, and the drills
//
// Converted from docs/deep/largest-rectangle_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `**Memorise cold: the monotonic stack, and the reframing that produces it.** The code is ten lines, but
the reframing is what is actually being assessed, and it has to come first.

> **In an interview.** Open with the reframing, before any code: *"a rectangle is capped by its
> shortest bar, so I'll fix each bar as the height and find the first shorter bar on each side —
> that's next-smaller-element twice, and one stack answers both."* Then write it, and volunteer the
> two things you will be asked anyway: **why the inner \`while\` is still linear** (each index is pushed
> once and popped once, so at most \`n\` pops in total) and **why the sentinel exists** (a bar is only
> measured when something shorter arrives, so the final ascending run would never be measured). The
> follow-up is usually maximal rectangle in a binary matrix — say that it is this function called once
> per row over running column heights.

**Memorise second: the brute-force spread, including the \`>=\`.** Not to ship, but because it is how
you explain the reframing in ten seconds and how you sanity-check the fast version when it disagrees
with you at a whiteboard. Getting the \`>=\` right matters even here: equal bars must not stop the
spread, and being able to say why — an equal bar supports the plank fine — shows you understand what
the boundary actually is.

**Understand but do not drill: divide & conquer.** It is a genuinely nice idea and it is the wrong
answer to give, because its worst case is \`O(n²)\` on sorted input and sorted input is not exotic. Know
the three-case split, know that \`m - 1\` and \`m + 1\` must both exclude the minimum or it does not
terminate, know that an \`O(1)\` range-minimum structure would rescue it, and spend your preparation
time on the stack instead.

---`
