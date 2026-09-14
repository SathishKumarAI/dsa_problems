// fruit-baskets — which rungs to know cold, and the drills.
//
// Which two or three to have in recall, and why the rest are for understanding
// rather than for typing out under time.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

export const interview = `> **In an interview.** Lead with the translation, not the code: *"the baskets are a story — this is
> the longest run containing at most two distinct values, and the general version is
> at-most-\`K\`-distinct."* Then write Approach 2. Two follow-ups are near-certain. **"That's a loop
> inside a loop, so isn't it \`O(n²)\`?"** — no: \`left\` only ever moves forward, so it takes at most \`n\`
> steps across the whole run, making both edges \`2n\` together. And **"why do you delete the kind only
> when the count hits zero?"** — because the window is a *multiset*: a kind whose first copy leaves
> may still have copies inside.

**Memorize cold — the shrinking window (Approach 2).** This is the expected answer and it should
take under a minute: a \`dict\` of counts, grow on the right, \`while len(counts) > 2\` shrink on the
left deleting a kind only at zero, track \`best\`. The single line that carries the most weight is the
guarded \`del\`; write it deliberately, because it is where the interviewer is looking.

**Memorize cold — the at-most-\`K\` generalisation.** Not separate code, one sentence: *"change the \`2\`
to a \`K\` and this is at-most-\`K\`-distinct unchanged."* It costs nothing to say and it is the
difference between having solved a puzzle and having recognised a family. If you are asked the
longest-substring-with-at-most-two-distinct-characters problem, this is verbatim the same algorithm
with \`str\` in place of \`list[int]\`.

**Worth understanding, not memorizing — the non-shrinking window (Approach 3).** Know it exists,
know it is the tightest form, and above all know **why** it is allowed: the answer is a maximum, so
a window that has become illegal never has to be repaired, and the frame's width is a high-water
mark. Offer it as a tightening *after* Approach 2. Writing it first invites "what if I asked for the
shortest such run?" and the honest answer is "I'd rewrite it", which is a worse place to stand than
having led with the general version.

**Not worth memorizing — the every-start scan.** Say it, name its \`O(n²)\`, reject it on the \`10^5\`
constraint, and move on; that takes ten seconds and it is the ten seconds that shows you are
reasoning rather than reciting. Its real job is as the oracle the fast versions are checked against,
which is exactly what it does below.

---`
