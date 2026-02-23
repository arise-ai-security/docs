---
slug: /reviews/magis/
title: MAGIS Overview
sidebar_position: 1
hide_title: true
---

# MAGIS Overview

> **"MAGIS: LLM-Based Multi-Agent Framework for GitHub Issue Resolution"**
> Tao et al., Fudan University, Sun Yat-sen University, University of Macau, Chongqing University, CUHK — June 2024
> arXiv:2403.17927

---

## 1. What is the Problem?

LLMs excel at function-level code generation but fail at repository-level tasks. SWE-bench shows that LLMs fail to resolve **over 95%** of real GitHub issues — GPT-4 directly resolves fewer than **2%** (p. 2, §2).

The root cause is not coding ability alone. Two factors dominate (p. 2–3, §2):

- **File/line localization**: LLMs cannot reliably find *which files and lines* to modify. Line locating coverage ratio correlates significantly with resolution success (coefficient 0.5997, p < 0.05 on Claude-2).
- **Code change complexity**: more files and functions touched → lower success. Logistic regression shows # files and # functions are significantly negatively correlated with resolution for all three baseline LLMs (Table 1).

---

## 2. Why is it Hard?

GitHub issue resolution is a **repository-level** task — the context is an entire codebase, far exceeding LLM context limits. Direct retrieval (BM25) introduces irrelevant files, which increases cost and degrades LLM performance on long contexts. Even when correct files are provided, LLMs must localize the exact lines to change, then generate a coherent multi-hunk diff — a compound challenge that single-model approaches cannot handle (p. 1–2, §1–2).

Prior multi-agent systems (MetaGPT, ChatDev) focus on *generating new repositories from scratch*, not on *evolving existing ones*. They do not address the file localization or line-level editing challenges specific to software maintenance (p. 9, §5).

---

## 3. What is the Solution?

> **Why a framework, not a benchmark?**
> The problem here is already measurable — SWE-bench exists as a controlled ruler for GitHub issue resolution. What is missing is a system that can actually *solve* the task. MAGIS is validated against SWE-bench precisely because the benchmark provides a shared, objective measuring instrument. This is the contrast with CooperBench: CooperBench contributes the *ruler* (no prior ruler existed for coordination); MAGIS contributes the *system* and uses an existing ruler to prove it works.

**MAGIS** decomposes GitHub issue resolution into a **planning + coding** pipeline executed by four specialized agents (p. 3–6, §3, Fig. 2):

| Agent | Role |
|---|---|
| **Manager** | Coordinates the full process: decomposes the issue into file-level tasks, recruits Developer agents, runs a kick-off meeting, produces a main work plan. |
| **Repository Custodian** | Locates relevant files via BM25 ranking, then filters with an LLM relevance check backed by a **memory mechanism** that caches prior file summaries and diffs to avoid redundant context processing. |
| **Developer** | Implements code changes file-by-file using a multi-step approach: identify line ranges → extract old part → generate new part → replace. |
| **QA Engineer** | Reviews each Developer's code change and provides structured feedback; Developer revises until QA approves or the iteration limit is reached. |

### Planning phase (p. 5–6, §3.2.1)

1. Repository Custodian ranks files with BM25, then filters irrelevant ones by querying the LLM with file summaries.
2. Manager decomposes the issue into per-file tasks and designs a Developer agent persona for each.
3. A **kick-off meeting** (circular discussion among all agents) confirms task ownership, resolves dependencies, and produces an executable main work plan embedded as code.

### Coding phase (p. 6–7, §3.2.2, Algorithm 3)

Developer and QA Engineer iterate per task: Developer generates a diff → QA reviews → if rejected, Developer revises incorporating the review comment. The final diffs across all files are merged as the issue solution.

---

## 4. Why Should We Believe It?

### Overall performance — SWE-bench (p. 7, §4.2, Table 2)

| Method | % Applied | % Resolved |
|---|---|---|
| GPT-3.5 | 11.67 | 0.84 |
| Claude-2 | 49.36 | 4.88 |
| GPT-4 | 13.24 | 1.74 |
| SWE-Llama 13b | 49.13 | 4.36 |
| **MAGIS** | **97.39** | **13.94** |
| MAGIS w/o QA | 92.71 | 10.63 |
| MAGIS w/o hints | 94.25 | 10.28 |
| MAGIS w/o hints, w/o QA | 91.99 | 8.71 |

MAGIS achieves a **13.94% resolved ratio** — an **8× improvement** over direct GPT-4 application (1.74%) and more than **2× Claude-2** (4.88%). Even without QA or hints, MAGIS (8.71%) still outperforms all baselines by 5×, confirming the core multi-agent architecture drives the gain (p. 7–8, §4.2).

### SWE-bench Lite — comparison with contemporaneous methods (p. 18, App. D, Table 4)

| Method | % Resolved |
|---|---|
| AutoCodeRover | 22.33% |
| SWE-Agent | 18.00% |
| **MAGIS** | **25.33%** |

MAGIS achieves the highest resolved ratio among compared methods, with robustness confirmed across ablation conditions.

### Comparison with Devin (p. 18–19, App. E)

On the shared 140-instance overlap, MAGIS resolves **21 issues (15%)** vs Devin's **18 (12.86%)**. MAGIS relies solely on shell access with no internet; Devin uses browser and external tools. MAGIS also resolves each instance in an average of **~5 minutes**, vs Devin where 72% of resolved instances take >10 minutes.

### Planning effectiveness (p. 8, §4.3, Fig. 3–4)

- Repository Custodian consistently **outperforms BM25** in file recall across all file-number settings (Fig. 3).
- Manager task descriptions score 3+ out of 5 in LLM correlation assessment for the majority of cases, and higher scores predict higher resolution rates (Fig. 4).

### Coding effectiveness (p. 8–9, §4.4, Fig. 5–6)

- Developer's line locating coverage ratio distribution peaks near **1.0**, while GPT-4 and Claude-2 peak near **0** (Fig. 5).
- Higher line locating coverage directly increases the resolved ratio — the right half of the coverage distribution has consistently higher resolution rates than the left (Fig. 6).
- MAGIS significantly reduces the negative correlation between complexity (# files, # functions) and resolution compared to GPT-4 alone (Table 3): GPT-4 shows −25.15\* for both; MAGIS shows −1.55.

---

## 5. What is Left Unsolved?

- **86% of issues remain unresolved.** Performance varies widely by repository — some reach 40% resolved, others stay near 0% (App. F, Fig. 13), suggesting repository-specific difficulty is not fully addressed.
- **Complex multi-file changes remain hard.** Unresolved instances involve more files, hunks, and changed lines of code than resolved ones. The framework tends to delete lines rather than add them in failing cases, diverging from human developer patterns.
- **No internet or GUI access.** MAGIS is shell-only. Devin-style external tool access could expand capability but was intentionally excluded.
- **QA and hints are significant contributors** — removing both drops resolved ratio from 13.94% to 8.71%, meaning roughly 5 percentage points depend on human-provided PR hints, which may not always be available.

---

## References

Tao, W., Zhou, Y., Wang, Y., Zhang, W., Zhang, H., & Cheng, Y. (2024). *MAGIS: LLM-Based Multi-Agent Framework for GitHub Issue Resolution*. arXiv:2403.17927.
