---
sidebar_position: 5
---

# Evaluation and Findings

## Evaluation Quality

Quality of PoC generation is an acceptable metric to use to evaluate the cybersecurity capabilities of AI agents for the following 4 reasons.

1. It is an important element in cybersecurity
2. It is appropriately challenging for the agents
3. CyberGym's database contains large quantities of real-world data to concretely evaluate an agent’s performance on. The OSS-Fuzz data used details the vulnerability, how it was triggered, and how it was patched.
4. The defined benchmark metric assures benchmarking is rigorous

## Findings

Four agent frameworks were used in this experiment. Two cybersecurity agents: Cybench and ENiGMA, and two general-purpose coding agents: Codex and OpenHands. Nine LLMs were used, four of which were general-purpose closed-source LLMs (GPT-4.1, o4-mini, Claude-3.7-Sonnet, and Gemini2.5-Flash), three were specialized LLMs to solve SWE-Bench and were optimized for OpenHands (SWE-Gym-32B, R2E-Gym-32B, and OpenHands-LM-32B), and two were general-purpose open-weight LLMs (Qwen3-235B-A22B and DeepSeekV3).

### Overall Findings

Enabling thinking mode increased vulnerability reproduction by 2-3%. On a set of 300 tasks, Claude-3.7-Sonnet increased from 14.3% to 17.3% and Qwen3-235B-A22B increased from 2.7% to 4.7%. However, thinking mode was disabled for the experiment to reduce costs.

More input information increased vulnerability reproduction rates Provide the stack trace and/or ground truth. However, model discovers less post-path vulnerabilities with more inputs because there is less freedom for exploration.

The success rate of the agent decreased as PoC length increased because the program is more complex, so it is harder for the agent to accurately trigger the target vulnerability.

Analysis not constrained to source code inspection, so agents were able to dynamically test their PoCs.

### Zero-Day Vulnerabilities

When CyberGym is run with difficulty level 0, agents were able to discover seventeen new vulnerabilities. Fifteen of these new vulnerabilities are zero-day, and 2 are unpatched but disclosed. This demonstrates the real potential of agents to uncover unknown vulnerabilities.

### LLM Findings

OpenHands was used as the agent to evaluate the 9 LLMs since it possessed the highest success rate on reproducing target vulnerabilities.

- Claude-3.7-Sonnet: highest rates all-around
  - Reproducing target vulnerabilities: **11.9%**
  - Finding new post-path vulnerabilities: **2.2%**
- GPT-4.1
  - Reproducing target vulnerabilities: 9.4%
  - Finding new post-path vulnerabilities: 1.3%
- Specialized models (SWE-Gym-32B, R2E-Gym-32B, and OpenHands-LM-32B)
  - Weak generalization to real-world vulnerabilities
- o4-mini
  - Overall low performance. It asked the user for confirmation rather than taking actions itself, due to its safety mechanisms.
- Open source (Qwen3-235B-A22B and DeepSeekV3)
  - DeepSeek had the highest success rates (3.6% and 0.7%)

### Agent Findings

GPT-4.1 was used as the LLM when evaluating the four agents due to its API’s having a higher rate limit than Claude-3.7-Sonnet.

- OpenHands
  - Reproducing target vulnerabilities: **9.4%**
  - Finding new post-patch vulnerabilities: 1.3%
- Cybench
  - Reproducing target vulnerabilities: 9.0%
  - Finding new post-patch vulnerabilities: **2.3%**
- Codex
  - Reproducing target vulnerabilities: 7.4%
  - Finding new post-patch vulnerabilities: 1.2%
- ENiGMA
  - Reproducing target vulnerabilities: 7.2%
  - Finding new post-patch vulnerabilities: 1.9%
