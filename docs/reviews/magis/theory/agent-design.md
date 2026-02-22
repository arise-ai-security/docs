---
sidebar_position: 2
---

# Agent Design & Collaborative Process

MAGIS draws inspiration from **GitHub Flow**, the human workflow paradigm used by many software teams. The framework assigns four specialized roles to LLM-based agents, each tailored for software evolution rather than building from scratch.

## Agent Roles

### Manager
The Manager coordinates the entire process: decomposing issues into tasks, assembling the development team, and organizing a kick-off meeting. Unlike human managers who assign tasks to a pre-formed team, the MAGIS Manager **first decomposes the issue into tasks, then designs Developer agents** to match those tasks. This improves team flexibility and adaptability.

### Repository Custodian
The Custodian locates files relevant to the issue within the repository. Since LLMs cannot efficiently browse entire repositories (due to context length limits and performance degradation on long inputs), the Custodian uses a combination of **BM25 retrieval** and **LLM-based filtering** with a memory mechanism to efficiently narrow down candidate files.

### Developer
Developer agents work on assigned file-level tasks. The framework decomposes code modification into sub-operations (line locating → code splitting → code generation → replacement), leveraging LLMs' strength in code generation while mitigating their weakness in direct code change generation. Multiple Developers can work in parallel on independent tasks.

### QA Engineer
Each Developer is paired with a QA Engineer for task-specific code review. The QA Engineer reviews code changes and provides feedback, prompting revisions until quality standards are met or an iteration limit is reached. This addresses the common problem of delayed or overlooked code reviews in software development.

## Collaborative Process

### Planning Phase

The planning phase involves three steps:

#### 1. Locating Code Files
The Repository Custodian uses a two-stage process:

1. **BM25 ranking**: Rank all repository files by relevance to the issue description, select top-k candidates
2. **LLM-based filtering**: For each candidate file, use the LLM to determine relevance and filter out irrelevant files

A **memory mechanism** avoids redundant LLM queries: if a file was previously summarized, only the diff since the last version is processed. The summary of the newer version combines the previous summary with a "commit message" describing the changes — reducing context length while maintaining accuracy.

#### 2. Team Building
The Manager:
1. Analyzes the GitHub issue with the located files
2. Breaks the issue into **file-level tasks** — each task targets a specific code file
3. Designs a **personalized role description** for each Developer agent based on its assigned task

This approach simplifies the problem: each Developer handles a sub-task rather than the entire issue.

#### 3. Kick-off Meeting
The Manager organizes a circular-speech meeting with all Developers to:
- **Validate** that tasks are reasonable and collectively resolve the issue
- **Determine dependencies** — which tasks can run concurrently vs. sequentially

After the meeting, Developers adjust their role descriptions based on the discussion, and the Manager generates a **main work plan** as executable code.

### Coding Phase

For each file-level task, the Developer and QA Engineer collaborate iteratively:

1. **Line locating**: The Developer identifies line ranges `{[s'_i, e'_i]}` to modify
2. **Code splitting**: The original file is split into parts to modify (`old_part`) and parts to retain
3. **Code generation**: The Developer generates `new_part` to replace `old_part`
4. **Code review**: The QA Engineer reviews the diff and produces a decision
   - If **rejected**: feedback is provided and the Developer revises (next iteration)
   - If **approved**: the code change is finalized
5. This iterates until approval or a maximum iteration count

All finalized file-level code changes are merged into the repository-level code change as the issue solution.

## Design Rationale

The multi-step coding process is motivated by the empirical findings:

- **File localization** is handled by the Repository Custodian's BM25 + LLM filtering, addressing the file-level challenge
- **Line localization** is explicitly separated as a sub-step, addressing the line-level challenge identified in the empirical study
- **Code generation** (rather than direct code change generation) leverages LLMs' strongest capability
- **QA review** provides iterative refinement, reducing errors from single-pass generation
- **Task decomposition** reduces complexity per agent, addressing the negative correlation between complexity and resolution success
