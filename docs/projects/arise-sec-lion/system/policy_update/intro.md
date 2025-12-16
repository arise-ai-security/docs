---
slug: /projects/arise-sec-lion/system/policy_update/
title: Policy Update Overview
sidebar_position: 1
hide_title: true
---

# Policy Update Overview
The bigger picture of proposal of tree structured system is to incorporate the ideas of reinforcement learning but at a higher level. The strength of agentic system is that the agents repeatedly gain more knowledge about the task thorugh explorations in the environment (coding space) and interactions with other agents. We aim to design a system that thinking agents can think more with trial-and-errors and working agents gain more instructions through better context provided by the ancestor agents. This idea is inspired by this HuggingFace blog post: [An Introduction to Deep Reinforcement Learning](https://huggingface.co/blog/deep-rl-intro#what-is-reinforcement-learning) and UC Berkeley CS188 Slides on [Reinforcement Learning 1](https://inst.eecs.berkeley.edu/~cs188/fa25/assets/lectures/cs188-fa25-lec10.pdf) and [Reinforcement Learning 2](https://inst.eecs.berkeley.edu/~cs188/fa25/assets/lectures/cs188-fa25-lec11.pdf). 

This agentic tree system adapts the active reinforcement learning framework, intuitively illustrated below:
![active RL](./activeRL.jpg)
*Credit: UC Berkeley CS188*

Our system have two different agents: thinkers and workers. Thinkers utilize their reasoning capabilities to perform offline planning by creating task breakdowns based on its current understanding of the task and context provided by ancestor agents. Workers, on the other hand, focus on executing specific tasks assigned to them by their parent thinkers. Workers uses online planning by following the instructions provided in the context from ancestor thinkers to perform actions in the coding environment. Their supervisor nodes learn from the actual execution results and real-life behaviors of their workers.

## 📚 Documentations

### [Task Assignment Mechanism](./task_assign.md)
This section discusses how our system designed to allow supervisor agents to effectively assign tasks to their subordinate agents, monitor their progress, manage task completion, verification, or reassignment.

### [Reward Allocation Mechanism](./reward_alloc.md)
This section illustrates how our system use reward allocation mechanism to dynamically adjust the budget of each agent based on their performance. This online reinforcement learning should assist agents to converge to solutions.

### [Access Control Mechanism](./access_control.md)
This section describes how our system implements access control mechanism to manage file permissions among agents, preventing conflicts and ensuring smooth collaboration in the coding environment.

## Terminiologies:
### Supervisions:
Human supervisions to the system can be in various forms, including: prompting, rewording, human task breakdown, and human feedbacks. However, our agentic tree grows exponentially fast, and human interventions are not as effective as expected. For example, prompting with clearer and direct instructions at the root may be only helpful for top-level agents to plan how to break down the objective. Our high-level goal for this system is to learn on its own. For example, for a completed task, other agents may decide to verify it or not with unit tests.

### State

### Action

### Value

### Reward
- **Definition**: 
- **Reward Hypothesis**: all goals can be described as the maximization of the expected return (expected cumulative reward). In our system, the reward is gained or lost when the exploration (task execution) is completed, and it can be exponentially propagated back to ancestor agents through reward allocation mechanism. However, if the tree grows too deep, the budget for eacch agent will be so small that the reward signal is weak, so that the tree shoud be kept in a reasonable depth.

### Policy 