import { useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// Helper component to render LaTeX
function Latex({ children, display = false }) {
  const html = katex.renderToString(children, {
    throwOnError: false,
    displayMode: display,
  });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

// Color scheme for different workflow stages
const STAGE_COLORS = {
  state: { bg: '#e6f3ff', border: '#7aa6d9', text: '#1e40af' },
  action: { bg: '#fff0e6', border: '#d99a6a', text: '#9a3412' },
  qvalue: { bg: '#e6ffe6', border: '#6ad96a', text: '#166534' },
  selection: { bg: '#ffe6f0', border: '#d96a9a', text: '#9f1239' },
  execution: { bg: '#f0e6ff', border: '#9a6ad9', text: '#6b21a8' },
  transition: { bg: '#fff7e6', border: '#e0a14a', text: '#92400e' },
  update: { bg: '#e6ffff', border: '#6ad9d9', text: '#0e7490' },
  next: { bg: '#f5f5f5', border: '#888888', text: '#374151' },
  highlight: { bg: '#90EE90', border: '#22c55e', text: '#166534' },
  end: { bg: '#ffcccc', border: '#ef4444', text: '#991b1b' },
};

// Detail content for each node (using LaTeX notation) - Rich content from intro.md
const NODE_DETAILS = {
  state: {
    title: '1. State Observation',
    formula: '\\mathcal{S}_t = (\\text{objective}, \\text{budget}, \\text{task queue}, \\text{file system snapshot}, \\text{sub-agents\' states})',
    description: 'The agent observes its current state, which represents how it perceives and understands its environment. We apply Markov Decision Process (MDP), meaning the agent takes actions exclusively based on the current state without considering prior states.',
    sections: [
      {
        heading: 'State Definition',
        content: 'State is formally defined as how one agent perceives its environment. In our partially observable system, each agent only has access to a subset of files and is not always aware of sub-agents\' states until they report back.',
      },
      {
        heading: 'State Components',
        items: [
          ['\\text{Objective}', 'The task or goal assigned; includes ancestor agents\' thoughts as context'],
          ['\\text{Budget}', 'Available resources for task execution and sub-agent spawning'],
          ['\\text{Task Queue}', 'Pending sub-tasks to be processed or delegated'],
          ['\\text{File System}', 'Snapshot of accessible files with read/write permissions'],
          ['\\text{Sub-Agents\' States}', 'Only direct children\'s states (not entire sub-tree, to encourage decentralization)'],
        ],
      },
      {
        heading: 'Key Equations',
        equations: [
          ['\\text{MDP Property:}', '\\mathcal{S}_t \\perp \\!\\!\\! \\perp \\mathcal{S}_{t-1}, \\mathcal{S}_{t-2}, \\ldots'],
          ['\\text{State Transition:}', '\\mathcal{T}(\\mathcal{s}, \\mathcal{a}, \\mathcal{s}\') = P(\\mathcal{s}\' | \\mathcal{s}, \\mathcal{a})'],
        ],
      },
      {
        heading: 'Example in Our System',
        content: 'A supervisor agent is tasked with "Fix SQL injection vulnerability in user login". Its state observation includes:',
        items: [
          ['\\text{Objective}', '"Fix SQL injection in auth/login.py" (from root agent\'s breakdown)'],
          ['\\text{Budget}', '50 remaining after root allocated 100'],
          ['\\text{Task Queue}', '[analyze_code, patch_vulnerability, write_tests] — 3 sub-tasks, 3 sub-agents'],
          ['\\text{File System}', 'Read access to auth/*.py, write access to auth/login.py only'],
          ['\\text{Sub-Agents}', 'Agent-A: completed, Agent-B: in progress, Agent-C: pending'],
        ],
      },
    ],
  },
  actionSpace: {
    title: '2. Action Space',
    formula: '\\mathcal{A} = \\{\\mathcal{a}_1, \\mathcal{a}_2, \\mathcal{a}_3, \\mathcal{a}_4, \\mathcal{a}_5, \\mathcal{a}_6\\}',
    description: 'The set of all possible actions the agent can take. While actions may have undeterministic effects on the coding environment, the action space itself is discrete and finite. Actions are categorized into "thinking" (task breakdown) and "working" (execution).',
    sections: [
      {
        heading: 'Action Types',
        items: [
          ['\\mathcal{a}_1', 'Decompose objective into manageable sub-tasks'],
          ['\\mathcal{a}_2', 'Assign sub-task: spawn sub-agent, allocate budget, configure model'],
          ['\\mathcal{a}_3', 'Verify completed task against objective criteria'],
          ['\\mathcal{a}_4', 'Redo failed task or respawn with better configuration'],
          ['\\mathcal{a}_5', 'Terminate and report: end lifecycle, return budget to supervisor'],
          ['\\mathcal{a}_6', 'Report to supervisor: request clarification, task change, more budget, or handle error'],
        ],
      },
      {
        heading: 'Agent Roles',
        items: [
          ['\\text{Thinker}', 'Uses reasoning to create task breakdowns (offline planning)'],
          ['\\text{Worker}', 'Executes specific tasks in coding environment (online planning)'],
        ],
      },
      {
        heading: 'Key Insight',
        content: 'Supervisor agents decide sub-agent configurations (model name, temperature, max tokens) as part of the action. If a branch is failing, the supervisor can respawn with a more capable model.',
      },
      {
        heading: 'Example in Our System',
        content: 'For the "Fix SQL injection" task, the supervisor considers these actions:',
        items: [
          ['\\mathcal{a}_1', 'Decompose into: (1) identify injection points, (2) implement parameterized queries, (3) add input validation'],
          ['\\mathcal{a}_2', 'Spawn all 3 sub-agents with configured models and allocated budgets for each sub-task'],
          ['\\mathcal{a}_3', 'After Agent-A reports "patched login.py", verify by spawning verification agent'],
          ['\\mathcal{a}_4', 'Agent-B failed; kill and respawn with Claude model and higher budget'],
          ['\\mathcal{a}_5', 'All sub-tasks done; terminate and report "vulnerability fixed" to root'],
          ['\\mathcal{a}_6', 'Report to root: "Unclear if auth/register.py also vulnerable — request clarification or more budget"'],
        ],
      },
    ],
  },
  qvalue: {
    title: '3. Q-Value Computation (Approximate Q-Learning)',
    formula: '\\mathcal{Q}(\\mathcal{s}, \\mathcal{a}) = \\sum_{i} \\mathcal{w}_i \\cdot f_i(\\mathcal{s}, \\mathcal{a})',
    description: 'Since maintaining a Q-table for all state-action pairs is impractical (states include complex textual objectives), we use feature-based approximation. Q-values are computed as a linear combination of feature functions weighted by learned parameters.',
    sections: [
      {
        heading: 'Why Approximate Q-Learning?',
        content: 'Traditional Q-learning uses a Q-table, but our state space is too large (textual objectives, dynamic file systems). Feature-based representations allow us to generalize across similar states.',
      },
      {
        heading: 'Feature Functions',
        items: [
          ['f_1: \\text{Objective Complexity}', '1 if complex, 0 if simple'],
          ['f_2: \\text{Objective Fulfillment}', '1 if fulfilled, 0 otherwise'],
          ['f_3: \\text{Task Queue Length}', 'Number of pending tasks'],
          ['f_4: \\text{Sub-Agent Feedback}', '+1 positive, 0 neutral, -1 negative'],
          ['f_5: \\text{Task Completion}', '1 if sub-task completed'],
          ['f_6: \\text{Budget Gain/Loss}', 'given - remaining budget'],
          ['f_7: \\text{Current Budget}', 'Available budget held by agent'],
        ],
      },
      {
        heading: 'Key Equations',
        equations: [
          ['\\text{Feature Function:}', 'f_i: (\\mathcal{S}, \\mathcal{A}) \\rightarrow \\mathbb{R}'],
          ['\\text{Q-Value:}', '\\mathcal{Q}(\\mathcal{s}, \\mathcal{a}) = \\sum_{i} \\mathcal{w}_i \\cdot f_i(\\mathcal{s}, \\mathcal{a})'],
          ['\\text{Value Function:}', '\\mathcal{V}^{\\pi}(\\mathcal{s}) = \\max_{\\mathcal{a}} \\mathcal{Q}(\\mathcal{s}, \\mathcal{a})'],
        ],
      },
      {
        heading: 'Example in Our System',
        content: 'Computing Q-value for action "Verify completed patch" in current state:',
        items: [
          ['f_1 = 1', 'Objective is complex (security vulnerability)'],
          ['f_2 = 0', 'Objective not yet fulfilled (patch unverified)'],
          ['f_3 = 2', 'Two sub-agents still working (2 tasks pending)'],
          ['f_4 = +1', 'Agent-A reported positive: "patch applied successfully"'],
          ['f_5 = 1', 'The "patch vulnerability" sub-task is completed'],
          ['f_6 = 10', 'Agent-A used 5 of allocated 15 budget (gain = 10)'],
          ['f_7 = 35', 'Current budget remaining'],
        ],
      },
      {
        heading: 'Example Q-Value Calculation',
        content: 'With learned weights w = [0.3, 0.8, -0.1, 0.5, 0.4, -0.2, 0.1]:',
        equations: [
          ['\\mathcal{Q}(\\mathcal{s}, \\text{verify}) =', '0.3(1) + 0.8(0) + (-0.1)(2) + 0.5(1) + 0.4(1) + (-0.2)(10) + 0.1(35)='],
          ['', '0.3 + 0 - 0.2 + 0.5 + 0.4 - 2.0 + 3.5 = 2.5'],
        ],
      },
    ],
  },
  policy: {
    title: '4. Action Selection (Stochastic ε-Greedy Policy)',
    formula: '\\pi(\\mathcal{a}|\\mathcal{s}) = P[\\mathcal{A} = \\mathcal{a} | \\mathcal{S} = \\mathcal{s}]',
    description: 'We adopt a stochastic policy where action selection is probabilistic. This incorporates verification heuristics — randomly spawning verification sub-agents to double-check work, preventing hallucination propagation from sub-agents.',
    sections: [
      {
        heading: 'ε-Greedy Strategy',
        items: [
          ['\\text{Exploration } (\\varepsilon)', 'With prob ε: select random action to discover new strategies'],
          ['\\text{Exploitation } (1-\\varepsilon)', 'With prob 1-ε: select action with highest Q-value'],
        ],
      },
      {
        heading: 'Key Equations',
        equations: [
          ['\\text{Stochastic Policy:}', '\\pi(\\mathcal{a}|\\mathcal{s}) = P[\\mathcal{A}|\\mathcal{s}]'],
          ['\\text{Optimal Action:}', '\\mathcal{a}^* = \\arg\\max_{\\mathcal{a}} \\mathcal{Q}(\\mathcal{s}, \\mathcal{a})'],
          ['\\text{ε-Greedy:}', '\\mathcal{a} = \\begin{cases} \\text{random} & \\text{w.p. } \\varepsilon \\\\ \\mathcal{a}^* & \\text{w.p. } 1-\\varepsilon \\end{cases}'],
        ],
      },
      {
        heading: 'Why Stochastic?',
        content: 'LLMs learn from textual reports which can be biased by hallucinations. Random verification prevents single points of failure. One hallucination in a sub-agent can cause catastrophic breakdown of the entire objective.',
      },
      {
        heading: 'Example in Our System',
        content: 'After computing Q-values for all actions in "Fix SQL injection" task:',
        items: [
          ['Q(\\mathcal{s}, \\text{verify}) = 2.5', 'Highest Q-value — exploitation would choose this'],
          ['Q(\\mathcal{s}, \\text{assign}) = 1.8', 'Second best option'],
          ['Q(\\mathcal{s}, \\text{terminate}) = 0.3', 'Low value — premature termination'],
        ],
      },
      {
        heading: 'Example Selection (ε = 0.1)',
        content: 'With ε = 0.1, the agent has 90% chance to pick "verify" (best Q-value) and 10% chance to explore randomly. Random exploration might select "assign" to spawn an extra verification agent — this catches potential hallucinations like Worker-A falsely reporting "patch successful" when the code still has vulnerabilities.',
      },
    ],
  },
  execution: {
    title: '5. Execute Action',
    formula: '\\mathcal{s} \\xrightarrow{\\mathcal{a}^*} \\mathcal{s}\'',
    description: 'The chosen action is executed, producing observable effects on the environment. Thinkers perform offline planning (task breakdowns) while Workers perform online planning (code execution). Effects are undeterministic but actions are discrete.',
    sections: [
      {
        heading: 'Execution by Agent Type',
        items: [
          ['\\text{Thinker}', 'Design sub-tasks, allocate budgets, configure models, spawn nodes'],
          ['\\text{Worker}', 'Execute code, modify files, run tests, interact with environment'],
        ],
      },
      {
        heading: 'Action Effects',
        items: [
          ['\\text{Decompose}', 'Creates entries in task queue based on objective analysis'],
          ['\\text{Assign}', 'Spawns sub-agent with budget allocation and access control'],
          ['\\text{Verify}', 'Compares sub-agent report against original objective'],
          ['\\text{Redo}', 'Re-inserts modified task or respawns with better config'],
          ['\\text{Terminate}', 'Reports state to supervisor, returns remaining budget'],
          ['\\text{Request}', 'Signals resource need to supervisor for reallocation'],
        ],
      },
      {
        heading: 'Key Insight',
        content: 'Even though actions may have undeterministic effects, they are categorized into discrete types: working (direct execution) or thinking (delegation). Supervisors learn from actual execution results.',
      },
      {
        heading: 'Example: Executing "Verify" Action',
        content: 'The supervisor chose a* = verify for Agent-A\'s completed patch. Execution involves:',
        items: [
          ['\\text{Step 1}', 'Spawn Verifier-Agent with budget=10, model=GPT-4, temp=0.1'],
          ['\\text{Step 2}', 'Grant read access to auth/login.py (patched file)'],
          ['\\text{Step 3}', 'Objective: "Run SQL injection tests on login.py, report PASS/FAIL"'],
          ['\\text{Step 4}', 'Verifier executes: runs sqlmap, checks parameterized queries'],
          ['\\text{Step 5}', 'Verifier reports: "PASS - No injection vulnerabilities found"'],
        ],
      },
      {
        heading: 'Example: Worker Execution',
        content: 'When Agent-A executed "patch vulnerability", it: (1) read login.py, (2) identified raw SQL string concatenation, (3) replaced with parameterized query using cursor.execute(sql, params), (4) wrote changes to auth/login.py, (5) reported completion.',
      },
    ],
  },
  transition: {
    title: '6. State Transition & Reward',
    formula: '(\\mathcal{s}, \\mathcal{a}^*, \\mathcal{r}, \\mathcal{s}\')',
    description: 'After action execution, the environment transitions to a new state and the agent receives a reward signal. The transition function T and reward function R are unknown, which is why we use model-free Q-learning.',
    sections: [
      {
        heading: 'Transition Tuple',
        items: [
          ['\\mathcal{s}', 'Current state before action'],
          ['\\mathcal{a}^*', 'Selected action that was executed'],
          ['\\mathcal{r}', 'Immediate reward received'],
          ['\\mathcal{s}\'', 'New state after transition'],
        ],
      },
      {
        heading: 'Reward Signals',
        items: [
          ['+\\mathcal{r}_{\\text{progress}}', 'Positive: sub-task completed, objective progress'],
          ['-\\mathcal{r}_{\\text{failure}}', 'Negative: sub-task failed, resources wasted'],
          ['+\\mathcal{r}_{\\text{budget}}', 'Recovered budget from terminated sub-agents'],
          ['\\mathcal{r}_{\\text{verify}}', 'Verification outcome (success/failure detection)'],
        ],
      },
      {
        heading: 'Key Equations',
        equations: [
          ['\\text{Transition:}', '\\mathcal{T}(\\mathcal{s}, \\mathcal{a}, \\mathcal{s}\') = P(\\mathcal{s}\' | \\mathcal{s}, \\mathcal{a})'],
          ['\\text{Reward:}', '\\mathcal{R}(\\mathcal{s}, \\mathcal{a}, \\mathcal{s}\')'],
          ['\\text{Discounted Return:}', 'G_t = \\sum_{k=0}^{\\infty} \\gamma^k \\mathcal{r}_{t+k+1}'],
        ],
      },
      {
        heading: 'Reward Hypothesis',
        content: 'All goals can be described as maximizing expected cumulative reward. Rewards propagate back to ancestor agents. If tree grows too deep, budget per agent becomes small, weakening the reward signal.',
      },
      {
        heading: 'Example Transition',
        content: 'After executing "verify" action, the transition tuple is recorded:',
        items: [
          ['\\mathcal{s}', 'Task queue: 3 agents (Agent-A: done, B: working, C: pending), budget: 35'],
          ['\\mathcal{a}^*', 'verify (spawned Verifier-Agent for Agent-A\'s work)'],
          ['\\mathcal{r} = +1.5', 'Verifier confirmed patch is correct (+1) + budget recovered (+0.5)'],
          ['\\mathcal{s}\'', 'Verification complete, budget: 32, Agent-A: verified'],
        ],
      },
      {
        heading: 'Example Negative Reward',
        content: 'If Verifier had found that Agent-A\'s patch was incomplete (SQL injection still possible in another function), the reward would be r = -1.0 (verification failed). This negative signal propagates to discourage trusting unverified patches from similar states.',
      },
    ],
  },
  weightUpdate: {
    title: '7. Weight Update (Temporal Difference Learning)',
    formula: '\\mathcal{w}_i \\leftarrow \\mathcal{w}_i + \\alpha \\cdot \\text{diff} \\cdot f_i(\\mathcal{s}, \\mathcal{a}^*)',
    description: 'Weights are updated based on the TD (Temporal Difference) error — the difference between the expected Q-value and the actual observed reward plus discounted future value. This is the core learning mechanism.',
    sections: [
      {
        heading: 'Weight Initialization',
        content: 'Before any learning occurs, weights must be initialized. The choice of initial weights affects early exploration behavior and convergence speed.',
        items: [
          ['\\mathcal{w}_i = 0', 'Zero initialization: All actions appear equally valuable initially (Q = 0 for all state-action pairs). Encourages pure exploration at start.'],
          ['\\mathcal{w}_i \\sim \\mathcal{N}(0, \\sigma^2)', 'Small random: Breaks symmetry, prevents all actions from having identical Q-values. Typical σ = 0.01 to 0.1.'],
          ['\\mathcal{w}_i = c > 0', 'Optimistic initialization: Setting weights positive makes all states look promising, encouraging exploration of unvisited states.'],
        ],
      },
      {
        heading: 'Initial Weights in Our System',
        content: 'For the 7 feature functions, we initialize weights based on domain knowledge about task assignment:',
        items: [
          ['w_1 = 0.3', 'Objective Complexity: Slightly positive — complex tasks need more careful planning'],
          ['w_2 = 0.8', 'Objective Fulfillment: High positive — fulfilled objectives are highly desirable'],
          ['w_3 = -0.1', 'Task Queue Length: Slightly negative — longer queues mean more work remaining'],
          ['w_4 = 0.5', 'Sub-Agent Feedback: Positive — positive feedback indicates progress'],
          ['w_5 = 0.4', 'Task Completion: Positive — completed tasks contribute to objective'],
          ['w_6 = -0.2', 'Budget Gain/Loss: Negative — high budget consumption is costly'],
          ['w_7 = 0.1', 'Current Budget: Slightly positive — more budget enables more actions'],
        ],
      },
      {
        heading: 'Why Initialization Matters',
        content: 'Poor initialization can cause problems: (1) All-zero weights make Q(s,a) = 0 everywhere, so early actions are random until enough updates occur. (2) Large initial weights can cause the agent to be overconfident in untested actions. (3) Domain-informed initialization (as above) gives agents reasonable starting behavior while still allowing learning to refine the policy.',
      },
      {
        heading: 'Update Algorithm',
        equations: [
          ['\\text{1. Sample:}', '\\text{sample} = \\mathcal{r} + \\gamma \\max_{\\mathcal{a}\'} \\mathcal{Q}(\\mathcal{s}\', \\mathcal{a}\')'],
          ['\\text{2. TD Diff:}', '\\text{diff} = \\text{sample} - \\mathcal{Q}(\\mathcal{s}, \\mathcal{a}^*)'],
          ['\\text{3. Q-Update:}', '\\mathcal{Q}(\\mathcal{s}, \\mathcal{a}) \\leftarrow \\mathcal{Q}(\\mathcal{s}, \\mathcal{a}) + \\alpha \\cdot \\text{diff}'],
          ['\\text{4. Weights:}', '\\mathcal{w}_i \\leftarrow \\mathcal{w}_i + \\alpha \\cdot \\text{diff} \\cdot f_i(\\mathcal{s}, \\mathcal{a}^*)'],
        ],
      },
      {
        heading: 'Hyperparameters',
        items: [
          ['\\alpha \\in (0, 1]', 'Learning rate: how much new info overrides old'],
          ['\\gamma \\in [0, 1]', 'Discount factor: importance of future vs immediate rewards'],
        ],
      },
      {
        heading: 'Blame Attribution',
        content: 'If something unexpectedly bad happens (diff < 0), weights of active features decrease. This causes the agent to disprefer ALL states with similar features. Positive outcomes increase weights of active features.',
      },
      {
        heading: 'Example Weight Update',
        content: 'After verifying the patch succeeded (r = +1.5), with α = 0.1, γ = 0.9:',
        items: [
          ['\\text{Expected:}', 'Q(s, verify) = 2.5 (computed earlier)'],
          ['\\text{Best next:}', 'max Q(s\', a\') = 2.0 (for action "assign test-writer")'],
          ['\\text{Sample:}', '1.5 + 0.9 × 2.0 = 3.3'],
          ['\\text{Diff:}', '3.3 - 2.5 = +0.8 (better than expected!)'],
        ],
      },
      {
        heading: 'Example Feature Weight Changes',
        content: 'With diff = +0.8, active features get boosted:',
        items: [
          ['w_4 \\text{ (feedback)}', 'Was 0.5, f₄ = +1 → new: 0.5 + 0.1 × 0.8 × 1 = 0.58'],
          ['w_5 \\text{ (completion)}', 'Was 0.4, f₅ = 1 → new: 0.4 + 0.1 × 0.8 × 1 = 0.48'],
          ['\\text{Effect:}', 'Future states with positive feedback + completed tasks get higher Q-values'],
        ],
      },
      {
        heading: 'Alternative Form',
        equations: [
          ['\\text{EMA:}', '\\mathcal{Q}(\\mathcal{s}, \\mathcal{a}) \\leftarrow (1-\\alpha)\\mathcal{Q}(\\mathcal{s}, \\mathcal{a}) + \\alpha \\cdot \\text{sample}'],
        ],
      },
    ],
  },
  nextCycle: {
    title: '8. Next Decision Cycle',
    formula: '\\mathcal{s} \\leftarrow \\mathcal{s}\'',
    description: 'If not in a terminal state, the agent sets the current state to the new state and continues the Q-learning loop. Terminal states occur when the objective is fulfilled, budget is exhausted, or the agent decides to terminate.',
    sections: [
      {
        heading: 'Loop Condition',
        items: [
          ['\\text{Continue if:}', 'Objective not fulfilled AND budget > 0 AND no termination'],
          ['\\text{Terminate if:}', 'Objective fulfilled OR budget exhausted OR explicit termination'],
        ],
      },
      {
        heading: 'Terminal Conditions',
        items: [
          ['\\text{Success}', 'All sub-tasks completed, objective verified as fulfilled'],
          ['\\text{Failure}', 'Budget exhausted without fulfilling objective'],
          ['\\text{Early Exit}', 'Agent decides current state unlikely to succeed (low value)'],
          ['\\text{Killed}', 'Parent agent terminates this branch due to poor performance'],
        ],
      },
      {
        heading: 'On Termination',
        content: 'The agent reports final state to supervisor, returns remaining budget, and the supervisor updates its own Q-values based on this child\'s outcome. Rewards propagate up the tree.',
      },
      {
        heading: 'Example: Continue Loop',
        content: 'After successful verification, the supervisor updates state and continues:',
        items: [
          ['\\mathcal{s}\' \\text{ becomes } \\mathcal{s}', 'Agent-A verified, Agent-B and C still working, budget: 32'],
          ['\\text{Next iteration}', 'Observe new state → compute Q-values → select action...'],
          ['\\text{Likely next } \\mathcal{a}^*', 'Wait for Agent-B/C or spawn additional verification agents'],
        ],
      },
      {
        heading: 'Example: Terminal Success',
        content: 'After all 3 sub-agents complete: (1) patch applied, (2) verification passed, (3) tests written and passing. The supervisor terminates with report: "SQL injection vulnerability fixed in auth/login.py. Parameterized queries implemented. 5 unit tests added. Budget remaining: 12." Root agent receives +reward and updates its weights.',
      },
      {
        heading: 'Example: Early Termination',
        content: 'If after 3 failed attempts to patch, budget drops to 5 and V(s) < threshold, the agent may choose a₅ (terminate) to return remaining budget to root rather than waste resources on a likely-failing branch.',
      },
      {
        heading: 'Convergence',
        content: 'Q-learning converges to optimal Q* given: (1) adequate exploration, (2) learning rate decay, (3) bounded rewards. This is off-policy learning.',
      },
    ],
  },
  chosen: {
    title: 'Chosen Action: How It Affects Agents',
    formula: '\\mathcal{a}^* = \\arg\\max_{\\mathcal{a}} \\mathcal{Q}(\\mathcal{s}, \\mathcal{a})',
    description: 'The chosen action is the result of policy evaluation. Once selected, this action fundamentally determines the agent\'s behavior and triggers a cascade of effects on the agent itself, its sub-agents, and the overall tree structure.',
    sections: [
      {
        heading: 'Impact on Thinker Agents',
        content: 'Thinkers use reasoning capabilities to perform offline planning. The chosen action affects how they break down objectives and allocate resources.',
        items: [
          ['\\mathcal{a}_1 \\text{ (Decompose)}', 'Creates task queue entries; high-value states lead to more detailed sub-tasks'],
          ['\\mathcal{a}_2 \\text{ (Assign)}', 'Spawns sub-agents with configured models (GPT, Gemini), temperature, budget'],
          ['\\mathcal{a}_3 \\text{ (Verify)}', 'Spawns verification sub-agents to double-check completed work'],
          ['\\mathcal{a}_5 \\text{ (Terminate)}', 'Ends branch if value is low; returns budget to supervisor'],
        ],
      },
      {
        heading: 'Impact on Worker Agents',
        content: 'Workers perform online planning by executing tasks in the coding environment. The chosen action directly affects code generation and file modifications.',
        items: [
          ['\\text{Code Execution}', 'Workers modify files, run tests, interact with the file system'],
          ['\\text{High } \\mathcal{V}(\\mathcal{s})', 'Indicates code structure is efficient; continue current approach'],
          ['\\text{Low } \\mathcal{V}(\\mathcal{s})', 'Code quality not desirable; refactor or seek more context from thinkers'],
          ['\\text{Report}', 'Workers report results back to supervisor for Q-value updates'],
        ],
      },
      {
        heading: 'Cascade Effects on Tree Structure',
        items: [
          ['\\text{Budget Flow}', 'Actions consume or redistribute budget across the tree'],
          ['\\text{Spawning}', 'Assign actions create new branches; tree grows exponentially'],
          ['\\text{Pruning}', 'Terminate/Kill actions remove branches; focus resources on promising paths'],
          ['\\text{Reward Propagation}', 'Outcomes affect ancestor agents\' Q-values through the tree'],
        ],
      },
      {
        heading: 'Example: Choosing "Verify" vs "Assign"',
        content: 'In the SQL injection fix scenario, choosing a* = verify instead of a* = assign has cascading effects:',
        items: [
          ['\\text{If Verify chosen}', 'Spawns 1 verifier agent, consumes 10 budget, catches potential hallucinations'],
          ['\\text{If Assign chosen}', 'Spawns 1 worker for next task, consumes 15 budget, moves forward faster'],
          ['\\text{Trade-off}', 'Verify is safer but slower; Assign is faster but riskier'],
          ['\\text{Q-values guide}', 'High w₄ (feedback weight) favors verify when sub-agent reports are uncertain'],
        ],
      },
      {
        heading: 'Example: Catastrophic Breakdown Prevention',
        content: 'Without verification, if Agent-A hallucinated "patch complete" but actually broke the authentication: Root thinks task done → marks vulnerability fixed → security audit fails. With a* = verify, Verifier catches the bug → negative reward → supervisor learns to always verify security patches.',
      },
      {
        heading: 'Key Equations',
        equations: [
          ['\\text{Action Selection:}', '\\mathcal{a}^* = \\arg\\max_{\\mathcal{a}} \\mathcal{Q}(\\mathcal{s}, \\mathcal{a})'],
          ['\\text{Value Impact:}', '\\mathcal{V}^{\\pi}(\\mathcal{s}) = \\mathcal{Q}(\\mathcal{s}, \\mathcal{a}^*)'],
          ['\\text{Policy Mapping:}', '\\pi: \\mathcal{S} \\rightarrow \\mathcal{A}'],
        ],
      },
      {
        heading: 'Supervisor Response Actions',
        content: 'When sub-agents report back, supervisors respond with actions that affect the entire sub-tree:',
        items: [
          ['\\text{Continue}', 'Let sub-agent continue on current task'],
          ['\\text{Modify}', 'Adjust task parameters or reallocate budget'],
          ['\\text{Adjust Access}', 'Change file permissions based on access control mechanism'],
          ['\\text{Early Kill}', 'Terminate underperforming sub-agent; respawn with better config'],
        ],
      },
    ],
  },
};

// Modal component for node details - Enhanced with sections
function DetailModal({ nodeId, onClose }) {
  const details = NODE_DETAILS[nodeId];
  if (!details) return null;

  const stageKey = nodeId === 'state' ? 'state' :
                   nodeId === 'actionSpace' ? 'action' :
                   nodeId === 'qvalue' ? 'qvalue' :
                   nodeId === 'policy' ? 'selection' :
                   nodeId === 'chosen' ? 'highlight' :
                   nodeId === 'execution' ? 'execution' :
                   nodeId === 'transition' ? 'transition' :
                   nodeId === 'weightUpdate' ? 'update' : 'next';

  const colors = STAGE_COLORS[stageKey];

  // Render a section based on its type
  const renderSection = (section, idx) => {
    return (
      <div key={idx} style={{ marginBottom: '16px' }}>
        <h4 style={{
          margin: '0 0 10px 0',
          color: colors.text,
          fontSize: '14px',
          fontWeight: '600',
          borderBottom: `1px solid ${colors.border}`,
          paddingBottom: '6px',
        }}>
          {section.heading}
        </h4>

        {/* Content paragraph */}
        {section.content && (
          <p style={{ color: '#4b5563', margin: '0 0 8px 0', lineHeight: '1.6', fontSize: '13px' }}>
            {section.content}
          </p>
        )}

        {/* Items list (LaTeX label + description) */}
        {section.items && (
          <ul style={{ margin: 0, paddingLeft: '0', color: '#374151', listStyle: 'none' }}>
            {section.items.map(([latex, text], i) => (
              <li key={i} style={{
                marginBottom: '8px',
                lineHeight: '1.5',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                fontSize: '13px',
              }}>
                <span style={{
                  minWidth: 'fit-content',
                  backgroundColor: '#f1f5f9',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                }}>
                  <Latex>{latex}</Latex>
                </span>
                <span style={{ color: '#4b5563' }}>{text}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Equations block */}
        {section.equations && (
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
          }}>
            {section.equations.map(([label, eq], i) => (
              <div key={i} style={{
                marginBottom: i < section.equations.length - 1 ? '10px' : '0',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                  <Latex>{label}</Latex>
                </span>
                <div style={{
                  fontSize: '14px',
                  color: '#1e293b',
                  paddingLeft: '12px',
                  overflowX: 'auto',
                }}>
                  <Latex>{eq}</Latex>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '720px',
          width: '90%',
          maxHeight: '85vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          borderTop: `4px solid ${colors.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, color: colors.text, fontSize: '18px', fontWeight: '600' }}>
            {details.title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '0',
              lineHeight: '1',
            }}
          >
            ×
          </button>
        </div>

        {/* Main Formula - rendered with LaTeX */}
        <div style={{
          backgroundColor: colors.bg,
          padding: '14px 18px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '15px',
          color: '#334155',
          borderLeft: `4px solid ${colors.border}`,
          overflowX: 'auto',
        }}>
          <Latex display={true}>{details.formula}</Latex>
        </div>

        {/* Description */}
        <p style={{ color: '#374151', marginBottom: '20px', lineHeight: '1.7', fontSize: '14px' }}>
          {details.description}
        </p>

        {/* Sections */}
        <div style={{
          backgroundColor: '#fafafa',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
        }}>
          {details.sections && details.sections.map((section, idx) => renderSection(section, idx))}
        </div>
      </div>
    </div>
  );
}

// Custom node component with handles
function WorkflowNode({ data }) {
  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: '8px',
        backgroundColor: data.colors.bg,
        border: `2px solid ${data.colors.border}`,
        minWidth: data.width || '200px',
        maxWidth: data.maxWidth || '320px',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: data.colors.border, width: 8, height: 8 }}
      />
      <div style={{ fontWeight: '600', color: data.colors.text, marginBottom: data.subtitleLatex ? '4px' : '0', fontSize: '13px' }}>
        {data.label}
      </div>
      {data.subtitleLatex && (
        <div style={{ fontSize: '12px', color: '#4b5563' }}>
          <Latex>{data.subtitleLatex}</Latex>
        </div>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: data.colors.border, width: 8, height: 8 }}
      />
      {data.hasLeftHandle && (
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          style={{ background: data.colors.border, width: 8, height: 8 }}
        />
      )}
      {data.hasRightHandle && (
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          style={{ background: data.colors.border, width: 8, height: 8 }}
        />
      )}
    </div>
  );
}

// Action item node (smaller)
function ActionNode({ data }) {
  return (
    <div
      style={{
        padding: '8px 12px',
        borderRadius: '6px',
        backgroundColor: data.colors.bg,
        border: `1px solid ${data.colors.border}`,
        fontSize: '12px',
        color: data.colors.text,
        minWidth: '200px',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: data.colors.border, width: 6, height: 6 }}
      />
      <span style={{ fontWeight: '600' }}><Latex>{data.actionLatex}</Latex></span>
      <span>: {data.description}</span>
    </div>
  );
}

const nodeTypes = {
  workflow: WorkflowNode,
  action: ActionNode,
};

// Initial nodes with LaTeX notation - increased spacing with sub-blocks
const initialNodes = [
  // 1. State Observation
  {
    id: 'state',
    type: 'workflow',
    position: { x: 400, y: 0 },
    data: {
      label: '1. State Observation',
      subtitleLatex: '\\mathcal{S}_t = (\\text{objective}, \\text{budget}, ...)',
      colors: STAGE_COLORS.state,
      width: '300px',
      hasLeftHandle: true,
      hasRightHandle: true,
    },
  },
  // State components sub-blocks
  { id: 's1', type: 'action', position: { x: 1050, y: -60 }, data: { actionLatex: '\\text{Objective}', description: 'Task + ancestor context', colors: STAGE_COLORS.state } },
  { id: 's2', type: 'action', position: { x: 1050, y: -15 }, data: { actionLatex: '\\text{Budget}', description: 'Available resources', colors: STAGE_COLORS.state } },
  { id: 's3', type: 'action', position: { x: 1050, y: 30 }, data: { actionLatex: '\\text{Task Queue}', description: 'Pending sub-tasks', colors: STAGE_COLORS.state } },
  { id: 's4', type: 'action', position: { x: 1050, y: 75 }, data: { actionLatex: '\\text{File System}', description: 'Accessible files', colors: STAGE_COLORS.state } },
  { id: 's5', type: 'action', position: { x: 1050, y: 120 }, data: { actionLatex: '\\text{Sub-Agents}', description: 'Children states', colors: STAGE_COLORS.state } },
  // 2. Action Space
  {
    id: 'actionSpace',
    type: 'workflow',
    position: { x: 400, y: 200 },
    data: {
      label: '2. Action Space',
      subtitleLatex: '\\mathcal{A} = \\{\\mathcal{a}_1, \\mathcal{a}_2, ..., \\mathcal{a}_6\\}',
      colors: STAGE_COLORS.action,
      width: '300px',
      hasRightHandle: true,
    },
  },
  // Action items (stacked) - shorter distance
  { id: 'a1', type: 'action', position: { x: 880, y: 165 }, data: { actionLatex: '\\mathcal{a}_1', description: 'Decompose objective', colors: STAGE_COLORS.action } },
  { id: 'a2', type: 'action', position: { x: 880, y: 210 }, data: { actionLatex: '\\mathcal{a}_2', description: 'Assign sub-task', colors: STAGE_COLORS.action } },
  { id: 'a3', type: 'action', position: { x: 880, y: 255 }, data: { actionLatex: '\\mathcal{a}_3', description: 'Verify completed task', colors: STAGE_COLORS.action } },
  { id: 'a4', type: 'action', position: { x: 880, y: 300 }, data: { actionLatex: '\\mathcal{a}_4', description: 'Redo failed task', colors: STAGE_COLORS.action } },
  { id: 'a5', type: 'action', position: { x: 880, y: 345 }, data: { actionLatex: '\\mathcal{a}_5', description: 'Terminate and report', colors: STAGE_COLORS.action } },
  { id: 'a6', type: 'action', position: { x: 880, y: 390 }, data: { actionLatex: '\\mathcal{a}_6', description: 'Report to supervisor', colors: STAGE_COLORS.action } },
  // 3. Q-Value Computation
  {
    id: 'qvalue',
    type: 'workflow',
    position: { x: 400, y: 450 },
    data: {
      label: '3. Q-Value Computation',
      subtitleLatex: '\\mathcal{Q}(\\mathcal{s}, \\mathcal{a}_i) = \\sum_j \\mathcal{w}_j \\cdot f_j(\\mathcal{s}, \\mathcal{a}_i)',
      colors: STAGE_COLORS.qvalue,
      width: '340px',
      hasRightHandle: true,
    },
  },
  // Feature function sub-blocks - longer distance
  { id: 'f1', type: 'action', position: { x: 1050, y: 435 }, data: { actionLatex: 'f_1', description: 'Objective Complexity', colors: STAGE_COLORS.qvalue } },
  { id: 'f2', type: 'action', position: { x: 1050, y: 475 }, data: { actionLatex: 'f_2', description: 'Objective Fulfillment', colors: STAGE_COLORS.qvalue } },
  { id: 'f3', type: 'action', position: { x: 1050, y: 515 }, data: { actionLatex: 'f_3', description: 'Task Queue Length', colors: STAGE_COLORS.qvalue } },
  { id: 'f4', type: 'action', position: { x: 1050, y: 555 }, data: { actionLatex: 'f_4', description: 'Sub-Agent Feedback', colors: STAGE_COLORS.qvalue } },
  { id: 'f5', type: 'action', position: { x: 1050, y: 595 }, data: { actionLatex: 'f_5', description: 'Task Completion', colors: STAGE_COLORS.qvalue } },
  { id: 'f6', type: 'action', position: { x: 1050, y: 635 }, data: { actionLatex: 'f_6', description: 'Budget Gain/Loss', colors: STAGE_COLORS.qvalue } },
  { id: 'f7', type: 'action', position: { x: 1050, y: 675 }, data: { actionLatex: 'f_7', description: 'Current Budget', colors: STAGE_COLORS.qvalue } },
  // 4. Action Selection
  {
    id: 'policy',
    type: 'workflow',
    position: { x: 400, y: 650 },
    data: {
      label: '4. Action Selection (ε-greedy)',
      subtitleLatex: '\\mathcal{a}^* = \\arg\\max_{\\mathcal{a}} \\mathcal{Q}(\\mathcal{s}, \\mathcal{a})',
      colors: STAGE_COLORS.selection,
      width: '320px',
      hasRightHandle: true,
    },
  },
  // Policy sub-blocks - shorter distance
  { id: 'explore', type: 'action', position: { x: 880, y: 710 }, data: { actionLatex: '\\varepsilon', description: 'Explore (random)', colors: STAGE_COLORS.selection } },
  { id: 'exploit', type: 'action', position: { x: 880, y: 750 }, data: { actionLatex: '1-\\varepsilon', description: 'Exploit (best Q)', colors: STAGE_COLORS.selection } },
  // Chosen action highlight
  {
    id: 'chosen',
    type: 'workflow',
    position: { x: 400, y: 780 },
    data: {
      label: 'Chosen Action:',
      subtitleLatex: '\\mathcal{a}^*',
      colors: STAGE_COLORS.highlight,
      width: '180px',
    },
  },
  // 5. Execution
  {
    id: 'execution',
    type: 'workflow',
    position: { x: 400, y: 910 },
    data: {
      label: '5. Execute Action',
      subtitleLatex: '\\text{Execute } \\mathcal{a}^*',
      colors: STAGE_COLORS.execution,
      width: '280px',
      hasRightHandle: true,
    },
  },
  // Execution sub-blocks - longer distance
  { id: 'exec1', type: 'action', position: { x: 1050, y: 900 }, data: { actionLatex: '\\text{Thinker}', description: 'Online planning', colors: STAGE_COLORS.execution } },
  { id: 'exec2', type: 'action', position: { x: 1050, y: 940 }, data: { actionLatex: '\\text{Worker}', description: 'Online execution', colors: STAGE_COLORS.execution } },
  // 6. Transition
  {
    id: 'transition',
    type: 'workflow',
    position: { x: 400, y: 1050 },
    data: {
      label: '6. State Transition & Reward',
      subtitleLatex: '(\\mathcal{s}, \\mathcal{a}^*, \\mathcal{r}, \\mathcal{s}\')',
      colors: STAGE_COLORS.transition,
      width: '300px',
      hasRightHandle: true,
    },
  },
  // Transition sub-blocks - shorter distance
  { id: 't1', type: 'action', position: { x: 880, y: 1000 }, data: { actionLatex: '\\mathcal{s}', description: 'Current state', colors: STAGE_COLORS.transition } },
  { id: 't2', type: 'action', position: { x: 880, y: 1040 }, data: { actionLatex: '\\mathcal{a}^*', description: 'Executed action', colors: STAGE_COLORS.transition } },
  { id: 't3', type: 'action', position: { x: 880, y: 1080 }, data: { actionLatex: '\\mathcal{r}', description: 'Reward signal', colors: STAGE_COLORS.transition } },
  { id: 't4', type: 'action', position: { x: 880, y: 1120 }, data: { actionLatex: '\\mathcal{s}\'', description: 'Next state', colors: STAGE_COLORS.transition } },
  // 7. Weight Update
  {
    id: 'weightUpdate',
    type: 'workflow',
    position: { x: 400, y: 1180 },
    data: {
      label: '7. Weight Update',
      subtitleLatex: '\\mathcal{w}_i \\leftarrow \\mathcal{w}_i + \\alpha \\cdot \\text{diff} \\cdot f_i(\\mathcal{s}, \\mathcal{a}^*)',
      colors: STAGE_COLORS.update,
      width: '360px',
      hasRightHandle: true,
    },
  },
  // Weight Update sub-blocks - longer distance
  { id: 'w1', type: 'action', position: { x: 1050, y: 1160 }, data: { actionLatex: '\\text{Init}', description: 'Initialize weights', colors: STAGE_COLORS.update } },
  { id: 'w2', type: 'action', position: { x: 1050, y: 1200 }, data: { actionLatex: '\\text{Sample}', description: 'r + γ max Q(s\',a\')', colors: STAGE_COLORS.update } },
  { id: 'w3', type: 'action', position: { x: 1050, y: 1240 }, data: { actionLatex: '\\text{Diff}', description: 'sample - Q(s,a)', colors: STAGE_COLORS.update } },
  { id: 'w4', type: 'action', position: { x: 1050, y: 1280 }, data: { actionLatex: '\\alpha, \\gamma', description: 'Learning rate, discount', colors: STAGE_COLORS.update } },
  // 8. Next Cycle
  {
    id: 'nextCycle',
    type: 'workflow',
    position: { x: 400, y: 1340 },
    data: {
      label: '8. Next Decision Cycle',
      subtitleLatex: '\\mathcal{s} \\leftarrow \\mathcal{s}\'',
      colors: STAGE_COLORS.next,
      width: '240px',
      hasRightHandle: true,
    },
  },
  // Next Cycle sub-block - shorter distance (no terminal sub-block, END node handles that)
  { id: 'n1', type: 'action', position: { x: 880, y: 1340 }, data: { actionLatex: '\\text{Continue}', description: 'Loop to step 1', colors: STAGE_COLORS.next } },
  // End node
  {
    id: 'end',
    type: 'workflow',
    position: { x: 600, y: 1500 },
    data: {
      label: 'END: Lifecycle Complete',
      colors: STAGE_COLORS.end,
      width: '180px',
    },
  },
];

// Initial edges with explicit styling
const initialEdges = [
  // Main flow - vertical connections
  {
    id: 'e-state-action',
    source: 'state',
    target: 'actionSpace',
    type: 'smoothstep',
    animated: false,
    style: { stroke: '#64748b', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b', width: 20, height: 20 },
  },
  {
    id: 'e-action-qvalue',
    source: 'actionSpace',
    target: 'qvalue',
    type: 'smoothstep',
    style: { stroke: '#64748b', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b', width: 20, height: 20 },
  },
  {
    id: 'e-qvalue-policy',
    source: 'qvalue',
    target: 'policy',
    type: 'smoothstep',
    style: { stroke: '#64748b', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b', width: 20, height: 20 },
  },
  {
    id: 'e-policy-chosen',
    source: 'policy',
    target: 'chosen',
    type: 'smoothstep',
    style: { stroke: '#64748b', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b', width: 20, height: 20 },
  },
  {
    id: 'e-chosen-exec',
    source: 'chosen',
    target: 'execution',
    type: 'smoothstep',
    style: { stroke: '#64748b', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b', width: 20, height: 20 },
  },
  {
    id: 'e-exec-trans',
    source: 'execution',
    target: 'transition',
    type: 'smoothstep',
    style: { stroke: '#64748b', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b', width: 20, height: 20 },
  },
  {
    id: 'e-trans-weight',
    source: 'transition',
    target: 'weightUpdate',
    type: 'smoothstep',
    style: { stroke: '#64748b', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b', width: 20, height: 20 },
  },
  {
    id: 'e-weight-next',
    source: 'weightUpdate',
    target: 'nextCycle',
    type: 'smoothstep',
    style: { stroke: '#64748b', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b', width: 20, height: 20 },
  },
  // Loop back - from nextCycle to state (using default handles since smoothstep will route around)
  {
    id: 'e-next-state',
    source: 'nextCycle',
    target: 'state',
    targetHandle: 'left',
    type: 'smoothstep',
    style: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5,5' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 20, height: 20 },
    label: 'Loop',
    labelStyle: { fill: '#3b82f6', fontWeight: 600, fontSize: 12 },
    labelBgStyle: { fill: 'white', fillOpacity: 0.9 },
  },
  // End path - from nextCycle right to end
  {
    id: 'e-next-end',
    source: 'nextCycle',
    target: 'end',
    sourceHandle: 'right',
    type: 'smoothstep',
    style: { stroke: '#ef4444', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444', width: 20, height: 20 },
    label: 'Terminal',
    labelStyle: { fill: '#ef4444', fontWeight: 600, fontSize: 12 },
    labelBgStyle: { fill: 'white', fillOpacity: 0.9 },
  },
  // Action space to all action items (dashed arrows)
  {
    id: 'e-as-a1',
    source: 'actionSpace',
    target: 'a1',
    sourceHandle: 'right',
    type: 'smoothstep',
    style: { stroke: '#d99a6a', strokeWidth: 1.5, strokeDasharray: '4,4' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#d99a6a', width: 15, height: 15 },
  },
  {
    id: 'e-as-a2',
    source: 'actionSpace',
    target: 'a2',
    sourceHandle: 'right',
    type: 'smoothstep',
    style: { stroke: '#d99a6a', strokeWidth: 1.5, strokeDasharray: '4,4' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#d99a6a', width: 15, height: 15 },
  },
  {
    id: 'e-as-a3',
    source: 'actionSpace',
    target: 'a3',
    sourceHandle: 'right',
    type: 'smoothstep',
    style: { stroke: '#d99a6a', strokeWidth: 1.5, strokeDasharray: '4,4' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#d99a6a', width: 15, height: 15 },
  },
  {
    id: 'e-as-a4',
    source: 'actionSpace',
    target: 'a4',
    sourceHandle: 'right',
    type: 'smoothstep',
    style: { stroke: '#d99a6a', strokeWidth: 1.5, strokeDasharray: '4,4' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#d99a6a', width: 15, height: 15 },
  },
  {
    id: 'e-as-a5',
    source: 'actionSpace',
    target: 'a5',
    sourceHandle: 'right',
    type: 'smoothstep',
    style: { stroke: '#d99a6a', strokeWidth: 1.5, strokeDasharray: '4,4' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#d99a6a', width: 15, height: 15 },
  },
  {
    id: 'e-as-a6',
    source: 'actionSpace',
    target: 'a6',
    sourceHandle: 'right',
    type: 'smoothstep',
    style: { stroke: '#d99a6a', strokeWidth: 1.5, strokeDasharray: '4,4' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#d99a6a', width: 15, height: 15 },
  },
  // State components sub-blocks
  { id: 'e-s-s1', source: 'state', target: 's1', sourceHandle: 'right', type: 'smoothstep', style: { stroke: '#7aa6d9', strokeWidth: 1.5, strokeDasharray: '4,4' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#7aa6d9', width: 15, height: 15 } },
  { id: 'e-s-s2', source: 'state', target: 's2', sourceHandle: 'right', type: 'smoothstep', style: { stroke: '#7aa6d9', strokeWidth: 1.5, strokeDasharray: '4,4' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#7aa6d9', width: 15, height: 15 } },
  { id: 'e-s-s3', source: 'state', target: 's3', sourceHandle: 'right', type: 'smoothstep', style: { stroke: '#7aa6d9', strokeWidth: 1.5, strokeDasharray: '4,4' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#7aa6d9', width: 15, height: 15 } },
  { id: 'e-s-s4', source: 'state', target: 's4', sourceHandle: 'right', type: 'smoothstep', style: { stroke: '#7aa6d9', strokeWidth: 1.5, strokeDasharray: '4,4' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#7aa6d9', width: 15, height: 15 } },
  { id: 'e-s-s5', source: 'state', target: 's5', sourceHandle: 'right', type: 'smoothstep', style: { stroke: '#7aa6d9', strokeWidth: 1.5, strokeDasharray: '4,4' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#7aa6d9', width: 15, height: 15 } },
  // Q-value feature function sub-blocks
  { id: 'e-q-f1', source: 'qvalue', target: 'f1', sourceHandle: 'right', type: 'smoothstep', style: { stroke: '#6ad96a', strokeWidth: 1.5, strokeDasharray: '4,4' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#6ad96a', width: 15, height: 15 } },
  { id: 'e-q-f2', source: 'qvalue', target: 'f2', sourceHandle: 'right', type: 'smoothstep', style: { stroke: '#6ad96a', strokeWidth: 1.5, strokeDasharray: '4,4' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#6ad96a', width: 15, height: 15 } },
  { id: 'e-q-f3', source: 'qvalue', target: 'f3', sourceHandle: 'right', type: 'smoothstep', style: { stroke: '#6ad96a', strokeWidth: 1.5, strokeDasharray: '4,4' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#6ad96a', width: 15, height: 15 } },
  { id: 'e-q-f4', source: 'qvalue', target: 'f4', sourceHandle: 'right', type: 'smoothstep', style: { stroke: '#6ad96a', strokeWidth: 1.5, strokeDasharray: '4,4' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#6ad96a', width: 15, height: 15 } },
  { id: 'e-q-f5', source: 'qvalue', target: 'f5', sourceHandle: 'right', type: 'smoothstep', style: { stroke: '#6ad96a', strokeWidth: 1.5, strokeDasharray: '4,4' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#6ad96a', width: 15, height: 15 } },
  { id: 'e-q-f6', source: 'qvalue', target: 'f6', sourceHandle: 'right', type: 'smoothstep', style: { stroke: '#6ad96a', strokeWidth: 1.5, strokeDasharray: '4,4' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#6ad96a', width: 15, height: 15 } },
  { id: 'e-q-f7', source: 'qvalue', target: 'f7', sourceHandle: 'right', type: 'smoothstep', style: { stroke: '#6ad96a', strokeWidth: 1.5, strokeDasharray: '4,4' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#6ad96a', width: 15, height: 15 } },
  // Policy sub-blocks
  { id: 'e-p-explore', source: 'policy', target: 'explore', sourceHandle: 'right', type: 'smoothstep', style: { stroke: '#d96a9a', strokeWidth: 1.5, strokeDasharray: '4,4' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#d96a9a', width: 15, height: 15 } },
  { id: 'e-p-exploit', source: 'policy', target: 'exploit', sourceHandle: 'right', type: 'smoothstep', style: { stroke: '#d96a9a', strokeWidth: 1.5, strokeDasharray: '4,4' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#d96a9a', width: 15, height: 15 } },
  // Execution sub-blocks
  { id: 'e-ex-1', source: 'execution', target: 'exec1', sourceHandle: 'right', type: 'smoothstep', style: { stroke: '#9a6ad9', strokeWidth: 1.5, strokeDasharray: '4,4' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#9a6ad9', width: 15, height: 15 } },
  { id: 'e-ex-2', source: 'execution', target: 'exec2', sourceHandle: 'right', type: 'smoothstep', style: { stroke: '#9a6ad9', strokeWidth: 1.5, strokeDasharray: '4,4' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#9a6ad9', width: 15, height: 15 } },
  // Transition sub-blocks
  { id: 'e-t-1', source: 'transition', target: 't1', sourceHandle: 'right', type: 'smoothstep', style: { stroke: '#e0a14a', strokeWidth: 1.5, strokeDasharray: '4,4' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#e0a14a', width: 15, height: 15 } },
  { id: 'e-t-2', source: 'transition', target: 't2', sourceHandle: 'right', type: 'smoothstep', style: { stroke: '#e0a14a', strokeWidth: 1.5, strokeDasharray: '4,4' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#e0a14a', width: 15, height: 15 } },
  { id: 'e-t-3', source: 'transition', target: 't3', sourceHandle: 'right', type: 'smoothstep', style: { stroke: '#e0a14a', strokeWidth: 1.5, strokeDasharray: '4,4' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#e0a14a', width: 15, height: 15 } },
  { id: 'e-t-4', source: 'transition', target: 't4', sourceHandle: 'right', type: 'smoothstep', style: { stroke: '#e0a14a', strokeWidth: 1.5, strokeDasharray: '4,4' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#e0a14a', width: 15, height: 15 } },
  // Weight update sub-blocks
  { id: 'e-w-1', source: 'weightUpdate', target: 'w1', sourceHandle: 'right', type: 'smoothstep', style: { stroke: '#6ad9d9', strokeWidth: 1.5, strokeDasharray: '4,4' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#6ad9d9', width: 15, height: 15 } },
  { id: 'e-w-2', source: 'weightUpdate', target: 'w2', sourceHandle: 'right', type: 'smoothstep', style: { stroke: '#6ad9d9', strokeWidth: 1.5, strokeDasharray: '4,4' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#6ad9d9', width: 15, height: 15 } },
  { id: 'e-w-3', source: 'weightUpdate', target: 'w3', sourceHandle: 'right', type: 'smoothstep', style: { stroke: '#6ad9d9', strokeWidth: 1.5, strokeDasharray: '4,4' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#6ad9d9', width: 15, height: 15 } },
  { id: 'e-w-4', source: 'weightUpdate', target: 'w4', sourceHandle: 'right', type: 'smoothstep', style: { stroke: '#6ad9d9', strokeWidth: 1.5, strokeDasharray: '4,4' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#6ad9d9', width: 15, height: 15 } },
  // Next cycle sub-block (no terminal sub-block)
  { id: 'e-n-1', source: 'nextCycle', target: 'n1', sourceHandle: 'right', type: 'smoothstep', style: { stroke: '#888888', strokeWidth: 1.5, strokeDasharray: '4,4' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#888888', width: 15, height: 15 } },
];

export default function ApproxQLearningWorkflow() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);

  const onNodeClick = useCallback((_event, node) => {
    // Only show modal for main workflow nodes, not action items
    if (node.type === 'workflow' && NODE_DETAILS[node.id]) {
      setSelectedNode(node.id);
    }
  }, []);

  return (
    <div style={{ width: '100%', height: '1500px', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.3}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { stroke: '#64748b', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' },
        }}
      >
        <Background color="#e5e7eb" gap={20} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(node) => node.data?.colors?.border || '#888'}
          maskColor="rgba(0, 0, 0, 0.1)"
          style={{ height: 100 }}
        />
      </ReactFlow>

      {selectedNode && (
        <DetailModal nodeId={selectedNode} onClose={() => setSelectedNode(null)} />
      )}

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '60px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '11px',
        color: '#6b7280',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        zIndex: 10,
      }}>
        Scroll to zoom • Drag to pan • Click nodes for details
      </div>
    </div>
  );
}
