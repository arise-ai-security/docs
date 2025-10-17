---
sidebar_position: 1
---

# Overview

CyberGym is a large-scale framework created to evaluate the cybersecurity capabilities of AI agents by evaluating how well agents reproduce vulnerabilities in real-world software projects. Agents are required to produce Proof of Concept tests to trigger target vulnerabilities.

High-level Overview:
- **Features 1,507 vulnerabilities** (discovered by OSS-Fuzz) from 188 software projects that agents are tasked with reproducing
- **Found 15 zero-day vulnerabilities**
- **Used to evaluate 4 agents and 9 LLMs**
    - Most effective found to be OpenHands with Claude-3.7-Sonnet


## Novel Contribution
### Existing Benchmarks
Existing benchmarks to assess how effective the cybersecurity capabilities of LLMs are currently **fall short** for three reasons:
1. Codebases are too small
2. Simplified tasks (CTF challenges)
3. Do not target real-world vulnerabilities

### CyberGym
CyberGym builds upon these limitations
1. Explicitly tests agents vulnerability reproduction capabilities on real-world vulnerabilities
2. Goal: Agent must generate a PoC that triggers the vulnerability in the pre-patch version of the program, solve at the repository level
3. Post-patch executable allows for discovery
    - Buggy patch: the PoC triggers the same vulnerability post-patch
    - New vulnerability: the PoC triggers a new vulnerability
4. Modular: ensures scalability & adaptability in the future
5. Four difficulty levels provide insights into how successful agents could be with enough input information