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

## Q-Learning Convergence Justification

This section provides theoretical justification for why our approximate Q-learning approach converges to a close-to-optimal policy for task assignment, along with convergence time estimates grounded in our agentic tree system.

### Bellman Optimality and Contraction Mapping

The foundation of Q-learning convergence rests on the Bellman optimality equation. For any state-action pair $(\mathcal{s}, \mathcal{a})$, the optimal Q-value satisfies:

$$
\mathcal{Q}^*(\mathcal{s}, \mathcal{a}) = \mathbb{E}\left[\mathcal{r} + \gamma \max_{\mathcal{a'}} \mathcal{Q}^*(\mathcal{s'}, \mathcal{a'})\right]
$$

The Bellman operator $\mathcal{T}$ defined as:

$$
(\mathcal{T}\mathcal{Q})(\mathcal{s}, \mathcal{a}) = \mathbb{E}\left[\mathcal{r} + \gamma \max_{\mathcal{a'}} \mathcal{Q}(\mathcal{s'}, \mathcal{a'})\right]
$$

is a **contraction mapping** with factor $\gamma < 1$. By the Banach fixed-point theorem, repeated application of $\mathcal{T}$ converges to a unique fixed point $\mathcal{Q}^*$:

$$
\|\mathcal{T}\mathcal{Q}_1 - \mathcal{T}\mathcal{Q}_2\|_\infty \leq \gamma \|\mathcal{Q}_1 - \mathcal{Q}_2\|_\infty
$$

**System Example**: Consider a supervisor agent handling a SQL injection vulnerability fix. Initially, the agent may assign poorly scoped sub-tasks (e.g., "fix all SQL queries" as a single task). Through repeated interactions:
- The Bellman operator contracts the Q-value estimates toward the true optimal values
- After observing that monolithic tasks yield negative feedback ($f_4 = -1$) and low completion rates ($f_5 = 0$), the Q-values for such actions decrease
- Conversely, well-decomposed tasks (e.g., "audit input validation for user login endpoint") receive positive feedback, and their Q-values increase toward the optimum

### Convergence Conditions

Tabular Q-learning converges to $\mathcal{Q}^*$ almost surely under three conditions:

1. **Adequate Exploration**: Every state-action pair must be visited infinitely often. Our ε-greedy policy with $\varepsilon > 0$ ensures this:
$$
\pi(\mathcal{a}|\mathcal{s}) =
\begin{cases}
    1 - \varepsilon + \frac{\varepsilon}{|\mathcal{A}|} & \text{if } \mathcal{a} = \arg\max_{\mathcal{a'}} \mathcal{Q}(\mathcal{s}, \mathcal{a'}) \\
    \frac{\varepsilon}{|\mathcal{A}|} & \text{otherwise}
\end{cases}
$$

2. **Learning Rate Decay**: The learning rate $\alpha_t$ must satisfy the Robbins-Monro conditions:
$$
\sum_{t=0}^{\infty} \alpha_t = \infty \quad \text{and} \quad \sum_{t=0}^{\infty} \alpha_t^2 < \infty
$$
   A common choice is $\alpha_t = \frac{1}{1 + \text{visits}(\mathcal{s}, \mathcal{a})}$.

3. **Bounded Rewards**: Rewards must be bounded, i.e., $|\mathcal{r}| \leq R_{max}$ for some constant $R_{max}$.

**System Example**: In our task assignment workflow:
- *Exploration*: With $\varepsilon = 0.1$, even after learning that "Pop/execute next task" is often optimal, the agent still occasionally tries "Insert verification task" or "Redo failed task" to discover if circumstances have changed
- *Learning rate*: As the supervisor repeatedly assigns tasks to fix authentication bypass vulnerabilities, it updates weights less aggressively over time, stabilizing around learned patterns
- *Bounded rewards*: Our reward shaping $\mathcal{r} = r_{done} + r_{verify} + r_{budget} + r_{feedback} - r_{delay}$ is bounded by design, with each component constrained to a known range

### Approximate Q-Learning: Feature-Based Convergence

Our system uses approximate Q-learning with a linear feature representation:

$$
\mathcal{Q}(\mathcal{s}, \mathcal{a}; \mathbf{w}) = \sum_{i=1}^{7} \mathcal{w}_i \cdot f_i(\mathcal{s}, \mathcal{a})
$$

Unlike tabular Q-learning, approximate methods do not guarantee convergence to $\mathcal{Q}^*$. However, under the following conditions, they converge to a **close-to-optimal** policy:

1. **Linear Function Approximation**: With linear features, the weight update rule:
$$
\mathcal{w}_i \leftarrow \mathcal{w}_i + \alpha \cdot \text{difference} \cdot f_i(\mathcal{s}, \mathcal{a})
$$
   performs stochastic gradient descent on the mean squared Bellman error.

2. **Feature Richness**: If the feature set can express the true Q-function well (low approximation error), the learned policy approaches optimality. Our seven features capture key decision factors:
   - $f_1$ (complexity): distinguishes simple vs. complex objectives
   - $f_2$ (fulfillment): tracks progress toward goal completion
   - $f_3$ (queue length): encodes workload and potential bottlenecks
   - $f_4$ (feedback): integrates sub-agent signals
   - $f_5$ (completion): monitors per-task success
   - $f_6, f_7$ (budget): encode resource constraints

3. **Gradient Temporal Difference (GTD) Stability**: Standard TD with function approximation can diverge (the "deadly triad"). Using GTD2 or TDC algorithms provides provable convergence guarantees:
$$
\mathbf{w}_{t+1} = \mathbf{w}_t + \alpha \left(\delta_t - \gamma \mathbf{w}_t^\top \mathbf{f}_{t+1} \cdot \mathbf{h}_t^\top \mathbf{f}_t \right) \mathbf{f}_t
$$
   where $\mathbf{h}$ is an auxiliary weight vector.

**Approximation Error Bound**: Let $\mathcal{Q}^*$ be the true optimal Q-function and $\Pi$ be the projection onto the linear feature space. The learned $\mathcal{Q}(\cdot; \mathbf{w})$ satisfies:

$$
\|\mathcal{Q}(\cdot; \mathbf{w}) - \mathcal{Q}^*\|_\mu \leq \frac{1}{\sqrt{1 - \gamma^2}} \|\Pi \mathcal{Q}^* - \mathcal{Q}^*\|_\mu
$$

where $\mu$ is the stationary distribution. This bound shows that if our features can represent $\mathcal{Q}^*$ well (small projection error), the learned Q-function will be close to optimal.

**System Example**: For the SQL injection fix objective:
- If features adequately capture "a task requiring 3 sub-agents with verification is better than 1 sub-agent without verification for complex vulnerabilities," the learned weights will reflect this
- The approximation error depends on whether our 7 features can distinguish between qualitatively different states
- Adding feature $f_1$ (complexity) allows the agent to learn different strategies for simple bugs (quick fix) vs. complex vulnerabilities (thorough decomposition with verification)

### Convergence Time Estimates

The convergence rate depends on several factors. We provide estimates for our agentic tree system:

#### Sample Complexity (PAC Bounds)

For tabular Q-learning to achieve an $\varepsilon$-optimal policy with probability at least $1 - \delta$, the required number of samples is:

$$
N = \tilde{O}\left(\frac{|\mathcal{S}||\mathcal{A}|}{\varepsilon^2(1-\gamma)^5} \log\frac{1}{\delta}\right)
$$

For approximate Q-learning with $d$ features (we have $d = 7$):

$$
N = \tilde{O}\left(\frac{d}{\varepsilon^2(1-\gamma)^4}\right)
$$

#### Concrete Estimates for Task Assignment

Consider our system parameters:
- Discount factor: $\gamma = 0.9$
- Action space: $|\mathcal{A}| = 6$ (pop, verify, redo, assign new, report, terminate)
- Features: $d = 7$
- Desired accuracy: $\varepsilon = 0.1$ (90% optimal)

**Per-Agent Convergence**:
$$
N_{agent} \approx \frac{7}{0.1^2 \times (1-0.9)^4} = \frac{7}{0.01 \times 0.0001} = 7,000,000 \text{ samples}
$$

However, in practice, with good feature engineering and domain knowledge initialization (see [Weight Initialization](#workflow-explanation)), convergence is much faster:

- **Warm-start with domain knowledge**: Initializing $\mathcal{w}_2 = 5.0$ (fulfillment) and $\mathcal{w}_4 = 2.0$ (feedback) based on prior understanding reduces required samples by 10-100×
- **Experience replay**: Reusing past transitions accelerates learning
- **Practical estimate**: 500-2,000 task assignment episodes per agent type

**System-Wide Convergence**: For an agentic tree with depth $D$ and branching factor $B$:

$$
N_{total} \approx N_{agent} \times \sum_{i=0}^{D} B^i = N_{agent} \times \frac{B^{D+1} - 1}{B - 1}
$$

**System Example**: For the SQL injection fix with:
- Tree depth $D = 3$ (root → security specialist → code analyzer → file patcher)
- Average branching factor $B = 3$

$$
N_{total} \approx 1,500 \times \frac{3^4 - 1}{3 - 1} = 1,500 \times 40 = 60,000 \text{ episodes}
$$

This represents the total task assignment decisions across all agents before the system achieves near-optimal behavior for similar vulnerability classes.

#### Wall-Clock Time Considerations

If each task assignment episode takes on average 30 seconds (including sub-agent execution):

$$
T_{convergence} \approx \frac{60,000 \times 30}{3600} \approx 500 \text{ hours}
$$

**Acceleration Strategies**:
1. **Transfer learning**: Weights learned for "SQL injection fix" transfer to "XSS vulnerability fix" with minimal fine-tuning (~10× speedup)
2. **Parallel simulation**: Running multiple independent trees simultaneously
3. **Offline RL**: Learning from logged historical agent interactions

### Why Close-to-Optimal is Sufficient

In the agentic tree setting, exact optimality is neither achievable nor necessary:

1. **Non-Stationary Environment**: Real-world codebases change, making the true $\mathcal{Q}^*$ a moving target. A close-to-optimal policy that adapts is more valuable than a historically optimal but static policy.

2. **Catastrophic Breakdown Prevention**: Our primary goal is preventing the catastrophic breakdown observed in the [budgeted tree experiment](/docs/projects/arise-sec-lion/system/design_choice/budgeted_tree.md). A policy that is 90% optimal but avoids complete failure modes (improper task breakdown, redundant sub-tasks) is highly effective.

3. **Graceful Degradation**: With learned weights:
   - High $\mathcal{w}_4$ (feedback weight) ensures negative sub-agent signals trigger corrective actions
   - High $\mathcal{w}_2$ (fulfillment weight) prioritizes completing the objective over perfect efficiency
   - Balanced $\mathcal{w}_6, \mathcal{w}_7$ (budget weights) prevent resource exhaustion

**System Example**: After convergence, when a supervisor agent receives the objective "Fix SQL injection in user authentication":
1. Feature $f_1$ activates (complex task) → agent decomposes into sub-tasks
2. Sub-agent reports negative feedback ($f_4 = -1$: "ambiguous scope") → high $\mathcal{w}_4$ triggers "Redo" action
3. Refined sub-task succeeds ($f_5 = 1$) → agent proceeds to next task
4. All sub-tasks complete ($f_2 = 1$) → agent selects "Terminate" with high confidence

The policy may not be theoretically optimal (perhaps verification could have been skipped for one sub-task), but it reliably achieves the objective while avoiding catastrophic failures.