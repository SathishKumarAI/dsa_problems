# 3 — Sampling and the Central Limit Theorem

A poll of **1,013 people** is published claiming to know what fifty million voters think, to within
three points. Something in you objects. 1,013 out of 50,000,000 is 0.002 % of the population — how
can a sample that thin possibly speak for the whole?

Then someone tells you the more offensive fact: **if the population were five hundred million
instead of fifty, the pollster would still ask 1,013 people, and the margin would be the same three
points.** The required sample size does not depend on the population size at all.

This chapter is why both of those are true, and — more usefully — when they are false.

---

## Sampling: the part that no amount of data can fix

Back to the soup. You taste a spoonful to judge the pot, and the taste is trustworthy **if and only
if you stirred**. Stirring has a formal name: a **simple random sample**, in which every member of
the population has an equal chance of being chosen, and choosing one tells you nothing about who
else gets chosen.

Everything that can go wrong with a sample goes wrong in one of three ways, and all three are
failures to stir:

| Failure | What happens | A version you have shipped |
|---|---|---|
| **Selection bias** | Some members are more likely to be picked | Analysing only users who reached the checkout page. Sampling "recent" rows because the query was faster |
| **Non-response bias** | The ones who decline are not like the ones who answer | NPS surveys: the furious and the delighted reply, the other 95 % ignore it |
| **Survivorship bias** | You can only see the ones that made it | Studying retention among users who are still here. Fitting a model on accounts that have not yet churned |

> **Watch out.** You are about to believe the thing that every dashboard quietly teaches: **that a
> bigger sample fixes a bad one.** It does not. More data reduces *variance* — the random wobble —
> and does exactly nothing to *bias*, the systematic lean. A biased estimate with a huge `n` is a
> wrong number reported with enormous confidence, which is strictly worse than a wrong number
> reported with visible uncertainty, because the narrow interval is what convinces the room.

Here is that, measured. The true population mean session length is **36.7810** seconds. Sample it
two ways: fairly, and with a sampler that picks users with probability proportional to their session
length — the mathematical form of "heavy users are more likely to answer the survey".

| `n` | fair mean | biased mean | truth | fair error | **bias error** |
|---:|---:|---:|---:|---:|---:|
| 10 | 36.6504 | 122.9669 | 36.7810 | −0.1306 | **+86.19** |
| 100 | 36.5699 | 124.6930 | 36.7810 | −0.2111 | **+87.91** |
| 1,000 | 36.7874 | 123.4061 | 36.7810 | +0.0064 | **+86.63** |
| 10,000 | 36.7963 | 123.7983 | 36.7810 | +0.0153 | **+87.02** |

Read the last two columns down. The fair error shrinks by a factor of ten per column, exactly as it
should. **The bias error does not move.** It is 86 seconds at `n = 10` and 87 seconds at `n =
10,000`; a thousand times the data bought exactly nothing. And it is not a small error — the biased
estimate is 3.4× the truth.

> **Why it works.** The size-biased estimate converges to `E[X²]/E[X]`, not `E[X]`. For this
> lognormal population that is `μ·e^(σ²) = 36.781 × e^1.21 = 123.35` — which is what the simulation
> keeps landing on. The bias is not noise that averages out; it is a **different quantity**, and
> more sampling estimates that different quantity more and more precisely.

That is the whole reason the poll works and also the reason polls fail. 1,013 *randomly selected*
people is plenty. 1,013 people who happened to answer a landline at dinner time is not a sample of
the electorate at all, no matter how large you make it.

---

## The sampling distribution of the mean

This is the hardest idea in elementary statistics, and it is hard for a specific reason: **it is a
distribution of a thing you only ever compute once.**

You take one sample. You compute one mean. There is one number. So where is the distribution?

The answer is that you must hold a counterfactual in your head. Your sample is one of astronomically
many samples you *could* have drawn. Each of those would have given a slightly different mean. The
collection of all those possible means — with how likely each one is — is the **sampling
distribution of the mean**. It exists whether or not you ever draw a second sample, in the same way
that a die has a distribution whether or not you roll it twice.

> **Intuition.** You have met three levels and they are easy to blur:
> 1. **The population** — all the actual values. Has a mean `μ` and a spread `σ`.
> 2. **One sample** — `n` values drawn from it. Has a mean `x̄` and a spread `s`. This is what your
>    data file is.
> 3. **The sampling distribution** — the spread of `x̄` *across hypothetical repeats*. You never
>    observe it. Its spread has its own name: the **standard error**.
>
> Level 2 is a fact about your file. Level 3 is a fact about your **procedure**. Confidence
> intervals, p-values, standard errors — every inferential tool you will ever use is a statement
> about level 3, which is why none of them can be checked by looking harder at your data.

### Small enough to count on your fingers

Abstraction is why this idea slips. So make the population so small we can enumerate *every possible
sample* and not talk about probability at all.

Population: `{1, 2, 3, 10}`. Four values, all of them visible. `μ = 4`, `σ² = 12.5`, `σ = 3.5355`.

Now take every possible sample of size 2 — all `4 × 4 = 16` of them — and write down each mean:

| sample | mean | | sample | mean |
|---|---:|---|---|---:|
| (1, 1) | 1.00 | | (3, 1) | 2.00 |
| (1, 2) | 1.50 | | (3, 2) | 2.50 |
| (1, 3) | 2.00 | | (3, 3) | 3.00 |
| (1, 10) | 5.50 | | (3, 10) | 6.50 |
| (2, 1) | 1.50 | | (10, 1) | 5.50 |
| (2, 2) | 2.00 | | (10, 2) | 6.00 |
| (2, 3) | 2.50 | | (10, 3) | 6.50 |
| (2, 10) | 6.00 | | (10, 10) | 10.00 |

**That column of 16 numbers is the sampling distribution of the mean for `n = 2`.** Not a metaphor
for it, not an approximation of it — it *is* it, completely, with nothing hidden. Look at what it
does:

| | population | means of `n=1` | means of `n=2` | means of `n=3` |
|---|---:|---:|---:|---:|
| how many | 4 | 4 | 16 | 64 |
| mean of them | 4.0000 | 4.0000 | 4.0000 | 4.0000 |
| variance of them | 12.5000 | 12.5000 | **6.2500** | **4.1667** |
| `σ²/n` | — | 12.5000 | 6.2500 | 4.1667 |
| standard error | — | 3.5355 | 2.5000 | 2.0412 |

Three things, and they are the entire foundation of inference:

1. **The centre does not move.** The mean of the sample means is 4.0000 at every `n` — the sample
   mean is an **unbiased** estimator of `μ`. (Compare the biased sampler above, where the centre
   moved to 123 and stayed there.)
2. **The spread shrinks, by exactly `σ²/n`.** Not approximately — the enumerated variance is
   `6.2500` and `12.5/2` is `6.2500`, to the last digit. This is exact for any population, any `n`,
   no normality required, no limit taken.
3. **The shape changes.** The population has a lonely 10 sitting far from a cluster at 1–3. The
   `n = 2` means already have values filling the gap at 5.5 and 6.0, and 10.00 now occurs only once
   in 16 instead of once in 4. Averaging pulls the extremes inward, because *both* draws must be
   extreme to keep an extreme mean.

> **Why it works — where `σ²/n` comes from.** Two facts, one line. Variances of independent things
> add: `Var(X₁ + … + Xₙ) = nσ²`. Scaling divides variance by the square:
> `Var(cX) = c²Var(X)`. The sample mean is the sum scaled by `1/n`, so
> `Var(x̄) = (1/n²)·nσ² = σ²/n`. Take the square root and the standard error is `σ/√n`. **That is
> where the square root in every confidence interval comes from, and it is two lines of algebra —
> not a deep fact, just the two rules for variance applied in order.**
>
> The practical consequence is brutal: to halve your uncertainty you need **four times** the data.
> To get one more decimal place, a hundred times.

### The same thing on a population that is not toy

Real populations are not four numbers. Here is one built to be as hostile as possible — session
durations, lognormal, `μ = 36.7810`, `σ = 56.5700`, **skewness 7.96** (a normal distribution has
skewness 0). 20,000 repeated samples at each size:

| `n` | avg of the means | sd of the means (measured) | `σ/√n` (predicted) | skew of the means | within 1 sd |
|---:|---:|---:|---:|---:|---:|
| 1 | 36.4236 | 56.7048 | 56.5700 | 7.0741 | 0.9194 |
| 2 | 37.1314 | 40.7236 | 40.0011 | 5.0485 | 0.9039 |
| 5 | 36.6018 | 24.6333 | 25.2989 | 2.9775 | 0.8437 |
| 30 | 36.8215 | 10.4132 | 10.3282 | 1.5388 | 0.7399 |
| 100 | 36.8184 | **5.6904** | **5.6570** | 0.8545 | 0.7105 |

The measured spread tracks `σ/√n` at every size — that column pair is the `σ²/n` law holding on a
distribution that looks nothing like a bell. And the **skew column is the CLT happening in front of
you**: 7.07 → 5.05 → 2.98 → 1.54 → 0.85, heading for zero. The `within 1 sd` column heads for 0.682
from above.

Note also what the `n = 1` row is: the sampling distribution of the mean of one observation *is the
population itself*. Everything on this table starts from the raw ugly distribution and walks toward
a bell.

---

## Standard error is not standard deviation

These two get confused constantly, they are both spreads, and mixing them up is the most common
error in a results table.

| | Standard deviation `s` | Standard error `s/√n` |
|---|---|---|
| Describes | how spread out **the data** is | how uncertain **the estimate** is |
| As `n` grows | settles down to `σ` and stays | shrinks toward zero |
| Answers | "how different are two users?" | "how well do I know the average user?" |
| Use it in | "sessions last 37 s ± 57 s" | "mean session length 37 s ± 1.8 s" |

Measured on the same population (`σ = 56.5700`):

| `n` | sd of ONE sample | se of its mean |
|---:|---:|---:|
| 10 | 90.3149 | 28.5601 |
| 100 | 67.7953 | 6.7795 |
| 1,000 | 56.4918 | 1.7864 |
| 10,000 | 57.2512 | 0.5725 |

The left column is **noisily estimating a fixed number** (it should converge to 56.57, and at
`n = 10` it overshot to 90.3 because one long session landed in the sample). The right column is
**going to zero**. They are different kinds of object that happen to share units.

> **Watch out.** You are about to quote a standard deviation where a standard error belongs, or the
> reverse, and the two mistakes are not symmetric. Reporting `s` when you meant `s/√n` makes your
> estimate look far shakier than it is, and someone kills a good project. Reporting `s/√n` when you
> meant `s` claims the *population* is tight when only your *estimate* is — that is the version that
> ships a personalisation feature based on "users average 37 seconds ± 1.8", when in reality half of
> them are under 20 and some are at 600. If you cannot say out loud which of the two questions in
> the table you are answering, you do not yet know which number to print.

---

## The Central Limit Theorem

**Statement.** Let `X₁, X₂, …, Xₙ` be independent and identically distributed random variables with
finite mean `μ` and **finite** variance `σ²`. Let `x̄ₙ` be their average. Then as `n → ∞`,

```
    x̄ₙ − μ
  ─────────  →  Normal(0, 1)      (convergence in distribution)
    σ / √n
```

Equivalently, and more usefully: **for large `n`, `x̄ₙ` is approximately `Normal(μ, σ²/n)` whatever
the distribution of the `Xᵢ` was.**

Now the two explanations. They are different explanations, not a repetition; people unstick on one
or the other.

### Explanation one — the extremes run out of ways to happen

To get a sample mean far above `μ`, the draws must conspire. With `n = 2`, two high draws is
unlikely but perfectly possible — you saw `(10, 10)` occur once in our 16 samples. With `n = 30`,
you need thirty high draws in a row, and the number of ways to be *near the middle* overwhelms the
number of ways to be extreme by an enormous factor. Averaging is therefore a **cancellation
machine**: each draw's deviation from `μ` is as likely up as down, and they annihilate each other.

The shape that emerges is the shape of "many independent deviations, mostly cancelling", and — this
is the surprising part — that shape does not remember the ingredients. Chapter 2 built a bell out of
twelve flat draws. The table above built one out of a distribution with skewness 7.96. The bell is
not inherited, it is **manufactured by the addition**, and there is exactly one shape that is stable
under adding independent copies with finite variance. The normal is that fixed point, which is why
it is not one distribution among many but the attractor they all fall into.

### Explanation two — read the statement for what it does not say

The theorem is about a *standardised* quantity, and four things follow that people routinely get
backwards:

| It says | It does **not** say |
|---|---|
| The **sample mean** goes normal | The **data** goes normal. Your incomes stay skewed forever |
| The spread of `x̄` is `σ/√n` | Anything about one particular sample |
| It needs **finite variance** | It holds for every distribution. See the last section |
| It needs i.i.d. draws | It survives dependence — time series, clustered users, repeat visitors |
| Convergence is in **distribution** | The convergence is uniform, or that the tails converge as fast as the middle |

That last row is the one that costs money. Convergence is fastest in the middle of the distribution
and **slowest in the tails** — so at `n = 100` the CLT is excellent for the central 90 % and still
noticeably wrong at the 1st and 99th percentile. Since the entire business of hypothesis testing
lives in the tails (Chapter 5), "the CLT has kicked in" is a claim you should hold more loosely than
the textbook implies.

> **Watch out.** You are about to remember this as "with `n ≥ 30` the data is normal". Three words
> in that sentence are wrong. It is not the data, it is the mean of the data; 30 is not a
> threshold, it is folklore; and "is normal" should be "is approximately normal, in the middle,
> maybe". The table above is the refutation: at `n = 30` the sample means of our session-length
> population still have skewness **1.54**, and only 74.0 % of them fall within 1 sd instead of
> 68.2 %. Thirty was nowhere near enough for this population. For a mildly skewed one, five would
> have been plenty.

---

## How big must the sample be?

Two questions hide behind this one, and they have different answers.

### Question A: big enough for the normal approximation to hold?

There is no universal `n`. The honest answer is that the required `n` **scales with how skewed the
population is** — a common rule of thumb is `n > 25 × skewness²`, which for our session data
(skew 7.96) demands `n > 1,580`, and for something mildly skewed (skew 0.5) demands `n > 7`. That
rule is a rough guide, not a theorem, and the way to actually settle it is the way this chapter
settled it: **simulate the sampling distribution and look**. You have a computer; the question takes
four lines.

### Question B: big enough for the precision I want?

This one has an exact answer. Margin of error is `z · σ/√n`. Set it to the margin you want and solve:

```
  n = ( z · σ / margin )²
```

Nothing about the population size appears in that formula — which settles the question this chapter
opened with. The precision of an estimate depends on the **spread of the population and the size of
your sample**, not on how many people you did not ask. (There is a finite-population correction,
`√((N−n)/(N−1))`, for when you sample a large fraction of a finite population. For 1,013 out of 50
million it equals 0.99999, so: no.)

For the poll: a yes/no answer has `σ = √(p(1−p)) ≤ 0.5`, so the worst-case margin is
`1.96 × 0.5/√1013 = 0.0308` — **±3.1 points**, which is exactly what the published poll claimed.
Want ±1 point instead? `n = (1.96 × 0.5/0.01)² = 9,604`. Ten times the cost for three times the
precision, every time.

And for our session data, `σ = 56.57`. Required `n`, and then the width of the 95 % band actually
measured across 3,000 simulated samples of that size:

| margin wanted (sec) | required `n` | measured 95 % half-width |
|---:|---:|---:|
| 20.0 | 31 | 19.0082 |
| 10.0 | 123 | 9.8199 |
| 5.0 | 492 | 4.8980 |
| 2.0 | 3,074 | 2.0286 |

The formula delivers what it promises at every row. Note the cost curve: `20 → 2` seconds of
precision, a factor of 10, costs a factor of **99×** in sample size (31 → 3,074). That is the `√n`
tax, and it is the reason experiments are expensive.

> **In an interview.** If asked "how many samples do you need", the answer is a question: *"to
> detect what size of effect, with what power, at what significance?"* Then `n = (z·σ/margin)²` for
> an estimate, or the power calculation of Chapter 5 for a test. Naming the three inputs is the
> answer; a number without them is a guess.

---

## Where the CLT gives up

The theorem says **finite variance**. That is a real condition, not a technicality, and Chapter 2
already introduced the population that violates it: Pareto with `α = 1.2` has a finite mean and an
**undefined variance**. Sample means from it do still settle down — but not at the rate `√n`.

Measured, 3,000 repeats at each `n`, using the interquartile range because there is no variance to
measure:

| `n` | IQR of the sample means | shrink vs `n = 10` | `√n` says |
|---:|---:|---:|---:|
| 10 | 2.2372 | 1.0000 | 1.0000 |
| 100 | 1.7487 | 1.2794 | 3.1623 |
| 1,000 | 1.2788 | **1.7494** | **10.0000** |

A hundredfold increase in data should have cut the uncertainty by 10×. It cut it by **1.75×**.
(Stable-law theory predicts spread scaling as `n^(1/α − 1) = n^(−0.167)`, i.e. a shrink of
`100^0.167 = 2.15` — the measured 1.75 is in that neighbourhood and nowhere near 10. The estimate is
itself noisy, because averaging a quantity with no variance is exactly the thing that does not work.)

This is not an exotic corner. Insurance losses, file sizes, wealth, word frequencies, city sizes and
network traffic bursts are all in `α < 2` territory or close to it. For those, **the sample mean is
a bad statistic no matter how much data you collect**, and the fix is to change the question — use a
median or a trimmed mean, model the tail explicitly, or report a quantile — rather than to collect
more.

---

## The code

Paste these blocks in order into one file and run it; it takes a few seconds. Stdlib only.

```python
"""Chapter 3 - sampling and the Central Limit Theorem.

Stdlib only. Every function is independent.
Run: python ch03.py
"""

from __future__ import annotations

import math
import random
from itertools import product

# A population small enough to enumerate completely. mu = 4, sigma^2 = 12.5.
TOY: list[float] = [1.0, 2.0, 3.0, 10.0]


def make_population(size: int = 200_000, seed: int = 11) -> list[float]:
    """A deliberately ugly population: session durations in seconds, heavily right-skewed."""
    rng = random.Random(seed)
    return [rng.lognormvariate(3.0, 1.1) for _ in range(size)]


def mean(xs: list[float]) -> float:
    return sum(xs) / len(xs)


def sd(xs: list[float], ddof: int = 1) -> float:
    m = mean(xs)
    return (sum((x - m) ** 2 for x in xs) / (len(xs) - ddof)) ** 0.5


def skewness(xs: list[float]) -> float:
    """Fisher's g1. Zero for anything symmetric; positive means a tail to the right."""
    m = mean(xs)
    s = sd(xs, ddof=0)
    return sum((x - m) ** 3 for x in xs) / len(xs) / s**3


def iqr(xs: list[float]) -> float:
    """Spread that survives a distribution with no finite variance."""
    ordered = sorted(xs)
    lo = ordered[min(int(0.25 * (len(ordered) - 1)), len(ordered) - 1)]
    hi = ordered[min(int(0.75 * (len(ordered) - 1)), len(ordered) - 1)]
    return hi - lo
```

The two samplers are the point of the bias section. They have the same signature, so the experiment
swaps one for the other and changes nothing else — which is exactly how a real pipeline acquires a
bias, by swapping the data source and leaving the analysis alone:

```python
def every_sample(population: list[float], n: int) -> list[tuple[float, ...]]:
    """Every n-length sample with replacement. Tractable only for a toy population."""
    return list(product(population, repeat=n))


def simple_random_sample(population: list[float], n: int, rng: random.Random) -> list[float]:
    """Every member equally likely, drawn with replacement. The 'stirred' sample."""
    return [rng.choice(population) for _ in range(n)]


def size_biased_sample(population: list[float], n: int, rng: random.Random) -> list[float]:
    """A BROKEN sampler: heavy users answer the survey more often. Weight = the value itself."""
    return rng.choices(population, weights=population, k=n)


def sampling_distribution(
    population: list[float],
    n: int,
    reps: int,
    rng: random.Random,
    sampler=simple_random_sample,
) -> list[float]:
    """The object people find hardest: one sample mean per repetition, `reps` of them."""
    return [mean(sampler(population, n, rng)) for _ in range(reps)]
```

`sampling_distribution` is eight words long and is the most important function in this course. It
manufactures level 3 — the thing you cannot observe in real life — by doing the counterfactual
literally. Everything in Chapters 4 and 5 is this function with a different statistic inside it.

```python
def standard_error(population_sd: float, n: int) -> float:
    """Predicted spread of the SAMPLE MEAN. Shrinks with n; the data's own sd does not."""
    return population_sd / math.sqrt(n)


def required_n(population_sd: float, margin: float, z: float = 1.96) -> int:
    """Smallest n whose margin of error is at most `margin`. Invert margin = z * sd / sqrt(n)."""
    return math.ceil((z * population_sd / margin) ** 2)


def within_k_sd(xs: list[float], k: float = 1.0) -> float:
    """Share of values within k standard deviations of their own mean - the normality probe."""
    m, s = mean(xs), sd(xs)
    return sum(1 for x in xs if abs(x - m) <= k * s) / len(xs)
```

```python
def main() -> None:
    rng = random.Random(4)
    population = make_population()
    mu, sigma = mean(population), sd(population, ddof=0)
    print("=== 0. The population (which in real life you never see) ===")
    print(
        f"N={len(population)}  mu={mu:.4f}  sigma={sigma:.4f}  "
        f"median={sorted(population)[len(population) // 2]:.4f}  skew={skewness(population):.4f}"
    )

    print("\n=== 1. The sampling distribution, enumerated exactly ===")
    toy_mu = mean(TOY)
    toy_var = sum((x - toy_mu) ** 2 for x in TOY) / len(TOY)
    print(f"population {TOY}  mu={toy_mu}  sigma^2={toy_var}  sigma={toy_var ** 0.5:.4f}")
    for n in (1, 2, 3):
        means = [mean(list(s)) for s in every_sample(TOY, n)]
        var_of_means = sum((m - toy_mu) ** 2 for m in means) / len(means)
        print(
            f"  n={n}: {len(means):>3} possible samples   mean of means={mean(means):.4f}   "
            f"var of means={var_of_means:.4f}   sigma^2/n={toy_var / n:.4f}   "
            f"se={var_of_means ** 0.5:.4f}"
        )
    print("  all 16 samples of size 2, and the mean of each:")
    for s in every_sample(TOY, 2):
        print(f"    ({s[0]:>4.1f}, {s[1]:>4.1f}) -> {mean(list(s)):>5.2f}")

    print("\n=== 2. The same thing on a real, ugly population ===")
    print(
        f"{'n':>6} {'reps':>6} {'avg of means':>13} {'sd of means':>12} {'sigma/sqrt(n)':>14} "
        f"{'skew':>8} {'within 1sd':>11}"
    )
    for n in (1, 2, 5, 30, 100):
        means = sampling_distribution(population, n, 20_000, rng)
        print(
            f"{n:>6} {20000:>6} {mean(means):>13.4f} {sd(means):>12.4f} "
            f"{standard_error(sigma, n):>14.4f} {skewness(means):>8.4f} {within_k_sd(means):>11.4f}"
        )

    print("\n=== 3. Standard error is not standard deviation ===")
    print(f"{'n':>6} {'sd of ONE sample':>18} {'se of its mean':>16}")
    for n in (10, 100, 1000, 10_000):
        one = simple_random_sample(population, n, rng)
        print(f"{n:>6} {sd(one):>18.4f} {sd(one) / math.sqrt(n):>16.4f}")
    print(f"{'truth':>6} {sigma:>18.4f}")

    print("\n=== 4. Bias does not shrink. Ever. ===")
    print(
        f"{'n':>6} {'fair mean':>12} {'biased mean':>13} {'truth':>10} "
        f"{'fair err':>10} {'bias err':>10}"
    )
    for n in (10, 100, 1000, 10_000):
        fair = mean(sampling_distribution(population, n, 200, rng))
        bad = mean(sampling_distribution(population, n, 200, rng, sampler=size_biased_sample))
        print(f"{n:>6} {fair:>12.4f} {bad:>13.4f} {mu:>10.4f} {fair - mu:>10.4f} {bad - mu:>10.4f}")

    print("\n=== 5. How big must the sample be? ===")
    print(f"{'margin (sec)':>13} {'required n':>11} {'measured 95% half-width':>25}")
    for margin in (20.0, 10.0, 5.0, 2.0):
        n = required_n(sigma, margin)
        ordered = sorted(sampling_distribution(population, n, 3_000, rng))
        lo, hi = ordered[int(0.025 * len(ordered))], ordered[int(0.975 * len(ordered))]
        print(f"{margin:>13.1f} {n:>11} {(hi - lo) / 2:>25.4f}")

    print("\n=== 6. Where the CLT gives up: infinite variance ===")
    heavy = [rng.paretovariate(1.2) for _ in range(200_000)]  # alpha < 2 => variance undefined
    print(f"{'n':>6} {'IQR of means':>14} {'shrink vs n=10':>16} {'CLT predicts':>14}")
    base = 0.0
    for n in (10, 100, 1000):
        spread = iqr(sampling_distribution(heavy, n, 3_000, rng))
        base = base or spread
        print(f"{n:>6} {spread:>14.4f} {base / spread:>16.4f} {math.sqrt(n / 10):>14.4f}")


if __name__ == "__main__":
    main()
```

---

## Check yourself

**1.** You quadruple your sample size. What happens to the standard error, and what happens to the
standard deviation of the data?

<details><summary>Answer</summary>

The standard error **halves** (`σ/√n`, and `√4 = 2`). The standard deviation of the data **does not
change** in expectation — it is estimating a fixed property of the population, and more data just
estimates it more precisely. The measured table shows exactly this: the `sd of ONE sample` column
wanders around 56.57 while the `se` column falls by ~3.2× per 10× of `n`.
</details>

**2.** Your A/B test has 2 million users per arm, drawn only from users who opted into the beta
programme. Is your estimate of the treatment effect trustworthy?

<details><summary>Answer</summary>

The *precision* is superb and the *validity* is unknown. Beta opt-in is selection bias; beta users
are more engaged, more tolerant of change, and more likely to be on desktop. Two million of them
estimates the effect **among beta users** with a tiny standard error. Whether that number transfers
to everyone else is a question your data cannot answer, and the narrow interval will make everyone
in the room forget to ask it. See the bias table: 1,000× the data, the same 87-second error.
</details>

**3. (the common misconception)** True or false: "the CLT means that with `n ≥ 30`, I can assume my
data is normally distributed."

<details><summary>Answer</summary>

**False on both counts, and this is the single most repeated error in applied statistics.**

*It is not the data.* The CLT is about the sampling distribution of the **mean**, not about the
observations. Your session durations will have skewness 7.96 at `n = 30` and at `n = 30,000`.

*30 is not a threshold.* It is a rule of thumb that got promoted to a law. At `n = 30` on this
population, the sample means still had skewness 1.54 and put 74.0 % of their mass within 1 sd rather
than 68.2 % — visibly not normal. For a symmetric population, `n = 5` would have been fine. The
required `n` depends on the skew of what you are sampling, and the cheapest way to find out is to
simulate it.
</details>

**4.** A colleague reports "mean revenue per user is $4.21, standard error $0.02" on a dataset where
90 % of users spend nothing and the top 0.1 % spend thousands. What are you worried about?

<details><summary>Answer</summary>

Two things, in order of severity.

First, **the heavy tail may make the mean a bad statistic at all** — if the spend distribution is
near-Pareto with `α < 2`, that standard error is not just optimistic, it is estimating something
that does not converge at the `√n` rate. The measured table shows what that looks like: 100× the
data buying a 1.75× improvement.

Second, even if the variance is finite, ±$0.02 is a statement about the **estimate**, not the
population, and the population here is 90 % zeros and a handful of whales. Any decision that treats
"$4.21 per user" as describing a user is wrong about every single user. Ask for the median, the p99,
and the share of revenue from the top 1 %.
</details>

---

## Summary

| Concept | What it means | When it misleads you |
|---|---|---|
| **Simple random sample** | Every member equally likely, independently | Convenience samples that look random: "recent rows", "users who responded", "accounts still active" |
| **Bias** | A systematic lean in the procedure | It **does not shrink with `n`**. Measured: same 87-second error from `n=10` to `n=10,000` |
| **Sampling distribution of the mean** | The spread of `x̄` across all samples you *could* have drawn | Confusing it with the spread of your data. It is a fact about your procedure, not your file |
| **`Var(x̄) = σ²/n`** | Exact, for any population, any `n` — no normality needed | Assuming it needs the CLT. It does not; only the *shape* needs the CLT |
| **Standard error `σ/√n`** | Uncertainty of the estimate | Printed where a standard deviation belongs, making a wide population look tight |
| **Central Limit Theorem** | Standardised `x̄` → `Normal(0,1)` for i.i.d. draws with **finite variance** | "The data becomes normal" (it does not); "`n ≥ 30` suffices" (skew 7.96 needed far more); tails converge last, and tests live in the tails |
| **`n = (z·σ/margin)²`** | The sample size for a target precision | Forgetting it is independent of population size — and that 10× the precision costs 100× the data |
| **Finite variance** | The CLT's actual precondition | Heavy tails (`α < 2`): losses, file sizes, revenue. The mean never stabilises; change the statistic, not the sample size |

Next: [Chapter 4 — Confidence and uncertainty](04-confidence-and-uncertainty.md). You now have the
sampling distribution. A confidence interval is nothing more than reading two numbers off it.
