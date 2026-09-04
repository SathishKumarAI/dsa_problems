import type { Flashcard } from "./types"

// Original statistics flashcards for DS/ML interview review.
export const FLASHCARDS: Flashcard[] = [
  {
    tag: "distributions",
    q: "When is the mean a bad summary of central tendency?",
    a: "Under skew or heavy outliers — a handful of extreme values drags it away from the bulk of the data. The median resists both (50% breakdown point). Rule of thumb: incomes, latencies, and transaction amounts want medians.",
  },
  {
    tag: "distributions",
    q: "What does the Central Limit Theorem actually claim?",
    a: "The distribution of the SAMPLE MEAN of n i.i.d. draws (finite variance) approaches Normal(μ, σ²/n) as n grows — regardless of the underlying distribution's shape. It says nothing about the raw data becoming normal.",
  },
  {
    tag: "inference",
    q: "Define a p-value in one sentence.",
    a: "The probability, computed assuming the null hypothesis is true, of observing a result at least as extreme as the one seen. It is NOT the probability the null is true.",
  },
  {
    tag: "inference",
    q: "Type I vs Type II error, and the knob that trades them.",
    a: "Type I: rejecting a true null (false positive), rate α. Type II: failing to reject a false null (false negative), rate β. Lowering α raises β at fixed n; more samples or bigger true effects lower both. Power = 1 − β.",
  },
  {
    tag: "inference",
    q: "What does a 95% confidence interval mean, precisely?",
    a: "If the sampling procedure were repeated many times, ~95% of the intervals so constructed would contain the true parameter. Any single interval either contains it or doesn't — the 95% is a property of the procedure, not of one interval.",
  },
  {
    tag: "inference",
    q: "Why does peeking at an A/B test repeatedly inflate false positives?",
    a: "Each look is another chance to cross the significance threshold by noise; the effective α compounds well past the nominal 5%. Fix with a pre-registered sample size, alpha-spending/sequential methods, or Bayesian monitoring designed for continuous looks.",
  },
  {
    tag: "probability",
    q: "State Bayes' theorem and name the classic trap it exposes.",
    a: "P(A|B) = P(B|A)·P(A) / P(B). The trap is base-rate neglect: a 99%-accurate test on a 1-in-10,000 condition still yields mostly false positives, because the prior P(A) is tiny.",
  },
  {
    tag: "probability",
    q: "Expected value vs median of a distribution — when do decisions differ?",
    a: "With asymmetric payoffs or skewed distributions: a lottery has negative expected value yet a typical (median) outcome of exactly −ticket price. Optimize expectation for repeated decisions, quantiles for one-shot risk.",
  },
  {
    tag: "ml-stats",
    q: "Bias–variance tradeoff in one breath.",
    a: "Expected test error decomposes into bias² (model too simple to capture the signal) + variance (model too sensitive to the particular sample) + irreducible noise. Regularization, more data, and ensembling trade the first two against each other.",
  },
  {
    tag: "ml-stats",
    q: "Precision vs recall — and which to favour when.",
    a: "Precision: of predicted positives, how many are real. Recall: of real positives, how many were found. Favour precision when false alarms are costly (spam filtering), recall when misses are costly (cancer screening). F1 is their harmonic mean.",
  },
  {
    tag: "ml-stats",
    q: "Why does accuracy mislead on imbalanced classes?",
    a: "Predicting the majority class always scores its base rate — 99% accuracy on 1% fraud means detecting nothing. Use precision/recall, PR-AUC, or calibrated probabilities with a cost-aware threshold instead.",
  },
  {
    tag: "ml-stats",
    q: "What is data leakage and its most common disguise?",
    a: "Information from outside the training window (often from the future or from the target) sneaking into features. Most common disguise: preprocessing (scaling, imputation, target encoding) fit on the FULL dataset before the train/test split.",
  },
  {
    tag: "regression",
    q: "What does R² measure, and what doesn't it?",
    a: "The fraction of outcome variance explained by the model versus a constant-mean baseline. It doesn't measure calibration, causality, or out-of-sample performance — and it never decreases when you add predictors, hence adjusted R².",
  },
  {
    tag: "regression",
    q: "Multicollinearity: symptom and remedy.",
    a: "Correlated predictors make individual coefficients unstable (huge standard errors, sign flips) while overall fit looks fine. Diagnose with VIF; remedy by dropping/combining features, regularizing (ridge), or accepting that you can predict but not attribute.",
  },
  {
    tag: "probability",
    q: "Simpson's paradox in one example.",
    a: "A treatment can beat the control in every subgroup yet lose overall, when group sizes differ across arms — e.g. a surgery used mostly on severe cases. Aggregated and stratified comparisons answer different questions; condition on the confounder.",
  },
  {
    tag: "distributions",
    q: "Standard error vs standard deviation.",
    a: "SD describes spread of the data; SE (= σ/√n for the mean) describes uncertainty of an ESTIMATE. SD stays put as n grows, SE shrinks. Quoting SD where SE belongs makes estimates look noisier than they are; the reverse overstates certainty.",
  },
]
