// hamming-weight — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The top-level block is
// the rung the page recommends; `alternatives` is worst -> best beneath it.
//
// Python only for now. Java and C++ are optional until a problem has a journey
// (`problems.test.ts` holds that line), and `scripts/localsmith` backfills
// them — a translation nobody has run is not content, it is a claim.

import type { Solution } from "../../data/types.ts"

export const approach = "Repeatedly clear the lowest set bit with n &= n - 1, counting the iterations. Subtracting one flips the lowest set bit to zero and turns every zero below it into a one; the AND then keeps only the bits above, so exactly one set bit disappears per step and nothing else changes. The loop therefore runs once per set bit rather than once per bit position, which is the entire point: on a sparse number it is a single iteration where shifting would take the full word."

export const whyNow = "Shifting inspects every bit position whether or not anything is there, so the cost is the word size regardless of the answer. Clearing the lowest set bit skips the zeroes entirely, making the work proportional to the answer itself."

export const arc = "n & (n - 1) is worth memorising with its reason rather than as a trick: subtracting one borrows through the trailing zeroes, flipping them to ones and clearing the lowest one, so ANDing keeps precisely the bits above it. Once that is understood the identity pays out repeatedly — n & (n - 1) == 0 tests for a power of two, the loop above counts set bits, and a variant isolates the lowest set bit as n & -n. The habit underneath is more general still: when an operation's cost tracks the word size but the answer is sparse, look for an identity that jumps to the next interesting position instead of walking to it. The corner case for the power-of-two test, which nobody writes a case for, is zero."

export const complexity = { time: "O(set bits)", space: "O(1)" }

export const python = `def hamming_weight(n: int) -> int:
    count = 0
    while n:
        # subtracting 1 clears the lowest set bit and sets every zero below
        # it, so the AND keeps only the bits ABOVE that one
        n &= n - 1
        count += 1
    return count`

export const alternatives: Solution[] = [
  {
    name: "Test every bit position",
    summary:
      "Walk all 32 positions, shifting a mask and counting the hits. The cost is fixed at the word size whatever the number looks like, which makes it predictable and needlessly thorough on sparse values.",
    complexity: { time: "O(32)", space: "O(1)" },
    python: `def hamming_weight(n: int) -> int:
    count = 0
    for i in range(32):
        if n & (1 << i):
            count += 1
    return count`,
  },
  {
    name: "Read the lowest bit and shift",
    summary:
      "Look at n & 1, then drop it with n >> 1, until nothing is left. It stops at the highest set bit rather than always running 32 times, so a small number costs little — but a set bit high up still drags the loop all the way there.",
    complexity: { time: "O(position of the highest set bit)", space: "O(1)" },
    whyNow:
      "Testing all 32 positions costs the same for 1 as for 4 billion. Stopping when the value reaches zero makes the work depend on the magnitude of the number rather than on the width of the machine word.",
    python: `def hamming_weight(n: int) -> int:
    count = 0
    while n:
        count += n & 1
        n >>= 1
    return count`,
  },
]
