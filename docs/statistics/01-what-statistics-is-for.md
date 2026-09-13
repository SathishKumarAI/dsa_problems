# 1 — What statistics is for

A recruiter tells you the average salary on the team you are about to join is **96,000**. You take
the job. On your first day you discover the seven salaries are:

```
38   41   42   44   47   52   410      (thousands)
```

The recruiter did not lie. The mean really is 96.29. It is also true that **six of the seven people
earn less than the average**, and that the seventh is the founder. Every number in that sentence is
correct and the sentence is still a lie, and learning why — and what to say instead — is most of
what this chapter is.

Statistics is not a bag of formulas. It is the discipline of **saying something about what you
cannot see, using only what you can**, and being explicit about how wrong you might be.

---

## Populations and samples, and why we ever infer

Two words, and everything later depends on keeping them apart.

| Term | What it is | What you have |
|---|---|---|
| **Population** | Every unit you actually care about: all users, all requests, all future requests | Almost never |
| **Sample** | The handful you managed to measure | Always |
| **Parameter** | A number describing the *population* — written with Greek letters: `μ`, `σ` | Unknown, fixed |
| **Statistic** | The same number computed from your *sample* — written with Latin letters: `x̄`, `s` | Known, and different every time you sample |

A programmer's instinct is that this is a data-availability problem: get more data and the
distinction dissolves. It does not, for two reasons that never go away.

1. **The population is often not finite or not yet real.** You want to know the latency your service
   *will* serve tomorrow. There is no database you could query that contains tomorrow.
2. **Measuring everything changes what you can afford to ask.** A survey of all 4 million users asks
   two questions; a survey of 400 asks forty.

> **Intuition.** You are tasting soup. You cannot drink the pot to find out whether the pot is
> salty — and you do not need to, *provided you stirred*. Almost every failure of statistical
> inference in practice is a failure to stir, not a failure to taste enough. Keep that image: the
> whole of Chapter 3 is about stirring.

So we infer: compute a statistic from a sample, and then — this is the part that makes it a
discipline rather than a guess — **quantify how far that statistic could plausibly be from the
parameter**. A number without that second part is not an estimate, it is an anecdote with decimals.

> **Watch out.** You are about to think that "sample" means "a subset I took because the data was
> too big". That is one kind of sample. But your *whole* dataset — all 40 million rows, the complete
> log — is also a sample, drawn from the population of "all the traffic this system could have
> received". The completeness of your file is not the completeness of your knowledge. This is why a
> team with every row of production data still needs confidence intervals.

---

## What an average hides

"Average" in English means three different things in statistics, and the recruiter chose the one
that flattered them.

| Summary | Definition | Breaks when |
|---|---|---|
| **Mean** | Sum ÷ count. The **balance point** — the value where the signed deviations cancel | One extreme value can move it arbitrarily far |
| **Median** | The middle value by rank | Says nothing about the tails; two wildly different datasets can share one |
| **Mode** | The most frequent value | Meaningless on continuous data, where every value occurs once |

Run the seven salaries through all three:

```
mean=96.29   median=44.00   mode=[38, 41, 42, 44, 47, 52, 410]
salaries above the mean: 1 of 7
```

The mode is a list of all seven values — every salary occurs exactly once, so they all tie for most
frequent. That is not a bug in the code; that is what the mode *does* on measurements. Mode is for
categories ("most common HTTP status", "most common browser"), not for quantities.

> **Intuition.** The mean is a **lever arm**. Put the seven salaries on a plank at their positions
> and the mean is the single fulcrum that balances it. Now notice what leverage means: the founder's
> 410 sits far from the others, so it pushes with enormous torque. Moving one distant point moves
> the fulcrum; moving one point does not move the middle-by-rank at all unless it crosses it. That
> difference has a name — the median's **breakdown point is 50 %** (you must corrupt half the data
> to move it arbitrarily), the mean's is 0 %.

### The case people miss: where the mean lies and the median lies with it

Everyone eventually learns "use the median when data is skewed". Fewer learn the second failure,
which is worse because no summary catches it. Here is a latency population: 50 requests hit a warm
cache at 5 ms, 50 miss it and take 195 ms.

```
cache latency (ms)   n=100  mean=100.00 median=100.00 mode=[5.0, 195.0]
```

Mean 100. Median 100. **Not one single request took anything near 100 ms.** The mean is a value the
system is incapable of producing. The median splits two clusters and lands in the gap between them.
Both summaries are arithmetically perfect and descriptively fictional.

> **Watch out.** You are about to believe that the fix is "use the median instead of the mean".
> The real lesson is one level up: **a single number is a summary, and a summary of a two-humped
> distribution is always a lie.** Before you choose a summary, look at the shape. If you find two
> humps, the honest report is not a better average — it is *two* averages and the mix ("94 % of
> requests at ~5 ms, 6 % at ~195 ms"), because you have discovered that there are two populations
> wearing one name. Chapter 2 is how to see the shape.

---

## Spread, built from scratch

Knowing the middle is half a description. These two datasets have the same mean of 50:

```
A: 49, 50, 51            B: 0, 50, 100
```

You would bet money on the next value from A and refuse to bet on B. The thing you are reacting to
is **spread**, and we can build the standard measure of it from a single honest question: *on
average, how far is a data point from the middle?*

**Attempt 1 — average the deviations.** Take each `x - x̄` and average. This gives **exactly zero,
always**, for every dataset in the universe. Look at the `sum` row of the worked example below: the
deviations sum to `-0.00`. That is not a coincidence or a rounding artefact — it is the *definition*
of the mean. The mean is the balance point, so the positive and negative deviations cancel by
construction. Attempt 1 measures nothing.

**Attempt 2 — average the absolute deviations.** Drop the signs: `mean(|x - x̄|)`. This works, it
has a name (**mean absolute deviation**, MAD), and it is the most intuitive measure of spread there
is. For the salaries it is 89.63. It is also, genuinely, a fine thing to report.

**Attempt 3 — average the squared deviations.** `mean((x - x̄)²)`. This is **variance**. Squaring
also kills the sign, so why prefer it to the honest absolute value?

> **Why it works.** Three reasons, in increasing order of how much they matter.
> (a) `|x|` has a corner at zero and no derivative there; `x²` is smooth everywhere, so anything
> you want to *optimise* is tractable in squares and painful in absolutes. Least squares exists;
> least absolutes is a linear program.
> (b) **Variances of independent things add.** If `X` and `Y` are independent,
> `Var(X + Y) = Var(X) + Var(Y)`. Nothing like this is true of MAD. This single property is the
> engine of the entire rest of this course: it is why the standard error is `σ/√n` (Chapter 3), why
> the Central Limit Theorem has that shape, and why every confidence interval you will ever write
> has a square root in it.
> (c) Squaring is why the normal distribution's formula contains `e^(-x²/2)` and therefore why
> variance is the *natural* parameter for the distribution that sample means converge to.

The price of squaring is that the units are wrong: square the salaries and you get 19,156.90
**squared thousand-dollars**, which is not a thing. So take the square root and call it the
**standard deviation**: 138.41 thousand. Standard deviation is just "variance, carried back to the
units you started in".

### Worked example — the state at every step

`SALARIES = [38, 41, 42, 44, 47, 52, 410]`, `mean = 96.29`.

| `x` | `x - mean` | `(x - mean)²` |
|---:|---:|---:|
| 38.0 | −58.29 | 3,397.22 |
| 41.0 | −55.29 | 3,056.51 |
| 42.0 | −54.29 | 2,946.94 |
| 44.0 | −52.29 | 2,733.80 |
| 47.0 | −49.29 | 2,429.08 |
| 52.0 | −44.29 | 1,961.22 |
| 410.0 | **+313.71** | **98,416.65** |
| **sum** | **−0.00** | **114,941.43** |

Read the last two rows twice. The founder's single row contributes **98,416 of the 114,941 total**
— 86 % of all the squared deviation in the company comes from one person. That is squaring doing
exactly what squaring does: it makes outliers dominant. It is the reason variance is the right tool
for theory and a dangerous one for description.

Finish the arithmetic:

| Quantity | Formula | Value |
|---|---|---|
| Mean absolute deviation | sum of the unsquared distances (627.43) ÷ 7 | 89.63 |
| Variance, sample (`n−1`) | 114,941.43 ÷ 6 | 19,156.90 |
| Std dev, sample (`n−1`) | √19,156.90 | **138.41** |
| Std dev, population (`n`) | √(114,941.43 ÷ 7) | 128.14 |

Two different standard deviations for one dataset, differing by 8 %. Which is right depends entirely
on a question about *intent*, and that question is the rest of the chapter.

---

## Why `n − 1`: Bessel's correction, derived

Every textbook asserts "divide by `n − 1` for a sample". Here is why, first as the one sentence that
unsticks people, then as the algebra, then measured.

**The sentence.** You want the average squared distance from the population mean `μ`. You do not
know `μ`, so you use `x̄` instead — and `x̄` was computed *from the very same data*. The sample mean
is always pulled toward whatever your sample happened to contain. So your data is closer to `x̄`
than it is to `μ`, **always, for every possible sample**, and dividing by `n` therefore
systematically under-reports the spread.

> **Intuition.** `x̄` is the point that minimises `Σ(x − c)²` over all choices of `c`. That is not
> an analogy, it is a theorem — the mean is *defined* by being the best-fitting single point. So
> `Σ(x − x̄)²` is the smallest sum of squares the data can produce against any centre, including
> against the true `μ`. Measuring spread against the best-fitting centre is like measuring how far
> your darts landed from the middle of the darts, rather than from the bullseye. You will always
> flatter yourself.

> **Why it works.** The algebra takes four lines. Start by splitting each deviation from `μ` into
> "deviation from `x̄`" plus "how far `x̄` missed `μ`":
>
> `Σ(xᵢ − μ)² = Σ((xᵢ − x̄) + (x̄ − μ))² = Σ(xᵢ − x̄)² + 2(x̄ − μ)Σ(xᵢ − x̄) + n(x̄ − μ)²`
>
> The middle term vanishes — `Σ(xᵢ − x̄)` is zero, the `-0.00` row from the table. So exactly:
>
> `Σ(xᵢ − μ)² = Σ(xᵢ − x̄)² + n(x̄ − μ)²`
>
> Now take expectations over all possible samples. On the left, each `E[(xᵢ − μ)²]` is `σ²` by
> definition, so the left side is `nσ²`. On the right, `E[(x̄ − μ)²]` is the variance of the sample
> mean, which is `σ²/n` (Chapter 3 proves this; it is the `σ/√n` you have already heard of). So the
> last term is `n · σ²/n = σ²`. Rearranged:
>
> `E[Σ(xᵢ − x̄)²] = nσ² − σ² = (n − 1)σ²`
>
> The sum of squared deviations is, on average, `(n − 1)σ²` — not `nσ²`. Divide it by `n` and you
> get `σ²·(n−1)/n`, biased low by a factor of exactly `(n−1)/n`. Divide by `n − 1` and the
> bias is exactly zero. That is the whole of Bessel's correction: **not a fudge factor, a correction
> for a bias you can calculate to the last decimal.**

### Measured, because a derivation you have not checked is a belief

Draw 40,000 samples of size `n` from a population whose true variance is 224.533, and average both
estimators:

| `n` | true var | avg of `÷n` | avg of `÷(n−1)` | ratio `÷n` : truth | predicted `(n−1)/n` |
|---:|---:|---:|---:|---:|---:|
| 2 | 224.533 | 111.788 | 223.577 | 0.4979 | 0.5000 |
| 3 | 224.533 | 149.648 | 224.471 | 0.6665 | 0.6667 |
| 5 | 224.533 | 180.437 | 225.546 | 0.8036 | 0.8000 |
| 10 | 224.533 | 202.050 | 224.500 | 0.8999 | 0.9000 |
| 30 | 224.533 | 217.191 | 224.680 | 0.9673 | 0.9667 |

The measured ratio tracks the predicted `(n−1)/n` to three decimals at every sample size. At `n = 2`
the naive estimator reports **half** the true variance. At `n = 30` it is off by 3 %. That last row
is also the practical rule: **the correction matters enormously when `n` is small and is nearly
irrelevant when `n` is large** — which is exactly when you are most and least in danger anyway.

> **Watch out.** You are about to conclude that `s = √(s²)` is therefore an unbiased estimate of
> `σ`. It is not. Bessel's correction makes the *variance* unbiased; the square root is a concave
> function, so by Jensen's inequality `E[√(s²)] < √(E[s²]) = σ`. The sample standard deviation is
> still biased low, slightly, and no simple constant fixes it for all distributions. Nobody cares in
> practice — but if someone asks you in an interview whether `s` is unbiased, the answer is **no**,
> and the reason is Jensen, not Bessel.

When do you use `÷n`? When your data **is** the population — when you are describing these seven
people and have no interest in generalising beyond them. That is the actual decision: not "is my
dataset big or small" but "**am I describing, or am I estimating?**"

---

## The code

Paste these blocks in order into one file and run it; that is exactly the script whose output is
quoted above.

```python
"""Chapter 1 - what statistics is for.

Every function here is independent: lift one out and it still runs.
Run: python ch01.py
"""

from __future__ import annotations

import random
from collections import Counter

# The chapter's worked example: seven salaries at a small company, in thousands.
SALARIES: list[float] = [38.0, 41.0, 42.0, 44.0, 47.0, 52.0, 410.0]

# Two populations that share a mean and share nothing else.
CACHE_LATENCY_MS: list[float] = [5.0] * 50 + [195.0] * 50


def mean(xs: list[float]) -> float:
    """The balance point: the value that makes the signed deviations sum to zero."""
    return sum(xs) / len(xs)


def median(xs: list[float]) -> float:
    """The middle value by rank. Averages the two middles when the count is even."""
    ordered = sorted(xs)
    mid = len(ordered) // 2
    if len(ordered) % 2 == 1:
        return ordered[mid]
    return (ordered[mid - 1] + ordered[mid]) / 2


def modes(xs: list[float]) -> list[float]:
    """Every value tied for most frequent. A list, because ties are the normal case."""
    counts = Counter(xs)
    top = max(counts.values())
    return sorted(v for v, c in counts.items() if c == top)
```

Spread, one function per attempt, so you can see the three definitions side by side:

```python
def mean_absolute_deviation(xs: list[float]) -> float:
    """Average distance from the middle, measured the obvious way."""
    m = mean(xs)
    return sum(abs(x - m) for x in xs) / len(xs)


def sum_squared_deviations(xs: list[float]) -> float:
    """The raw material of variance: total squared distance from the sample mean."""
    m = mean(xs)
    return sum((x - m) ** 2 for x in xs)


def variance(xs: list[float], ddof: int = 1) -> float:
    """ddof=1 divides by n-1 (a sample). ddof=0 divides by n (a whole population)."""
    return sum_squared_deviations(xs) / (len(xs) - ddof)


def stdev(xs: list[float], ddof: int = 1) -> float:
    """Variance carried back to the units of the data."""
    return variance(xs, ddof) ** 0.5


def deviation_table(xs: list[float]) -> list[tuple[float, float, float]]:
    """One row per observation: value, deviation from the mean, squared deviation."""
    m = mean(xs)
    return [(x, x - m, (x - m) ** 2) for x in xs]
```

`ddof` ("delta degrees of freedom") is the one knob, and it is named the same way in `numpy` and
`statistics`, so learning it here transfers. The bias experiment is the only non-obvious function
in the chapter — it is the derivation above, run:

```python
def bessel_experiment(
    population: list[float], n: int, trials: int, seed: int = 1
) -> tuple[float, float, float]:
    """Draw `trials` samples of size n; return (true variance, mean of /n, mean of /(n-1))."""
    rng = random.Random(seed)
    truth = variance(population, ddof=0)
    naive = 0.0
    corrected = 0.0
    for _ in range(trials):
        sample = [rng.choice(population) for _ in range(n)]
        ssd = sum_squared_deviations(sample)
        naive += ssd / n
        corrected += ssd / (n - 1)
    return truth, naive / trials, corrected / trials
```

```python
def _fmt(x: float, places: int = 2) -> str:
    return f"{x:,.{places}f}"


def main() -> None:
    print("=== 1. What the average hides ===")
    for label, data in (("salaries (k)", SALARIES), ("cache latency (ms)", CACHE_LATENCY_MS)):
        print(
            f"{label:<20} n={len(data):<4} mean={_fmt(mean(data))} "
            f"median={_fmt(median(data))} mode={modes(data)}"
        )
    above = sum(1 for s in SALARIES if s > mean(SALARIES))
    print(f"salaries above the mean: {above} of {len(SALARIES)}")

    print("\n=== 2. Building spread from scratch (salaries) ===")
    print(f"{'x':>8} {'x - mean':>10} {'(x - mean)^2':>14}")
    for x, d, sq in deviation_table(SALARIES):
        print(f"{x:>8.1f} {d:>10.2f} {sq:>14.2f}")
    print(f"{'sum':>8} {sum(d for _, d, _ in deviation_table(SALARIES)):>10.2f} "
          f"{sum_squared_deviations(SALARIES):>14.2f}")
    print(f"mean absolute deviation = {_fmt(mean_absolute_deviation(SALARIES))}")
    print(f"variance  (n-1) = {_fmt(variance(SALARIES))}")
    print(f"std dev   (n-1) = {_fmt(stdev(SALARIES))}")
    print(f"std dev   (n)   = {_fmt(stdev(SALARIES, ddof=0))}")

    print("\n=== 3. Why n-1: measured, not asserted ===")
    rng = random.Random(0)
    population = [rng.gauss(100.0, 15.0) for _ in range(200_000)]
    print(f"{'n':>4} {'true var':>10} {'avg /n':>10} {'avg /(n-1)':>12} {'/n ratio':>10} {'(n-1)/n':>9}")
    for n in (2, 3, 5, 10, 30):
        truth, naive, corrected = bessel_experiment(population, n, 40_000, seed=n)
        print(
            f"{n:>4} {truth:>10.3f} {naive:>10.3f} {corrected:>12.3f} "
            f"{naive / truth:>10.4f} {(n - 1) / n:>9.4f}"
        )


if __name__ == "__main__":
    main()
```

No `numpy` in this chapter and that is deliberate: `numpy.var` defaults to `ddof=0`, which is the
population formula, while `statistics.variance` uses `n − 1`. Two libraries in the same standard
install disagree about the default. You are now the kind of person who checks.

---

## Check yourself

**1.** A dataset's mean is 50 and its standard deviation is 0. What does the dataset look like?

<details><summary>Answer</summary>

Every value is exactly 50. Standard deviation is the average distance from the middle; it is zero
only when nothing is any distance from the middle. This is worth internalising as the floor: `sd ≥
0` always, and `sd = 0` means "no information here, all rows identical" — a very common symptom of a
broken feature pipeline.
</details>

**2.** You compute the standard deviation of a column with `n = 4` using `÷n` instead of `÷(n−1)`.
By roughly what factor is your *variance* wrong, and in which direction?

<details><summary>Answer</summary>

Too small by a factor of `(n−1)/n = 3/4`, so you report 75 % of the true variance — the standard
deviation is off by `√0.75 ≈ 0.87`, about 13 % low. The measured table above shows exactly this
pattern at `n = 2, 3, 5`. Direction matters more than magnitude: the error is always
*under*-reporting uncertainty, which is the dangerous direction.
</details>

**3. (the common misconception)** True or false: "the mean is the value you are most likely to
observe."

<details><summary>Answer</summary>

**False, and this is the most common wrong belief about the mean.** The value you are most likely to
observe is the **mode**. For the cache-latency population, the mean is 100 ms and the probability of
observing anything within 50 ms of it is **zero** — the only values that exist are 5 and 195. The
mean is the balance point of the distribution, not its peak. They coincide for a symmetric,
single-humped distribution, which is why the belief survives: the normal distribution teaches it and
nothing else does.
</details>

**4.** Your team's dashboard shows p50 latency 20 ms and mean latency 180 ms. Before looking at any
other chart, what do you already know?

<details><summary>Answer</summary>

That the distribution is **heavily right-skewed** — a long tail of slow requests. The mean is nine
times the median, and only a tail of large values can drag a mean that far above the middle by rank.
You also know that "average latency" is the wrong SLO for this service and that someone should be
looking at p99. You know all of this from two numbers, without a histogram. Getting this reflex is
the point of the chapter.
</details>

---

## Summary

| Concept | What it means | When it misleads you |
|---|---|---|
| **Population vs sample** | What you care about vs what you measured | When "I have all the data" makes you skip uncertainty — a complete log is still a sample of possible traffic |
| **Mean** | The balance point; sum ÷ count | Skew and outliers. One founder moved it 52 k. Zero breakdown point |
| **Median** | The middle by rank; 50 % breakdown point | Bimodal data — it lands in the empty gap between two humps and describes nothing |
| **Mode** | Most frequent value | Continuous measurements, where everything ties at a count of 1 |
| **Mean absolute deviation** | Average distance from the middle, honestly | Nothing, descriptively — but it does not add across independent variables, so no theory is built on it |
| **Variance** | Average *squared* distance from the middle | Units are squared, and outliers dominate: 86 % of the salary variance came from one row |
| **Standard deviation** | Variance in the original units | Reported for skewed or bimodal data, where "mean ± sd" implies a bell that is not there |
| **Bessel's `n − 1`** | Corrects for `x̄` being fitted to the same data | Forgetting it at small `n` (half the variance at `n = 2`); also, it does *not* make `s` an unbiased estimate of `σ` |
| **`ddof`** | 1 = estimating a population, 0 = describing this data | `numpy.var` defaults to 0 and `statistics.variance` to 1. Check, every time |

Next: [Chapter 2 — Distributions](02-distributions.md). You now know that a summary hides the shape.
The cure is to look at the shape.
