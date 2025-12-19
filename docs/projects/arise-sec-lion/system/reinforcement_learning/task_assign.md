---
title: Task Assignment Mechanism
sidebar_position: 2
---

import ApproxQLearningWorkflow from '@site/src/components/ApproxQLearningWorkflow';

# Task Assignment Overview
As observed in our [budgeted tree experiment](/docs/projects/arise-sec-lion/system/design_choice/budgeted_tree.md), the lack of a proper task assignment mechanism leads to one prominent issue: catestrophic breakdown. One supervisor agent's inproper/inaccurate task breakdown can cause all of sub-agents derail from the main objective. 

To mitigate this issue or similar task assignment problems, a task assignment mechanism is necessary to ensure that the sub-tasks designed by supervisor agents are accurate, non-redundant, and productive. The generated work can be verified or redone.

In our [Q-Value based reinforcement learning framework](./intro.md), the task assignment mechanism is one of actions an agent should be guided to take while maximizing its Q-Value. Created sub-tasks, along with their completion statuses, feedbacks from sub-agents, configurations of sub-agents of assigned tasks are essential part of agent's state $\mathcal{S}$ representation.

## Task Assignment Mechanism Workflow
This part also delineates the agent's responsibilities in task assignment.

- **Key Changes Compared to [brain-storming note](/docs/weekly/brainstorming/agentic-tree#task-assignment-mechanism)**:
    1. Introduce Task Fullfillment Queue.
    2. Formalize Redo, Verify against Objective, or Termination Heuristics by Q-Learning method.
    3. Incorporate Sub-Agent Feedback Reports and Corresponding Response Actions.
    4. However, update on Budget Recollection and Q-Value Adjustment is not shown here for simplicity, but should be considered as part of the overall workflow.

### Feature Functions:
As illustrated in [Approximate Q-Learning Framework](./intro.md#approximate-q-learning), the task assignment mechanism can be formalized as a set of feature functions: $f_i: (\mathcal{S}, \mathcal{A}) \rightarrow \mathbb{R}$.
    1. Objective Complexity: action $\mathcal{a}$ is to analyze objective by agent's reasoning.
    $$
    f_1(\mathcal{s}, \mathcal{a}) =
    \begin{cases}
        1 &\text{if task is complex} \\
        0 &\text{if task is simple}
    \end{cases}
    $$
    2. Objective Fullifillment: action $\mathcal{a}$ is to gather all finished reports from sub-tasks to check if the objective is fulfilled. The summary report of all sub-tasks is compared against the original objective.
    $$
    f_2(\mathcal{s}, \mathcal{a}) =
    \begin{cases}
        1 &\text{if objective is fulfilled} \\
        0 &\text{if objective is not fulfilled}
    \end{cases}
    $$
    3. Task Queue Length: action $\mathcal{a}$ is to check the length of task queue.
    $$
    f_3(\mathcal{s}, \mathcal{a}) = \text{length of task queue}
    $$
    4. Sub-Agent Feedback: action $\mathcal{a}$ is to analyze feedback reports from sub-agents.
    $$
    f_4(\mathcal{s}, \mathcal{a}) =
    \begin{cases}
        1 &\text{if feedback is positive} \\
        0 &\text{if feedback is neutral} \\
        -1 &\text{if feedback is negative}
    \end{cases}
    $$
    5. Individual Task Completion Status: action $\mathcal{a}$ is to inspect if one sub-task is completed.
    $$
    f_5(\mathcal{s}, \mathcal{a}) =
    \begin{cases}
        1 &\text{if the chosen sub-task is completed} \\
        0 &\text{if the chosen sub-task is not completed}
    \end{cases}
    $$
    6. Individual Completed Task Budget Gain/ Loss: action $\mathcal{a}$ that can cause the budget gain/loss from one completed sub-task from a specific sub-agent. For example, if the current agent kills the sub-agent after the sub-agent finishes the assigned sub-task, the remaining budget is returned to the current agent.
    $$
    f_6(\mathcal{s}, \mathcal{a}) = \text{given budget} - \text{remaining budget}
    $$
    7. Current Budget On Hold: action $\mathcal{a}$ is to check the current existing budget possessed by this agent.
    $$
    f_7(\mathcal{s}, \mathcal{a}) = \text{current budget}
    $$
 

### Workflow Chart
The following interactive diagram illustrates the [Approximate Q-Learning](./intro.md#approximate-q-learning) process for task assignment. It shows the complete decision cycle: how the agent observes the current state, evaluates Q-values for all candidate actions, selects an action via stochastic policy, executes the action, transitions to a new state, receives a reward, and updates weights for the next iteration.

**Interactive Diagram:** Scroll to zoom • Drag to pan • Click nodes for detailed information

<ApproxQLearningWorkflow/>

### Workflow Explanation

This explanation maps the interactive `ApproxQLearningWorkflow` to the equations in [Approximate Q-Learning](./intro.md#approximate-q-learning), but stays focused on *task-assignment semantics* (assign / verify / redo) and *weight updates*.

1) Observe state and enumerate candidate actions
    - The supervisor observes its current state $\mathcal{s}$ (objective + progress signals such as budget, task queue, feedback, etc.).
    - It enumerates candidate task-assignment actions $\mathcal{A}(\mathcal{s})$ such as:
      - Pop/execute next task
      - Insert verification task
      - Redo (revise and re-insert) a failed task
      - Terminate / stop spawning (when warranted)

2) Compute feature values and estimate $Q(\mathcal{s},\mathcal{a})$
    - For each candidate action $\mathcal{a}$, compute feature values $f_i(\mathcal{s},\mathcal{a})$ (see [Feature Functions](#feature-functions)).
    - Approximate the action value by a linear function of features:
$$
\mathcal{Q}(\mathcal{s},\mathcal{a}) = \sum_i \mathcal{w_i}\, f_i(\mathcal{s},\mathcal{a})
$$

3) Select an action (policy)
    - Use a stochastic policy (typically ε-greedy): explore with probability $\varepsilon$, otherwise choose the action with the largest estimated $\mathcal{Q}(\mathcal{s},\mathcal{a})$.

4) Execute the task-assignment action
    - Execute the selected action in the workflow (task queue update, optional verification insertion, redo decision).
    - The system transitions to a new state $\mathcal{s'}$.

5) Observe reward and record the transition
    - The agent receives a scalar reward $\mathcal{r}$ and records $(\mathcal{s},\mathcal{a},\mathcal{r},\mathcal{s'})$.
    - Reward should reflect what task assignment is trying to optimize (e.g., correctness + alignment + efficiency). One simple shaping pattern:
$$
\mathcal{r} = r_{done} + r_{verify} + r_{budget} + r_{feedback} - r_{delay}
$$

6) Update weights (blame-on-features)
    - Compute a *difference* signal using the same form as in the Approximate Q-Learning section:
$$
	\text{difference} = \left[\mathcal{r} + \gamma\max_{\mathcal{a'}} \mathcal{Q}(\mathcal{s'},\mathcal{a'})\right] - \mathcal{Q}(\mathcal{s},\mathcal{a})
$$
    - Update weights for features that were active for $(\mathcal{s},\mathcal{a})$:
$$
\mathcal{w_i} \leftarrow \mathcal{w_i} + \alpha \cdot \text{difference} \cdot f_i(\mathcal{s},\mathcal{a})
$$
    - Intuition: if an outcome is worse than expected, the active features get “blamed” and their weights move to reduce the chance of repeating that decision in similar states.

7) Iterate
    - Set $\mathcal{s} \leftarrow \mathcal{s'}$ and repeat until termination.

Feature cues in this workflow
- $f_1$ (complexity): triggers on hard objectives (more likely to verify/branch).
- $f_2$ (fulfillment): turns on when aggregated sub-results satisfy the objective.
- $f_3$ (queue length): discourages bloat; affects $r_{delay}$.
- $f_4$ (feedback): positive/neutral/negative sub-agent signals.
- $f_5$ (completion): per-task success flag.
- $f_6$ (budget gain/loss): efficiency per completed task.
- $f_7$ (current budget): remaining resources.