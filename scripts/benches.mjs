// The input each audited problem is timed on, at its own constraint ceiling.
//
// Authored per problem, never inferred. A generator that guessed sizes from a
// constraint STRING would eventually build an input the problem forbids, and
// this repo has already paid for that once: timing `product-except-self` at
// n = 10^5 with values outside −30..30 never returned, because the guaranteed
// 32-bit answer stops being guaranteed and Python starts multiplying numbers
// with tens of thousands of digits. A bench that violates the constraints is
// measuring a different problem.
//
// `setup` is Python that binds the call's arguments. `call` is the expression
// to time, in terms of the entry point `fn` — the harness substitutes the
// rung's own function name, which can differ between rungs.
//
// Sizes are the CEILING the constraints allow, except where a quadratic rung
// would take minutes: those carry `slowAt`, a smaller size used for the rungs
// whose bound says they cannot survive the ceiling, so the table still reports
// a real number rather than a timeout. Any such scaling is printed.

/** @type {Record<string, {setup: string, call: string, note?: string, slowAt?: {size: number, setup: string}}>} */
export const BENCHES = {
  "contains-duplicate": {
    setup:
      "import random\nrandom.seed(7)\nnums = random.sample(range(-10**9, 10**9), 100000)",
    call: "fn(nums)",
    note: "n = 10^5, all distinct — the worst case for every rung, since nothing may return early",
  },
  "pair-sum": {
    setup:
      "import random\nrandom.seed(7)\nnums = random.sample(range(-10**6, 10**6), 10000)\ntarget = nums[-1] + nums[-2]",
    call: "fn(nums, target)",
    note: "n = 10^4 at the ceiling, with the answer at the very end so no rung returns early",
  },
  "valid-anagram": {
    setup:
      "import random\nrandom.seed(7)\nletters = [chr(97 + random.randrange(26)) for _ in range(50000)]\ns = ''.join(letters)\nrandom.shuffle(letters)\nt = ''.join(letters)",
    call: "fn(s, t)",
    note: "two 5·10^4 strings that ARE anagrams, so nothing exits early",
  },
  "valid-palindrome": {
    setup: "half = 'a1b2c3, d4e5! ' * 7000\ns = half + half[::-1]",
    call: "fn(s)",
    note: "a real palindrome of ~2·10^5 characters, so both rungs read all of it",
  },
  "move-zeroes": {
    setup:
      "import random\nrandom.seed(7)\nbase = [random.choice([0, random.randrange(-2**31, 2**31 - 1)]) for _ in range(10000)]",
    call: "fn(list(base))",
    note: "n = 10^4, about half zeroes — the case where write-count differs between rungs",
  },
  "trap-rain-water": {
    setup:
      "import random\nrandom.seed(7)\nheight = [random.randrange(0, 10**5) for _ in range(20000)]",
    call: "fn(height)",
    slowAt: {
      size: 2000,
      setup:
        "import random\nrandom.seed(7)\nheight = [random.randrange(0, 10**5) for _ in range(2000)]",
    },
    note: "n = 2·10^4 at the ceiling; the per-column rung is timed at n = 2000 and scaled",
  },
  "longest-unique-substring": {
    setup:
      "import random\nrandom.seed(7)\ns = ''.join(chr(32 + random.randrange(95)) for _ in range(50000))",
    call: "fn(s)",
    slowAt: {
      size: 1200,
      setup:
        "import random\nrandom.seed(7)\ns = ''.join(chr(32 + random.randrange(95)) for _ in range(1200))",
    },
    note: "n = 5·10^4; the cubic rung is timed at n = 1200 and scaled",
  },
  "balanced-brackets": {
    setup: "s = '([{' * 3333 + '}])' * 3333",
    call: "fn(s)",
    slowAt: { size: 2000, setup: "s = '([{' * 333 + '}])' * 333" },
    note: "~10^4 deeply nested brackets, which is the worst case for the replace rung",
  },
  "classic-binary-search": {
    setup: "nums = list(range(-10000, 10000, 2))\ntarget = nums[-1]",
    call: "fn(nums, target)",
    note: "the target at the far end, so the linear rung pays its full price",
  },
  "reverse-list": {
    setup: "vals = list(range(5000))",
    call: "fn(__mklist(vals))",
    note: "5000 nodes, the constraint ceiling — also the size that overflows CPython's recursion limit",
  },
  "max-depth": {
    setup: "vals = list(range(10000))",
    call: "fn(__mktree(vals))",
    note: "a complete tree of 10^4 nodes (a degenerate chain would overflow the recursive rung by design)",
  },
  "product-except-self": {
    setup:
      "import random\nrandom.seed(7)\nnums = [random.randrange(-30, 31) or 7 for _ in range(100000)]",
    call: "fn(nums)",
    slowAt: {
      size: 3000,
      setup:
        "import random\nrandom.seed(7)\nnums = [random.randrange(-30, 31) or 7 for _ in range(3000)]",
    },
    note: "n = 10^5 with values INSIDE −30..30: outside that bound the products grow to thousands of digits and never return",
  },
  "subarray-sum-k": {
    setup:
      "import random\nrandom.seed(7)\nnums = [random.randrange(-1000, 1001) for _ in range(20000)]\nk = 0",
    call: "fn(nums, k)",
    slowAt: {
      size: 2000,
      setup:
        "import random\nrandom.seed(7)\nnums = [random.randrange(-1000, 1001) for _ in range(2000)]\nk = 0",
    },
    note: "n = 2·10^4; the two quadratic rungs are timed at n = 2000 and scaled",
  },
  "group-anagrams": {
    setup:
      "import random\nrandom.seed(7)\nwords = [''.join(random.choice('abcdefghij') for _ in range(20)) for _ in range(10000)]",
    call: "fn(list(words))",
    slowAt: {
      size: 800,
      setup:
        "import random\nrandom.seed(7)\nwords = [''.join(random.choice('abcdefghij') for _ in range(20)) for _ in range(800)]",
    },
    note: "n = 10^4 words of length 20; the pairwise rung is timed at n = 800 and scaled",
  },
  "sorted-pair-sum": {
    setup:
      "numbers = list(range(-1000, 1000))\ntarget = numbers[0] + numbers[-1]",
    call: "fn(numbers, target)",
    note: "the answer at the two ends, which is the converging walk's best case and the brute rung's worst",
  },
  "container-water": {
    setup:
      "import random\nrandom.seed(7)\nheight = [random.randrange(0, 10**4) for _ in range(100000)]",
    call: "fn(height)",
    slowAt: {
      size: 3000,
      setup:
        "import random\nrandom.seed(7)\nheight = [random.randrange(0, 10**4) for _ in range(3000)]",
    },
    note: "n = 10^5; the every-pair rung is timed at n = 3000 and scaled",
  },
}
