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

**Interactive Features:** Scroll to zoom • Drag to pan • Click nodes for detailed information

<ApproxQLearningWorkflow />

### Workflow Explanation

The diagram above follows the [Approximate Q-Learning](./intro.md#approximate-q-learning) loop with feature-based Q-value estimation:

1. **State Observation**: The agent observes its current state $\mathcal{s}$, defined as:
$$
\mathcal{S_t} = (\text{objective}, \text{budget}, \text{task queue}, \text{file system snapshot with access}, \text{sub-agents' states})
$$

2. **Action Space**: The agent considers all possible actions in its action space $\mathcal{A}$. Each action type corresponds to a specific task assignment operation.

3. **Q-Value Computation**: For **each** candidate action $\mathcal{a}_i$, the agent extracts [feature values](#feature-functions) and computes the Q-value using the linear approximation:
$$
\mathcal{Q}(\mathcal{s}, \mathcal{a}_i) = \sum_{j} \mathcal{w_j} f_j(\mathcal{s}, \mathcal{a}_i)
$$

4. **Action Selection**: Using a [stochastic policy](./intro.md#policy) $\pi(\mathcal{a}|\mathcal{s})$, typically ε-greedy:
   - With probability $\varepsilon$: select a random action (exploration)
   - With probability $1-\varepsilon$: select $\mathcal{a}^* = \arg\max_{\mathcal{a}} \mathcal{Q}(\mathcal{s}, \mathcal{a})$ (exploitation)

5. **Action Execution**: The chosen action $\mathcal{a}^*$ is executed, producing observable effects (e.g., tasks added to queue, sub-agents spawned, budget consumed).

6. **State Transition & Reward**: The environment transitions to new state $\mathcal{s'}$ and the agent receives reward $\mathcal{r}$ based on the outcome. The transition tuple $(\mathcal{s}, \mathcal{a}^*, \mathcal{r}, \mathcal{s'})$ is recorded.

7. **Weight Update**: Following [Approximate Q-Learning update rules](./intro.md#approximate-q-learning), the agent computes the TD difference and updates weights:
$$
\begin{aligned}
\text{difference} &= \left[\mathcal{r} + \gamma \max_{\mathcal{a'}} \mathcal{Q}(\mathcal{s'}, \mathcal{a'})\right] - \mathcal{Q}(\mathcal{s}, \mathcal{a}^*) \\
\mathcal{Q}(\mathcal{s}, \mathcal{a}^*) &\leftarrow \mathcal{Q}(\mathcal{s}, \mathcal{a}^*) + \alpha \cdot \text{difference} \\
\mathcal{w_i} &\leftarrow \mathcal{w_i} + \alpha \cdot \text{difference} \cdot f_i(\mathcal{s}, \mathcal{a}^*)
\end{aligned}
$$
   The key insight: **blame on-features**. If something unexpectedly bad happens (difference < 0), the weights of active features decrease, causing the agent to disprefer all states with similar features.

8. **Next Iteration**: If not in a terminal state, the agent sets $\mathcal{s} \leftarrow \mathcal{s'}$ and repeats from step 1.