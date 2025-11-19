# Agentic Tree

Research ideas for the tree-structured agentic system.
- Writen by Song Li

---

## Introduction
The goal of this brainstrom should settle down our fundamental design to create a tree-like agentic sturcutre to tackle cybersecurity tasks.

We have successfully reproduced and even refactored the SEC-Verifier with a better modular OpenHands core. This improvement allows us to easily test the 3-stage agents (Builder, Exploiter, and Fixer) on OpenAI, Gemini, and Claude models. We discovered that the 3-stage agentic system performance depends on the choice of models. For example, Claude Sonnet 4.5 is able to recreate the builder stage for `php.cve-2018-19935`, but all of powerful OpenAI models (GPT-5, GPT-5-mini, GPT-4o) failed to do so.

The weak point of the current SEC-Verifier is that it only allows a linear chain of agents. For example, if the Builder fails to create a working exploit, the Exploiter will not be able to proceed. To address this limitation, we propose a tree-structured agentic system where multiple agents can be spawned at each stage, and the decision-making agent is able to produce fine-grained actions to fix the issues.

**Note**: We use terms agents and nodes interchangeably in this document.

## Core Algorithm of Tree-Structured Agentic System
Our proposed tree-structured system is highly recursive, and actions taken by agent nodes are dependent on the current budget. Every single node is a subclass of a superclass of an abstract AgentNode. This tree system allows multiple models to collaborate, compare and select the best actions to finish a given task, and even backtrack the to redo the failed objective if needed.

### Agent Node Stucture
Each node in the tree represents an agent with the following attributes:
- **Agent Model:** This one is the core of the node, which contains the information of the selected LLM model name (e.g., GPT-5, Claude Sonnet 4.5, Gemini Pro, etc.) and its configuration (e.g., temperature, max tokens, current context, etc.).
- **Current Budget:** This is a numeric allocation of resources allowed for the node to perform its tasks. An agent node can get more budeget if its subordinate nodes succeed in their tasks, and get a loss in budget if they fail. This part would be more explictly defined in the [Reward Mechanism](#reward-mechanism).
- **Objective:** This is text description of the task that the current agent node possesses. If the current node is root node of the entire tree, then the objective is the high-level cybersecurity task with detailed descriptions, including the operating system specifications, the GitHub repository link with specific reported commits, GitHub Issues raised, etc. If the current node is not a root node, then the objective is a sub-task created by its supervisor node.
- **Task Queue:** This part is a linked list of sub-tasks that are created by the current agent node in order to fullfill the objective. At every single iteration, the current agent node will pop the first task from the task queue, and decide to fullfill it by itself (if it is an atomic task), or spawn subordinate nodes to tackle the sub-task (if it is a composite task). More details about the task list management will be discussed in the [Task Assignment Mechanism](#task-assignment-mechanism).
- **Supervisor Node:** This points to the parent node of the current agent node. The supervisor node is responsible for generating subtasks, monitoring the progress of its subordinate nodes, collecting their results, recalculating the current budget, spawning new tasks, and terminating the sub-tasks. The part related to spawning and killing of sub-agent is more explictly defined in the [Agent Lifecycle](#agent-lifecycle).
- **Subordiante Nodes:** This a list of child nodes that are spawned 

### Agent Node Actions
Each agent node acts in accordance with the following workflow:
1. **Analyze Objective:** 
2. **Create High-Level Task Type:**
    - **Atomic Task:** 
    - **Composite Task:** 
3. **Create ToDo List:**
    - **Spawn Subordinate Nodes:**
4. **Monitor Subordinate Nodes:**
5. **Update Budget:**
6. **Redo or Terminate:**
7. **Report to Supervisor:**

### Tree Structure Illustration

```mermaid
---
config:
  look: handDrawn
  theme: neutral
---
graph TD;
    president([Root Node with GPT 5 → Objective: Fix the vulnerability reported at ...])-->thinker1([thinker1]);
    president-->thinker2([thinker2: Exploiter Agent with Claude Sonnet 4.5 → Objective: Create working exploit for ...]);
    president-->thinker3([thinker3]);
    
    thinker1-->thinker1.1([...]);
    
    thinker2-->thinker2.1([thinker2.1: File Editor Agent with Claude Haiku → Objective: change the function ...]);
    thinker2-->thinker2.2([thinker2.2: Verifier Agent with Gemini Pro → Objective: Verify the Previous Task]);
    thinker2-->thinker2.3([thinker2.3]);
    
    thinker3-->thinker3.1([...]);

    thinker2.1-->thinker2.1.1([...]);
    thinker2.2-->thinker2.2.1([thinker2.2.1 with GPT 4o → Objective: Verify the correctness of unit tests for ...]);
    thinker2.3-->thinker2.3.1([...]);

    thinker2.1.1-->worker2.1.1([leaf Node with GPT 3 → Atomic Task: Delete Line Number ...]);
    thinker2.2.1-->worker2.2.1([leaf Node → Atomic Task: Write unit tests to ...]);
    thinker2.3.1-->worker2.3.1([leaf Node → Atomic Task: Change Access Permission of file ...]);

```

### Reward Mechanism
```mermaid
flowchart TB
    A("Supervisor Node S") --> A_b[("Budget of S = X")];
    A --> A_o[("Objective = Y")];
    A --> A_c[("Configurations = Z")];
    
    A_o --> A_t1(["sub-task1 = Y1"]);
    A_o --> A_t2(["sub-task2 = Y2"]);
    A_o --> A_t3(["sub-task3 = Y3"]);

    A_t2 --> B{"Task Type?"};
    
    B -- "ATOMIC" --> B1["Execute Task Directly"];
    B1--> H{"Report Status?"};
    B -- "COMPOSITE" --> B2["Delegate to Subordinate Nodes"];
    
    B2 --> Bchild("Subordinate Node for Y2");
    A_t2 --> Bchild_b[("Budget = X_Y2")];
    Bchild -- "Spawned to be Subtree Superviosr with Objective = X2" --> A;
    Bchild ---> E{"Completion Status?"};
    
    H -- "'SUCCESS'" --> I["S Increases Budget"];
    H -- "'FAILURE'" --> J["S Decreases Budget"];
    
    E -- "YES" --> H;
    E -- "NO" --> J;

    I -- "PLUS Reward Ration * X_Y2" --> A_b;
    J -- "MINUS Penalty Ration * X_Y2" --> A_b;

```

### Task Assignment Mechanism

### Agent Lifecycle

### Tree Structure Workflow

### Example Workflow Illustration
Consider a scenario where the objective is the following:
- **Objective:** Count the number of words in a given text file.

TODO

## Task Evaluation/ Verificaiton
It is significantly challenging to evaluate the successes of the tree-structured agentic system, but it is crucial to establish a robust evaluation framework.

### Problem Statement
In the worst case scenario, if in a subtree, one of our agent hallucinates and reports the false negative (i.e. falsely reported as finished) that the current objective is fully achieved. For example, if an agent reports that one function that is supposed to check the file's access permission is correctly implemented, but in reality, the function always returns true for any user. This problem can cause ripple effects in the entire tree, because once the subtask is popped from the task queue of the supervisor node, this specific task is unlikely to be recreated. As a result, somewhere in other parts of the tree, one agent can further build on top of this false negative and reports incorrect incorrect results, simply due to the calling of hallucinated function. Eventually, the errors accumulated to the root node, and the entire tree reports a false negative that the high-level objective is achieved, because of one wrongly implemented atomic task.

### Thoughts On Simple Solutions
Therefore, it is critical for the task evaluation mechanism to be able to at least catch the suspicion of wrongly reported tasks. In the agentic world, it is particularly challenging to verify the correctness of the tasks. The following methods are **NOT** ideal for this problem:
1. **Redundant Task**: Assign the same task repeated can cause budeget waste and quickly exhuast the rewards, and based on our [Agent Lifecyle](#agent-lifecycle), this can quickly terminates the sub-branch. The false negative task report does not generate meaningful feedback to the supervisor node, and supervisor node is unlikely to redo the same task again. Also, this method is not efficient if we create the same task multiple times.
2. **Same Layer Cross-Validation**: Checking the results of sibling nodes can cause confusions to the supervisor node. Imagine that, 2 of the 3 subordiante nodes reported false negative results, and the last subordinate is able to finish the sub-task correctly. The supervisor node is likely to believe the majority vote, and the correctly finished task is instead killed. This cross-validation error may be mitigated if we always use different models for the subordinate nodes, because their results are likely to be different.
3. **Agent Self Reflection**: Relying on the agent to self-reflect may not be reliable, because the agent itself has already hallucinated once, and it is likely to hallucinate again.

As shown above, the evaluation of the tree-structured agentic system is non-trivial, but it can grealy imporves the overall success rate and realiability if the system is able to catch some false negative reports.

### Agentic Verification Task Strategy
The following strategy is **proposed and planned** to be implemented:
1. **Verification Task Injection**: The supervisor node is in charge of the task queue management, and our system encourages the supervisor node to inject a verification task to the head of the queue, and this verfication task would be popped next, if the budeget is sufficient. Currently, injections are based on heuristics, and verification task would be created based on the following conditions: 
    - Complexity of Previous Task: if the sub-tree is gigantic and the previous task is complex.
    - Random Probability: a small probability to randomly inject verification tasks.
    - Suspicious Reports: if the report from the subordinat's amount of edits are not compatible with the task complexity.
    - Time Since Last Verification: if it has been a long time since the last verification task was injected.
    - Budget Availability: if there is sufficient budget to perform verification without jeopardizing the main tasks.
2. **Independent Verifier Sub-Agent**: For the verification task, the supervisor node will spawn an independent verifier sub-agent, which is expected to be different from all of orginal subordinate nodes. Verifier agents can be costly to deploy, since they are likely to be more advanced models with more deep-thinking capabilities, such as `Anthropic/claude-sonnet-4-5`. This verifier agent can also itself spawn verifier sub-agents if needed.
3. **Task Re-Do**: If the verifier agent reports that the previous task is not correctly finished, then the supervisor node will re-inject the same task to the head of the task queue, and the supervisor node respawns subordinate nodes to redo the task with more contexts from the verifier agent if the budget allows.

Rationale of this strategy:

This approach is more compatible with our tree-structured agentic system, because the verification task is treated as a normal task, and the verifier agents themselves have the autonomy to validate the correctness. Verifier agents are able to create unit tests, integration tests, or simply deep reasoning if needed. However, verfiers are expensive, but they reply on our budget reward mechanism to allocate resources properly. They can be killed if they deplete the supervisor's total budget.

## Runtime Considerations
This aspect can be potential attacking point on this entire design: explonential growth of amount of sub-agenets.

### Nodes Classification
This agentic tree can be actually seperated into two parts based on nodes' funcitonalities.
- **Thinking Nodes**: Agents that divide and conquer every objective. They only delegate tasks to sub-agents through its internal LLM reasonings. These nodes are always non-leaf nodes. Their tasks are composite tasks, and expected to be more advanced models. LLM token generation speed is the major factor that limits the runtime.
- **Working Nodes**: Agents that are actually make function/tool callings to make changes to the target repository. These nodes are always the leaf nodes. Their tasks are atomic, which are expected to be simple in terms of the amount of edits to the files, but well instructed due to the fine-grained and even filtered context generated by ancetor nodes in the current objective. Less advanced and cheap models are expected here. File I/O speed is the major factor taht limits the runtime.

Due to the nature of the tree data strcutre, the growth of the amount of leaves are exponential. This can be a benefit, because our system maximizes the probablity of fixing the holistic issue at the root node by exploring more possibilities at every branch. However, this also leads to computational challenges, a real example is that in SEC-Verifier, a single Builder Agent (can be considered as one sub-tree under root in our case) spend more than 1.5M tokens on Claude-Sonnet-4-5.

### Runtime Cost Analysis
Assume that we have not implemented any pruning strategy, and our tree is relatively balanced, which means that we have roughly same amount of thinking nodes and working nodes, and all working nodes are at the same depth. We can analyze the total computational cost of the entire tree as follows:

- Let **D** be the depth of the tree.
- Let **B** be the average branching factor (number of subordinate nodes spawned by every thinking node).
- Let **N_d** be the average amount of token consumption of a node at depth d. It is expected that N_d decreases as d increases, because deeper nodes are likely to be exposed only to the selected files that they need to access.
- Let **T_d** be the average computational cost per token (both input and output) for a node at depth d. It is expected that C_d decreases as d increases, because deeper nodes are likely to be less advanced models. Assume that input tokens cost the same as output tokens, but in practice, output tokens are likely to be 2 to 3 times slower to generate depending on the model selection.
- Let **F** be the average file I/O cost for every a working node.

Then the total computational cost C of the entire tree can be approximated as:

TODO

### Runtime Speed-Up
To mitigate the computational cost, we propose the following strategies:
1. **Budget Constraints**: Each node has a budget that limits the number of tokens it
2. **Branch Pruning**: Implement a pruning mechanism to remove less promising branches of the tree based on intermediate results and budget consumption.
3. 

## Potential Challenges
1. **Dockers**
2. **File System Restore**
3. 

## Benefits of Agentic Tree Design

## Implementation Plan
