---
sidebar_position: 3
sidebar_label: API Documentation
---

# CyberGym API Documentation

## Overview

The CyberGym API provides endpoints for submitting and validating vulnerability proofs-of-concept (PoCs) in a controlled environment. The system evaluates whether a submitted PoC can successfully exploit a vulnerability while ensuring it doesn't affect the fixed version of the software.

## Core Concepts

### What is a PoC Submission?
When an AI agent or researcher discovers a potential vulnerability, they create a proof-of-concept (PoC) - typically a small input file or script that triggers the vulnerability. The CyberGym server tests this PoC against both vulnerable and patched versions of the target software to validate the finding.

### Why Docker Execution?
All PoCs are executed inside isolated Docker containers to:
- Prevent malicious code from affecting the host system
- Ensure reproducible testing environments
- Safely test potentially dangerous exploits like buffer overflows or code injection

## API Endpoints

### Public Endpoints

#### POST /submit-vul

| Type | Description |
|------|-------------|
| **Request** | Multipart form with metadata (agent_id, task_id) and binary PoC file |
| **Response** | Returns poc_id, exit_code, and execution output |

This is CyberGym's core validation engine that determines whether a discovered vulnerability is genuine. When an agent submits a PoC, the endpoint spins up isolated Docker containers and executes the PoC against both the vulnerable and fixed versions of the target software. A real vulnerability will crash or exploit the vulnerable version (exit code 0) but fail on the fixed version (non-zero exit code). All submissions are stored in SQLite for historical tracking and logged to the filesystem for audit purposes. This endpoint abstracts away the complexity and danger of executing potentially malicious code, providing a safe, consistent validation mechanism that would be impossible for individual agents to implement securely.

### Private Endpoints

#### POST /submit-fix

| Type | Description |
|------|-------------|
| **Request** | Multipart form with metadata and patch file, requires API key |
| **Response** | Similar to submit-vul |

This endpoint verifies that proposed security patches actually prevent exploitation. When a fix is submitted, it runs the original PoC against the newly patched version to confirm the vulnerability no longer exists. This automated verification is critical because security patches can be ineffective or even introduce new vulnerabilities. The endpoint ensures the integrity of the vulnerability lifecycle from discovery to resolution, updating the database to mark vulnerabilities as properly patched and providing confidence that fixes work as intended without breaking legitimate functionality.

#### POST /query-poc

| Type | Description |
|------|-------------|
| **Request** | JSON with agent_id and optional task_id, requires API key |
| **Response** | Array of all matching PoC records |

This endpoint provides access to the historical submission database, enabling performance analysis and audit trails. It queries the SQLite database to retrieve all PoC records for a specific agent and optionally filters by task. The returned data includes PoC identifiers, hashes, execution results for both vulnerable and fixed versions, and timestamps. This historical data is essential for calculating agent success rates, comparing performance between different AI models, identifying patterns in vulnerability discovery, and providing evidence of findings for security research. Without this endpoint, there would be no way to track agent improvement over time or validate benchmark results.

#### POST /verify-agent-pocs  

| Type | Description |
|------|-------------|
| **Request** | JSON with agent_id, requires API key |
| **Response** | Summary of verification results |

This endpoint ensures the reproducibility of all vulnerabilities discovered by an agent, which is fundamental to scientific validity in security research. It retrieves all PoC records submitted by a specific agent and re-executes each one in fresh Docker containers to confirm they still trigger their respective vulnerabilities. This batch validation process identifies false positives that may have passed initial testing due to environmental factors or timing issues. The endpoint returns a summary showing which PoCs were successfully verified, which failed, and the overall verification rate. This reproducibility check is critical for establishing trust in agent capabilities, ensuring fair benchmark comparisons, and validating that discovered vulnerabilities are genuine rather than artifacts of specific conditions.

## Authentication

Private endpoints require an API key to prevent unauthorized access to sensitive operations:

```bash
X-API-Key: cybergym-030a0cd7-5908-4862-8ab9-91f2bfc7b56d
```

**Why authentication matters**:
- `/submit-fix` modifies the validation state of vulnerabilities
- `/query-poc` exposes submission history and patterns
- `/verify-agent-pocs` triggers resource-intensive Docker operations

## Workflow Integration

### 1. Task Generation Phase
```
cybergym.task.gen_task → Creates task package → Includes submit.sh
```
The generated `submit.sh` script is pre-configured to call `/submit-vul` with the correct server endpoint.

### 2. PoC Development Phase
```
AI Agent → Creates PoC → Calls submit.sh → POST /submit-vul
```
Agents develop PoCs based on task descriptions and submit them for validation.

### 3. Validation Phase
```
Server → Docker execution → Database storage → Return results
```
The server handles all validation logic internally, abstracting Docker complexity from agents.

### 4. Verification Phase
```
verify_agent_result.py → POST /verify-agent-pocs → Re-validation
```
Post-evaluation verification ensures all findings are legitimate and reproducible.
