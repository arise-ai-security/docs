# Agent Tree Brainstorming

Research ideas for the tree-structured agentic system.

---

## Introduction
The goal of this brainstrom should settle down our fundamental design to create a tree-like agentic sturcutre to tackle cybersecurity tasks.

We have successfully reproduced and even refactored the SEC-Verifier with a better modular OpenHands core. This improvement allows us to easily test the 3-stage agents (Builder, Exploiter, and Fixer) on OpenAI, Gemini, and Claude models. We discovered that the 3-stage agentic system performance depends on the choice of models. For example, Claude Sonnet 4.5 is able to recreate the builder stage for `php.cve-2018-19935`, but all of powerful OpenAI models (GPT-5, GPT-5-mini, GPT-4o) failed to do so.

The weak point of the current SEC-Verifier is that it only allows a linear chain of agents. For example, if the Builder fails to create a working exploit, the Exploiter will not be able to proceed. To address this limitation, we propose a tree-structured agentic system where multiple agents can be spawned at each stage, and the decision-making agent is able to produce fine-grained actions to fix the issues.

## Core Algorithm of Tree-Structured Agentic System
Our proposed tree-structured system is highly recursive, and actions taken by agent nodes are dependent on the current budget. Every single node is a subclass of a superclass of an abstract AgentNode. This tree system allows multiple models to collaborate, compare and select the best actions to finish a given task, and even backtrack the to redo the failed objective if needed.

### Agent Node Stucture
Each node in the tree represents an agent with the following attributes:
- **Agent Model:** 
- **Current Budget:** 
- **Objective:**
- **Task List:** 
- **Supervisor Node:**
- **Subordiante Nodes:**

### Agent Node Actions
Each node in the tree represents an agent with the following attributes:
- **Agent Model:** 
- **Current Budget:** 
- **Objective:**
- **Task List:** 
- **Supervisor Node:**
- **Subordiante Nodes:**

### Tree Structure Illustration

TODO


```mermaid
flowchart TB
    %% --- Global Components ---
    R["Shared Data Repository (R)<br/>(Metadata, Logs, Artifacts)"];
    style R fill:#ffefd1,stroke:#ffd79b,stroke-width:2px;

    %% --- Client & Root Node ---
    C["Client (C)"] --> M["Manager (M) / Root N0"];
    
    subgraph "Container E_0 (Root Workspace)"
        direction TB
        M --> M_AP["N0: Analyzing Part (AP)"];
        M_AP -.-> R; 
        %% Log analysis
        M_AP --> M_Decision{"ATOMIC or COMPOSITE?"};
        M_Decision -- "COMPOSITE" --> M_WP_D["N0: Worker Part (WP-D)<br/>Decompose to Task 1...k"];
        M_WP_D -.-> R;
        %% Log sub-tasks
    end
    
    M_WP_D --> Spawn1["Spawns Portfolio for Task 1<br/>(e.g., N_1a, N_1b... in new containers)"];

    %% --- Generic Node Lifecycle (Represents any node Ni) ---
    subgraph "Node Ni in Container Ei"
        direction TB
        Start("Start Node Ni<br/>(Receives Task)");
        Start --> AP["Analyzing Part (AP)"];
        AP -.-> R;
        %% Log analysis
        AP --> Decision{"ATOMIC or COMPOSITE?"};
        style Decision fill:#d1ffe,stroke:#9bffd7,stroke-width:2px;

        %% --- Path 1: Composite (Intermediate Node) ---
        Decision -- "COMPOSITE" --> WP_D["Worker Part (WP-D)<br/>Decomposition Mode"];
        WP_D -.-> R;
        %% Log new sub-tasks
        WP_D --> Spawn_Child["Spawns Child Portfolio<br/>(Child nodes in new containers)"];
        Spawn_Child --> End_Composite["Waits for Child Success"];

        %% --- Path 2: Atomic (Leaf Node) ---
        Decision -- "ATOMIC" --> WP_E["Worker Part (WP-E)<br/>Execution Mode (Leaf)"];
        WP_E --> Test["Run Tests in Container Ei"];
        Test -- "PASS" --> Success["Report 'SUCCESS' to Parent"];
        Success -.-> R; 
        %% Save code artifact
        Success --> End_Atomic["Node Task Complete"];

        Test -- "FAIL" --> Failure["Report 'FAILURE' to Parent"];
        Failure --> End_Atomic;
    end
    
    %% --- Linking and Termination ---
    Spawn1 --> Start; 
    %% The spawned node starts its lifecycle
    End_Atomic --> Terminate;
    End_Composite --> Terminate;

    subgraph "Orchestration Logic (External to Node)"
        direction TB
        Terminate["Parent Node Receives 'SUCCESS'"];
        Terminate --> Terminate_Siblings["Terminates Sibling Nodes"];
        Terminate --> Adopt_State["Adopts Successful Code State"];
        Adopt_State --> M_Loop["M: Receives Task 1 Success<br/>Starts Task 2..."];
    end

    %% --- Final Output ---
    M_Loop --> M_Report["M: Reports Final Result"];
    M_Report --> C;

    %% --- Styles ---
    classDef client fill:#d6fadd,stroke:#5cb85c,stroke-width:2px;
    class C client;
    
    classDef root fill:#ececff,stroke:#9696ff,stroke-width:2px;
    class M,M_AP,M_Decision,M_WP_D root;
    
    classDef node fill:#fff,stroke:#ccc,stroke-width:2px;
    class Start,AP,WP_D,WP_E,Test,End_Composite,End_Atomic,Success,Failure node;

    classDef term fill:#ffcccc,stroke:#cc0000,stroke-width:2px;
    class Terminate,Terminate_Siblings,Failure term;

    classDef spawn fill:#f9f,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5;
    class Spawn1,Spawn_Child spawn;
    
    classDef success fill:#dff0d8,stroke:#3c763d,stroke-width:2px;
    class Success,Adopt_State,M_Loop,M_Report success;
```

### Tree Structure Workflow

### Example Use Case
Consider a scenario where the objective is the following:
- **Objective:** Count the number of words in a given text file.

