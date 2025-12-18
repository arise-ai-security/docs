---
title: Task Assignment Mechanism
sidebar_position: 2
---

# Task Assignment Overview
As observed in our [budgeted tree experiment](/docs/projects/arise-sec-lion/system/design_choice/budgeted_tree.md), the lack of a proper task assignment mechanism leads to one prominent issue: catestrophic breakdown. One supervisor agent's inproper/inaccurate task breakdown can cause all of sub-agents derail from the main objective. 

To mitigate this issue or similar task assignment problems, a task assignment mechanism is necessary to ensure that the sub-tasks designed by supervisor agents are accurate, non-redundant, and productive. The generated work can be verified or redone.

In our [Q-Value based reinforcement learning framework](./intro.md), the task assignment mechanism is one of actions an agent should be guided to take while maximizing its Q-Value. Created sub-tasks, along with their completion statuses, feedbacks from sub-agents, configurations of sub-agents of assigned tasks are essential part of agent's state $\mathcal{S}$ representation.

## Task Assignment Mechanism Workflow
The following diagram is a revised version of workflow presented in [brain-storming note](/docs/weekly/brainstorming/agentic-tree#task-assignment-mechanism).

Key Changes:
1. Introduce Task Fullfillment Queue.
2. Formalize Redo, Verify against Objective, or Termination Heuristics by Q-Learning method.
3. Incorporate Sub-Agent Feedback Reports and Corresponding Response Actions.
4. However, update on Budget Recollection and Q-Value Adjustment is not shown here for simplicity, but should be considered as part of the overall workflow.

```mermaid
flowchart TB
    A("Supervisor Node S") --> Obejctive["Objective = Y"];
    Obejctive --> Tasks["` TASK QUEUE:
    sub-task 1
    sub-task 2
    sub-task 3 
    ...`"];
    Tasks --> pop{"Pop First Task"};
    pop --> Task1["sub-task"];
    Task1 --> Decision{"Completed?"};
    Decision -- "YES" --> Update["Update Task Queue"];

    Update -- "Trigger Verification" --> insert{"Insert Verification Task?"};

    Decision -- "NO" --> Report["Report to Supervisor Node S"];
    Report --"Failure Reason to Finish Current sub-task"--> redo{"Redo sub-task?"};

    insert -- "Yes, Add Verification Task to Head of Queue" --> Tasks;
    insert -- "No, Choose Next Task" --> pop;

    redo -- "Yes, Re-insert REVISED sub-task to Head of Queue" --> Tasks;
    redo -- "No, Proceed to Next Task" --> END["END of Supervisor Node S Lifecycle"];
    
    style A fill:#bbf,stroke:#333,stroke-width:2px
    style END fill:#ffcccc,stroke:#333,stroke-width:2px
```