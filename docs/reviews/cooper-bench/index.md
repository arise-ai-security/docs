---
slug: /reviews/cooper-bench/
title: CooperBench Overview
sidebar_position: 1
hide_title: true
---

# CooperBench Overview

> **"CooperBench: Why Coding Agents Cannot be Your Teammates Yet"**
> Khatua et al., Stanford University & SAP Labs US — January 2026
> https://cooperbench.com

---

## 1. What is the Problem?

Does strong individual coding ability translate into effective cooperation? No — yet there is no benchmark to measure this gap.

GPT-5 and Claude Sonnet 4.5 achieve only **~25% success** when two agents cooperate — roughly **50% lower** than one agent handling both tasks alone (p. 3). The authors call this the **curse of coordination**. Prior work evaluated agents inside structured, scaffolded systems, making it impossible to isolate whether failures came from coordination inability or framework design. A controlled benchmark is needed to make the problem visible and measurable.

---

## 2. Why is it Hard?

### Prior work sidesteps free-form coordination

Existing multi-agent systems manage coordination by imposing scaffolds (orchestrators, strict turn-taking, shared observability). These designs avoid the problem rather than solving it (p. 2, §1).

### The partial observability bottleneck

Each agent works in an **isolated Docker container** on its own branch. Neither agent can directly inspect what the other has changed. Coordination must happen entirely through natural-language messages — but agents are trained to be *verification-first* (require observable evidence before trusting claims), which conflicts directly with the *trust-requiring* nature of collaboration under isolation. This is the **trust paradox** (p. 13, §6.2).

### Three root-cause capability gaps (p. 12, Table 2)

| Cause | Definition | Frequency |
|---|---|---|
| **Expectation** | Agent fails to update its model of partner's actual code state | 42% |
| **Commitment** | Agent deviates from or cannot verify promised integration points | 32% |
| **Communication** | Agent fails to share actionable intentions or answer questions | 26% |

### Concrete example — the trust paradox in action (p. 11, §6.3)

Agent A promises: *"I will add bypass check at lines 100–104, happens FIRST in get()."* Agent B trusts this claim and builds on it. After merge, the bypass code is entirely missing. Under workspace isolation, there was no mechanism for B to verify A's claim before acting on it.

---

## 3. What is the Solution?

The authors do not propose a fix — they propose a **benchmark** to measure and diagnose the problem, which is itself the contribution.

> **Why a benchmark, not a system?**
> Without a controlled benchmark, if two agents fail together you cannot tell whether the failure came from coordination inability, task difficulty, or the scaffolding imposed by the framework. Existing benchmarks (SWE-bench, HumanEval) only measure individual agent performance — coordination was never the isolated variable. CooperBench fixes this: same task, same total workload, same models, only the coordination requirement changes (Solo vs. Coop). That controlled contrast is what makes the curse of coordination *measurable* — and gives future systems like MAGIS something to be evaluated against.

### CooperBench (p. 3–6, §2)

652 collaborative coding tasks across 12 open-source libraries in Python, TypeScript, Go, and Rust. Each task assigns two agents **different features** to implement on the same repository state. Features are logically compatible but require modifying overlapping code (77.3% of pairs have conflicting ground-truth solutions).

**Three-stage dataset construction** (p. 5, §2.3, Fig. 3):

| Stage | Description |
|---|---|
| **I — Repository & PR Selection** | 12 repos (>1K stars, not in SWE-Bench). PRs filtered for clear feature description, new tests, <200-line diff. |
| **II — Feature Extraction & Augmentation** | Each PR becomes an *anchor feature*. Human annotators author *adjacent features* that naturally co-occur and create overlap. |
| **III — Environment & Reproducibility** | Automated scripts clone the repo at the exact base commit and containerize the full environment for deterministic evaluation. |

**Evaluation pipeline** (p. 4, §2.2): success requires both (1) **solution compatibility** — patches merge cleanly via `git merge-file`, with a fine-tuned Qwen2.5-Coder-0.5B resolver handling trivial style conflicts — and (2) **implementation correctness** — merged codebase passes all unit tests for both features.

**Experiment setup** (p. 6, §3): OpenHands v0.54 agent framework extended with an SQL-backed inter-agent messaging tool. Five models evaluated: GPT-5, Claude Sonnet 4.5, MiniMax M2, Qwen3-30B-A3B-Instruct, Qwen3-Coder-30B-A3B-Instruct. Three conditions: *Solo* (one agent, both features), *Coop* (two agents with communication), *No-comm* (two agents without communication).

---

## 4. Why Should We Believe It?

### RQ1: The curse of coordination is real and universal (p. 7, §4, Fig. 4)

Coop success is consistently below Solo across **all five models**:

| Model | Solo | Coop | Retention |
|---|---|---|---|
| GPT-5 | 0.48 | 0.28 | 0.64 |
| Claude Sonnet 4.5 | 0.47 | 0.26 | 0.60 |
| MiniMax M2 | 0.36 | 0.14 | 0.46 |
| Qwen3-Coder | 0.13 | 0.05 | 0.63 |
| Qwen3 | 0.22 | 0.06 | 0.68 |
| **Pooled** | **—** | **—** | **0.59** |

On average, agents **lose 41% of their Solo capability** when forced to coordinate (pooled retention = 0.59, Appendix C, p. 24, Table 5). Notably, coding ability does not predict coordination ability: MiniMax has the worst retention (0.46) despite mid-tier coding performance; Qwen has the best retention (0.68) despite being the weakest coder.

The gap is largest at **intermediate task difficulty** — easy tasks leave room for coordination overhead; hard tasks overwhelm both modes equally (Fig. 4 Right). Scaling agents further amplifies the curse: 68.6% (2 agents) → 46.5% (3) → 30.0% (4) on a 46-task subset (p. 8, §4).

### RQ2: Communication is used but not useful (p. 8–9, §5, Fig. 5–6)

Banning the communication tool produces **no statistically significant difference** in final success rate for any model (Table 6, p. 27). Agents spend up to **20% of their action budget** communicating — yet it does not help.

What communication *does* do: it reduces naive merge conflicts (Fig. 5b), because agents coordinate on *where* to edit (spatial). What it fails to do: ensure compatible *semantics* — what values, interfaces, and behaviors to implement.

**Case study — Jinja2 `groupby` filter** (Appendix I, pp. 31–33): Two agents add `case_sensitive` and `reverse` parameters to the same function signature. They exchange 10 messages (>3,000 words) successfully coordinating line numbers and edit ranges. They never once discuss the *default value* of `case_sensitive`. Agent 1 correctly implements `False`; Agent 2 reports `case_sensitive=True` in its status message and the merged code fails. A single clarifying message about the intended default would have prevented the failure entirely.

**What effective communication looks like** (p. 9, §5):
- A `Plan` message in the **first turn** nearly halves the conflict rate (29.4% vs 51.5%).
- Successful trajectories show a Plan:Question ratio of **2.04 vs 1.31** — questions are a symptom of struggle, not a coordination tool.
- Successful agents cite **32.6 line numbers vs 22.5** and **13.1 file paths vs 10.0** — specificity enables spatial coordination.

**Communication failure modes** (Fig. 6, p. 10):
- **Repetition**: near-duplicate status updates consume budget without adding constraints (up to 37.1% of conversations, Claude).
- **Unresponsiveness**: direct questions go unanswered, collapsing the decision loop (up to 21.3%, MiniMax).
- **Hallucination**: agents assert false completions or interface states (up to 6.9%, Claude).

### RQ3: Failures are systematic, not random (p. 10–13, §6, Tables 1–2)

Observable failure symptoms (LLM-as-Judge over all failed Coop traces, 96% human agreement on 50 validation samples):

| Symptom | Frequency |
|---|---|
| Work overlap — both agents implement the same code | 33.2% |
| Divergent architecture — incompatible design decisions survive a clean merge | 29.7% |
| Repetition | 14.7% |
| Unresponsiveness | 8.7% |
| Unverifiable claims | 4.3% |
| Broken commitment | 3.7% |

**Emergent coordination in successful runs** (p. 13, §6.4): the behaviors that work are rare but structured — *role division* (mutually confirmed scope boundaries), *resource division* (line-level ownership), and *negotiation* (one agent proposes two fully-specified options; the other picks one). Their presence proves the underlying capability exists; the challenge is making them reliable.

---

## 5. What is Left Unsolved?

- **No training solution is proposed.** CooperBench is a measurement tool, not a fix. How to train agents to coordinate reliably under partial observability remains open.
- **Communication channel is text-only.** Screen sharing or diff-sharing could reduce the spatial-semantic gap.
- **Findings generalize beyond software.** Any domain with role conflicts and partial observability faces the same bottleneck — but CooperBench only evaluates code.

**Future directions** (p. 15–16, §8):
1. Training objectives that reward coordination under partial observability.
2. Lightweight verifiable commitment protocols — shared signatures, insertion-point contracts.
3. Richer communication modalities beyond natural language.

---

## References

Khatua, A., Zhu, H., Tran, P., Prabhudesai, A., Sadrieh, F., Lieberwirth, J. K., Yu, X., Fu, Y., Ryan, M. J., Pei, J., & Yang, D. (2026). *CooperBench: Why Coding Agents Cannot be Your Teammates Yet*. https://cooperbench.com
