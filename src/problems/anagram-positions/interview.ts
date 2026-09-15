// anagram-positions — which rungs to know cold, and the drills.
//
// Which two or three to have in recall, and why the rest are for understanding
// rather than for typing out under time.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

export const interview = `> **In an interview.** Write Approach 3 and state the two index facts as you write them: after
> processing \`i\` the window is \`[i-k+1, i]\`, so \`i - k\` leaves and \`i - k + 1\` is what you report.
> The follow-up is **"can you beat 26 comparisons per step?"** — answer with the agreement counter
> and the sentence that justifies it: *only a letter whose own count changed can flip its
> verdict.* Be ready for "what does \`agree\` start at?", because that is the half people fumble: 26
> minus the number of distinct letters in the pattern.

**Memorize cold — the sliding tally (Approach 3).** This is the answer that passes, and it should
take under a minute: build \`want\`, run one loop over the text adding \`text[i]\` and subtracting
\`text[i - k]\`, compare the tallies once \`i >= k - 1\`. Know the two index facts without thinking —
after processing \`i\` the window is \`[i-k+1, i]\`, so \`i - k\` is what leaves and \`i - k + 1\` is what
you report — because that is where this gets written wrong under pressure.

**Memorize cold — the agreement counter (Approach 4).** Not because Approach 3 is too slow here, but
because this is the idea the problem exists to teach and it is the one an interviewer follows up on:
*"can you do better than 26 comparisons per step?"* The answer is the three-step \`touch\` — unbook,
change, book — and the sentence that justifies it: **only a letter whose own count changed can flip
its verdict.** Be ready to say why the counter starts at 26 minus the number of distinct letters in
the pattern; that is the half people fumble.

**Worth understanding, not memorizing — counting every window.** Its job is to make the sliding
version's improvement visible by contrast. It is also the honest first thing to say out loud —
"the naive version is a tally per window, \`O(n·k)\`" — before improving on it, and there are real
situations (scattered candidates, tiny \`k\`) where it is the correct choice rather than the
placeholder.

**Worth understanding, not memorizing — sorting every window.** One sentence in an interview:
"sorting each window works and costs \`k log k\` per window, but sorting answers a question about
order that an anagram does not ask." Naming it and rejecting it for the right reason takes ten
seconds and demonstrates you know what an anagram actually is. Its other use is as the oracle in a
test harness, where being obviously correct beats being fast.

---`
