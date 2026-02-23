---
sidebar_position: 1
---

# Overview

CooperBench is the first benchmark designed to measure how well AI coding agents can cooperate when handling individual tasks with potential conflicts. It comprises over 600 collaborative coding tasks across 12 open-source libraries in 4 programming languages (Python, TypeScript, Go, Rust). Each task assigns two agents different features that can be implemented independently but may conflict without proper coordination.

## Key Definitions

- **Cooperation**: When two or more agents/humans work together towards a shared goal, where an agent may altruistically help another achieve things outside their original responsibility.
- **Collaboration**: When two or more agents/humans work together towards a shared goal.
- **Coordination**: The capability to act and communicate in accordance with other agents/humans.

## Motivation

As AI agents are increasingly deployed in cooperative settings, whether strong individual capabilities translate to effective cooperation remains an open question.

> **Why a benchmark, not a system?**
> Without a controlled benchmark, if two agents fail together you cannot tell whether the failure came from coordination inability, task difficulty, or the scaffolding imposed by the framework. Existing benchmarks (SWE-bench, HumanEval) only measure individual agent performance — coordination was never the isolated variable. CooperBench fixes this: same task, same total workload, same models, only the coordination requirement changes (Solo vs. Coop). That controlled contrast is what makes the curse of coordination *measurable* — and gives future systems like MAGIS something to be evaluated against.

Existing research on multi-agent systems largely sidesteps the coordination challenge by either:
- Providing more scaffolds (Magentic-One, AgentOrchestra)
- Enforcing strict workflows (MetaGPT, ChatDev, AgileCoder)
- Providing active supervision and verification (GuardAgent)

These approaches rely on developer- or user-provided scaffolding to manage coordination, which limits flexible cooperation and places additional burden on humans. CooperBench instead tests whether agents can coordinate autonomously through natural language communication.

## Novel Contribution

### Existing Benchmarks
Prior benchmarks for multi-agent systems have significant limitations:
1. **Game-based benchmarks** (Hanabi, Cicero): Test coordination under information asymmetry but in simplified, non-realistic domains.
2. **Embodied task benchmarks** (Tool-RoCo, RoCoBench): Assess multi-robot cooperation but not software development coordination.
3. **Software benchmarks** (SWE-Bench, Multi-SWE-Bench): Measure single-agent success rather than whether multiple peers can integrate changes without conflict.
4. **Structured interaction benchmarks** (SyncBench, MultiAgentBench): Typically enforce turn-taking or shared observability rather than testing code integration under workspace isolation.

### CooperBench's Contributions
1. **Realistic cooperative coding tasks**: 652 tasks grounded in real open-source repositories with expert-written features and tests.
2. **Free-form coordination**: Agents communicate via natural language without imposed interaction structure, reflecting real-world software development.
3. **Workspace isolation**: Each agent works in its own environment, creating genuine partial observability that demands coordination.
4. **Verifiable evaluation**: Success is measured through deterministic merge + unit test pipeline, making cooperation outcomes objectively measurable.
5. **Identifies the curse of coordination**: Empirically demonstrates that frontier models (GPT-5, Claude Sonnet 4.5) achieve only ~25% success in cooperative settings, roughly 50% lower than solo baselines.

## Research Questions

CooperBench investigates three core research questions:

1. **RQ1**: How well can agents cooperate with each other? (The curse of coordination)
2. **RQ2**: What role does communication play in agent-agent cooperation? (Communication reduces conflicts but not success)
3. **RQ3**: What coordination failures do agents exhibit? (Expectation, commitment, and communication gaps)
