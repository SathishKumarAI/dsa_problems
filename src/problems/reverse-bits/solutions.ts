// reverse-bits — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The top-level block is
// the rung the page recommends; `alternatives` is worst -> best beneath it.
//
// Python only for now. Java and C++ are optional until a problem has a journey
// (`problems.test.ts` holds that line), and `scripts/localsmith` backfills
// them — a translation nobody has run is not content, it is a claim.

import type { Solution } from "../../data/types.ts"

export const approach = "Run exactly 32 iterations. Each one shifts the accumulating result left by one to make room, ORs in the input's lowest bit, and shifts the input right by one. Because the loop count is fixed rather than driven by the input's value, the leading zeroes are reversed along with everything else — which is what makes it correct on small numbers. The result is built low bit first, so the input's least significant bit ends up in the most significant position, exactly as reversal requires."

export const whyNow = "Building a string of bits allocates and pads, and padding to 32 characters is a step that is easy to forget and invisible when the input happens to start with a one. Shifting keeps everything in registers and makes the fixed 32 iterations the explicit guarantee that the width is respected."

export const arc = "This is the problem where the leading zeroes stop being nothing. Counting set bits can ignore them because zeroes contribute no count; reversing cannot, because a position is part of the answer whether or not anything occupies it. That distinction — value versus fixed-width representation — is the one to carry away, and it is behind a whole class of bugs in serialisation, hashing and checksums. The divide-and-conquer version is worth seeing too: swap halves, then quarters, then bytes, then adjacent pairs, then adjacent bits, and the whole reversal is five masked operations regardless of the input, which is what a library implementation actually does."

export const complexity = { time: "O(32)", space: "O(1)" }

export const python = `def reverse_bits(n: int) -> int:
    result = 0
    # exactly 32 times, NOT while n: the leading zeroes have positions too
    for _ in range(32):
        result = (result << 1) | (n & 1)
        n >>= 1
    return result`

export const alternatives: Solution[] = [
  {
    name: "Reverse the binary string",
    summary:
      "Format the number as binary, pad it to 32 characters, reverse the text and parse it back. It reads exactly like the problem statement, and the padding step is both essential and easy to leave out.",
    complexity: { time: "O(32)", space: "O(32)" },
    python: `def reverse_bits(n: int) -> int:
    bits = bin(n)[2:]
    padded = "0" * (32 - len(bits)) + bits  # the step that is easy to forget
    return int(padded[::-1], 2)`,
  },
  {
    name: "Move each bit to its mirror",
    summary:
      "For each of the 32 positions, test whether the bit is set and, if so, OR it into position 31 minus that index. The mapping is written out explicitly, which makes it obvious what reversal means and keeps everything numeric.",
    complexity: { time: "O(32)", space: "O(1)" },
    whyNow:
      "Going through text allocates a string and depends on a padding step whose absence only shows on inputs with a leading zero — a bug that passes every large example. Working on the bits directly removes both the allocation and the silent failure mode.",
    python: `def reverse_bits(n: int) -> int:
    result = 0
    for i in range(32):
        if n & (1 << i):
            result |= 1 << (31 - i)
    return result`,
  },
]
