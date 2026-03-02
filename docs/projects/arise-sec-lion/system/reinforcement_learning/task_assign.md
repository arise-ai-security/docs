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

- **Key Changes Compared to [brain-storming note](/docs/weekly(old)/brainstorming/agentic-tree)**:
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

## Q-Learning Justification (What Theory Actually Supports)

This section checks the theoretical justification for using (approximate) Q-learning in our task-assignment setting, and clarifies what is and is not guaranteed.

### 1) Tabular Q-learning: strong guarantees, strict assumptions

In a **finite MDP** with a **tabular** representation (finite $|\mathcal{S}|$ and $|\mathcal{A}|$), Q-learning is a standard choice because it is **model-free** (does not require knowing $\mathcal{T}$ or $\mathcal{R}$).

- The Bellman optimality operator is a contraction in $\|\cdot\|_\infty$ when applied to the *true* (unapproximated) value function space:
$$
\|\mathcal{T}Q_1 - \mathcal{T}Q_2\|_\infty \le \gamma\,\|Q_1 - Q_2\|_\infty
$$
- Under standard stochastic-approximation conditions (sufficient exploration and a Robbins–Monro learning-rate schedule), **tabular Q-learning converges** to $Q^*$.

Important caveat for our system: these assumptions (finite tabular states, stationarity, repeated visits to the same $(s,a)$) generally **do not hold** for large, text-rich agent states.

### 2) Approximate Q-learning (linear features): useful, but no general convergence guarantee

In our workflow we use **function approximation**:
$$
\mathcal{Q}(\mathcal{s},\mathcal{a}) = \sum_i \mathcal{w}_i f_i(\mathcal{s},\mathcal{a})
$$

This is a practical choice because it generalizes across similar states, but it changes the theory:

- With function approximation + bootstrapping + off-policy updates (the "deadly triad"), **standard Q-learning can diverge**.
- The update we use is best thought of as a **semi-gradient** method that is *aiming* to make predictions more consistent with observed returns; it should not be presented as a guaranteed contraction/convergence result in our setting.

So the correct justification is:
- Q-learning provides a **principled objective** (prefer actions with higher long-term value) and a **standard learning signal** (the difference term).
- In complex, partially observed, non-stationary environments, we treat convergence as an **empirical property** to be validated, not a theorem we can claim.

### 3) What we rely on in practice (stability and evaluation)

To make approximate Q-learning behave well in an agentic tree:

1. **Bound rewards**: keep each reward component in a known range to prevent exploding updates.
2. **Normalize features**: ensure $f_i$ scales are comparable (especially $f_3$ queue length and budget-related features).
3. **Conservative learning rates**: prefer small $\alpha$ (or slowly decayed schedules) since state distributions shift during runs.
4. **Constrain the action set**: keep $|\mathcal{A}(\mathcal{s})|$ small and well-defined (assign/verify/redo/terminate), which reduces variance.
5. **Guardrails over "optimality"**: even if $\mathcal{Q}$ is imperfect, enforce safe defaults (e.g., verification when uncertain, avoid premature termination).
6. **Validate empirically**: track metrics like redo rate, verification pass rate, duplicate-task rate, and budget waste; treat these as the real convergence indicators.

Bottom line: Q-learning is justified here as a **model-free decision-learning framework** with interpretable credit assignment via features, but claims of *theoretical convergence time*, *PAC sample complexity numbers*, or *close-to-optimality guarantees* are not supportable for this environment and are intentionally omitted.

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

### Practical Expectations: 20-50 Iterations per Agent

While theoretical convergence requires thousands of episodes, real-world deployments often operate with far fewer iterations. This section provides realistic expectations for what an agent can learn and achieve within 20-50 task assignment iterations.

#### Learning Trajectory at Low Sample Sizes

With only 20-50 iterations, the agent is in the **early learning phase**. The weight updates follow a characteristic pattern:

**Iterations 1-10: Signal Detection**
- Weights fluctuate significantly as the agent encounters diverse outcomes
- No stable policy emerges; behavior appears random
- Expected Q-value error: $\|\mathcal{Q} - \mathcal{Q}^*\| \approx 50-70\%$ of initial error

**Iterations 11-25: Coarse Pattern Recognition**
- Weights for high-signal features ($\mathcal{w}_2$ for fulfillment, $\mathcal{w}_4$ for feedback) begin stabilizing
- Agent starts avoiding obviously bad actions (e.g., terminating without checking completion)
- Expected Q-value error reduction: $20-30\%$

**Iterations 26-50: Partial Policy Formation**
- A rough but functional policy emerges for common scenarios
- Agent reliably identifies "good enough" actions in familiar states
- Rare edge cases remain poorly handled
- Expected Q-value error reduction: $30-50\%$ of initial error

#### Which Features Converge First

Not all weights converge at the same rate. With limited iterations:

| Feature | Convergence Speed | Reason |
|---------|-------------------|--------|
| $\mathcal{w}_2$ (Fulfillment) | Fast (~15-20 iter) | Binary signal, clear correlation with terminal reward |
| $\mathcal{w}_4$ (Feedback) | Fast (~20-25 iter) | Immediate, high-variance signal from sub-agents |
| $\mathcal{w}_5$ (Completion) | Moderate (~25-35 iter) | Per-task signal, requires multiple task cycles |
| $\mathcal{w}_1$ (Complexity) | Slow (~40-60 iter) | Requires diverse objectives to distinguish simple vs. complex |
| $\mathcal{w}_3$ (Queue Length) | Slow (~50-80 iter) | Indirect effect on reward, needs many episodes |
| $\mathcal{w}_6, \mathcal{w}_7$ (Budget) | Very Slow (~80-150 iter) | Long-horizon effect, credit assignment is difficult |

**Implication**: At 50 iterations, expect $\mathcal{w}_2$ and $\mathcal{w}_4$ to be reasonably calibrated, while $\mathcal{w}_3, \mathcal{w}_6, \mathcal{w}_7$ remain noisy.

#### Expected Policy Quality at 20-50 Iterations

The agent's decision quality varies by action type:

**Well-Learned Actions** (50+ iterations):
- $\mathcal{a}_3$ (Report to sub-agent: Completed, request results) — Strong correlation with $f_5$
- $\mathcal{a}_6$ (Report to supervisor) — Triggered reliably by negative $f_4$ feedback

**Partially Learned Actions** (30-50 iterations):
- $\mathcal{a}_1$ (Assign task to sub-agent) — Basic decomposition works, but granularity may be suboptimal
- $\mathcal{a}_4$ (Report to sub-agent: Revise) — Sometimes triggered appropriately, sometimes missed

**Poorly Learned Actions** (requires 80+ iterations):
- $\mathcal{a}_2$ (Assign task to self) — Requires learning when delegation is inefficient
- $\mathcal{a}_5$ (Terminate) — Premature or delayed termination common

#### Practical System Behavior: SQL Injection Fix Example

Consider a supervisor agent assigned to fix an SQL injection vulnerability with 30 iterations of prior experience:

**What Works Well**:
1. Agent decomposes the objective into sub-tasks (learned $\mathcal{w}_1$ recognizes complexity)
2. When sub-agent reports "task completed," supervisor correctly requests results ($\mathcal{w}_5$ calibrated)
3. Negative feedback ("unclear scope") triggers revision request ($\mathcal{w}_4$ calibrated)

**What Remains Suboptimal**:
1. **Task granularity**: Agent might create 5 sub-tasks when 3 would suffice, or 2 when 4 is needed
   - Reason: $\mathcal{w}_3$ (queue length) not yet calibrated
2. **Budget efficiency**: Agent may over-allocate or under-allocate budget to sub-agents
   - Reason: $\mathcal{w}_6, \mathcal{w}_7$ require more episodes
3. **Termination timing**: Agent might verify unnecessarily or skip needed verification
   - Reason: $\mathcal{w}_2$ (fulfillment) needs more diverse completion scenarios

**Quantitative Expectations at 30 Iterations**:
- Probability of correct action in familiar states: ~65-75%
- Probability of catastrophic mistake (e.g., premature termination): ~10-15%
- Average reward per episode: ~60% of optimal

#### Strategies for Low-Iteration Deployments

When operating with 20-50 iterations, these strategies maximize effectiveness:

1. **Aggressive Warm-Starting**: Initialize weights based on domain knowledge rather than zeros
$$
\mathbf{w}_{init} = [1.0, 5.0, -0.5, 2.0, 1.5, 0.5, 0.3]
$$
   This embeds priors like "fulfillment matters most" ($\mathcal{w}_2 = 5.0$) and "long queues are slightly bad" ($\mathcal{w}_3 = -0.5$).

2. **Higher Exploration Rate**: Use $\varepsilon = 0.3$ instead of $\varepsilon = 0.1$ to gather more diverse experience in limited iterations.

3. **Focus on High-Signal Features**: Design reward shaping to amplify $f_2$ and $f_4$ signals:
$$
\mathcal{r}_{shaped} = 3 \cdot r_{done} + 2 \cdot r_{feedback} + r_{budget}
$$

4. **Conservative Defaults**: When Q-values are close (within 10%), default to safer actions:
   - Prefer verification over skipping
   - Prefer smaller sub-tasks over larger ones
   - Prefer reporting uncertainty to supervisor over guessing

5. **Experience Replay Priority**: Prioritize replaying transitions with high TD-error:
$$
P(i) \propto |\delta_i|^\alpha \quad \text{where } \alpha \in [0.5, 1.0]
$$

#### Realistic Outcome Summary

| Iterations | Policy Quality | Failure Rate | Suitable For |
|------------|----------------|--------------|--------------|
| 10-20 | Random with hints | 25-35% | Testing/debugging only |
| 20-35 | Coarse heuristics | 15-25% | Simple, well-defined tasks |
| 35-50 | Functional but imperfect | 10-15% | Moderate complexity tasks |
| 50-100 | Good for common cases | 5-10% | Most production scenarios |
| 100-500 | Near-optimal for known patterns | 2-5% | Complex, varied workloads |

**Bottom Line**: With 20-50 iterations, expect the agent to:
- Handle straightforward task assignment competently (~70% optimal)
- Occasionally make suboptimal but recoverable decisions
- Rarely cause catastrophic failures if warm-started properly
- Improve noticeably with each additional 10-20 iterations

The agent will not achieve theoretical convergence, but it will be **substantially better than random assignment** and will **avoid the most damaging failure modes** (complete task mismatch, resource exhaustion, infinite loops) that motivated the Q-learning approach.
