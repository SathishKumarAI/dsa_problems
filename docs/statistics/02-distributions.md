# 2 — Distributions

You are going on call for a week. The dashboard says **the support queue averages 3.4 tickets an
hour**, and you can comfortably handle six. So: how many hours of the week are you going to be
underwater?

The average cannot answer that. Not "does not", *cannot* — it is one number and the question is
about the shape of a whole week. What answers it is the **distribution**, and by the end of this
chapter you will read the answer off a table in about five seconds.

---

## What a distribution is, before any of them has a name

Take the actual week — 168 hourly counts — and do the least clever thing possible: count how often
each value occurred.

| tickets/hour | hours | share |
|---:|---:|---:|
| 0 | 5 | 0.030 |
| 1 | 23 | 0.137 |
| 2 | 34 | 0.202 |
| 3 | 28 | 0.167 |
| 4 | 34 | 0.202 |
| 5 | 22 | 0.131 |
| 6 | 13 | 0.077 |
| 7 | 6 | 0.036 |
| 8 | 2 | 0.012 |
| 9 | 1 | 0.006 |

**That is a distribution.** Nothing else. A distribution is *the list of the things that can happen,
each with how much of the probability it gets*. It is not a formula, not a curve, not a Greek
letter. The curve comes later and only as a compression of this table.

And the on-call question is now arithmetic: hours above 6 are `6 + 2 + 1 = 9` of 168, so **5.4 % of
your shift**, about four hours a week. One table, no theory.

> **Intuition.** A summary statistic is a *projection* of the distribution — mean and standard
> deviation are two numbers squeezed out of the full table, and squeezing is lossy. Chapter 1's
> bimodal latency was a case where the projection lost everything. Get in the habit of reaching for
> the table first and the summary second; the summary is for *communicating* a shape you have
> already looked at, not for discovering one.

### Continuous values, and the thing that trips programmers

Counts are easy: the values are 0, 1, 2, … and each gets a share. Now measure **response time in
milliseconds** and ask "what is the probability of exactly 43.7182 ms?"

Zero. Exactly zero, for every single value. There are uncountably many possible times and each
individual one has probability zero, which is why a continuous distribution cannot be written as
that table at all. What you get instead is **density**: the probability per unit of x, so that
*area* under the curve over a range is the probability of landing in that range.

> **Watch out.** You are about to read a density value of `2.3` off a plot and think something has
> gone wrong, because probabilities cannot exceed 1. Densities can be any non-negative number. A
> uniform distribution on `[0, 0.1]` has density 10 everywhere in that range — 10 per unit x, times
> a width of 0.1, equals a total probability of 1. **Height is not probability; height × width is.**

In practice you never see the density directly, you see a **histogram**: chop the range into bins
and count. That means every histogram you have ever looked at has a knob you did not turn — the bin
width — and that knob can manufacture or hide a second hump. Always try two bin counts before
believing a shape.

---

## The families, and what each one models

A **family** is a small formula that reproduces a whole table from one or two numbers. Their value
is not mathematical elegance; it is that *each one corresponds to a specific mechanism in the
world*, so recognising the family tells you what is generating your data.

### Uniform — "no reason to prefer any value"

**Models:** a mechanism with no structure at all inside a known range. Hash outputs across buckets.
A randomly chosen byte. The fractional part of a timestamp. `random.random()`.

**Recognise it:** a flat histogram, and `mean == median == midpoint`. `sd/mean` is a dead giveaway
for `U(0, a)`: it is `1/√3 ≈ 0.577`, measured below as 0.576.

**The useful thing:** uniform is the *null hypothesis of shape*. When your hash distribution is not
flat, you have a bug. When your p-values under a true null are not flat, your test is broken
(Chapter 5 leans on this hard).

### Normal — "many small independent nudges, added up"

**Models:** anything that is a **sum** of many small independent contributions. Measurement error
(many small errors compounding). Human heights (many genes, each a small additive push). The sample
mean of almost anything, which is Chapter 3's whole point.

**Two parameters:** `μ` (where the peak is) and `σ` (how wide). Symmetric, single hump, tails that
die off extremely fast — `e^(-x²/2)` falls off faster than any exponential.

> **Watch out.** You are about to call it the "bell curve" and treat *any* single-humped symmetric
> shape as normal. The thing that makes a normal distribution normal is not the hump, it is **how
> fast the tails die**. A `t` distribution with 3 degrees of freedom is symmetric and single-humped
> and has infinite kurtosis; a Cauchy distribution looks bell-shaped on a plot and has **no mean at
> all**. Judging normality by the middle of the picture is judging it by the part that does not
> matter. Every normal-assumption disaster in finance was a tail, never a hump.

### Binomial — "n independent yes/no trials, same probability each"

**Models:** conversions out of visitors. Defective units out of a batch. Heads out of tosses. Any
count with a **known ceiling** and a fixed per-trial probability.

**Two parameters:** `n` trials, `p` success probability. Mean `np`, variance `np(1−p)`.

**Recognise it:** a count that cannot exceed a known `n`, and — the signature — `variance/mean =
1 − p`, which is **always less than 1**. Measured below: `binomial(20, 0.3)` gives 0.700, and
`1 − 0.3 = 0.7`. A bounded count is *under*-dispersed relative to Poisson.

### Poisson — "events arriving independently at a constant rate, no ceiling"

**Models:** the support tickets. Server requests per second. Typos per page. Radioactive decays.
Anything you count **per unit of time or space** where there is no natural maximum and one event
does not make the next more likely.

**One parameter:** `λ`, both the mean and the variance.

> **Intuition.** Poisson is the binomial taken to its limit: chop the hour into a million
> milliseconds, each of which either does or does not contain a ticket with tiny probability. `n →
> ∞`, `p → 0`, `np = λ` held fixed, and the ceiling disappears. That is why Poisson has one
> parameter where binomial has two — when `p` is tiny, `np(1−p) ≈ np`, so the mean and variance
> collapse into the same number.

**Recognise it:** `variance ≈ mean`. This one ratio — the **index of dispersion** — is the single
most useful diagnostic for count data:

| `var/mean` | What it means | Likely mechanism |
|---|---|---|
| ≈ 1 | Poisson | Independent arrivals at a steady rate |
| < 1 | Under-dispersed | A ceiling (binomial), or events that *repel* — rate limiting, scheduled jobs |
| > 1 | Over-dispersed | The rate itself varies (busy hours vs quiet), or arrivals **cluster** — retries, a single user hammering the API |

Over-dispersion is the common case in real systems and it has a name: use a **negative binomial**
when `var/mean` is 3 or 5. Assuming Poisson when the data is over-dispersed makes every interval
you compute too narrow, which is the direction that gets you paged.

### Exponential — "how long until the next one"

**Models:** the *waiting time* between Poisson events. Time to the next request. Lifetime of a
component with no wear-out. Time until a cache entry is next touched.

**One parameter:** rate `λ`; mean is `1/λ`.

> **Intuition.** Poisson and exponential are the same mechanism, counted two ways: Poisson counts
> the events in a fixed window, exponential measures the gap between them. This is not a metaphor —
> the code in this chapter *generates* Poisson counts by adding up exponential waits until a unit of
> time is used up. If you understand one, you have the other for free.

**Recognise it:** `sd/mean ≈ 1`, exactly. Measured below: 0.999. Also **memorylessness** — having
waited 10 minutes tells you nothing about how much longer you will wait, which is either profound or
infuriating depending on whether you are the one waiting.

> **Watch out.** You are about to model service *durations* as exponential because it is the easy
> one-parameter choice. Memorylessness says a request that has already run for 10 seconds is exactly
> as likely to finish in the next second as a fresh one. That is a strong claim about your system and
> it is usually false — long-running requests are long-running *for a reason* (a bigger payload, a
> missing index), so they are *more* likely to keep running. That is a heavy tail, not an
> exponential one, and it is why p99 latency is always so much worse than an exponential predicts.

### The long tail — lognormal and Pareto

**Models:** anything produced by **multiplication** rather than addition. Income. File sizes. City
populations. Requests per user. Time on page. Wealth. If each step *scales* the previous value
instead of adding to it, you get a lognormal — because the logarithm turns the product into a sum
and the sum goes normal. Pareto (a power law) is the same shape with an even fatter tail.

**Recognise it:** mean ≫ median, and a small slice of the data owning a large share of the total.

Here is the full recognition table, measured on 200,000 draws from each family:

| family | mean | median | sd | var/mean | sd/mean | p99/median | top-1 % share |
|---|---:|---:|---:|---:|---:|---:|---:|
| uniform(0,10) | 4.998 | 4.998 | 2.881 | 1.660 | **0.576** | 1.981 | 0.020 |
| normal(100,15) | 99.973 | 99.895 | 15.006 | 2.253 | 0.150 | 1.349 | 0.014 |
| binomial(20,0.3) | 6.001 | 6.000 | 2.050 | **0.700** | 0.342 | 1.833 | 0.019 |
| poisson(3.4) | 3.400 | 3.000 | 1.842 | **0.998** | 0.542 | 2.667 | 0.027 |
| exponential(1/50) | 49.876 | 34.630 | 49.806 | 49.736 | **0.999** | 6.650 | 0.056 |
| lognormal(3,1) | 33.164 | 20.082 | 43.411 | 56.823 | 1.309 | 10.267 | **0.093** |
| pareto(1.5) | 2.898 | 1.587 | 11.029 | 41.979 | 3.806 | 13.411 | **0.190** |

Read the bold cells; they are the fingerprints. And read the **top-1 % share** column downward: the
top 1 % of a normal population owns 1.4 % of the total, the top 1 % of a Pareto population owns
**19 %**. That column is the difference between "we can plan capacity from the average" and "one
customer is going to take down the cluster".

> **Watch out.** The `var/mean` column is not scale-free — it changes if you switch from seconds to
> milliseconds, which is why it reads 2.253 for a normal and 49.7 for an exponential and means
> nothing in either case. It is interpretable **only for counts**, where the units are "events" and
> cannot be rescaled. The scale-free spread measure is `sd/mean`, the coefficient of variation. Do
> not compare `var/mean` across quantities measured in different units; that number is a trap in
> every direction except counts.

---

## The empirical rule, and the size of its fine print

For a normal distribution: about **68 %** of the data lies within 1 standard deviation of the mean,
**95 %** within 2, **99.7 %** within 3. That is the empirical rule, and it is why "two sigma" and
"three sigma" became shorthand for "unusual" and "alarming".

Measured on the same 200,000 draws per family:

| family | within 1 sd | within 2 sd | within 3 sd |
|---|---:|---:|---:|
| **normal(100,15)** | **0.684** | **0.955** | **0.997** |
| uniform(0,10) | 0.577 | 1.000 | 1.000 |
| binomial(20,0.3) | 0.780 | 0.976 | 0.999 |
| poisson(3.4) | 0.723 | 0.977 | 0.991 |
| exponential(1/50) | 0.865 | 0.950 | 0.982 |
| lognormal(3,1) | 0.908 | 0.962 | 0.982 |
| pareto(1.5) | 0.985 | 0.994 | 0.996 |
| *normal, as claimed* | *0.682* | *0.954* | *0.997* |

The normal row matches the claim to three decimals. **No other row does**, and the way they miss is
the lesson. The uniform has no tail at all: 2 sd covers literally everything, and a "3-sigma event"
is not rare, it is *impossible*. Pareto puts 98.5 % of its mass inside 1 sd — and the 1.5 % outside
is so far outside it drags the sd up single-handed.

> **Watch out.** You are about to say "this value is 3 standard deviations out, so there is a 0.3 %
> chance of it — something is wrong." **The 0.3 % is a fact about the normal distribution, not about
> your data.** For the Pareto column, 0.4 % of draws are beyond 3 sd, and those draws are not
> anomalies, they are Tuesday. Applying the empirical rule to a heavy-tailed metric — latency,
> revenue per user, file size — generates a stream of false alarms, then teaches your team to ignore
> alarms, which is worse than having no alarm.

---

## Why the normal turns up everywhere

Here is the question that sets up the next chapter. Why does one specific curve describe heights,
measurement errors, exam scores and — critically — sample means, when the mechanisms have nothing
in common?

Take the flattest, least bell-shaped thing available: `random.random()`, uniform on `[0, 1]`. Add
`k` of them together and check how normal the result is, using the empirical rule as the test:

| k draws summed | within 1 sd | within 2 sd | within 3 sd |
|---:|---:|---:|---:|
| 1 | 0.579 | 1.000 | 1.000 |
| 2 | 0.651 | 0.967 | 1.000 |
| 12 | **0.679** | **0.955** | **0.998** |
| *normal target* | *0.682* | *0.954* | *0.997* |

Twelve flat draws, added, and the empirical rule holds to three decimals. Here is the shape:

```
    2.080 |                                                21
    2.516 |                                                57
    2.953 | #                                              297
    3.390 | ###                                            1011
    3.827 | #######                                        2740
    4.263 | ################                               5749
    4.700 | ###########################                    10069
    5.137 | ######################################         13909
    5.573 | ############################################## 16859
    6.010 | #############################################  16485
    6.447 | ######################################         13810
    6.883 | ##########################                     9627
    7.320 | ###############                                5486
    7.757 | #######                                        2513
    8.193 | ###                                            986
    8.630 | #                                              285
    9.067 |                                                79
    9.504 |                                                17
```

Nothing in the ingredients is bell-shaped. Every draw was flat. The bell is not inherited from the
inputs — it is **manufactured by the addition**.

> **Intuition.** Adding independent things is a *smoothing* operation, and smoothing has a fixed
> point. To land at the extreme high end of a sum of twelve draws, all twelve must be high, which is
> rare; to land in the middle there are enormously many combinations. Combinatorics does the rest,
> and the shape it converges to does not remember what the ingredients looked like. That forgetting
> is the whole content of the Central Limit Theorem, and it is why the normal distribution is not
> one distribution among seven — it is the **attractor** the other six fall into once you start
> averaging them.

An average is a sum divided by a constant. So this experiment was already a demonstration about
sample means, which is Chapter 3.

---

## Worked example — is the ticket queue actually Poisson?

Claiming a family is a claim you can check. `n = 168` hours, `566` tickets, so `λ̂ = 566/168 =
3.3690`. The sample variance is `3.4079`, giving **`var/mean = 1.0115`** — the Poisson fingerprint,
about as clean as a real 168-point sample gets.

Now compare the whole table, not just the ratio. `expected = 168 × P(k)`:

| `k` | observed hours | `P(k)` | expected | observed − expected |
|---:|---:|---:|---:|---:|
| 0 | 5 | 0.0344 | 5.78 | −0.78 |
| 1 | 23 | 0.1160 | 19.48 | +3.52 |
| 2 | 34 | 0.1954 | 32.82 | +1.18 |
| 3 | 28 | 0.2194 | 36.86 | **−8.86** |
| 4 | 34 | 0.1848 | 31.04 | +2.96 |
| 5 | 22 | 0.1245 | 20.92 | +1.08 |
| 6 | 13 | 0.0699 | 11.75 | +1.25 |
| 7 | 6 | 0.0336 | 5.65 | +0.35 |
| 8 | 2 | 0.0142 | 2.38 | −0.38 |
| 9 | 1 | 0.0053 | 0.89 | +0.11 |
| ≥10 | 0 | 0.0025 | 0.43 | −0.43 |

Every row is within about 3 hours of prediction except `k = 3`, which is 8.9 low. Is that a problem?
The counts themselves are Poisson-ish, so a cell expecting 36.9 has a standard deviation of about
`√36.9 = 6.1` — an 8.9 miss is about 1.5 of those. **One cell 1.5 sd off in a table of eleven cells
is exactly what randomness looks like.** Chapter 5 gives you the formal version of this argument
(the chi-square goodness-of-fit test); the informal version — compare each residual to `√expected` —
catches 90 % of real misfits and takes ten seconds.

Now go back to the on-call question and answer it two ways. Empirically: 9 hours of 168 = **5.4 %**.
From the fitted model: `P(k ≥ 7) = 0.0336 + 0.0142 + 0.0053 + 0.0025 = 5.6 %`. The model earns its
keep by letting you ask questions the week did not answer — like `P(k ≥ 12)`, which never happened
in your sample and is not zero.

---

## The code

Paste these blocks in order into one file and run it. Stdlib only — `numpy` would make the
histogram shorter and the mechanism invisible, which is the wrong trade for a chapter about
mechanism. `random.binomialvariate` needs Python 3.12 or later.

```python
"""Chapter 2 - distributions.

Stdlib only. Every function is independent.
Run: python ch02.py
"""

from __future__ import annotations

import math
import random
from collections import Counter

# One week of hourly support-ticket counts (168 hours). The chapter's worked example.
TICKETS: list[int] = [
    2, 2, 9, 6, 3, 3, 1, 1, 2, 6, 5, 1, 8, 3, 6, 7, 3, 5, 1, 2, 4, 6, 2, 1, 4, 4, 3, 4, 0,
    6, 5, 1, 3, 2, 4, 4, 5, 3, 2, 5, 3, 6, 7, 3, 2, 4, 6, 1, 3, 3, 4, 1, 2, 6, 1, 4, 4, 5,
    2, 3, 2, 5, 2, 2, 2, 2, 4, 2, 2, 4, 1, 4, 7, 6, 1, 5, 1, 2, 5, 6, 3, 4, 1, 3, 2, 1, 5,
    3, 1, 3, 2, 4, 2, 2, 4, 0, 2, 5, 4, 2, 4, 4, 2, 3, 1, 1, 4, 2, 2, 3, 3, 3, 3, 1, 1, 0,
    5, 3, 5, 5, 4, 5, 1, 2, 2, 3, 5, 7, 5, 7, 2, 3, 4, 7, 3, 4, 1, 6, 1, 4, 8, 6, 0, 2, 4,
    2, 5, 2, 4, 4, 5, 5, 4, 4, 3, 4, 3, 6, 1, 4, 4, 2, 5, 4, 4, 0, 5, 3,
]


def tally(xs: list[int]) -> list[tuple[int, int, float]]:
    """Discrete distribution the honest way: value, count, share of the total."""
    counts = Counter(xs)
    return [(v, counts[v], counts[v] / len(xs)) for v in range(min(xs), max(xs) + 1)]


def text_histogram(xs: list[float], bins: int = 20, width: int = 50) -> list[str]:
    """A continuous distribution has to be BINNED before it can be seen at all."""
    lo, hi = min(xs), max(xs)
    span = (hi - lo) or 1.0
    counts = [0] * bins
    for x in xs:
        slot = min(int((x - lo) / span * bins), bins - 1)
        counts[slot] += 1
    tallest = max(counts) or 1
    rows = []
    for i, c in enumerate(counts):
        edge = lo + span * i / bins
        rows.append(f"{edge:9.3f} | {'#' * round(c / tallest * width):<{width}} {c}")
    return rows
```

`bins` is the knob mentioned above: it is a *parameter of the picture*, not of the data. Change it
and re-look, always.

```python
def quantile(xs: list[float], q: float) -> float:
    """Linear-interpolated quantile. q=0.5 is the median."""
    ordered = sorted(xs)
    pos = q * (len(ordered) - 1)
    lo = int(pos)
    hi = min(lo + 1, len(ordered) - 1)
    return ordered[lo] + (ordered[hi] - ordered[lo]) * (pos - lo)


def describe(xs: list[float]) -> dict[str, float]:
    """The five numbers that identify a family without plotting anything."""
    n = len(xs)
    mean = sum(xs) / n
    var = sum((x - mean) ** 2 for x in xs) / (n - 1)
    top = sorted(xs)[int(n * 0.99):]
    return {
        "mean": mean,
        "median": quantile(xs, 0.5),
        "sd": var**0.5,
        "var/mean": var / mean if mean else float("nan"),
        "sd/mean": var**0.5 / mean if mean else float("nan"),
        "p99/median": quantile(xs, 0.99) / quantile(xs, 0.5) if quantile(xs, 0.5) else float("nan"),
        "top1%share": sum(top) / sum(xs) if sum(xs) else float("nan"),
    }


def empirical_rule(xs: list[float]) -> tuple[float, float, float]:
    """Share of the data within 1, 2 and 3 standard deviations of the mean."""
    n = len(xs)
    mean = sum(xs) / n
    sd = (sum((x - mean) ** 2 for x in xs) / (n - 1)) ** 0.5
    inside = [sum(1 for x in xs if abs(x - mean) <= k * sd) / n for k in (1, 2, 3)]
    return inside[0], inside[1], inside[2]
```

The Poisson sampler is the one piece of real teaching in the code. There is no Poisson generator in
the standard library, and writing one from the **definition** — keep drawing exponential waits until
the clock runs out — is shorter than looking up Knuth's algorithm and shows you the duality for
free:

```python
def sample_poisson(rate: float, rng: random.Random) -> int:
    """Count arrivals in one time unit by simulating the waits between them.

    This IS the definition: a Poisson count is what an exponential wait produces.
    """
    elapsed = 0.0
    arrivals = 0
    while True:
        elapsed += rng.expovariate(rate)
        if elapsed > 1.0:
            return arrivals
        arrivals += 1


def poisson_pmf(k: int, lam: float) -> float:
    """P(exactly k events) when events arrive independently at average rate lam."""
    return math.exp(-lam) * lam**k / math.factorial(k)


def sum_of_uniforms(k: int, draws: int, rng: random.Random) -> list[float]:
    """Add up k flat random numbers, `draws` times. The setup for the CLT."""
    return [sum(rng.random() for _ in range(k)) for _ in range(draws)]


FAMILIES: dict[str, object] = {
    "uniform(0,10)": lambda r: r.uniform(0, 10),
    "normal(100,15)": lambda r: r.gauss(100, 15),
    "binomial(20,0.3)": lambda r: float(r.binomialvariate(20, 0.3)),
    "poisson(3.4)": lambda r: float(sample_poisson(3.4, r)),
    "exponential(1/50)": lambda r: r.expovariate(1 / 50),
    "lognormal(3,1)": lambda r: r.lognormvariate(3, 1),
    "pareto(1.5)": lambda r: r.paretovariate(1.5),
}
```

`FAMILIES` is the one place to edit if you want another distribution in every table at once — add a
row and all three experiments pick it up.

```python
def main() -> None:
    rng = random.Random(2)

    print("=== 1. A distribution, before it has a name ===")
    print(f"{'tickets/hour':>12} {'count':>6} {'share':>7}")
    for value, count, share in tally(TICKETS):
        print(f"{value:>12} {count:>6} {share:>7.3f}  {'#' * count}")
    print(f"total hours: {len(TICKETS)}, total tickets: {sum(TICKETS)}")

    print("\n=== 2. The families, told apart by five numbers ===")
    header = f"{'family':<18}" + "".join(
        f"{k:>11}" for k in ("mean", "median", "sd", "var/mean", "sd/mean", "p99/median", "top1%share")
    )
    print(header)
    for name, draw in FAMILIES.items():
        xs = [draw(rng) for _ in range(200_000)]
        d = describe(xs)
        print(
            f"{name:<18}" + "".join(
                f"{d[k]:>11.3f}"
                for k in ("mean", "median", "sd", "var/mean", "sd/mean", "p99/median", "top1%share")
            )
        )

    print("\n=== 3. The empirical rule is a fact about ONE family ===")
    print(f"{'family':<18}{'within 1sd':>12}{'within 2sd':>12}{'within 3sd':>12}")
    for name, draw in FAMILIES.items():
        xs = [draw(rng) for _ in range(200_000)]
        one, two, three = empirical_rule(xs)
        print(f"{name:<18}{one:>12.3f}{two:>12.3f}{three:>12.3f}")
    print(f"{'normal, claimed':<18}{0.682:>12.3f}{0.954:>12.3f}{0.997:>12.3f}")

    print("\n=== 4. Worked example: are the tickets Poisson? ===")
    n = len(TICKETS)
    lam = sum(TICKETS) / n
    var = sum((x - lam) ** 2 for x in TICKETS) / (n - 1)
    print(f"lambda-hat = mean = {lam:.4f}   sample variance = {var:.4f}   var/mean = {var / lam:.4f}")
    print(f"{'k':>3} {'observed':>9} {'P(k)':>8} {'expected':>9} {'obs-exp':>8}")
    for k in range(0, 10):
        obs = TICKETS.count(k)
        p = poisson_pmf(k, lam)
        print(f"{k:>3} {obs:>9} {p:>8.4f} {p * n:>9.2f} {obs - p * n:>8.2f}")
    tail = 1 - sum(poisson_pmf(k, lam) for k in range(10))
    print(f"{'>=10':>3} {sum(1 for t in TICKETS if t >= 10):>9} {tail:>8.4f} {tail * n:>9.2f}")

    print("\n=== 5. Why the normal keeps turning up ===")
    for k in (1, 2, 12):
        xs = sum_of_uniforms(k, 100_000, rng)
        one, two, three = empirical_rule(xs)
        print(f"sum of {k:>2} uniforms: within 1sd={one:.3f} 2sd={two:.3f} 3sd={three:.3f}")
    print("\nshape of the sum of 12 flat draws:")
    for row in text_histogram(sum_of_uniforms(12, 100_000, rng), bins=18, width=46):
        print(row)


if __name__ == "__main__":
    main()
```

It takes about half a minute — 200,000 draws from seven families, twice, in pure Python. That is the
price of seeing the mechanism instead of calling a library.

---

## Check yourself

**1.** A metric has mean 400 ms and standard deviation 395 ms. Before plotting anything, what family
would you guess, and what does that imply about p99?

<details><summary>Answer</summary>

`sd/mean ≈ 0.99` is the exponential fingerprint — a waiting time, plausibly the gap between
independent events or a service time with no wear-out. It implies p99 is roughly `−ln(0.01)/λ =
4.6 × mean ≈ 1,840 ms`, and the measured table above shows p99/median ≈ 6.65 for an exponential. If
your real p99 is much *worse* than that, you have something heavier than exponential — which is the
usual finding, and the reason to look.
</details>

**2.** You count errors per minute over a day: mean 2.0, variance 11.5. Is Poisson a reasonable
model?

<details><summary>Answer</summary>

No. `var/mean = 5.75`, badly over-dispersed. Poisson requires `var = mean`. Something is making
errors **cluster**: a retry storm, a single bad client, or an error rate that itself varies across
the day (quiet at 4am, busy at noon). A Poisson model here would give you intervals far too narrow
and alerts that fire at the wrong threshold. Reach for a negative binomial, or — better — find the
clustering mechanism, because it is usually the actual bug.
</details>

**3. (the common misconception)** True or false: "with enough data, any dataset becomes normally
distributed."

<details><summary>Answer</summary>

**False, and it is the single most common misreading of the CLT.** Collect a billion incomes and the
histogram of incomes is exactly as skewed as it was at a thousand — more data measures the *same*
shape more precisely, it does not change it. What becomes normal is the distribution of the **sample
mean** across repeated samples, which is a different object entirely and one you never see directly
unless you simulate it. Chapter 3 exists to make that distinction impossible to lose.
</details>

**4.** Your histogram of session durations shows one hump. A colleague concludes the data is normal
and computes "mean ± 2 sd" as the expected range. What has gone wrong?

<details><summary>Answer</summary>

Two things. First, a single hump is not evidence of normality — lognormal, exponential and Pareto all
show one hump, and they differ from normal in the **tail**, which is the part of a histogram you
cannot see because the bars are one pixel tall. Second, session duration is a near-canonical
lognormal (produced by multiplicative effects), and the measured table says a lognormal keeps 90.8 %
of its mass within 1 sd and 96.2 % within 2 — so "mean ± 2 sd" is not a 95 % range, and the mean is
already above the median. Check on a log scale, or check `sd/mean` and `p99/median`, before
assuming.
</details>

---

## Summary

| Concept | What it means | When it misleads you |
|---|---|---|
| **Distribution** | The list of what can happen, with the share of probability each gets | Treating the plotted curve as the truth — the curve is a *model* fitted to a table, and the table is the data |
| **Density** | Probability *per unit x*; area is probability | Reading a height as a probability. Density can exceed 1 |
| **Histogram** | Binned counts, the only way to see a continuous distribution | The bin width is yours, not the data's — it can invent or erase a second hump |
| **Uniform** | No structure inside a range | Real "random" data is rarely flat; flatness is usually a good null, not a good model |
| **Normal** | Many small *additive* independent effects | Judged by the hump instead of the tails. Fatal for anything financial or latency-shaped |
| **Binomial** | `n` fixed trials, constant `p`; `var/mean = 1−p < 1` | Trials that are not independent (users who influence each other) or `p` that varies across trials |
| **Poisson** | Independent events per unit time; `var = mean` | Over-dispersed reality (clusters, varying rate) — makes every interval too narrow |
| **Exponential** | Waiting time between Poisson events; `sd/mean = 1`; memoryless | Service durations, where long jobs are long for a reason and the real tail is heavier |
| **Long tail (lognormal, Pareto)** | Multiplicative growth; mean ≫ median, top 1 % owns a big share | Planning capacity or cost from an average that no user resembles |
| **Empirical rule (68-95-99.7)** | A property of *the normal*, measured to 3 decimals above | Applied to anything else. Pareto puts 98.5 % inside 1 sd; uniform has nothing beyond 2 sd at all |
| **`var/mean`** | Index of dispersion — the count-data diagnostic | Any non-count quantity: it has units, so it changes when you change from seconds to ms |

Next: [Chapter 3 — Sampling and the Central Limit Theorem](03-sampling-and-the-clt.md). Adding flat
numbers produced a bell. Find out why that is the most useful accident in statistics.
