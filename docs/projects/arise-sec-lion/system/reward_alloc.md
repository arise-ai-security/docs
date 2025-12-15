---
title: Tree-Strucuted Agentic System Reward Allocation Mechanism
sidebar_position: 1
---

# Reward Allocation Overview
This overview is partially adapted from [the brainstorming notes and design documents](/docs/weekly/brainstorming/agentic-tree.md) and improved upon by the real experiments conducted during the development of ARISE SEC-LION based on this GitHub [commit](https://github.com/arise-ai-security/arise-sec-lion/commit/7b58977a52112dc8c342d95490000923cab095aa).

### Porposed Reward Mechanism Workflow
The following diagram illustrates the proposed reward allocation mechanism for the tree-structured agentic system. Each supervisor node allocates budgets to its subordinate nodes based on task types and monitors their performance to adjust budgets accordingly. 

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
    B -- "COMPOSITE" --> B2["Delegate to Subordinate Nodes With Budget X_Y2"];
    
    B2 --> Bchild("Subordinate Node for Y2");
    A_t2 --> Bchild_b[("Budget = X_Y2")];
    Bchild_b -- "Greater Than 0" --> B2;
    Bchild_b -- "Less Than or Equal to 0" --> END["END of Supervisor Node S Lifecycle"];
    Bchild -- "Spawned to be Subtree Superviosr with Objective = X2" --> A;
    Bchild ---> E{"Completion Status?"};
    
    H -- "'SUCCESS'" --> I["S Increases Budget"];
    H -- "'FAILURE'" --> J["S Decreases Budget"];
    
    E -- "YES" --> H;
    E -- "NO" --> J;

    I -- "PLUS Reward Ration * X_Y2" --> A_b;
    J -- "MINUS Penalty Ration * X_Y2" --> A_b;

    style A fill:#bbf,stroke:#333,stroke-width:2px
    style Bchild_b fill:#bdf,stroke:#333,stroke-width:2px
    style A_b fill:#bdf,stroke:#333,stroke-width:2px
    style END fill:#ffcccc,stroke:#333,stroke-width:2px
```
