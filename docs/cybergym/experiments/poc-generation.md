---
sidebar_position: 7
---

# PoC Generation

This page provides a high-level overview of how Proof-of-Concept (PoC) exploits are generated within the CyberGym framework using AI agents.

## Overview

The PoC generation process is an iterative, AI-driven approach where an LLM-powered agent autonomously explores a cybersecurity challenge environment, analyzes vulnerabilities, and attempts to generate exploits. The agent operates within a sandboxed environment with access to Linux command-line tools and follows a structured reasoning framework.

## Generation Process

### 1. Environment Setup
The generation process begins with:
- Creating an isolated Docker container environment based on the specified engine (e.g., `cybench`)
- Setting up temporary directories for inputs and logs
- Initializing the working directory (`/tmp/cyber-bench`) where the agent operates
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
- Information about target files (e.g., `repo-vul.tar.gz` containing vulnerable source code, `description.txt` with vulnerability details)
- Submission format and success criteria

### 4. Iterative Reasoning Framework
For each iteration, the agent follows a structured response format:

1. **Reflection**: Analyzes previous observations, errors, and their causes
2. **Research Plan and Status**: Maintains and updates a high-level plan tracking:
   - Overall strategy for solving the challenge
   - Completed steps and current progress
   - Key findings and conclusions from each step
3. **Thought**: Determines the current action, its purpose, and reasoning
4. **Log**: Maintains an enumerated list of executed commands with concise conclusions
5. **Command**: Provides a single executable command to gather information or make progress

### 5. Progressive Exploration
The agent systematically:
- Enumerates files and directories to understand the challenge structure
- Extracts and analyzes target program source code
- Reviews vulnerability descriptions and documentation
- Identifies potential attack vectors
- Develops and tests exploit strategies
- Creates PoC files (binary or text inputs) designed to trigger vulnerabilities

### 6. PoC Submission
Once the agent generates a candidate exploit:
- The PoC is saved as a file in the working directory
- The agent executes `bash submit.sh /path/to/poc` to submit the exploit
- The submission system validates whether the PoC successfully triggers the vulnerability
- Success results in capturing a flag (format: `flag{****************}`)

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

## Limitations and Challenges

As illustrated in the example case:
- The agent may encounter missing files or incomplete challenge setups
- Limited iterations can prevent solving complex challenges
- The agent must work with available information and tools
- Success depends on the LLM's ability to reason about security vulnerabilities

## Success Metrics

A successful PoC generation results in:
- A valid exploit file that triggers the target vulnerability
- Successful submission via the verification system
- Capture of the challenge flag
- Complete documentation of the generation process in logs

## Output and Logging

The system generates comprehensive logs including:
- Task configuration and metadata
- Complete conversation history between iterations
- All executed commands and their outputs
- Final status (success or failure)
- Timestamped execution records for analysis

This structured approach enables systematic evaluation of AI agents' capabilities in cybersecurity tasks and provides insights into their reasoning processes when generating exploits.
