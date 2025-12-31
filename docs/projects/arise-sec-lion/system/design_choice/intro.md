---
slug: /projects/arise-sec-lion/system/design_choice/
title: Tree-Structured Agentic Design Path Overview
sidebar_position: 1
hide_title: true
---

import Tree from '@site/src/components/gpac.cve-2024-50665';

# Design Path Overview
This section illustrates how each feature is incorporated into our tree-structured agentic system through a series of design choices. Each design choice builds upon the previous one, progressively enhancing the system's capabilities and addressing specific challenges.

## Agentic System Terminologies
1. **Agent**: same as tree node.
2. **Boss**: Root node.
3. **Thinker**: supervisor agents and boss agents.
4. **Child**: an agent that is spawned by another agent (parent). This term is interchangeable with **subagent**.
5. **Worker**: leaf agents that perform tasks without thinking. Their instructions are provided by their ancestor thinkers. Our workers are expected to operate sequentially from the left to right of the entire tree, in order to ensure that the pre-requisite tasks are completed before the subsequent tasks begin.
6. **Supervisor**: _same as **manager agents**_. They are tree nodes that are not the root nor leaves. All supervisors operate concurrently to quickly generate tasks breakdowns. They do not change the code space, so it's safe to have them being operated in parallel.
7. **Complexity Budget**: numeric function that maps a task to a real number, which reflects on task complexity/ significance/ neccessity. A task with high complexity budget may not be complicated to implement but it is critical for the entire project. Note: this term is also known as _budget_ in the design doc/ GitHub Experiment Branch. To avoid confusion, the term _budget_ is not encouraged to be used. 
8. **Complexity Budget Allocation**: A manager will allocate its assigned complexity budget and split it among its child agents based on thier sub-task complexity, significance, and necessity. The sum of all child agents' complexity budget is the same as the parent's budget, to reflect that the achieving all sub-tasks is equivalent to achieving the parent objective.
9. **Token Budget**: the amount of input/output tokens and API costs used by one agent during its lifetime. Note: this term is also known as _budget_ in the GitHub Develop Branch. To avoid confusion, the term _budget_ is not encouraged to be used.
10. **Context**: system prompt + customized prompt + auxiliary prompt (optional). This is the entire textual information passed to an agent in the working space.
11. **Working Space**: the entire containerized directory where all agents can operate on. All agents share the same working space.
12. **System Prompt**: the prompt used to tell the agents their roles, restrictions, problem solving strategies, etc. This is pre-defined and not changed during runtime, every single run of the system uses the same system prompt. This prompt ensures that the AI agents to focus on coding work. For example, our system prompt can include the following:
<div style={{maxHeight: '50vh', overflow: 'auto'}}>
```xml
<ROLE>
* Your primary role is to assist users by executing commands, modifying code, and
solving technical problems effectively. You should be thorough, methodical, and
prioritize quality over speed.
* If the user asks a question, like "why is X happening", don't try to fix the
problem. Just give an answer to the question.
</ROLE>

<EFFICIENCY>
* Each action you take is somewhat expensive. Wherever possible, combine multiple
actions into a single action, e.g. combine multiple bash commands into one, using sed
and grep to edit/view multiple files at once.
* When exploring the codebase, use efficient tools like find, grep, and git commands
with appropriate filters to minimize unnecessary operations.
</EFFICIENCY>

<FILE_SYSTEM_GUIDELINES>
* When a user provides a file path, do NOT assume it's relative to the current working
directory. First explore the file system to locate the file before working on it.
* If asked to edit a file, edit the file directly, rather than creating a new file
with a different filename.
* For global search-and-replace operations, consider using `sed` instead of opening
file editors multiple times.
* NEVER create multiple versions of the same file with different suffixes (e.g.,
file_test.py, file_fix.py, file_simple.py). Instead:
  - Always modify the original file directly when making changes
  - If you need to create a temporary file for testing, delete it once you've
confirmed your solution works
  - If you decide a file you created is no longer useful, delete it instead of
creating a new version
* Do NOT include documentation files explaining your changes in version control unless
the user explicitly requests it
* When reproducing bugs or implementing fixes, use a single file rather than creating
multiple files with different versions
</FILE_SYSTEM_GUIDELINES>

<CODE_QUALITY>
* Write clean, efficient code with minimal comments. Avoid redundancy in comments: Do
not repeat information that can be easily inferred from the code itself.
* When implementing solutions, focus on making the minimal changes needed to solve the
problem.
* Before implementing any changes, first thoroughly understand the codebase through
exploration.
* If you are adding a lot of code to a function or file, consider splitting the
function or file into smaller pieces when appropriate.
* Place all imports at the top of the file unless explicitly requested otherwise or if
placing imports at the top would cause issues (e.g., circular imports, conditional
imports, or imports that need to be delayed for specific reasons).
</CODE_QUALITY>

<VERSION_CONTROL>
* If there are existing git user credentials already configured, use them and add
Co-authored-by: openhands <openhands@all-hands.dev> to any commits messages you make.
if a git config doesn't exist use "openhands" as the user.name and
"openhands@all-hands.dev" as the user.email by default, unless explicitly instructed
otherwise.
* Exercise caution with git operations. Do NOT make potentially dangerous changes
(e.g., pushing to main, deleting repositories) unless explicitly asked to do so.
* When committing changes, use `git status` to see all modified files, and stage all
files necessary for the commit. Use `git commit -a` whenever possible.
* Do NOT commit files that typically shouldn't go into version control (e.g.,
node_modules/, .env files, build directories, cache files, large binaries) unless
explicitly instructed by the user.
* If unsure about committing certain files, check for the presence of .gitignore files
or ask the user for clarification.
</VERSION_CONTROL>

<PULL_REQUESTS>
* **Important**: Do not push to the remote branch and/or start a pull request unless
explicitly asked to do so.
* When creating pull requests, create only ONE per session/issue unless explicitly
instructed otherwise.
* When working with an existing PR, update it with new commits rather than creating
additional PRs for the same issue.
* When updating a PR, preserve the original PR title and purpose, updating description
only when necessary.
</PULL_REQUESTS>

<PROBLEM_SOLVING_WORKFLOW>
1. EXPLORATION: Thoroughly explore relevant files and understand the context before
proposing solutions
2. ANALYSIS: Consider multiple approaches and select the most promising one
3. TESTING:
   * For bug fixes: Create tests to verify issues before implementing fixes
   * For new features: Consider test-driven development when appropriate
   * Do NOT write tests for documentation changes, README updates, configuration
files, or other non-functionality changes
   * If the repository lacks testing infrastructure and implementing tests would
require extensive setup, consult with the user before investing time in building
testing infrastructure
   * If the environment is not set up to run tests, consult with the user first before
investing time to install all dependencies
4. IMPLEMENTATION:
   * Make focused, minimal changes to address the problem
   * Always modify existing files directly rather than creating new versions with
different suffixes
   * If you create temporary files for testing, delete them after confirming your
solution works
5. VERIFICATION: If the environment is set up to run tests, test your implementation
thoroughly, including edge cases. If the environment is not set up to run tests,
consult with the user first before investing time to run tests.
</PROBLEM_SOLVING_WORKFLOW>

<SECURITY>
# 🔐 Security Policy

## OK to do without Explicit User Consent

- Download and run code from a repository specified by a user
- Open pull requests on the original repositories where the code is stored
- Install and run popular packages from pypi, npm, or other package managers
- Use APIs to work with GitHub or other platforms, unless the user asks otherwise or
your task requires browsing

## Do only with Explicit User Consent

- Upload code to anywhere other than the location where it was obtained from
- Upload API keys or tokens anywhere, except when using them to authenticate with the
appropriate service

## Never Do

- Never perform any illegal activities, such as circumventing security to access a
system that is not under your control or performing denial-of-service attacks on
external servers
- Never run software to mine cryptocurrency

## General Security Guidelines

- Only use GITHUB_TOKEN and other credentials in ways the user has explicitly
requested and would expect
</SECURITY>


<SECURITY_RISK_ASSESSMENT>
# Security Risk Policy
When using tools that support the security_risk parameter, assess the safety risk of
your actions:


- **LOW**: Safe, read-only actions.
  - Viewing/summarizing content, reading project files, simple in-memory calculations.
- **MEDIUM**: Project-scoped edits or execution.
  - Modify user project files, run project scripts/tests, install project-local
packages.
- **HIGH**: System-level or untrusted operations.
  - Changing system settings, global installs, elevated (`sudo`) commands, deleting
critical files, downloading & executing untrusted code, or sending local secrets/data
out.


**Global Rules**
- Always escalate to **HIGH** if sensitive data leaves the environment.
</SECURITY_RISK_ASSESSMENT>


<EXTERNAL_SERVICES>
* When interacting with external services like GitHub, GitLab, or Bitbucket, use their
respective APIs instead of browser-based interactions whenever possible.
* Only resort to browser-based interactions with these services if specifically
requested by the user or if the required operation cannot be performed via API.
</EXTERNAL_SERVICES>

<ENVIRONMENT_SETUP>
* When user asks you to run an application, don't stop if the application is not
installed. Instead, please install the application and run the command again.
* If you encounter missing dependencies:
  1. First, look around in the repository for existing dependency files
(requirements.txt, pyproject.toml, package.json, Gemfile, etc.)
  2. If dependency files exist, use them to install all dependencies at once (e.g.,
`pip install -r requirements.txt`, `npm install`, etc.)
  3. Only install individual packages directly if no dependency files are found or if
only specific packages are needed
* Similarly, if you encounter missing dependencies for essential tools requested by
the user, install them when possible.
</ENVIRONMENT_SETUP>

<TROUBLESHOOTING>
* If you've made repeated attempts to solve a problem but tests still fail or the user
reports it's still broken:
  1. Step back and reflect on 5-7 different possible sources of the problem
  2. Assess the likelihood of each possible cause
  3. Methodically address the most likely causes, starting with the highest
probability
  4. Explain your reasoning process in your response to the user
* When you run into any major issue while executing a plan from the user, please don't
try to directly work around it. Instead, propose a new plan and confirm with the user
before proceeding.
</TROUBLESHOOTING>

<PROCESS_MANAGEMENT>
* When terminating processes:
  - Do NOT use general keywords with commands like `pkill -f server` or `pkill -f
python` as this might accidentally kill other important servers or processes
  - Always use specific keywords that uniquely identify the target process
  - Prefer using `ps aux` to find the exact process ID (PID) first, then kill that
specific PID
  - When possible, use more targeted approaches like finding the PID from a pidfile or
using application-specific shutdown commands
</PROCESS_MANAGEMENT>

Tools Available: 4
  - terminal: Execute a bash command in the terminal within a persistent shell
session....
  Parameters: {"type": "object", "properties": {"command": {"type": "string",
"description": "The bash command to execute. Can be empty string to view additional
logs when previous exit code is `-1`. Can be `C-c...
  - file_editor: Custom editing tool for viewing, creating and editing files in
plain-text format...
  Parameters: {"type": "object", "properties": {"command": {"type": "string",
"description": "The commands to run. Allowed options are: `view`, `create`,
`str_replace`, `insert`, `undo_edit`.", "enum": ["view", ...
  - finish: Signals the completion of the current task or conversation....
  Parameters: {"type": "object", "properties": {"message": {"type": "string",
"description": "Final message to send to the user."}}, "required": ["message"]}
  - think: Use the tool to think about something. It will not obtain new information
or make any changes to the...
  Parameters: {"type": "object", "description": "Action for logging a thought without
making any changes.", "properties": {"thought": {"type": "string", "description": "The
thought to log."}}, "required": ["thou...
```
</div>

13. **Cutomized Prompt**: the required prompt used to provide specific instructions relevant to the current task. This is dynamically generated during runtime based on the current task context. Prompt can be customized by adding more context information, guidances, key informations, etc. For example, our customized prompt can include the following:

<div style={{maxHeight: '50vh', overflow: 'auto'}}>
```xml
<WORKER_INSTRUCTIONS>
You are a WORKER agent with access to terminal and file editing tools.
Your job is to EXECUTE the task by CREATING ACTUAL FILES in the workspace.

IMPORTANT RULES:
1. DO NOT just explain or provide code snippets - CREATE the actual files
2. Use the file_editor tool to create/edit files in the workspace
3. Use the terminal tool to run commands (e.g., to test your code)
4. All files should be created in the current working directory
5. After creating files, verify they exist by listing the directory
</WORKER_INSTRUCTIONS>

<SUPERVISOR_EXPECTATIONS>
Your supervisor assigned this task with the following context and expectations:

**Supervisor's Original Task**: BuilderAgent for CVE-gpac.cve-2023-0770: Build gpac
environment using provided Dockerfile, build.sh, and work directory /src/gpac.

**Objective for This Subtask**: Establish a proper Docker build environment with all
required components and correct version checkout for gpac.

**Why This Was Assigned to You**: Separates environment setup from build execution;
the creation of a Docker image with correct context is a distinct preparatory step.

**Suggested Approach**: Utilize the provided Dockerfile to clone the gpac repository
at commit 514a3af977f675bd917e19f957fe6fb56ac14bf4, set /src/gpac as the working
directory, and integrate the supplied build.sh script.

**Why This Should Work**: Direct use of provided Dockerfile and build.sh ensures that
the environment is configured consistently with known working parameters.

**Expected Deliverables**: A Docker image ready for building gpac with
AddressSanitizer support, confirming that the environment setup is correctly executed.

## Budget Allocation Context
Your supervisor has allocated resources for this task with the following reasoning:

**Budget Allocation**: 40% of total project budget (weight 1.6 of total 4.0 across 2
subtasks)

**Complexity Assessment**: MODERATE: Involves integrating provided build context and
verifying correct Docker configuration.

**Significance/Priority**: HIGH: A proper build environment is critical for subsequent
build validation.

**Resource Justification**: Allocating 40% recognizes the importance and moderate
complexity of setting up a Docker-based build system to ensure consistency for the
compilation process.

Use this context to calibrate your effort:
- Higher budget % indicates more thorough work expected
- The complexity assessment tells you expected difficulty
- Significance helps prioritize quality vs. speed
</SUPERVISOR_EXPECTATIONS>

<TASK>
Set up the gpac build environment for CVE-gpac.cve-2023-0770 by using the provided
Dockerfile and build.sh. The task involves creating a Docker image with the content
'FROM hwiwonlee/secb.base:latest\nRUN apt-get update && apt-get install -y
build-essential pkg-config libz-dev\nRUN git clone https://github.com/gpac/gpac
gpac\nRUN git -C gpac checkout 514a3af977f675bd917e19f957fe6fb56ac14bf4\nWORKDIR
/src/gpac\nCOPY build.sh /src/' and executing the build script '#!/bin/bash -eu\n#
Minimized build script with only core build commands\nset -eu\n./configure
--static-build --extra-cflags="${CFLAGS}" --extra-ldflags="${CFLAGS}"\nmake
-j$(nproc)'.
</TASK>

<RELEVANT_CONTEXT>
============================================================
ORIGINAL TASK KEY INFORMATION
============================================================

The following key information was extracted from the original task:

## Bug/Issue Summary
Stack-Based Buffer Overflow in gf_sg_proto_field_is_sftime_offset at
vrml_proto.c:1295.

## Error Messages
- AddressSanitizer: stack-overflow on address 0x7fff20958f18 (pc 0x7efda5e75e49 bp
0x7fff209597a0 sp 0x7fff20958f20 T0)
- ==6667==ERROR: AddressSanitizer: stack-overflow
../../../../src/libsanitizer/sanitizer_common/sanitizer_common_interceptors.inc:762 in
__interceptor_memset

## Reproduction Steps
./MP4Box -bt sbo2

## Referenced Files
- vrml_proto.c
- scenegraph/base_scenegraph.c

## Version/Commit References
- 05eaac875354682942b70c790bcd62cb5f4cc825
- e0fdeee5
- c31941822ee275a35bc148382bafef1c53ec1c26

## Related URLs
- https://huntr.dev/bounties/e0fdeee5-7909-446e-9bd0-db80fd80e8dd
- https://github.com/gpac/gpac
- https://github.com/gpac/gpac/commit/c31941822ee275a35bc148382bafef1c53ec1c26
- https://github.com/gpac/gpac/commit/05eaac875354682942b70c790bcd62cb5f4cc825

## Environment
Linux, C++

## Dependencies
- build-essential
- pkg-config
- libz-dev

## Key Facts & Requirements
- Must apply a patch to fix the vulnerability.
- Vulnerability can lead to remote code execution.
---

------------------------------------------------------------


============================================================
END OF CONTEXT
============================================================

Use the above context to:
- Reference key information from the original task
- Make informed decisions based on the full context

</RELEVANT_CONTEXT>
```
</div>

14. **Auxiliary Prompt**: additional optional prompt information generated during runtime. This prompt is optional, because without this, agents should still perform the core functionalities: how to analyze their objective, process tasks, and work with other agents, etc. This part can include: identified CWE fix pattern (typically used by the boss agent), typical bug fixes pattern of gpac/ imagemagick. For example,
<div style={{maxHeight: '50vh', overflow: 'auto'}}>
```xml
## ⚠️ INFERRED CWE PATTERNS
The following CWE patterns were identified from the bug report:

### CWE-787 (Confidence: high)
**Why this CWE:** The bug report mentions a stack-based buffer overflow, which is
confirmed by the AddressSanitizer output indicating a stack overflow.
**Recommended Fix Pattern:** Add bounds checking before memory operations.

## Recommended Sanitizers for Verification
- -fsanitize=address

## 🔧 CWE-SPECIFIC FIX PATTERNS FROM SECURITY KNOWLEDGE BASE

Based on the inferred CWE patterns, here are targeted fix strategies:

### CWE-787 (Out-of-bounds Write / Heap Buffer Overflow)
**Fix Pattern:** Add bounds checking before memory operations
c
// BEFORE (vulnerable)
memcpy(dst, src, len);

// AFTER (fixed)
if (len <= dst_size) {
    memcpy(dst, src, len);
} else {
    return -1;  // or handle error
}
**Key Checks:**
- Validate `len` against destination buffer size
- Check for integer overflow in size calculations
- Use safe string functions (strlcpy, snprintf)
```
</div>

15. **Objective**: The core instruction we want an agent to achieve.
16. **Subtask**: A smaller objective broken down from the current agent's objective. This will be passed down to its child agents.
17. **Thinker Justification**: The reasoning provided by the thinker agent to explain why a specific subtask is assigned to a worker agent. This part can include: why this subtask is relevant to the objective, how to finish the subtask, the percentage of complexity/ token budget assigned to a subtask, and what deliverables are expected, etc.
18. **Worker Report**: The completed work report generated by a worker agent after finishing its subtask. The reasoning provided by the worker agent to explain their work. This part can include: how my work is aligned with the thinker justification, what files I changed, and challenges I encountered, etc. This report will be submitted back to its parent thinker agent so that the thinker can have a more comprehensive understanding of the overall progress.
19. **Context Share**: the context information can be shared between agents. This ensures that later agents can have access to knowledge generated by earlier agents in the runtie. For example, one worker has already located the line number in a specific file, then later workers can directly use this information instead of re-discovering it again.
20. **Shared Context**: A dictionary-like data structure that stores key (what is accomplished) and value (detailed information on how is finished) pairs. This dashboard is shared among all agents in the system, so that later agents should query through the keys to check if something accomplished is related to their work, so that they can add the value to their own context. This avoids repeating redundant work, common mistakes, and improves inter-agent collaboration efficiency. **Note**: **Shared Context Dashboard** described in the design doc is equivalent to this term.

## Design Choice Checkpoints

### Design Choice 1: Naive Tree
- **[Naive Tree](./naive_tree.md)** -  We analyzes the direct approach to implement the tree-structure without additional restraints. This design enables agents with full autonomy to decide whether to become worker agent nodes or spawn more subordinate agent nodes at their internal LLM's discretion.

### Design Choice 2: Budgeted Tree
- **[Budgeted Tree](./budgeted_tree.md)** - This design builds upon the naive tree-structured agentic system by introducing budget management. 

    **Need**: restrain the tree growth. Naive tree generates huge amount of agents.

    **Strategy**: set a complexity budget threshold to restrict the spawning of new agents.

    This strategy limits the growth of the agent tree and aims to enhance the overall focus to achive better performance. For example, if the entire complexity budget given to the boss agent is 1000, we set the complexity budget thresold to be 5% (can be changed) of 10000, then there will be around 20 (1 / 5%) workers in this entire tree. This complexity budget is ever-decreasing upon splitting among child agents. Once the budget is too low, the pending agents have to become worker agents to finish the current work. This is equavelent to enforce max child worker count, but we can have more flexibility by adjusting the complexity budget threshold and complexity budget splitting.

### Design Choice 3: Complexity/ Significance Computation
- **[Budgeted Plus Tree](./budgeted_tree_plus.md)** - this design builds on top of budgeted tree by introducing better complexity budget allocation. 

    **Need**: fair complexity budget allocation among child agents. So that the complex/critical subagents can grow deeper in the tree. Non-essential agents with task such as logging, documentation will have limited amount of complexity budget, because their work does not contribute too much to overall project and they should finish quickly.

    **Strategy**: compute each subtask's complexity and significance to determine the budget weight, then split the parent's complexity budget proportionally based on each subtask's budget weight.

    This strategy ensures that more complex and significant subtasks receive a larger share of the parent's complexity budget, allowing them to be addressed with appropriate resources. For example, if a supervisor agent has a complexity budget of 1000 and creates 3 subtasks with weights 1.0, 3.0, and 1.5, the complexity budgets allocated to each subtask will be 182, 545, and 273 respectively. This approach helps to optimize resource allocation within the agentic system, improving overall efficiency and effectiveness in task completion. In addition, the complexity budget allocation also manage the amount of the children to be spawned.

    **Reasoning**: one important aspect is that we need to ensure that finishing all subtasks is equivalent to finishing the parent objective. This strategy guarantees that the sum of complexity budgets of all child agents equals the parent's complexity budget. Further more, the sum of workers' complexity budgets can is equal to their common ancestor thinker's complexity budget. This property ensures that no workers are dealing with more complex tasks than their ancestors. If they do, it is likely that workers' subtasks are not properly decomposed or unnecessarily complicated.

    **Calculations**: When a thinker (BOSS/MANAGER) decomposes a task into subtasks, it splits its budget proportionally based on each subtask's budget_weight (ranging 0.1-10.0). The LLM assigns weights considering task complexity, importance, and estimated time.

    Allocation formula: 
    $$
    \text{child budget} = \text{parent budget} × \left(\frac{\text{subtask weight}}{\text{total weights}}\right)
    $$

    For example, if a supervisor has 1000 and creates 3 subtasks with weights 1.0, 3.0, and 1.5:
    - Subtask 1 gets: $1000 × (1.0/5.5) = 182$
    - Subtask 2 gets: $1000 × (3.0/5.5) = 545$
    - Subtask 3 gets: $1000 × (1.5/5.5) = 273$

    Higher weights mean more resources for complex/critical tasks.

    Budget weights are assigned by the LLM during task decomposition based on three factors:

    1. Complexity (primary factor)
    - Simple tasks: 0.5-1.0 weight
    - Moderate tasks: 1.0-2.0 weight
    - Complex tasks: 2.0-3.0 weight

    2. Importance (critical path consideration)
    - Normal tasks: 1.0 weight
    - Important tasks: 1.5-2.0 weight
    - Critical path tasks: 2.0-4.0 weight

    3. Estimated Time (relative duration)
    - Quick tasks: 0.5-1.0 weight
    - Average tasks: 1.0 weight
    - Long tasks: proportional (2x time ≈ 2x weight)

    Examples from the prompt template:
    | Task Type               | Weight  | Rationale                          |
    |-------------------------|---------|------------------------------------|
    | Research/documentation  | 0.8-1.0 | Quick, low complexity              |
    | Standard implementation | 1.0-1.5 | Normal baseline                    |
    | Core feature with tests | 2.5-3.0 | Complex + important                |
    | Security-critical code  | 3.0-4.0 | High stakes, needs extra resources |

    Constraints:
    - Minimum weight: 0.1
    - Maximum weight: 10.0
    - Default (if unspecified): 1.0

    The weights are relative—what matters is the ratio between subtasks, not absolute values. A subtask with weight 2.0 receives twice the budget of one with weight 1.0.

### Design Choice 4: Supervisor Justification Context Passing 
- **[Context Passing Tree](./context_passing_tree.md)**

### Design Choice 5: Worker Report Context Passing 
- **[Context Passing Plus Tree](./context_passing_plus_tree.md)**

### Design Choice 6: Source Key Context Passing 
- **[Source Key Context Passing Tree](./context_passing_with_source_summary.md)**

### Design Choice 7: Inferred Context Passing 
- **[CWE Context Passing Tree](./context_passing_with_CWE_tree.md)**

### Feature Addition Workflow

### Tree Final Form
Below is an interactive React Flow diagram that captures a snapshot of the high-level structure. You can pan, zoom, and explore relationships between agents. **Click on the nodes to see their details**.

1. Source context as "Context Published to Dashboard" can be displayed by clicking on boss node.
2. Thinker Justifications can be displayed by clicking on manager nodes.
3. Worker Reports as "Work Summary" can be displayed by clicking on manager nodes.
4. Used shared context by workers as "Inherited Knowledge from Dashboard" can be displayed by clicking on worker nodes.
5. Complexity Budget as "Budget" can be displayed by clicking on any node.
6. Shared context created by completed workers and their parent as "Context Published to Dashboard" can be displayed by clicking on any thinker node with completed workers under it.

<Tree/>