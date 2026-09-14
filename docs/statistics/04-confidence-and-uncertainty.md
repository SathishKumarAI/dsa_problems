# 4 — Confidence and uncertainty

You have twelve timings from a load test:

```
188  211  195  240  202  187  256  199  221  205  233  194      (milliseconds)
```

The mean is **210.92 ms**. Your SLO is 220 ms, so you write "we are within SLO" in the doc, and a
reviewer asks the only question that matters: *twelve requests out of how many million?*

You cannot answer "the true average is 210.92". You measured twelve things. What you can do — and
what this chapter is — is name a **range** that the procedure you used gets right 95 % of the time,
and then be extremely careful about what that sentence means, because almost everyone who says it
means something else.

---

## Building an interval out of the sampling distribution

Chapter 3 left you with one fact: across all the samples you could have drawn, `x̄` is centred on
`μ` and spread out by `σ/√n`. And for `n` large enough, that spread is normal-shaped.

Turn it around. If `x̄` lands within `1.96` standard errors of `μ` 95 % of the time, then 95 % of the
time `μ` is within `1.96` standard errors of `x̄`. That symmetry is the whole trick.

> **Why it works.** Start from the CLT statement, which says the standardised sample mean is
> standard normal, and 95 % of a standard normal lies within ±1.96:
>
> `P( −1.96 ≤ (x̄ − μ)/(σ/√n) ≤ 1.96 ) = 0.95`
>
> Multiply through by `σ/√n`:  `P( −1.96·σ/√n ≤ x̄ − μ ≤ 1.96·σ/√n ) = 0.95`
>
> Subtract `x̄` and negate (which flips the inequalities):
>
> `P( x̄ − 1.96·σ/√n ≤ μ ≤ x̄ + 1.96·σ/√n ) = 0.95`
>
> **Every step is algebra on one probability statement, and the probability never moved.** It was
> always a statement about `x̄`, the random thing. After the rearrangement `μ` *appears* in the
> middle, but `μ` never became random — the two endpoints did, because they are built from `x̄`.
> That single observation is the answer to the misconception in the next section, and it is worth
> more than the formula.

### One problem: you do not know `σ`

The derivation used `σ`, the population standard deviation. You have `s`, computed from the same
twelve numbers. Substituting one for the other adds a second source of error — your *interval width*
is now an estimate too, and at small `n` it is a poor one.

**Student's `t` distribution** is the fix: same bell shape, fatter tails, one parameter (**degrees of
freedom**, `n − 1`) that controls how much fatter. Use it and the multiplier grows:

| `n` | df | 95 % `t*` | 95 % `z*` | `t*` is bigger by |
|---:|---:|---:|---:|---:|
| 12 | 11 | **2.2010** | 1.9600 | 12 % |
| 30 | 29 | 2.0452 | 1.9600 | 4 % |
| 200 | 199 | 1.9720 | 1.9600 | 0.6 % |

> **Intuition.** The extra width is **payment for not knowing `σ`**. With 11 degrees of freedom your
> estimate of the spread could easily be 20 % too small, and if the width is too small the interval
> misses too often — so `t` widens it to compensate. As `n` grows, `s` converges on `σ`, the debt is
> paid, and `t` converges on `z`. The degrees of freedom are `n − 1` for exactly the reason Chapter
> 1's Bessel correction had `n − 1`: one piece of information in the sample was spent computing `x̄`,
> so only `n − 1` independent pieces remain to estimate the spread.

### Worked example — the state at every step

| Step | Quantity | Value |
|---|---|---:|
| 1 | `n` | 12 |
| 2 | `x̄` | 210.9167 |
| 3 | `s` (with `n − 1`) | 22.0761 |
| 4 | `se = s/√n = 22.0761/3.4641` | **6.3728** |
| 5 | `t*` at df = 11, 95 % | 2.2010 |
| 6 | margin `= t* × se` | **14.0265** |
| 7 | lower `= x̄ − margin` | 196.8902 |
| 8 | upper `= x̄ + margin` | 224.9432 |

**95 % CI: (196.89, 224.94) ms.** The same data with `z* = 1.96` would have given (198.43, 223.41) —
1.5 ms narrower at each end, an interval that is confident on false pretences.

And now answer the reviewer. Your SLO is 220 ms. The interval runs to **224.94**. You cannot say you
are within SLO; you can say your best estimate is 211 ms and twelve samples are not enough to rule
out 224. That is a completely different — and far more useful — sentence than "we are within SLO".

### Confidence is a dial, and it is not free

| Confidence | Interval | Half-width |
|---|---|---:|
| 80 % | (202.23, 219.61) | 8.69 |
| 90 % | (199.47, 222.36) | 11.44 |
| 95 % | (196.89, 224.94) | 14.03 |
| 99 % | (191.12, 230.71) | 19.79 |

Want to be more certain? Be less specific. A 100 % confidence interval is `(−∞, ∞)` and it is
perfectly, uselessly honest. 95 % is a convention with no mathematical standing whatsoever — Fisher
picked it, everyone copied it. The right level is a decision about what a miss costs you.

---

## What "95 % confident" means, and what it does not

> **Watch out.** You are about to say, or think: **"there is a 95 % probability that the true mean
> lies between 196.89 and 224.94."** This is the single most common sentence in applied statistics
> and it is wrong.
>
> The true mean is a **fixed number**. It is 207.3, or 213.8, or whatever it is; it has no
> probability distribution and it is not wandering about. The interval (196.89, 224.94) is also
> fixed — you already computed it. So the true mean is either inside it or it is not, and the
> probability of that is 1 or 0. You do not know which, but "you do not know" is not the same as
> "there is a 95 % chance".
>
> The 95 % belongs to the **procedure**, before you run it. It is the promise that *if you repeat
> this whole process — draw a sample, compute an interval — 95 % of the intervals you build will
> contain the true value*. That is a frequency across repetitions, not a belief about this one.

That is a fussy distinction until you make the machine do it. Here are 1,000 intervals, each from a
fresh sample of 30, from a population whose true mean is **199.9245**:

| # | sample mean | lo | hi | contains `μ`? |
|---:|---:|---:|---:|---|
| 1 | 199.799 | 190.619 | 208.979 | yes |
| 2 | 202.795 | 193.089 | 212.502 | yes |
| 3 | 195.437 | 187.029 | 203.846 | yes |
| 4 | 202.298 | 191.133 | 213.463 | yes |
| 5 | 197.342 | 187.580 | 207.104 | yes |
| 6 | 194.323 | 185.892 | 202.755 | yes |
| 7 | 193.156 | 182.702 | 203.610 | yes |
| 8 | 193.638 | 184.822 | 202.454 | yes |
| 9 | 204.777 | 195.650 | 213.904 | yes |
| 10 | 203.039 | 193.920 | 212.157 | yes |
| … | | | | |
| **35** | 213.124 | 203.072 | 223.176 | **NO** |

```
1000 intervals: 958 contained mu, 42 did not -> coverage 0.958
```

**958 of 1,000 — the promised 95 %, measured.** Now look at interval #35. It runs from 203.07 to
223.18 and the true mean is 199.92, so it lies **entirely above the truth**. Nothing went wrong: the
sample happened to be a high one, the interval was built by the same correct procedure as all the
others, and it is simply wrong. That is what "95 %" buys — not certainty, a **failure rate**. One
interval in twenty is #35, and you are never told which one you are holding.

Three more wrong versions, briefly, because each has its own flavour of wrong:

| Wrong statement | Why it is wrong |
|---|---|
| "95 % of the data lies in the interval" | That is nearly the *prediction interval* and it is far wider. Our CI is ±14 ms; the data itself spans 187–256 |
| "95 % of future sample means will land in this interval" | No — measured at `n = 30`, about **85 %** do. The interval is built around one wobbling estimate, not around `μ` |
| "if I repeat the experiment, I get a significant result 95 % of the time" | That is **power**, a different quantity entirely, and usually much lower. Chapter 5 |

> **In an interview.** Asked what a 95 % CI means, give the procedure answer: *"if I repeated the
> sampling and interval construction many times, about 95 % of the intervals would contain the true
> parameter — it is a property of the method, not a probability statement about this interval."* If
> you want the probability statement about this interval, you want a Bayesian **credible interval**,
> which requires a prior and is a different (and perfectly respectable) thing. Knowing that the
> statement you *want* has a name in a different framework is the sign you understand the
> distinction rather than having memorised the caveat.

---

## Margin of error

**Margin of error** is just the half-width: `t* × se`. It is the number newspapers print as "±3
points", and it is worth keeping separate from the interval because it is what you control.

| `n` | margin `= 1.96·σ/√n` |
|---:|---:|
| 25 | 22.8334 |
| 100 | 11.4167 |
| 400 | 5.7084 |
| 1,600 | 2.8542 |
| 6,400 | 1.4271 |

Every row quadruples `n` and halves the margin — the `√n` tax from Chapter 3, in the form you will
actually meet it. Three things move a margin, and only three:

1. **`n`**, at the punishing rate of `√n`.
2. **`σ`**, the population's own spread — which is why *reducing variance* (blocking, stratifying,
   CUPED in A/B testing, simply measuring more carefully) is often cheaper than collecting more data.
3. **The confidence level**, which is not a lever so much as an admission.

> **Watch out.** You are about to read "±3 points" as covering all the ways the poll could be wrong.
> It covers exactly one: **random sampling error**. It says nothing about a biased sampling frame,
> non-response, a leading question, or people who lie. Chapter 3 measured that: an 87-second bias
> that a thousandfold increase in `n` did not touch. The margin of error is the error you know how to
> compute, which is rarely the largest error present.

---

## When the assumptions break

Everything above rests on the CLT, which rests on `n` being big enough *for your population's skew*.
Here is what happens when it is not — coverage measured over 1,000 intervals per row, where 0.95 is
the promise:

| population | `n` | method | measured coverage |
|---|---:|---|---:|
| normal | 10 | z | 0.916 |
| normal | 10 | **t** | **0.950** |
| normal | 30 | z | 0.940 |
| normal | 30 | t | 0.945 |
| normal | 200 | z | 0.953 |
| normal | 200 | t | 0.954 |
| lognormal | 10 | z | 0.784 |
| lognormal | 10 | t | 0.814 |
| lognormal | 30 | z | 0.860 |
| lognormal | 30 | t | 0.869 |
| lognormal | 200 | z | **0.932** |
| lognormal | 200 | t | **0.932** |

Two lessons, both worth more than the formula.

**The `t` correction is real and it is exactly the right size.** At `n = 10` on a normal population,
`z` covers 91.6 % when it claims 95 % — one miss in twelve instead of one in twenty. `t` covers
95.0 %. That is the entire justification for `t` existing, and it is a 3.4-point effect.

**Skew breaks both of them, and `t` does not help.** On the lognormal population, `n = 30` gives
86.9 % coverage from an interval labelled 95 %. Your error rate is **two and a half times** what the
label says. At `n = 200` it is still 93.2 %. `t` fixes the *unknown-`σ`* problem; nothing in `t`
fixes the *non-normal sampling distribution* problem, because `t` assumes the underlying data is
normal too.

> **Watch out.** You are about to conclude that a 95 % interval on real, skewed data is a 95 %
> interval. On revenue, latency, session length or anything else with a tail, a nominal 95 % interval
> at `n = 30` is really an 87 % interval, and it will be **asymmetrically** wrong — because the
> skew means it misses low far more often than high. Check by simulation, or use a method that does
> not assume the shape. Which is the next section.

---

## The bootstrap

You have twelve latencies and someone asks for a confidence interval on the **median**, or the 90th
percentile, or the ratio of p99 to p50. There is a formula for the mean. There is a hard formula for
the median. There is no formula at all for most of what people actually ask about.

The bootstrap's idea is one sentence, and it sounds like cheating:

> **Intuition.** You want to know how much `x̄` varies across samples from the population. You cannot
> draw more samples from the population. But **your sample is the best picture of the population you
> have** — so treat it as the population and draw samples from *it*, with replacement, each the same
> size `n`. Recompute the statistic on each. The spread of those recomputed values estimates the
> spread of the real sampling distribution, which is all a confidence interval ever needed.
>
> It is called the bootstrap because pulling yourself up by your own bootstraps is exactly what it
> looks like. The reason it is not cheating: the empirical distribution of your sample converges on
> the true distribution as `n` grows, so resampling from it converges on sampling from the truth. You
> are not creating information — you are **reusing** the information about *shape* that is already in
> your sample, which the formula throws away by assuming normality.

Applied to the twelve latencies, 2,000 resamples each:

| statistic | point estimate | bootstrap 95 % CI | formula CI |
|---|---:|---|---|
| mean | 210.9167 | (199.58, 224.67) | (196.89, 224.94) |
| median | 205.0000 | (195.00, 233.00) | none exists |
| p90 | 240.0000 | (211.00, 256.00) | none exists |
| max | 256.0000 | (221.00, 256.00) | **none, and look at that upper bound** |

The mean row is the sanity check: bootstrap (199.58, 224.67) against the `t` formula (196.89,
224.94), from the same twelve numbers by completely different reasoning. They agree to a couple of
milliseconds. That agreement is the evidence that the bootstrap is doing something real.

The median and p90 rows are what the bootstrap is *for* — intervals nobody can write down, produced
by four lines of code and no theory.

> **Watch out.** Look at the `max` row: the interval is (221.00, 256.00), and **256 is the largest
> value in the sample**. A bootstrap resample can only ever contain values that were already there,
> so the bootstrapped maximum can never exceed the observed maximum, and the upper end of that
> interval is a lie by construction. The true maximum of the population is almost certainly above
> 256 — you just have not seen it. **The bootstrap fails for statistics that depend on the extreme
> tail** (max, min, and anything dominated by the largest observations), and it fails silently,
> producing a confident-looking interval. It is also unreliable at very small `n`, where "the sample
> is a good picture of the population" is simply false.

### Does the bootstrap actually cover?

Assert nothing; count. Same skewed population, `n = 40`, 300 experiments each:

| method | statistic | measured coverage |
|---|---|---:|
| `t` interval | mean | 0.903 |
| bootstrap | mean | 0.907 |
| bootstrap | median | 0.943 |

Two findings, and the second one is the honest half that textbooks skip.

**The bootstrap is not magic for the mean.** 0.907 against the `t` interval's 0.903 — the same
under-coverage, for the same reason: at `n = 40` on a skewed population the sampling distribution of
the mean is still skewed, and the *percentile* bootstrap does not correct for that. (The `BCa`
bootstrap — bias-corrected and accelerated — does, at the cost of more machinery. That is the one to
reach for when the percentile version under-covers.)

**The bootstrap does what it is for.** 0.943 coverage on the **median**, where the formula does not
exist at all. That is the trade: it does not beat the formula where a formula applies, it gives you
an answer where nothing else does.

---

## The code

Paste these blocks in order into one file and run it; about two seconds. `scipy` is imported for
exactly one thing — the `t` quantile, which the standard library does not provide. If you have no
`scipy`, replace `student_t.ppf(0.975, df)` with `NormalDist().inv_cdf(0.975)` and accept that your
intervals are 12 % too narrow at `n = 12`; the table above tells you exactly what that costs.

```python
"""Chapter 4 - confidence and uncertainty.

scipy is used for ONE thing: the t quantile, which the standard library does not have.
Everything else is stdlib. Run: python ch04.py
"""

from __future__ import annotations

import math
import random
from statistics import NormalDist

from scipy.stats import t as student_t

# Twelve measured API latencies, in milliseconds. The chapter's worked example.
LATENCIES: list[float] = [188, 211, 195, 240, 202, 187, 256, 199, 221, 205, 233, 194]


def mean(xs: list[float]) -> float:
    return sum(xs) / len(xs)


def sd(xs: list[float], ddof: int = 1) -> float:
    m = mean(xs)
    return (sum((x - m) ** 2 for x in xs) / (len(xs) - ddof)) ** 0.5


def standard_error(xs: list[float]) -> float:
    """Spread of the sampling distribution, estimated from this one sample."""
    return sd(xs) / math.sqrt(len(xs))
```

The two formula intervals differ in **one line** — the multiplier — which is the point: they are the
same construction with a different admission of what you know.

```python
def z_interval(xs: list[float], conf: float = 0.95) -> tuple[float, float]:
    """Normal-theory interval. Honest only when n is large or sigma is genuinely known."""
    z = NormalDist().inv_cdf(1 - (1 - conf) / 2)
    half = z * standard_error(xs)
    return mean(xs) - half, mean(xs) + half


def t_interval(xs: list[float], conf: float = 0.95) -> tuple[float, float]:
    """The everyday interval: same shape, wider multiplier, because s is itself an estimate."""
    crit = student_t.ppf(1 - (1 - conf) / 2, df=len(xs) - 1)
    half = crit * standard_error(xs)
    return mean(xs) - half, mean(xs) + half


def bootstrap_ci(
    xs: list[float],
    statistic=mean,
    reps: int = 2_000,
    conf: float = 0.95,
    seed: int = 0,
) -> tuple[float, float]:
    """Percentile bootstrap: resample the sample, recompute, read the quantiles off.

    Works for ANY statistic - median, p90, a ratio - with no formula and no normality.
    """
    rng = random.Random(seed)
    n = len(xs)
    stats = sorted(statistic(rng.choices(xs, k=n)) for _ in range(reps))
    lo = stats[int((1 - conf) / 2 * reps)]
    hi = stats[int((1 - (1 - conf) / 2) * reps) - 1]
    return lo, hi


def percentile(xs: list[float], q: float) -> float:
    """Nearest-rank percentile, so it is a real observed value. q in [0, 1]."""
    ordered = sorted(xs)
    return ordered[min(int(q * len(ordered)), len(ordered) - 1)]
```

`bootstrap_ci` takes the statistic as an argument, which is the whole reason it is worth writing:
`bootstrap_ci(data, mean)`, `bootstrap_ci(data, median)`, `bootstrap_ci(data, lambda v: p99(v)/p50(v))`
all work with no new mathematics. `coverage` does the same trick one level up — it takes the
*interval maker* as an argument, so every method in the chapter is graded by the same judge:

```python
def coverage(
    population: list[float],
    n: int,
    reps: int,
    maker=t_interval,
    truth=None,
    rng: random.Random | None = None,
) -> tuple[float, list[tuple[float, float, float, bool]]]:
    """Build `reps` intervals from fresh samples; count how many contain the truth.

    This is the only honest way to check what '95% confident' buys you.
    """
    rng = rng or random.Random(7)
    target = mean(population) if truth is None else truth
    rows: list[tuple[float, float, float, bool]] = []
    hits = 0
    for _ in range(reps):
        sample = [rng.choice(population) for _ in range(n)]
        lo, hi = maker(sample)
        ok = lo <= target <= hi
        hits += ok
        rows.append((mean(sample), lo, hi, ok))
    return hits / reps, rows
```

```python
def main() -> None:
    print("=== 1. Worked example: one interval, by hand ===")
    n = len(LATENCIES)
    xbar, s, se = mean(LATENCIES), sd(LATENCIES), standard_error(LATENCIES)
    crit = student_t.ppf(0.975, df=n - 1)
    zcrit = NormalDist().inv_cdf(0.975)
    print(f"n={n}  xbar={xbar:.4f}  s={s:.4f}  se=s/sqrt(n)={se:.4f}")
    print(f"t* (df={n - 1}, 95%) = {crit:.4f}     z* = {zcrit:.4f}")
    print(f"margin = t* * se = {crit * se:.4f}")
    print(f"95% t-interval : ({t_interval(LATENCIES)[0]:.4f}, {t_interval(LATENCIES)[1]:.4f})")
    print(f"95% z-interval : ({z_interval(LATENCIES)[0]:.4f}, {z_interval(LATENCIES)[1]:.4f})  <- too narrow")
    for conf in (0.80, 0.90, 0.95, 0.99):
        lo, hi = t_interval(LATENCIES, conf)
        print(f"  {conf:.0%} interval: ({lo:7.2f}, {hi:7.2f})   half-width {(hi - lo) / 2:6.2f}")

    print("\n=== 2. What '95% confident' actually means: run it 1000 times ===")
    rng = random.Random(3)
    normal_pop = [rng.gauss(200.0, 25.0) for _ in range(200_000)]
    mu = mean(normal_pop)
    rate, rows = coverage(normal_pop, 30, 1_000, t_interval, rng=random.Random(5))
    print(f"true mu = {mu:.4f}")
    print(f"{'#':>4} {'sample mean':>12} {'lo':>9} {'hi':>9}  contains mu?")
    for i, (m, lo, hi, ok) in enumerate(rows[:10], 1):
        print(f"{i:>4} {m:>12.3f} {lo:>9.3f} {hi:>9.3f}  {'yes' if ok else 'NO'}")
    first_miss = next(i for i, r in enumerate(rows, 1) if not r[3])
    m, lo, hi, _ = rows[first_miss - 1]
    print(f"{'...':>4}")
    print(f"{first_miss:>4} {m:>12.3f} {lo:>9.3f} {hi:>9.3f}  NO   <- the first miss")
    misses = sum(1 for _, _, _, ok in rows if not ok)
    print(f"1000 intervals: {1000 - misses} contained mu, {misses} did not -> coverage {rate:.3f}")

    print("\n=== 3. Coverage when the assumptions break ===")
    skewed = [rng.lognormvariate(3.0, 1.1) for _ in range(200_000)]
    print(f"{'population':<12} {'n':>6} {'method':>10} {'coverage of 1000':>18}")
    for label, pop in (("normal", normal_pop), ("lognormal", skewed)):
        for n_ in (10, 30, 200):
            for name, maker in (("z", z_interval), ("t", t_interval)):
                r, _ = coverage(pop, n_, 1_000, maker, rng=random.Random(n_ + len(name)))
                print(f"{label:<12} {n_:>6} {name:>10} {r:>18.3f}")

    print("\n=== 4. Margin of error: what buying precision costs ===")
    sigma = sd(skewed)
    print(f"{'n':>7} {'margin = 1.96*sigma/sqrt(n)':>28}")
    for n_ in (25, 100, 400, 1600, 6400):
        print(f"{n_:>7} {1.96 * sigma / math.sqrt(n_):>28.4f}")

    print("\n=== 5. The bootstrap: an interval with no formula ===")
    print(f"{'statistic':>12} {'point estimate':>16} {'bootstrap 95% CI':>28} {'formula CI':>28}")
    point = mean(LATENCIES)
    blo, bhi = bootstrap_ci(LATENCIES, mean, seed=1)
    tlo, thi = t_interval(LATENCIES)
    print(f"{'mean':>12} {point:>16.4f} {f'({blo:.2f}, {bhi:.2f})':>28} {f'({tlo:.2f}, {thi:.2f})':>28}")
    for name, stat in (
        ("median", lambda v: sorted(v)[len(v) // 2]),
        ("p90", lambda v: percentile(v, 0.90)),
        ("max", max),
    ):
        lo, hi = bootstrap_ci(LATENCIES, stat, seed=1)
        print(f"{name:>12} {stat(LATENCIES):>16.4f} {f'({lo:.2f}, {hi:.2f})':>28} {'none exists':>28}")

    print("\n=== 6. Does the bootstrap actually cover? (300 experiments) ===")
    med_truth = sorted(skewed)[len(skewed) // 2]
    print(f"true mean={mean(skewed):.4f}   true median={med_truth:.4f}")
    for label, n_, maker, truth in (
        ("mean, t-interval", 40, t_interval, mean(skewed)),
        ("mean, bootstrap", 40, lambda v: bootstrap_ci(v, mean, reps=500, seed=2), mean(skewed)),
        (
            "median, bootstrap",
            40,
            lambda v: bootstrap_ci(v, lambda w: sorted(w)[len(w) // 2], reps=500, seed=2),
            med_truth,
        ),
    ):
        r, _ = coverage(skewed, n_, 300, maker, truth=truth, rng=random.Random(21))
        print(f"{label:<20} n={n_:<5} coverage={r:.3f}")


if __name__ == "__main__":
    main()
```

---

## Check yourself

**1.** Your 95 % CI for a conversion lift is (−0.4 %, +2.8 %). A colleague says "so there is a 95 %
chance the lift is between −0.4 and 2.8". What do you say?

<details><summary>Answer</summary>

That the 95 % describes the **procedure**, not this interval. The true lift is a fixed number; this
interval either contains it or does not. The correct sentence is "this interval was built by a
method that captures the truth 95 % of the time". Practically, the thing to say next is more useful:
**the interval includes zero**, so the data is consistent with no effect at all — and it is also
consistent with a 2.8 % lift, so it does not show there is no effect either. An interval spanning
zero means *underpowered*, not *no effect*.
</details>

**2.** You quadruple your sample. What happens to the margin of error, and what happens to the
confidence level?

<details><summary>Answer</summary>

The margin **halves** (`1/√4`). The confidence level **does not change at all** — it is a number you
chose, not a number the data produces. This catches people constantly: more data makes an interval
*narrower at the same confidence*, it does not make you "more confident". The measured margin table
shows the halving: 22.83 → 11.42 → 5.71 → 2.85 as `n` goes 25 → 100 → 400 → 1,600.
</details>

**3. (the common misconception)** You bootstrap the maximum response time from 12 samples and get a
95 % interval of (221, 256) ms. Is 256 a reasonable upper bound for the worst case?

<details><summary>Answer</summary>

**No, and the interval is structurally incapable of telling you otherwise.** 256 is the largest value
in the original sample. A bootstrap resample draws only from values already present, so the
bootstrapped maximum can never exceed 256, and the upper endpoint is pinned to the observed maximum
by construction rather than by evidence. The real population maximum is almost certainly larger — you
simply have not seen it yet.

The bootstrap works for statistics that depend on the *bulk* of the distribution (mean, median,
quantiles well inside the range) and fails for those driven by the extreme tail. For worst-case
latency you need extreme value theory, or far more data, or a different question.
</details>

**4.** You compute a 95 % `t` interval for mean revenue per user from `n = 30`. Revenue is 90 %
zeros with a long tail. How often does your "95 %" interval actually contain the truth?

<details><summary>Answer</summary>

Considerably less than 95 %, and you can measure it rather than guess. The lognormal rows above —
which are *less* extreme than a zero-inflated revenue distribution — gave **86.9 %** at `n = 30`.
Your error rate is at least 2.5× the advertised one, and the misses are lopsided: skew makes the
interval sit below the true mean far more often than above.

The fixes, in order of effort: report the median instead (with a bootstrap interval, coverage 0.943
above); use a `BCa` bootstrap; or transform to logs, work there, and be careful that the mean of the
logs is not the log of the mean. What you must not do is print "95 %" and move on.
</details>

---

## Summary

| Concept | What it means | When it misleads you |
|---|---|---|
| **Confidence interval** | `x̄ ± t* · s/√n` — a range produced by a procedure with a known long-run hit rate | Reading it as a probability statement about the parameter. The parameter is fixed; the *interval* is the random thing |
| **"95 % confident"** | 95 % of intervals built this way contain the truth. Measured here: 958/1000 | Interval #35 was (203.07, 223.18) with `μ = 199.92` — correctly built, entirely wrong. You are never told which one you hold |
| **Standard error** | `s/√n`, the estimated spread of the sampling distribution | Confused with `s`. See Chapter 3's table |
| **`t` vs `z`** | `t` is wider because `s` is itself estimated; df = `n − 1` | Using `z` at small `n`: measured 0.916 coverage instead of 0.950 at `n = 10` |
| **Degrees of freedom** | Independent pieces of information left after estimating `x̄` | Same `n − 1` as Bessel's correction, for the same reason — not a coincidence to memorise separately |
| **Margin of error** | The half-width; `1/√n` in `n` | It covers **only random sampling error**. Not bias, non-response, or a bad sampling frame |
| **Coverage** | The rate at which intervals actually contain the truth | Nominal ≠ actual. A 95 % interval on skewed data at `n = 30` measured **86.9 %** |
| **Bootstrap** | Resample your sample; the spread of the recomputed statistic estimates the real one | Extreme statistics (max/min): the interval cannot exceed your data. Tiny `n`. Skew — the percentile version still under-covered the mean at 0.907 |
| **BCa bootstrap** | Bias-corrected percentile bootstrap | The thing to reach for when the plain percentile bootstrap under-covers, which skew guarantees |

Next: [Chapter 5 — Hypothesis testing](05-hypothesis-testing.md). An interval that excludes zero is
already half a hypothesis test. The other half is where most of the damage gets done.
