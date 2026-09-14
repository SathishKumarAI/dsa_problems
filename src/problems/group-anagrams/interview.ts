// group-anagrams — which rungs to know cold, and the drills.
//
// Which two or three to have in recall, and why the rest are for understanding
// rather than for typing out under time.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

export const interview = `> **In an interview.** Say the baseline in one sentence and kill it — *"the direct approach compares
> each word against each existing group, which is quadratic in the number of groups"* — then write
> the sorted-letters key, because it is one line and impossible to get wrong. Offer the count key as
> the improvement: *"sorting and counting produce the same information, and counting is one pass
> instead of \`k log k\`."* The follow-up is almost always **"how do you build the count key?"**, and
> the answer that separates you is the delimiter: without a separator, counts of 1 and 11 collide
> with 11 and 1.

**Know cold: the sorted-letters key.** It is two lines, it is the answer most interviewers are
listening for, and proposing the better key *from* a working solution reads as engineering — while
starting from the count signature and being asked "why?" reads as recall.

**Know cold: the count signature and its separator.** The insight is one sentence and the detail that
separates someone who has written it from someone who has read it is the delimiter. "Counts of 1 and
11 collide with 11 and 1" is a specific, checkable claim, which is exactly what distinguishes answers.

**Understand but do not drill: the pairwise scan.** It exists to establish what a key is *for*, before
you produce one. After that sentence, never write it again except as a test oracle.

**One thing to say regardless of approach:** in the general version the group order is arbitrary, so
if you are asked to verify your output against an expected answer, normalise both first — sort within
each group, then sort the groups. Two correct answers in different orders look like a disagreement
otherwise, and that false alarm costs more interview time than any of the code above.

---`
