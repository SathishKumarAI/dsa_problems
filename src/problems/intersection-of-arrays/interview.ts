// intersection-of-arrays — which rungs to know cold, and the drills.
//
// Which two or three to have in recall, and why the rest are for understanding
// rather than for typing out under time.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

export const interview = `**Know cold: count the smaller side, and the two-cursor merge.** They are a matched pair, and the
interview is about knowing which one the input calls for. The counting version is the default answer
and it is six lines; what earns the marks is not the code but the two sentences around it — *"this is
a counting problem, not a membership problem, so the answer's count for a value is \`min\` of the two
counts"*, and, for the famous follow-up, *"I tally whichever array is smaller and stream the other, so
the memory is bounded by the smaller input."* The two-cursor merge is what you switch to the moment
someone says the arrays are sorted, because then it is O(n + m) time with O(1) extra space and no
hashing, which strictly beats the map. Asking "are they sorted?" before you start is itself part of
the answer.

**Worth stating and rejecting out loud: the set intersection.** \`set(nums1) & set(nums2)\` is the
answer everyone reaches for first, and naming it *and then killing it* — "that gives \`[1]\` for three
1s against two, but the answer is \`[1, 1]\`" — is the fastest way to show you have actually read the
multiplicity rule rather than pattern-matched the title.

**Understand but do not drill: the cross-off scan, and the two-map version.** The cross-off scan's
value is that it makes the minimum rule physical (you run out of tokens) and that it is a
bulletproof oracle for testing — it plays exactly that role in the script below. The two-map version
is worth knowing as the readable reference implementation, the one you write when you want the rule
visible, and as the shape that generalises to three or more arrays. Neither is what you would ship.

---`
