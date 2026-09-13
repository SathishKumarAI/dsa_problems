# Statistics from basics — the path

A order, not an index. Every resource named here is described in `RESOURCES.md`, which says what
each one is bad for; this file says **when** to open it, **what it depends on**, and **the
checkpoint that proves you can move on**.

Ten stages, ~90 hours, about twelve weeks at 7–8 hours a week. It starts at "what does an average
hide" and ends at the statistics a working ML or data engineer is actually paid to get right:
honest hypothesis tests, intervals, regression, and the traps that make a correct calculation
produce a false conclusion.

## The rules that make this work

| Rule | Why |
|---|---|
| **Predict before you run.** Every checkpoint is a simulation. Write down the answer you expect *first*, then run it. | The gap between prediction and output is the only reliable signal that a concept has not landed. Code that agrees with a belief you never stated teaches nothing. |
| **A stage is not done until its checkpoint runs.** | Reading produces recognition. Recognition is what fails when the notebook is empty. |
| **One explanation per idea.** | Watching a second video on the same topic feels like studying and is not. If the first one failed, switch *format* (video → interactive → problem set), never repeat it. |
| **Do the problems with solutions, and look at the solution only after writing an answer down.** | MIT 18.05 publishes its solutions precisely so you can mark yourself. Reading them first converts a test into a lecture. |
| **Keep one notebook per stage.** | The checkpoints compound — stage 8's regression uses stage 4's bootstrap. |

The repo's own `src/data/flashcards.ts` is the spaced-repetition layer. Cards are tagged
`distributions`, `probability`, `inference`, `regression`, `ml-stats`; the stage table below says
which tag each stage should make *obvious* rather than memorised. If a card still feels like a
definition after its stage, the stage is not finished.

## Dependency map

Stages 1→8 are strictly sequential — each genuinely needs the one before it. Stages 9 and 10 both
depend on 8 and can be taken in either order.

| # | Stage | Depends on | Time | Makes this flashcard tag obvious |
|---|---|---|---|---|
| 0 | Orientation | — | 2 h | — |
| 1 | Data, distributions, and what an average hides | 0 | 8 h | `distributions` |
| 2 | Probability, only as much as inference needs | 1 | 12 h | `probability` |
| 3 | Sampling distributions — the hinge of the subject | 2 | 8 h | `distributions` |
| 4 | Estimation, standard error, and the bootstrap | 3 | 8 h | `inference` |
| 5 | Confidence intervals | 4 | 6 h | `inference` |
| 6 | Hypothesis testing, done honestly | 5 | 12 h | `inference` |
| 7 | The tests themselves, and why there are so few | 6 | 8 h | `inference` |
| 8 | Regression | 7 | 14 h | `regression` |
| 9 | The traps | 8 | 6 h | `probability`, `inference` |
| 10 | Applied: experiments and ML-facing statistics | 8 | 8 h | `ml-stats` |

---

## Stage 0 — Orientation (2 h)

Before any content, find out which format works on you and set up the environment you will use for
ten weeks.

| Do | Where | Time |
|---|---|---|
| Watch two StatQuest videos on a topic you already know (say, the mean and the median) | [StatQuest index](https://statquest.org/video_index.html) | 20 min |
| Play with one Seeing Theory chapter | [Seeing Theory ch. 1](https://seeing-theory.brown.edu/) | 20 min |
| Open the first Think Stats notebook in Colab and run it | [Think Stats 3e](https://allendowney.github.io/ThinkStats/) | 30 min |
| Skim the Datasaurus Dozen | [Same Stats, Different Graphs](https://www.research.autodesk.com/publications/same-stats-different-graphs/) | 10 min |
| Set up a local notebook with numpy, pandas, scipy, statsmodels, matplotlib | — | 30 min |

> **Checkpoint.** You can state, in one sentence, whether StatQuest's style helps you or annoys
> you — that decision governs 12 hours later on. And `import statsmodels.api as sm` works locally,
> not only in Colab.

---

## Stage 1 — Data, distributions, and what an average hides (8 h)

The genuine basics, and the only stage where "I know this already" is likely true and likely wrong.
A distribution is not a formula; it is the full answer to "how often does each value happen", and
every summary statistic is a lossy compression of it. Which loss you accepted is the whole game.

| Do | Where | Time |
|---|---|---|
| Read exploratory data analysis and distributions | IMS Parts I–II | 4 h |
| Read ch. 1–4: exploratory analysis, distributions, PMFs, CDFs | Think Stats 3e | 3 h |
| Watch: histograms, mean/median/mode, variance and standard deviation, percentiles | StatQuest, the first ~10 videos | 1 h |

Concepts that must be solid: distribution, mean, median, mode, variance, standard deviation,
quantiles, skew, the CDF (underrated — it is the honest picture the histogram's bin width keeps
hiding), and the difference between a *population* quantity and a *sample* quantity.

> **Checkpoint.** In a notebook:
> 1. Draw 10,000 samples from a lognormal. Plot the histogram, the CDF, and mark the mean and the
>    median. Predict which is larger and by roughly how much *before* you plot.
> 2. Append a single value of 10^6 to a 1,000-row sample. Report how far the mean moves and how far
>    the median moves. Explain the 50 % breakdown point from what you saw.
> 3. Reproduce the Datasaurus point: take any two of the thirteen datasets, compute mean(x),
>    mean(y), sd(x), sd(y) and Pearson r, show they agree to two decimals, then plot both.
>
> You have not got it if you cannot say what a CDF's vertical axis means, or if "the average
> salary is $95k" still sounds like a useful statement without a second number beside it.

---

## Stage 2 — Probability, only as much as inference needs (12 h)

The most common way this subject fails is a learner disappearing into combinatorics for a month.
You need enough probability to make sampling distributions make sense, and no more. That is:
conditional probability, independence, Bayes, random variables, expectation, variance, and the
handful of named distributions that keep appearing.

| Do | Where | Time |
|---|---|---|
| Chapters 1–3: basic probability, compound probability, distributions | [Seeing Theory](https://seeing-theory.brown.edu/) | 1.5 h |
| Read the probability chapters and do the first problem sets | [MIT 18.05](https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/) | 6 h |
| Conditional probability, interactively | [Explained Visually](https://setosa.io/ev/) | 30 min |
| Bayes' theorem as area, and why density is not probability | [3Blue1Brown](https://www.3blue1brown.com/lessons/binomial-distributions/) — `/lessons/bayes-theorem/` and `/lessons/pdfs/` | 1 h |
| IMS probability chapter, for the worked base-rate examples | IMS Part I | 2 h |
| Bookmark, do not read | [Distribution Explorer](https://distribution-explorer.github.io/) | 10 min |

Named distributions worth knowing by their *story*, not their formula: Bernoulli and binomial
(counting successes), Poisson (rare events in a window), uniform, normal, exponential, and
lognormal (anything multiplicative — incomes, latencies, file sizes).

> **Checkpoint.**
> 1. Code the medical-test problem: 1-in-10,000 prevalence, 99 % sensitivity, 99 % specificity.
>    Compute P(disease | positive) two ways — with Bayes' theorem, and by simulating a million
>    people and counting. They must agree. Then explain the answer to yourself in terms of counts
>    of people, not probabilities.
> 2. For each of binomial, Poisson and exponential, write the one-sentence story that generates it,
>    then simulate it from that story (not from `scipy.stats`) and check your simulation matches
>    `scipy.stats` — which forces you to find its `loc`/`scale` parameterisation.
> 3. Answer MIT 18.05's first two problem sets and mark yourself against the published solutions.
>    Below ~70 %: repeat the reading, do not advance.
>
> **Do not** continue into combinatorics, Markov chains, or measure theory. If you want them, take
> them later as a hobby; they are not on the path to stage 3.

---

## Stage 3 — Sampling distributions: the hinge (8 h)

The single stage that decides whether the rest of the subject is understanding or ritual. Every
inference method is an answer to one question: **if I repeated this whole study, how much would my
number jump around?** The distribution of that jumping is the sampling distribution, and it is a
different object from the distribution of the data. Nearly every misunderstanding downstream — the
CLT "making data normal", SD quoted where SE belongs, a confidence interval read as a probability
about the parameter — is this distinction missing.

| Do | Where | Time |
|---|---|---|
| Chapter 4, Frequentist Inference — work every widget | [Seeing Theory](https://seeing-theory.brown.edu/) | 1 h |
| Sampling distributions | Khan Academy, [unit 10](https://www.khanacademy.org/math/statistics-probability) | 2 h |
| StatQuest: the central limit theorem, standard deviation vs standard error | [StatQuest](https://statquest.org/video_index.html) | 45 min |
| Sampling distributions with the widget | [StatKey](https://www.lock5stat.com/StatKey/) | 30 min |
| IMS foundations of inference | IMS Part IV | 3 h |

> **Checkpoint.** Write one function, `sampling_distribution(population, statistic, n, reps)`, and
> use it for all of this:
> 1. Take a violently non-normal population (lognormal, or a 90/10 mixture). Plot the sampling
>    distribution of the **mean** at n = 2, 5, 30, 200. Watch it become normal while the population
>    does not change at all. State, in writing, what the CLT claims and what it does not.
> 2. On the same population, plot the sampling distribution of the **median** and of the
>    **maximum**. The maximum's does not become normal. Say why that does not contradict the CLT.
> 3. Show numerically that the standard deviation of your sampling distribution of the mean is
>    σ/√n, and that it shrinks with n while the population's σ does not move.
>
> You have not got it if you cannot finish this sentence without hedging: "the standard error is
> the standard deviation of ______".

---

## Stage 4 — Estimation, standard error, and the bootstrap (8 h)

A point estimate with no uncertainty attached is a rumour. Two ways to get the uncertainty: a
formula that assumes a shape, or resampling, which assumes far less and which you can always write
in five lines. Learn the resampling one first — it makes the formulas legible afterwards instead of
magical.

| Do | Where | Time |
|---|---|---|
| Ch. 8, Estimation | Think Stats 3e | 2 h |
| StatQuest: bootstrapping, maximum likelihood | [StatQuest](https://statquest.org/video_index.html) | 45 min |
| Bootstrap the mean, the median and a correlation, by clicking | [StatKey](https://www.lock5stat.com/StatKey/) | 30 min |
| Maximum likelihood, interactively | [R Psychologist](https://rpsychologist.com/viz) | 30 min |
| `scipy.stats.bootstrap` and `permutation_test` in the tutorial | [scipy.stats tutorial](https://docs.scipy.org/doc/scipy/tutorial/stats.html) | 1.5 h |
| MIT 18.05 problem set on estimators and MLE, with solutions | [MIT 18.05](https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/) | 2.5 h |

> **Checkpoint.**
> 1. Write a bootstrap in ten lines — resample with replacement, recompute, repeat — and use it to
>    put a standard error on a **median**, for which the textbook formula is unpleasant.
> 2. Check it: your bootstrap SE for the *mean* must match σ̂/√n on the same data. If it does not,
>    the bug is yours, and finding it is the exercise.
> 3. Break it deliberately. Bootstrap the **maximum** of a sample and look at the result. Explain
>    why the bootstrap fails there. (Knowing one place a method fails is worth more than three more
>    places it works.)
> 4. Estimate a parameter by maximum likelihood by writing the log-likelihood and optimising it
>    numerically — do not call a `fit()`.

---

## Stage 5 — Confidence intervals (6 h)

The most misread object in applied statistics, and the one to get right *before* hypothesis
testing, because an interval carries strictly more information than a test and reads honestly where
a p-value invites a lie.

| Do | Where | Time |
|---|---|---|
| Confidence intervals | Khan Academy, [unit 11](https://www.khanacademy.org/math/statistics-probability) | 2 h |
| The CI simulation — run it until the definition is inevitable | [R Psychologist](https://rpsychologist.com/viz) | 45 min |
| Seeing Theory ch. 4's interval widget, again, now that stage 3 is done | [Seeing Theory](https://seeing-theory.brown.edu/) | 20 min |
| IMS inference chapters on intervals | IMS Part V | 2 h |
| Bootstrap CIs: percentile vs BCa | [scipy.stats tutorial](https://docs.scipy.org/doc/scipy/tutorial/stats.html) | 1 h |

> **Checkpoint.** Build the coverage experiment, which is the definition made executable:
> 1. Simulate 1,000 studies from a population whose true mean you chose. Build a 95 % CI for each.
>    Count how many contain the true value. You are looking for ≈950, and for the fact that the
>    property belongs to the *procedure* over repetitions, not to any one interval.
> 2. Repeat with n = 5 on a heavily skewed population. Coverage will fall below 95 %. Report the
>    actual number. That gap is what "the assumptions are violated" means in units you can see.
> 3. Compare a normal-theory CI with a bootstrap percentile CI on the same skewed data and say
>    which you would report, and why.
>
> Then write the interpretation in one sentence, out loud, without the words "there is a 95 %
> chance the true mean is in this interval" — because that sentence is wrong.

---

## Stage 6 — Hypothesis testing, done honestly (12 h)

The whole apparatus is one idea: assume nothing is going on, and ask how surprising your data would
be. Everything that makes it dangerous — the threshold, the dichotomy, the incentive — is bolted on
afterwards. Learn it by permutation first, so that the null distribution is something you built
rather than something you looked up.

| Do | Where | Time |
|---|---|---|
| Ch. 9, Hypothesis Testing — the best chapter in the book | Think Stats 3e | 3 h |
| Significance tests, and two-sample inference | Khan Academy, [units 12–13](https://www.khanacademy.org/math/statistics-probability) | 3 h |
| StatQuest: p-values, what a p-value is *not*, statistical power | [StatQuest](https://statquest.org/video_index.html) | 1 h |
| Power, and p-value distributions under H0 vs H1 | [R Psychologist](https://rpsychologist.com/viz) | 1 h |
| MIT 18.05's NHST reading notes plus the matching problem set and solutions | [MIT 18.05](https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/) | 3 h |
| Optional stopping, in fifteen minutes | [How Not To Run an A/B Test](https://www.evanmiller.org/how-not-to-run-an-ab-test.html) | 30 min |

> **Checkpoint.**
> 1. Write a permutation test from scratch: shuffle the group labels 10,000 times, recompute the
>    difference in means, and read the p-value off the tail. Confirm it agrees with
>    `scipy.stats.ttest_ind` on data where the t-test's assumptions hold — and find data where they
>    disagree.
> 2. **Simulate the null.** Run 10,000 experiments with no effect whatsoever. Plot the histogram of
>    p-values. It must be flat. Then re-run with a real effect and watch it pile up at zero. Anyone
>    who has seen those two pictures cannot misread a p-value again.
> 3. **Simulate peeking.** Same null, but test after every new observation and stop the moment
>    p < 0.05. Report your actual false-positive rate. Miller's article predicts a disaster; produce
>    your own number, and keep it.
> 4. Compute the power of a test at a given n and effect size by simulation, then find the n that
>    buys 80 % power. Do it before ever running a real test again.
>
> You have not got it if you can define a p-value correctly but still describe p = 0.06 as "no
> effect".

---

## Stage 7 — The tests themselves, and why there are so few (8 h)

Only now, once a test is something you can build, is it safe to learn the catalogue — because the
catalogue is the part that invites cargo-culting. The compression that makes it survivable: almost
every named test is a linear model.

| Do | Where | Time |
|---|---|---|
| Read it end to end | [Common statistical tests are linear models](https://lindeloev.github.io/tests-as-linear/) | 2 h |
| Chi-square and categorical inference | Khan Academy, [unit 14](https://www.khanacademy.org/math/statistics-probability) | 1.5 h |
| The which-test-to-use flowcharts, and the assumption checks that come first | [pingouin guidelines](https://pingouin-stats.org/guidelines.html) | 1 h |
| Hypothesis tests in the API, and what each returns | [scipy.stats tutorial](https://docs.scipy.org/doc/scipy/tutorial/stats.html) | 1.5 h |
| IMS inference for categorical and numerical data | IMS Part V | 2 h |

> **Checkpoint.** Take one dataset and one comparison, and produce the *same* answer four ways:
> a t-test, the equivalent linear model (`smf.ols('y ~ group')`), a permutation test, and
> `pg.ttest`. Line up the numbers and account for every difference. Then write yourself a short
> table — test, what it assumes, what it returns, when it is the wrong tool — from what you saw,
> not from a blog post.
>
> Second half: for each test, name the assumption that fails most often in real data and how you
> would notice. If the answer is "check normality with a Shapiro–Wilk test", read the guidelines
> page again — testing an assumption with another test is how the p-value count silently doubles.

---

## Stage 8 — Regression (14 h)

The workhorse. For an ML engineer this is the bridge: the same least-squares fit is a prediction
tool in one framing and an inference tool in the other, and the two framings want different things
from you. sklearn gives you the first. statsmodels gives you the second. Confusing them is the most
common statistical error in production data science.

| Do | Where | Time |
|---|---|---|
| Ch. 10–11: least squares, multiple regression | Think Stats 3e | 3 h |
| **Ch. 3, linear regression** — the best single chapter on this list | [ISLP](https://www.statlearning.com/) | 4 h |
| Regression modelling | IMS Part III | 2 h |
| Ordinary least squares, interactively | [Explained Visually](https://setosa.io/ev/) | 30 min |
| Getting started, then the linear-regression and diagnostics notebooks | [statsmodels](https://www.statsmodels.org/stable/gettingstarted.html) and its [examples](https://www.statsmodels.org/stable/examples/index.html) | 3 h |
| StatQuest: R², multiple regression, logistic regression | [StatQuest](https://statquest.org/video_index.html) | 1.5 h |

Must be solid: the coefficient interpretation ("holding the others fixed" — and why that phrase is
often a fiction), residual plots, R² and what it is silent about, multicollinearity and VIF,
confounding, and logistic regression as the same machine with a link function.

> **Checkpoint.**
> 1. Fit an OLS with statsmodels and read every number in `summary()` aloud. Any number you cannot
>    explain — the F-statistic, the condition number, Durbin–Watson, the CI on each coefficient — is
>    a gap; close it before moving on.
> 2. **Manufacture multicollinearity.** Simulate `x2 = x1 + small noise`, fit, and watch the
>    coefficients become unstable and sign-flip across resamples while R² stays fine. Compute the
>    VIF. This turns a flashcard into something you have witnessed.
> 3. **Manufacture a confounder.** Simulate data where x has no effect on y but both depend on z.
>    Show the coefficient on x is significant until z enters the model. This is Stage 9's Simpson's
>    paradox in continuous clothing — meet it here first.
> 4. Fit the same model in sklearn and statsmodels, get identical coefficients, and write one
>    paragraph on why you would reach for each.

---

## Stage 9 — The traps (6 h)

Everything to here was how to compute correctly. This is how a correct computation still produces a
false conclusion — which is the failure mode that actually happens at work. Do it after stage 8,
never before: every trap here is only visible to someone who knows what the method was supposed to
do.

| Do | Where | Time |
|---|---|---|
| Read the whole thing — power, pseudoreplication, p-value misinterpretation, researcher degrees of freedom, regression to the mean | [*Statistics Done Wrong*](https://www.statisticsdonewrong.com/) | 3 h |
| Ch. 13, multiple testing | [ISLP](https://www.statlearning.com/) | 1.5 h |
| Selection bias and misleading charts — lectures 2, 3 and 7 | [Calling Bullshit](https://www.callingbullshit.org/videos.html) | 1.5 h |

The five to be able to recognise in someone else's analysis within a minute:

| Trap | The tell | Simulate it to believe it |
|---|---|---|
| **p-hacking / researcher degrees of freedom** | The analysis choices were made after seeing the data; "we also tried…" | 20 outcome variables, no real effect. Count how often at least one hits p < 0.05. |
| **Multiple comparisons** | Many tests, one headline | Same simulation. Then apply Bonferroni and Benjamini–Hochberg via `statsmodels.stats.multitest.multipletests` and watch the false discoveries drop — and the power with them. |
| **Simpson's paradox** | An aggregate that reverses in every subgroup | Build the UC Berkeley admissions example in ten lines of pandas. It is ten lines; type them. |
| **Survivorship bias** | The sample is the set of things that made it this far | Simulate 1,000 funds with pure-noise returns, delete the ones that die, and compute the "average fund return" of the survivors. |
| **Regression to the mean** | A treatment applied to the worst cases appears to work | Simulate two noisy measurements of the same quantity, select the bottom decile of the first, and look at the second. No treatment, large improvement. |

> **Checkpoint.** Run all five simulations in one notebook, each in under 20 lines, each printing a
> number that embarrasses the naive conclusion. Then take any published claim — a press release, a
> vendor benchmark, an internal dashboard — and write three sentences naming which of these five it
> is most exposed to and what you would ask for to rule it out.

---

## Stage 10 — Applied: experiments and ML-facing statistics (8 h)

Where the subject meets the job.

| Do | Where | Time |
|---|---|---|
| Precision & recall, ROC & AUC, cross-validation, bias–variance — move the threshold yourself | [MLU-Explain](https://mlu-explain.github.io/) | 1.5 h |
| Ch. 5, resampling methods and cross-validation | [ISLP](https://www.statlearning.com/) | 2 h |
| Chapter 1, free | [*Trustworthy Online Controlled Experiments*](https://experimentguide.com/) | 1 h |
| Sample size, peeking, sequential testing — re-read with stage 6 behind you | [How Not To Run an A/B Test](https://www.evanmiller.org/how-not-to-run-an-ab-test.html) | 30 min |
| Keep as the desk reference | [*Practical Statistics for Data Scientists*](https://github.com/gedeck/practical-statistics-for-data-scientists) | — |
| Optional, if you design experiments for a living | [Lakens](https://lakens.github.io/statistical_inferences/) | 3 h |

> **Checkpoint.** Write the design document for an A/B test you might actually run, before any data
> exists. It must state: the metric and why that one; the minimum effect worth detecting; the
> sample size that buys 80 % power at that effect (computed, not guessed); the stopping rule; the
> guardrail metrics; and the pre-committed analysis. Then simulate the experiment under the null
> and under your assumed effect, and confirm the false-positive and true-positive rates you
> designed for are the ones you get.
>
> Second: take a model you have trained. Put a confidence interval on its test-set metric by
> bootstrapping the test set, and state whether the difference between your two best models is
> larger than that interval. Most reported model comparisons are not, and this is the fastest way
> to find that out.

---

## What this path deliberately omits

Leaving things out is what makes it finishable. Each of these is worth learning *later*, and each
one derails a first pass.

| Omitted | Why | When to come back |
|---|---|---|
| Combinatorics beyond counting basics | Consumes weeks, unlocks nothing downstream | If probability itself becomes the interest |
| Measure-theoretic probability | Not needed for any applied result on this path | Graduate study only |
| Bayesian inference beyond stage 2's Bayes theorem | A second complete framework, not a supplement | After stage 10: [Think Bayes](https://allendowney.github.io/ThinkBayes2/), then [Statistical Rethinking](https://xcelab.net/rm/) |
| Causal inference (DAGs, potential outcomes) | Its own field; stages 8 and 9 give the intuition it builds on | [Statistical Rethinking](https://xcelab.net/rm/), or [*Regression and Other Stories*](https://users.aalto.fi/~ave/ROS.pdf) |
| Time series | Nearly disjoint from this material and much larger than it looks | When a job needs it — statsmodels' time-series half is ready |
| The full test catalogue (ANOVA variants, non-parametrics) | Stage 7's linear-model framing covers the reasoning; the rest is lookup | Look it up when needed, via [pingouin's guidelines](https://pingouin-stats.org/guidelines.html) |
| Theory-first courses (All of Statistics, CASI) | They compress graduate courses; as a first pass they are hostile | Year two, if the theory becomes the point |
