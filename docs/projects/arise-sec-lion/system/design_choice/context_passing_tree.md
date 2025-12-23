---
title: Context Passing Agentic System Design
sidebar_position: 5
---

import CVE from '@site/src/components/cve';

# Design Choice 4: Richer Context Passing Between Agents

## Context Passing Agentic System 
This system is building on top of the [budgeted tree plus](./budgeted_tree_plus.md) agentic system by adding supervisor justifications of subtask assignment and budget allocation.

## Case Study Task
### Task Objective
This time we deal with the real cybersecurity vulnerability CVE-2023-5586 to test for the effectiveness of this design choice. The prompt for the boss node is directly sampled from the SecVerifier.
### Interactive Diagram

Below is an interactive React Flow diagram that captures a snapshot of the high-level structure. You can pan, zoom, and explore relationships between agents. **Click on the nodes to see their details**.
<CVE/>

### Analysis
1. **Tree Growth and Better Context for Worker Node**: This design achieved the most optimal tree structure among all design choices so far. The worker node was able to inherit rich context from the supervisor node, which allowed it to focus on the specific vulnerability analysis task without needing to spawn additional agents for clarifications or subtask breakdowns. The work is done more efficiently and correctly from the left part of the tree to the right part of the tree by including the calling order for worker executions to avoid overlapping work.
2. **Supervisor Justifications**: The supervisor node provided clear justifications for both the subtask assignment and the budget allocation to the worker node. This transparency in decision-making helped ensure that the worker node understood the importance and scope of its task, leading to more focused and effective work.
3 **Resemble to SecVerifier Work**: With the same prompt used in SecVerifier, this design choice produced a similar vulnerability analysis report as SecVerifier, including builder, exploiter, and fixers. To tackle the same work we require around 50 agents, but SecVerifer activated more than 100 agents. However, our work still requires sound verifications to showcase our systemic capabilities oof demonstrating its effectiveness in handling real-world cybersecurity tasks.
4. **Lack of Model Fallback**: when a model is not available, we do not have a safeguard mechanism to switch to another model.
5. **Lack of Inter-Worker Communications**: Despite the supervisors' clear instructions, some workers still have overlapping work due to their lack of communication with each other. Implementing a mechanism for inter-worker communication could further enhance efficiency and reduce redundancy.