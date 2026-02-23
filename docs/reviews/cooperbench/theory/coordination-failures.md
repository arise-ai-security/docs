---
sidebar_position: 4
---

# Coordination Failures and Emergent Behaviors

Even when agents communicate their plans, they struggle to honor commitments and anticipate partner actions. Coordination failures stem from three capability gaps: **communication** (failing to exchange key information), **commitment** (not following through on promises), and **expectation** (failing to model what partners are doing).

## Failure Symptoms

Through iterative qualitative coding of all failed Coop trajectories, the following failure symptom taxonomy is identified (annotated at scale using GPT-5 as LLM-as-a-Judge, validated at 96% agreement with human experts):

| Symptom | Description | Frequency |
|---|---|---|
| **Work overlap** | Both agents independently implement the same functionality, duplicating work and overwriting details | 33.2% |
| **Divergent architecture** | Incompatible design decisions lead to semantic loss even under a clean merge | 29.7% |
| **Repetition** | Verbose status messages add little new information and reduce signal | 14.7% |
| **Unresponsiveness** | Direct questions or requests are not answered, breaking the decision loop | 8.7% |
| **Unverifiable claims** | Agent asserts a change without evidence the partner can check | 4.3% |
| **Broken commitment** | Confident completion claims create false shared context when the promised change is absent | 3.7% |
| **Dependency access** | Missing risk communication about merged dependency interactions (e.g., circular imports) | 1.7% |
| **Placeholder misuse** | An explicit integration contract exists but is applied differently than agreed | 1.5% |
| **Parameter flow** | Ambiguity about a changing interface leaves one agent implementing against an outdated contract | 1.3% |
| **Timing dependency** | Agents agree on order but fail to communicate an enforceable plan that preserves it after merge | 1.1% |

## Root Causes

Manual review of 50 failed Coop traces reveals three underlying capability gaps:

### Expectation Failures (42%)
One agent has clearly communicated what they are doing, but the other agent still treats the situation as if that work is not being done. This reflects a failure to model the state of the other agent's code changes and what that means for the system as a whole.

**Example**: Agent A announces it will modify `prompts.py` and call B's `get_global_filters()`. Agent B states it will insert `GLOBAL_FILTERS` at a specific location. Both communicate their plans explicitly, yet the merge fails — A proceeds as if B's code won't exist. This is the most common cause, reflecting a fundamental difficulty in maintaining an accurate model of partner state during independent work.

### Commitment Failures (32%)
An agent is not doing the things they promised to do. This includes failures to establish or maintain verifiable integration contracts.

**Example**: An agent promises "I will add bypass check at lines 100–104" and later claims completion with a checkmark. But after merge, the bypass code is missing. The partner trusted this claim but had no way to verify it under workspace isolation.

### Communication Failures (26%)
Breakdowns in using language to coordinate — agents do not effectively communicate their intentions, questions, or status updates.

**Example**: Agent A asks "Which approach would you prefer?" The response is silence. Without an answer, both agents continue with potentially incompatible assumptions. Unlike expectation failures (information exists but isn't integrated) or commitment failures (promises aren't kept), this is a failure to even establish shared context.

## The Trust Paradox

A deeper tension underlies expectation failures: models are trained to be cautious, requiring observable evidence and resisting unverifiable assertions. This is sensible for single-agent interactions where users may mislead the model. However, collaboration under workspace isolation requires the opposite — agents must **trust** partner claims about states they cannot observe.

When Agent A reports "I added the handler at line 50," Agent B's instinct is to verify, but verification fails because they are on separate branches. This mismatch between verification-first training and trust-requiring collaboration may partly explain why agents consistently fail to update their model of partner state despite explicit communication.

## Emergent Coordination Behaviors

Among successful runs, coordination patterns emerge that are largely absent from failures. These behaviors are not prompted or scaffolded — they arise when agents successfully navigate partial observability. Three patterns are identified:

### Role Division
Agents agree on who handles which part of the task and establish clear boundaries around their scope. What distinguishes successful role division is **mutual confirmation** — both agents explicitly acknowledge the split, creating verified shared understanding.

**Example**:
> "You implement the environment-isolation feature and I'll implement multi-file editing support. Please avoid the backend implementation; I will handle it end-to-end."
>
> "I won't touch the backend editor implementation. I'll implement environment isolation in the CLI-layer logic only."

### Resource Division
Agents avoid collisions by partitioning shared resources — specific files, code ranges, or ownership blocks. What makes this effective is **specificity**: line-level boundaries create safe zones where conflict is impossible by construction.

**Example**:
> "I will modify `types.py` lines 68–84 (`ImageBlock.image_to_base64`)"
>
> "I will NOT edit lines 68–84. My plan is to insert `get_image_mimetype()` AFTER line 84 (starting at new line 85)."

### Negotiation
Agents resolve conflicting approaches by proposing alternatives and converging on a single plan before acting. Effective negotiation reduces a complex coordination problem to a simple choice by proposing mutually exclusive options that fully specify what each agent will do.

**Example**:
> "I checked the file... here are two clean options: (1) I add IsHash; you add import re + IsRegex; I handle all `__init__.py` exports. (2) You add IsRegex; I add IsHash; you handle all `__init__.py` exports. Which option do you prefer?"
>
> "Let's do option (1)... I've already added `import re` now. You add IsHash, then I'll add IsRegex."

These coordination patterns are **rare** in the traces, but their presence in successful cases suggests the underlying capability exists. The challenge is making it reliable, potentially through multi-agent training methods that reinforce success on CooperBench.

## Implications for Future Work

The findings suggest current models lack reliable representations for:
1. **Partner state** — what the other agent has actually changed
2. **Checkable commitments** — contracts verifiable after merge
3. **Cross-branch integration reasoning** — anticipating how independent patches interact

The authors propose several directions:
- Training objectives that reward coordination under partial observability
- Lightweight protocols for verifiable commitments (shared signatures, insertion-point contracts)
- Richer communication channels (e.g., screen sharing) to expand beyond text
- Multi-agent training methods (e.g., Sotopia-pi) to reinforce emergent coordination behaviors through success feedback
