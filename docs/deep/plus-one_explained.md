# Add One to a Digit Array — explained

## Understanding the Problem

You are handed a number that has been taken apart. Instead of one value, you get a list with one
decimal digit per slot, written the way you would write it on paper — most significant digit first,
so `[1, 9, 9]` is the number one hundred and ninety-nine. Add one to that number and hand back the
answer in the same taken-apart form.

**The core question:** which digits actually change when you add one, and does the answer need more
room than the input had? The naive approach — glue the digits back into a single number, add one,
and take it apart again — is not slow, it is *unsafe*: the number is allowed to have a hundred
digits, and no fixed-width integer type in Java, C++, Go or Rust holds a hundred-digit number. The
whole reason this problem hands you an array instead of an `int` is that the value may not fit in
an `int`.

That is worth saying plainly, because it is the one place this problem is usually misread. In
Python the naive approach is *correct* — Python integers grow without limit — so a Python solver
can pass every test with it and never learn what the problem is about. The ladder below is
therefore not primarily a ladder of speed. It is a ladder of **not depending on a width you were
never promised**, and then of doing the addition with less state and fewer passes.

### The constraints, and what each one unlocks

| Constraint | What it means for you |
|---|---|
| `1 <= digits.length <= 100` | Never empty, so `digits[len - 1]` is always a real slot and no approach needs an empty-input branch. But a hundred digits is about a 333-bit number. **This is the constraint that kills Approach 1 outside Python**: the largest unsigned 64-bit integer is 20 digits long, so from 20 digits on a `long long` accumulator silently wraps. Measured below. |
| `0 <= digits[i] <= 9` | Every slot holds exactly one decimal digit. Adding one to a digit gives at most 10, so **the carry out of any position is 0 or 1 and never more.** That is what lets every approach carry a single flag instead of an arbitrary number, and why `total // 10` is always 0 or 1. |
| no leading zeros, except that `[0]` is a legal way to write zero | The input is a canonical spelling of the number, and the output must be one too — `[0, 1, 0, 0]` is not an acceptable way to write one hundred. This is why the growing case prepends exactly one `1` rather than padding. |
| a carry out of the leading digit makes the answer exactly one digit longer | **This unlocks the last two rungs.** Growth is not arbitrary: the answer is either the same length or one longer, it is one longer only when every digit was a 9, and in that case it is always a `1` followed by that many zeros. Knowing the shape of the only growing case in advance is what lets Approach 4 decide it before the loop and Approach 5 recognise it by falling off the front. |
| we add one to a **non-negative** number | There is no borrow, no sign, and no subtraction anywhere. The whole problem is one direction of carry. |

The worked example used in every section below is the statement's third example — chosen because it
is the only one that exercises a carry that *travels and then stops*, which is the behaviour the
later rungs are built around:

```
digits = [1, 9, 9]        answer: [2, 0, 0]   (199 + 1 = 200)
```

The all-nines input `[9, 9, 9] -> [1, 0, 0, 0]` is the other shape worth holding in your head, and
it appears in the "Common mistake" sections because it is where four of the five rungs break when
they break.

---

## Approach 1 — Build the number, add one, split it back

### The idea

*What does "add one to this number" mean?* Literally that: fold the digits into the number they
spell, add one, and peel the digits back off with repeated division by ten. It reads like the
definition of the problem, which is exactly why it is the first thing almost everyone writes.

### How to think about it

Think of the digit array as a number in a box with the lid off, and this approach as closing the
lid, doing ordinary arithmetic, and opening it again. Folding is Horner's rule — start at zero and
for each digit do "times ten, plus the digit" — which is just the reading you do in your head when
you see `199`. Unfolding is the reverse: `% 10` shakes the last digit loose, `// 10` throws it
away, repeat until nothing is left. The two halves are mirror images, and the peeling half produces
digits in the *wrong order*, least significant first, so the last act is to flip them. Everything
about this is honest arithmetic; the danger is entirely in the box, because the box in most
languages has a fixed size.

### Worked example

`digits = [1, 9, 9]`.

Fold, one digit at a time:

| digit read | `value` before | `value * 10 + digit` |
|---|---|---|
| 1 | 0 | 1 |
| 9 | 1 | 19 |
| 9 | 19 | **199** |

Add one: `value = 200`.

Peel, least significant first:

| step | `value` | `value % 10` | `out` so far | `value // 10` |
|---|---|---|---|---|
| 1 | 200 | 0 | `[0]` | 20 |
| 2 | 20 | 0 | `[0, 0]` | 2 |
| 3 | 2 | 2 | `[0, 0, 2]` | 0 |

`value` is now 0, so the loop stops. `out` is `[0, 0, 2]`, backwards. Reverse it: `[2, 0, 0]`.

### Code

```python
def plus_one_build_integer(digits: list[int]) -> list[int]:
    value = 0
    for d in digits:
        value = value * 10 + d
    value += 1
    out: list[int] = []
    while value > 0:
        out.append(value % 10)
        value //= 10
    out.reverse()  # peeled least-significant first, so flip it back
    return out
```

### Common mistake

Forgetting `out.reverse()`. The peeling loop necessarily produces digits from the right-hand end,
so the list it builds is the answer written backwards, and nothing about the code looks wrong.
Running the version without that line on `[1, 9, 9]` returns:

```
[0, 0, 2]
```

Two, not two hundred. It passes any palindromic test input — `[1, 2, 1]` becomes `[1, 2, 2]` and
reversing changes nothing visible on a short glance — which is what lets it survive to a hidden
test.

The much larger mistake is not a Python mistake at all, and it is the reason this rung exists in
the document: **writing this in a language with fixed-width integers.** Simulating a C++
`long long` accumulator (64 bits, wrapping) gives, measured:

| input | what the accumulator holds after folding + 1 | digits it then peels off |
|---|---|---|
| nineteen 9s | −8446744073709551616 | `[]` — the peel loop's `while value > 0` never runs |
| twenty 9s | 7766279631452241920 | `[7, 7, 6, 6, 2, 7, 9, 6, 3, 1, 4, 5, …]` |
| one hundred 9s | 0 | `[]` |

Nineteen nines is already past the end: the accumulator has gone negative, the peel loop does not
execute once, and the function returns an empty array. Twenty nines wraps to a positive value and
returns twenty digits of confident nonsense. A hundred nines lands exactly on zero. None of these
throw; all of them are wrong; and the constraints permit all three.

### Complexity and when to use this

**Time O(n), space O(n)** *in Python*. Time is one pass to fold and one pass to peel, both linear in
the digit count — though with Python's unbounded integers, arithmetic on an n-digit number is not
truly constant-time, so the honest bound is closer to O(n²) for the multiply-accumulate on very
large n. Space is the output list plus, again in Python, the big integer itself, which is
proportional to n.

Use it only when you know the value fits and you want the shortest possible code — for example
inside a script where the input is a three-digit product code. Name it in an interview and then
reject it out loud on the width argument: "in Python this works, but the array representation only
exists because the number might not fit a machine word, so I will not depend on it." Rejecting it
for the right reason scores better than never mentioning it.

---

## Approach 2 — Reverse, carry, reverse back

### The idea

*If the number might not fit in a machine word, can we add one without ever forming the number?*
Yes — do the addition the way you were taught on paper, one column at a time, carrying. A loop
naturally runs left to right while addition naturally runs right to left, so flip the digits first,
carry forward, and flip back.

This fixes Approach 1's fatal weakness: **it depends on an integer type wide enough to hold the
whole value, and no fixed-width type is wide enough for a hundred digits.** Carrying one digit at a
time has no width at all.

### How to think about it

Picture the column addition you did as a child: the digits stacked, the little carried 1 written
above the next column, working right to left. This approach is exactly that, with one simplification
— the bottom row is all zeros except a single 1 in the units column, so instead of adding two digits
you add one digit and a carry that starts at 1. The reversal is pure ergonomics: the arithmetic
wants to start at the units and a `for` loop wants to start at index 0, so reversing makes those the
same place. When the columns run out and the carry is still alive, there is one more column — the
one you would have written to the left of everything — and that is the digit you append.

### Worked example

`digits = [1, 9, 9]`.

Reverse first: `rev = [9, 9, 1]` — now index 0 is the units.

| `i` | `rev[i]` | `carry` in | `total` | `rev[i]` becomes `total % 10` | `carry` out | `rev` after |
|---|---|---|---|---|---|---|
| 0 | 9 | 1 | 10 | 0 | 1 | `[0, 9, 1]` |
| 1 | 9 | 1 | 10 | 0 | 1 | `[0, 0, 1]` |
| 2 | 1 | 1 | 2 | 2 | 0 | `[0, 0, 2]` |

The loop ends with `carry = 0`, so nothing is appended. Reverse back: `[2, 0, 0]`.

Contrast with `[9, 9, 9]`: every column produces a carry, the loop ends with `carry = 1`, the append
fires, `rev` becomes `[0, 0, 0, 1]`, and reversing gives `[1, 0, 0, 0]`.

### Code

```python
def plus_one_reverse_carry(digits: list[int]) -> list[int]:
    rev = digits[::-1]
    carry = 1
    for i in range(len(rev)):
        total = rev[i] + carry
        rev[i] = total % 10
        carry = total // 10
    if carry:
        rev.append(carry)  # a carry still alive means the answer is one digit longer
    rev.reverse()
    return rev
```

### Common mistake

Dropping the `if carry: rev.append(carry)` line. It is the only statement outside the loop, it looks
like tidying-up, and on most inputs it does nothing — so it gets deleted or never written. Running
the version without it:

| input | what it returns | correct answer |
|---|---|---|
| `[1, 9, 9]` | `[2, 0, 0]` | `[2, 0, 0]` — passes |
| `[9, 9, 9]` | `[0, 0, 0]` | `[1, 0, 0, 0]` |

`[9, 9, 9]` comes back as `[0, 0, 0]`: the carry that should have become the new leading digit was
computed, stored in a variable, and then thrown away when the function returned. The bug is invisible
on every input that is not all nines, which is why "run it on all nines" is the first test to write
for this problem, not the last.

### Complexity and when to use this

**Time O(n), space O(n).** Time is three linear passes — reverse, carry, reverse — and each column
does a fixed amount of arithmetic, so the constant is small but the pass count is three. Space is
O(n) because `digits[::-1]` allocates a full copy; nothing here writes into the caller's array.

Use it when the input must not be mutated and you would rather copy than reason about aliasing, or
when you are writing the general "add two arbitrary-length numbers" routine — there the reversed
layout genuinely pays, because you are aligning two arrays of different lengths at their units
digits and index 0 being the units makes that alignment free. For adding exactly one, the next rung
gets the same answer without the copies.

---

## Approach 3 — Carry from the back

### The idea

*Why physically turn the digits around when an index can just count downwards?* Leave the array
alone and run `i` from the last slot to the first. While you are at it, notice that once the carry
becomes 0 nothing further can change, so the loop can stop early instead of marching through digits
it will not touch.

This fixes Approach 2's weakness: **it pays two extra passes and a full-size copy purely to face the
digits the other way**, which a decrementing index does for free.

### How to think about it

Same paper addition, but instead of rotating the sheet you read it right to left. The carry is a
message being passed leftwards, and the loop condition says two things at once: keep going while
there are still columns (`i >= 0`) **and** while there is still a message to deliver (`carry`). The
moment a column absorbs the carry without producing one, the message is spent and every digit
further left is already correct — so the loop exits and you are done. If instead the columns run out
while a message is still in flight, that message has nowhere to go but a brand-new column at the
front, and that is the one case where the array grows.

### Worked example

`digits = [1, 9, 9]`, `carry = 1`, `i` starting at 2.

| `i` | `digits[i]` | `carry` in | `total` | `digits[i]` becomes | `carry` out | `digits` after | loop continues? |
|---|---|---|---|---|---|---|---|
| 2 | 9 | 1 | 10 | 0 | 1 | `[1, 9, 0]` | yes — `i = 1`, carry alive |
| 1 | 9 | 1 | 10 | 0 | 1 | `[1, 0, 0]` | yes — `i = 0`, carry alive |
| 0 | 1 | 1 | 2 | 2 | 0 | `[2, 0, 0]` | **no — carry is now 0** |

The loop exits on the carry, not on the index. `carry` is 0, so the array is returned as it stands:
`[2, 0, 0]`.

Note what the early exit buys on a different input: `[1, 2, 3]` does exactly one iteration and stops,
never reading the 1 or the 2 at all.

### Code

```python
def plus_one_carry_back(digits: list[int]) -> list[int]:
    carry = 1
    i = len(digits) - 1
    while i >= 0 and carry:  # stop the moment the carry is spent
        total = digits[i] + carry
        digits[i] = total % 10
        carry = total // 10
        i -= 1
    if carry:
        return [1] + digits
    return digits
```

### Common mistake

Writing the loop as `while carry:` and leaving out `i >= 0`. The reasoning feels airtight — "keep
going while there is a carry, and there cannot be a carry once a digit absorbs it" — and it is
airtight everywhere except all nines, where the carry survives past the front of the array. In a
language with bounds checking you get a crash, which is at least loud. **In Python you get a silent
wrong answer**, because `digits[-1]` is not an error: it wraps around to the last element. Measured
on `[9, 9, 9]`:

```
[0, 0, 1]
```

Trace it: the three nines become zeros, `i` reaches −1, the loop runs once more, `digits[-1]` reads
the final 0, adds the carry, and writes 1 into the *last* slot. The carry is now spent, so the
`if carry` branch never fires and the function returns a three-digit array whose value is 1 — the
answer should be 1000. Python's negative indexing turned an out-of-bounds bug into a plausible-looking
number, which is strictly worse than a crash.

### Complexity and when to use this

**Time O(n), space O(1).** Time is one backward pass that stops as soon as the carry dies — worst
case (all nines) it visits every digit, best case (last digit below 9) it visits exactly one, and the
average over uniformly random digits is about 1.1 columns. Space is constant: two scalars, and the
array is edited in place. The only allocation is `[1] + digits` in the growing case, which happens
for exactly one input shape.

Use it when you want one routine that generalises — replace `carry = 1` with a second number's digits
and this is the body of add-two-numbers and of string addition without changing its structure. For
adding literally one, Approach 5 says the same thing with less state.

---

## Approach 4 — Special-case all nines

### The idea

*The carry variable is the part that keeps going wrong — can the problem be arranged so there is no
carry to get wrong?* Only one input ever grows, and its answer is completely known in advance: all
nines becomes a 1 followed by that many zeros. Test for it up front and return that directly;
everything else can then zero out its trailing nines and bump the first digit that is not one,
with no carry state at all.

This fixes Approach 3's weakness: **the carry is state that must be read correctly *after* the loop
ends, and the after-the-loop read is exactly where people forget it** — the `[9, 9, 9] -> [0, 0, 0]`
failure from Approach 2 is the same wound in a different place. Deciding the growing case before the
loop starts removes the variable and the boundary together.

### How to think about it

Split the world in two before doing any work. Either the number is all nines — in which case you
already know the answer and there is nothing to compute — or it is not, in which case there is
guaranteed to be at least one digit below 9, and the rightmost such digit is where the increment
lands. Everything to the right of that digit is a nine and becomes a zero; everything to its left is
untouched. The all-nines test is not an optimization, it is a *precondition*: it is what makes the
inner `while digits[i] == 9` loop safe to write without an index guard, because a non-nine is
guaranteed to exist and the loop is guaranteed to stop before falling off the front.

### Worked example

`digits = [1, 9, 9]`.

**Step 1 — the guard.** Are all digits 9? `1` is not, so no. Fall through to the general case.

**Step 2 — zero out the trailing nines.** `i` starts at 2.

| `i` | `digits[i]` | is it 9? | action | `digits` after |
|---|---|---|---|---|
| 2 | 9 | yes | write 0, step left | `[1, 9, 0]` |
| 1 | 9 | yes | write 0, step left | `[1, 0, 0]` |
| 0 | 1 | **no** | stop | `[1, 0, 0]` |

**Step 3 — bump.** `digits[0] += 1` gives `[2, 0, 0]`.

On `[9, 9, 9]` the guard fires at step 1 and returns `[1] + [0, 0, 0]` = `[1, 0, 0, 0]` without
entering any loop.

### Code

```python
def plus_one_special_case_nines(digits: list[int]) -> list[int]:
    if all(d == 9 for d in digits):
        return [1] + [0] * len(digits)
    i = len(digits) - 1
    while digits[i] == 9:  # safe because the guard above ruled out running off the front
        digits[i] = 0
        i -= 1
    digits[i] += 1
    return digits
```

### Common mistake

Getting the length of the special case wrong: writing `[1] + [0] * (len(digits) - 1)`. The instinct
is that the leading 1 replaces something, so the zeros should be one fewer. They should not — the 1
is an *extra* column, and all n original nines become zeros. Measured on `[9, 9, 9]`:

```
[1, 0, 0]
```

That is 100. The answer is 1000. The mistake is arithmetically silent — the output is a perfectly
well-formed digit array with no leading zeros — and it is off by a factor of ten on every all-nines
input, which is the only input that reaches the branch. The sanity check that catches it in one
second: the answer must be `len(digits) + 1` long, so there are `len(digits)` zeros.

### Complexity and when to use this

**Time O(n), space O(1).** Time is up to two passes: the `all(d == 9 ...)` scan, which short-circuits
at the first non-nine and so is usually one comparison, plus the zeroing walk. On the one input where
the scan runs to the end — all nines — the zeroing walk does not run at all, so no input pays for
both in full. Space is constant apart from the single allocation in the growing branch.

Use it when the special case is genuinely special in your domain and you want it stated at the top of
the function where a reader will see it — that readability argument is real. But notice what the next
rung notices: the guard scans forward looking for a non-nine, and the loop then walks backward
looking for the same non-nine. The same question is being asked twice.

---

## Approach 5 — Walk from the back and return the moment a digit absorbs it (optimal)

### The idea

*If the all-nines test and the increment are both looking for the first digit below 9, why run them
as two separate walks?* Walk backwards once. The first digit below 9 absorbs the increment and you
return on the spot. If you never find one, you ran off the front — and running off the front *is*
the all-nines case, already fully zeroed on the way past.

This fixes Approach 4's weakness: **checking for all nines up front costs a full pass before any work
begins, and then the real work walks the digits a second time.** One backward pass decides both
questions, and the decision costs nothing extra because it is simply where the loop ended.

### How to think about it

You are walking left along a row of digits with one unit to deliver. At each digit you ask a single
question: *can this digit take it?* A digit below 9 can — it becomes one larger, the delivery is
complete, and every digit further left is none of your business, so you leave immediately. A 9
cannot — it rolls over to 0 and the delivery moves one place left. If you walk past the first digit
still carrying the unit, there were no takers anywhere: every digit was a 9 and every one is now a 0,
and the unit becomes a brand-new leading digit. The early return is not a speed trick, it is the
observation that **a carry cannot travel past a digit it does not overflow** — the loop has nothing
left to do, not merely nothing useful.

### Worked example

`digits = [1, 9, 9]`.

| `i` | `digits[i]` | is it below 9? | action | `digits` after |
|---|---|---|---|---|
| 2 | 9 | no | write 0, step left | `[1, 9, 0]` |
| 1 | 9 | no | write 0, step left | `[1, 0, 0]` |
| 0 | 1 | **yes** | `digits[0] += 1`, **return** | `[2, 0, 0]` |

Three iterations, no carry variable, no post-loop branch taken. Two other shapes worth holding
beside it:

- `[1, 2, 3]`: `i = 2`, `3 < 9`, becomes 4, return. **One iteration**, and the 1 and the 2 are never
  read.
- `[9, 9, 9]`: all three become 0, the loop ends by exhausting `range`, and the final line returns
  `[1] + [0, 0, 0]` = `[1, 0, 0, 0]`.

### Code

```python
def plus_one_early_return(digits: list[int]) -> list[int]:
    for i in range(len(digits) - 1, -1, -1):
        if digits[i] < 9:
            digits[i] += 1
            return digits  # nothing to the left of a digit below 9 can change
        digits[i] = 0
    return [1] + digits  # ran off the front: every digit was a 9
```

### Common mistake

Writing `break` where the `return` belongs, and then falling through into the growing branch:

```python
for i in range(len(digits) - 1, -1, -1):
    if digits[i] < 9:
        digits[i] += 1
        break            # WRONG — leaves the loop, but the function keeps going
    digits[i] = 0
return [1] + digits      # now runs on EVERY input, not just all nines
```

The array is incremented correctly and then a leading 1 is glued onto it unconditionally. Measured:

| input | what it returns | correct answer |
|---|---|---|
| `[1, 2, 3]` | `[1, 1, 2, 4]` | `[1, 2, 4]` |
| `[1, 9, 9]` | `[1, 2, 0, 0]` | `[2, 0, 0]` |

Every answer is a thousand-and-something. The structural point is that the final line is not a
general epilogue — it is the *else* branch of the loop, reachable only when the loop found no taker.
`return` inside the loop is what expresses that, and `break` destroys it. If you prefer `break`, the
honest spelling is Python's `for ... else`, where the trailing block runs only when the loop was
never broken out of.

### Complexity and when to use this

**Time O(n), space O(1).** Time is one backward pass with an early exit, so the worst case is n
iterations (all nines, the only input that reaches the last digit) and the common case is one — on
uniformly random digits the expected number of iterations is `1/(1 - 1/10)` ≈ 1.11, because each
step continues only when it lands on a 9. Space is constant: the loop holds one index, the array is
edited in place, and the single allocation happens only in the growing branch, which is the only case
where a new array is genuinely required. That is as tight as this problem gets — you must at minimum
read the last digit, and you must at minimum write a new array when the length changes.

**This is the one to memorize.** It is the shortest correct solution, it has no carry variable to
mishandle, its growing case and its loop termination are the same event rather than two conditions
kept in sync, and it generalises directly into add-two-numbers, add-binary and string addition by
replacing the implicit `+1` with a second operand.

---

## The Overall Arc

Every step on this ladder is chasing one principle: **do the arithmetic where the data actually
lives, and stop the moment nothing more can change.** The first instinct is to reassemble the
number, and in Python that instinct is even correct — which is precisely the trap, because the array
representation exists for exactly one reason, that the value may not fit in a machine word, and a
solution that folds a hundred digits into a `long long` is not slightly wrong but catastrophically
wrong in a way that returns a plausible number instead of an error. So the first real move is to
stop forming the number at all and do paper-column addition instead, carrying a single digit's worth
of state; reversing the array makes the units digit land at index 0, which is what a forward loop
wants, and that works, at the price of two flips and a full copy purely to change which way the
digits face. A decrementing index faces them the other way for nothing, so the copies go, and with
the copies gone a second observation becomes visible: the loop does not need to run to the end at
all, because once a digit absorbs the carry the message is spent and every digit to its left is
already the answer. That leaves only one variable, the carry, and one boundary, the moment the loop
ends with the carry still alive — and that boundary is where the classic wrong answer lives, all
nines silently returning all zeros. One way to kill the boundary is to decide it first, testing for
all nines before touching anything, which is genuinely clearer to read but asks the same question
twice: the guard scans forward for a digit below nine and the loop then walks backward to the same
digit. The last rung fuses them. Walk backward once, and the first digit below nine takes the
increment and ends the function on the spot; run off the front and you have *proved* it was all
nines, with every digit already zeroed on the way past, so the special case is not tested for, it is
what remains when the loop finds nothing. Reassemble, carry with copies, carry in place, decide the
special case, and finally let the special case fall out of where the walk stopped — and the two
worth carrying into an interview are the last one, which you write, and the first one, which you
name and then reject out loud on the width argument, because naming why the digit array exists is
the answer to the question the problem is really asking.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Build the number, add one, split it back | O(n) | O(n) | Shortest possible code, bought by depending on an integer type wide enough for the whole value — which no fixed-width type is | The value is known to fit and you want a one-liner; otherwise, only as the rung you name and reject |
| Reverse, carry, reverse back | O(n) | O(n) | Removes the width dependency; pays two extra passes and a full copy to put the units digit at index 0 | The input must not be mutated, or you are writing general multi-digit addition where index 0 = units aligns two operands for free |
| Carry from the back | O(n) | O(1) | Same carry logic with a decrementing index, so no copies — but the carry must be read correctly after the loop | You want one routine that generalises to adding two arbitrary-length numbers |
| Special-case all nines | O(n) | O(1) | Removes the carry variable and its after-the-loop boundary; pays a second scan to do it | The special case is worth stating at the top of the function for a reader |
| **Walk from the back, return early** | **O(n)** worst, **O(1)** typical | **O(1)** | **One pass answers both questions; the growing case is where the loop ended, not a thing tested for** | **The default answer for this problem** |

---

## Interview Priority

**Memorize cold — walk from the back with an early return.** Five lines, no carry variable, no
post-loop condition to keep in sync with the loop. Be ready for the follow-up, which is almost always
"what happens on `[9, 9, 9]`?" — the answer is that the loop exhausts, every digit is already 0, and
the final line prepends the 1. Be equally ready for "why an array and not an `int`?", because that
is the question the problem is actually about.

**Memorize cold — the general carry loop (Approach 3).** Not for this problem, where Approach 5 beats
it, but because it is the body of add-two-numbers, add-binary, add-strings and multiply-strings with
only the operands changed. If you know only the early-return trick, the moment the interviewer says
"now add two arbitrary-length numbers" you have nothing to build on, and that follow-up is common.

**Know how to name and reject — build the integer.** Ten seconds of your answer: "the obvious version
folds the digits into an integer; in Python that is correct, in Java or C++ it wraps somewhere around
nineteen digits and the constraints allow a hundred, so I will not use it." Correctly rejecting a
technique on a constraint is a stronger signal than not having considered it.

**Understand but do not memorize — reverse, carry, reverse back.** Worth being able to explain because
it makes the case for the decrementing index by contrast, and because the reversed layout is the right
one when you are aligning two operands of different lengths. For this problem it is two passes and a
copy you do not need.

**Understand but do not memorize — special-case all nines.** Its value is the observation, not the
code: there is exactly one input shape whose answer is longer than its input, and you know that
answer in closed form. Carry the observation; write Approach 5.

---

## Full Runnable Script

Every approach above, plus a test suite covering the statement's example, the smallest legal input
`[0]`, the smallest input that grows `[9]`, all nines, a carry that travels and stops, repeated
digits, a 100-digit input far past any fixed-width integer, and 45 randomised cases — each one
cross-checked against an independent oracle that does the arithmetic with Python's unbounded
integers. Every approach mutates its argument, so each is handed its own copy.

```python
"""Add One to a Digit Array - every approach in one file, plus a self-checking test suite.

Run: python plus_one_all.py
"""

from __future__ import annotations

import random


# --- 1. Build the number, add one, split it back -------------------------------

def plus_one_build_integer(digits: list[int]) -> list[int]:
    value = 0
    for d in digits:
        value = value * 10 + d
    value += 1
    out: list[int] = []
    while value > 0:
        out.append(value % 10)
        value //= 10
    out.reverse()  # peeled least-significant first, so flip it back
    return out


# --- 2. Reverse, carry, reverse back -------------------------------------------

def plus_one_reverse_carry(digits: list[int]) -> list[int]:
    rev = digits[::-1]
    carry = 1
    for i in range(len(rev)):
        total = rev[i] + carry
        rev[i] = total % 10
        carry = total // 10
    if carry:
        rev.append(carry)  # a carry still alive means the answer is one digit longer
    rev.reverse()
    return rev


# --- 3. Carry from the back ----------------------------------------------------

def plus_one_carry_back(digits: list[int]) -> list[int]:
    carry = 1
    i = len(digits) - 1
    while i >= 0 and carry:  # stop the moment the carry is spent
        total = digits[i] + carry
        digits[i] = total % 10
        carry = total // 10
        i -= 1
    if carry:
        return [1] + digits
    return digits


# --- 4. Special-case all nines -------------------------------------------------

def plus_one_special_case_nines(digits: list[int]) -> list[int]:
    if all(d == 9 for d in digits):
        return [1] + [0] * len(digits)
    i = len(digits) - 1
    while digits[i] == 9:  # safe because the guard above ruled out running off the front
        digits[i] = 0
        i -= 1
    digits[i] += 1
    return digits


# --- 5. Walk from the back and return early (optimal) --------------------------

def plus_one_early_return(digits: list[int]) -> list[int]:
    for i in range(len(digits) - 1, -1, -1):
        if digits[i] < 9:
            digits[i] += 1
            return digits  # nothing to the left of a digit below 9 can change
        digits[i] = 0
    return [1] + digits  # ran off the front: every digit was a 9


APPROACHES = [
    ("build_integer", plus_one_build_integer),
    ("reverse_carry", plus_one_reverse_carry),
    ("carry_back", plus_one_carry_back),
    ("special_case_nines", plus_one_special_case_nines),
    ("early_return", plus_one_early_return),
]


# --- test suite ----------------------------------------------------------------

def plus_one_reference(digits: list[int]) -> list[int]:
    """Independent oracle: Python's unbounded integers do the arithmetic."""
    return [int(c) for c in str(int("".join(map(str, digits))) + 1)]


def random_digits(length: int, rng: random.Random) -> list[int]:
    if length == 1:
        return [rng.randint(0, 9)]
    return [rng.randint(1, 9)] + [rng.randint(0, 9) for _ in range(length - 1)]


def main() -> None:
    cases: list[tuple[str, list[int]]] = [
        ("statement example", [1, 2, 3]),
        ("smallest legal input", [0]),
        ("smallest input that grows", [9]),
        ("all nines - the only shape that grows", [9, 9, 9]),
        ("carry stops partway", [1, 9, 9]),
        ("repeated digits", [2, 2, 2]),
        ("no carry at all", [4, 3, 2, 1]),
        ("100 digits - far past any 64-bit integer", [9] * 100),
        ("100 digits, carry dies at the second digit", [1, 8] + [9] * 98),
    ]
    # Every legal input has an answer: adding one to a non-negative number always
    # produces a number, so this problem has no "no answer" case to test.

    rng = random.Random(20260912)
    for n in range(1, 40):
        cases.append((f"stress len={n}", random_digits(n, rng)))
    for n in (1, 5, 17, 19, 20, 60):
        cases.append((f"stress all nines len={n}", [9] * n))

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True

    for label, digits in cases:
        shown = digits if len(digits) <= 10 else digits[:10] + ["..."]
        print(f"\n{label}: digits={shown}")
        expected = plus_one_reference(digits)
        results = []
        for name, fn in APPROACHES:
            got = fn(list(digits))  # every approach mutates, so hand each its own copy
            results.append(got)
            short = got if len(got) <= 10 else got[:10] + ["..."]
            print(f"  {name:<{width}} -> {short}")
        agreed = all(r == expected for r in results)
        if not agreed:
            all_agreed = False
            print(f"  DISAGREEMENT: reference said {expected[:10]}")

    print(f"\n{len(cases)} cases, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED WITH THE REFERENCE ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()
```
