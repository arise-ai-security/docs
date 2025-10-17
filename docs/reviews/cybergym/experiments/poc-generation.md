---
sidebar_position: 7
---

# PoC Generation

This page provides a high-level overview of how Proof-of-Concept (PoC) exploits are generated within the CyberGym framework using AI agents.

## Overview

The PoC generation process is an iterative process that operates within a sandboxed Docker environment with access to Linux command-line tools and follows a structured reasoning framework.

## Generation Process

### 1. Environment Setup
The generation process begins with:
- Creating an isolated Docker container environment based on the specified engine (e.g., `cybench`)
- Setting up temporary directories for inputs and logs
- Initializing the working directory (`/tmp/cyber-bench`) where the agent is allowed to operate
- Providing the agent with the necessary files and challenge description

### 2. Agent Configuration
The AI agent is configured with:
- **Role**: Cybersecurity expert conducting vulnerability assessments
- **Capabilities**: Access to Kali Linux terminal commands
- **Constraints**: Limited to the working directory but with full host machine access
- **Model**: Specified LLM (e.g., GPT-4) with appropriate temperature settings

### 3. Task Description
The agent receives:
- A challenge description explaining the objective (generate an exploit PoC)
- Initial files including `README.md` with instructions and `submit.sh` for submission
- Prompt the agent with "you do not know anything about this problem so far."

### 4. Iterative Reasoning Framework With Required Response Format
For each iteration, the agent follows a structured response format:

1. **Reflection**: Analyzes previous observations, errors, and their causes
2. **Research Plan and Status**: Maintains and updates a high-level plan tracking:
   - Overall strategy for solving the challenge
   - Completed steps and current progress
   - Key findings and conclusions from each step
3. **Thought**: Determines the current action, its purpose, and reasoning
4. **Log**: Maintains an enumerated list of executed commands with concise conclusions
5. **Command**: Provides a single executable command to gather information or make progress

### 5. Example Iteration Response
Provide some examples to help agent follow the instructions.

### 6. Progressive Exploration
The agent systematically:
- Enumerates files and directories to understand the challenge structure
- Extracts and analyzes target program source code
- Reviews vulnerability descriptions and documentation
- Identifies potential attack vectors
- Develops and tests exploit strategies
- Creates PoC files (binary or text inputs) designed to trigger vulnerabilities

### 7. PoC Submission
Once the agent generates a candidate exploit:
- The PoC is saved as a file in the working directory
- The agent executes `bash submit.sh /path/to/poc` to submit the exploit
- The submission system validates whether the PoC successfully triggers the vulnerability
- Success results in capturing a flag (format: `flag{****************}`)
- Please check [PoC Verification Page](poc-verification.md) page for more details.

## Key Characteristics

### Autonomous Operation
- The agent independently decides which commands to run
- No human intervention during the generation process
- Self-directed exploration and problem-solving

### Structured Reasoning
- Maintains a detailed research plan throughout the process
- Logs all actions for reproducibility and analysis
- Iteratively refines approach based on observations

### Constrained Environment
- Maximum number of iterations (e.g., 10) to prevent infinite loops
- UTF-8 text-only focus (ignores binary media files)
- Single command per iteration for clarity and debugging

### Learning from Failures
- Analyzes errors and adjusts strategy accordingly
- Revisits and updates the research plan based on new information
- Attempts alternative approaches when blocked

## Output and Logging

The system generates comprehensive logs including:
- Task configuration and metadata
- Complete conversation history between iterations
- All executed commands and their outputs
- Final status (success or failure)
- Timestamped execution records for analysis
