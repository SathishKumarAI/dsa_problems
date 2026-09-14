// cycle-detect — which rungs to know cold, and the drills.
//
// Which two or three to have in recall, and why the rest are for understanding
// rather than for typing out under time.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

export const interview = `> **In an interview.** Open by naming the visited set and killing it in the same breath — *"a hash
> set of node identities is \`O(n)\` time and \`O(n)\` space, and the space is the whole point of this
> question, so let me get that to \`O(1)\`"* — then write Floyd. The follow-up is one of two, reliably:
> **"why must they meet rather than pass each other?"** (the gap shrinks by exactly one per step, so
> it cannot skip zero) or **"now give me the node where the cycle starts"** (reset one pointer to the
> head, advance both by one, they meet at the entry). Have the first as a sentence and the second as
> four lines.

**Memorize cold: Floyd's tortoise and hare.** Five lines, and the two details that decide whether it
works — the loop condition \`while fast and fast.next\`, and checking \`slow is fast\` *after* both move —
are exactly the two things people get wrong under pressure. More importantly it is not one answer but
a family: the same pointers find the cycle's entry node (the standard follow-up), measure the cycle's
length, find the duplicate in an array of \`n+1\` numbers in \`1…n\`, and turn up in
happy-number and several other disguises. Learn the proof sentence too — "the gap shrinks by exactly
one per step, so it cannot skip zero" — because "why must they meet?" is the follow-up that separates
recall from understanding.

**Memorize cold: the visited set.** Not as the answer, but as the opening move. Naming it in one
sentence — "a hash set of node identities is \`O(n)\` time and \`O(n)\` space, so let me get that to
\`O(1)\`" — is how you show you understand what the space requirement is *for*, and it is the version
you actually want when the follow-up asks for the cycle's entry point in code a reviewer can read.
It is four lines; there is no excuse for fumbling it.

**Understand but do not drill: the nested walk.** Its only job is to establish the baseline and the
identity-versus-value distinction. You can derive it on the spot; it needs no flashcard.

**Understand but do not drill: value-marking.** Mention it only if the interviewer pushes on constant
factors or you want to show you read the value range. It is a good instinct to demonstrate and a bad
solution to submit, and saying both in the same breath is the whole point.

---`
