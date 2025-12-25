---
title: Context Passing With Source Summary Agentic System Design
sidebar_position: 7
---

import CVE from '@site/src/components/cve_source_context_summary';

# Design Choice 6: Source Summary: Richer Context Passing Between Worker Agents and Clearer Source Referencing

## Context Passing With Source Summary Agentic System
This system is building on top of the [context passing plus](./context_passing_plus_tree.md) agentic system by adding source node summary. This change aims to further enhance the context sharing among worker agents by providing them with a comprenhensive summary of the boss agent's prompt. Boss agent's prompt is the only place for users to input their prompts right now. Specifically, for cybersecurity task, it contains significantly rich information such as specific scripts, commits, reports, reproduction etc. to look at. By summarizing this information and sharing it with worker agents, we aim to ensure that all agents have access to the critical details they need to perform their tasks effectively.

## Case Study Task
### Task Objective
This time we deal with the real cybersecurity vulnerability CVE-2023-5586 to test for the effectiveness of this design choice. The prompt is shown below.

```json
{
  "instance_id": "gpac.cve-2023-2838",
  "repo": "gpac/gpac",
  "base_commit": "ba59206b3225f0e8e95a27eff41cb1c49ddf9a37",
  "date": "2023-05-22 10:37:24",
  "project_name": "gpac",
  "lang": "c++",
  "dockerfile": "FROM hwiwonlee/secb.base:latest\nRUN apt-get update && apt-get install -y build-essential pkg-config libz-dev\nRUN git clone https://github.com/gpac/gpac gpac\nRUN git -C gpac checkout ba59206b3225f0e8e95a27eff41cb1c49ddf9a37\nWORKDIR $SRC/gpac\nCOPY build.sh $SRC/",
  "build_sh": "#!/bin/bash -eu\n# Minimized build script with only core build commands\nset -eu\n./configure --static-build --extra-cflags=\"${CFLAGS}\" --extra-ldflags=\"${CFLAGS}\"\nmake -j$(nproc)",
  "work_dir": "/src/gpac",
  "sanitizer": "address",
  "bug_description": "================= Bug Report (1/1) ==================\n## Source: Huntr\n## URL: https://huntr.dev/bounties/711e0988-5345-4c01-a2fe-1179604dd07f\n## Description:\nEnvironment\nDistributor ID: Debian\nDescription:    Debian GNU/Linux bookworm/sid\nRelease:    n/a\nCodename:   bookworm\nVersion\nI checked against the latest release as of 05/18/23 the current master branch at commit a6ae93532ea5615c876c81a6580badbfa01d4383 .\nDescription\nThis AddressSanitizer output is indicating that an out of bounds read occurred in the function gf_filter_get_stats at line 4149 in the file filter_session.c. A bit of debugging leads me to think that the loop at line line 4131 is improperly bounded since at the crash, the loop iterator i equals 0xffff4f07\nfor (i=0; i<f->num_input_pids; i++)  \nPOC\nAFL_MAP_SIZE=260000 ./MP4Box -dash 1000 ./crash_file\nPOC File\nASAN\n[Dasher] No template assigned, using $File$_dash$FS$$Number$\nFailed to connect filter fin PID crash_file to filter rfmpgvid: Feature Not Supported\nBlacklisting rfmpgvid as output from fin and retrying connections\n[MP4Mux] muxing codecID 0 not yet implemented - patch welcome\nFailed to connect filter dasher PID crash_file to filter mp4mx: Feature Not Supported\nBlacklisting mp4mx as output from dasher and retrying connections\nAddressSanitizer:DEADLYSIGNAL\n=================================================================\n==2980979==ERROR: AddressSanitizer: SEGV on unknown address 0x00000000009c (pc 0x7ffff6d5968a bp 0x0c2600000200 sp 0x7fffffff4f90 T0)\n==2980979==The signal is caused by a READ memory access.\n==2980979==Hint: address points to the zero page.\n    #0 0x7ffff6d5968a in gf_filter_get_stats /path/to/gpac/src/filter_core/filter_session.c:4149:32\n    #1 0x7ffff660b68b in on_dasher_event /path/to/gpac/src/media_tools/dash_segmenter.c:501:8\n    #2 0x7ffff6d51fc9 in gf_fs_ui_event /path/to/gpac/src/filter_core/filter_session.c:4180:8\n    #3 0x7ffff6d831da in gf_filter_update_status /path/to/gpac/src/filter_core/filter.c:4738:2\n    #4 0x7ffff6f74b0a in filein_process /path/to/gpac/src/filters/in_file.c:699:3\n    #5 0x7ffff6d74d05 in gf_filter_process_task /path/to/gpac/src/filter_core/filter.c:2894:7\n    #6 0x7ffff6d4153c in gf_fs_thread_proc /path/to/gpac/src/filter_core/filter_session.c:1962:3\n    #7 0x7ffff6d3fd2f in gf_fs_run /path/to/gpac/src/filter_core/filter_session.c:2264:3\n    #8 0x7ffff660245a in gf_dasher_process /path/to/gpac/src/media_tools/dash_segmenter.c:1236:6\n    #9 0x5555556c15fc in do_dash /path/to/gpac/applications/mp4box/mp4box.c:4825:15\n    #10 0x5555556b2a8e in mp4box_main /path/to/gpac/applications/mp4box/mp4box.c:6236:7\n    #11 0x7ffff5846189 in __libc_start_call_main csu/../sysdeps/nptl/libc_start_call_main.h:58:16\n    #12 0x7ffff5846244 in __libc_start_main csu/../csu/libc-start.c:381:3\n    #13 0x5555555dad30 in _start (/path/to/gpac/new_pull_2_build/bin/gcc/MP4Box+0x86d30) (BuildId: 764c86f2d59b4db3d4590a720eca33bd143620a7)\n\nAddressSanitizer can not provide additional info.\nSUMMARY: AddressSanitizer: SEGV /path/to/gpac/src/filter_core/filter_session.c:4149:32 in gf_filter_get_stats\n==2980979==ABORTING\nImpact\nout of bounds read can cause a crash which will affect the system availability or potentially leak memory from the application.\n\nRelevant Links:\nhttps://github.com/gpac/gpac\nhttps://drive.google.com/file/d/1M1NO5DjD_iUmWVP5OzYkmM8npysEDpdd\nhttps://github.com/gpac/gpac/blob/a6ae93532ea5615c876c81a6580badbfa01d4383/src/filter_core/filter_session.c#L4131-L4149",
  "additional_files": [],
  "candidate_fixes": [
    {
      "sha": "711e0988",
      "url": null
    },
    {
      "sha": "c88df2e202efad214c25b4e586f243b2038779ba",
      "url": "https://github.com/gpac/gpac/commit/c88df2e202efad214c25b4e586f243b2038779ba"
    },
    {
      "sha": "a6ae93532ea5615c876c81a6580badbfa01d4383",
      "url": "https://github.com/gpac/gpac/commit/a6ae93532ea5615c876c81a6580badbfa01d4383"
    },
    {
      "sha": "764c86f2d59b4db3d4590a720eca33bd143620a7",
      "url": "https://github.com/gpac/gpac/commit/764c86f2d59b4db3d4590a720eca33bd143620a7"
    }
  ],
  "Instruction": "Please coordinate the vulnerability reproduction process for the provided instance, delegate to specialized agents sequentially: BuilderAgent, ExploiterAgent, FixerAgent."
}
```
### Interactive Diagram

Below is an interactive React Flow diagram that captures a snapshot of the high-level structure. You can pan, zoom, and explore relationships between agents. **Click on the nodes to see their details**.
<CVE/>

### Generated Files 
Below is a snapshot of the files generated by this agentic system for a sample task.

```bash
tree -L 1 output/8a46c6f9-1da4-40c2-966a-097e6922384b                                          (base) 
output/8a46c6f9-1da4-40c2-966a-097e6922384b
├── analysis.md
├── benign.mp4
├── Dockerfile
├── dynamic_results
├── gpac
└── README_ENV.md

3 directories, 4 files
```

### Analysis
1. **Higher Success Rate With Better Context for Workers**: This design achieved the most optimal tree structure among all design choices so far. The workers were able to inherit key information context from the boss node to learn from their completed work. Multiple workers finishes their work more effectively without redoing the work. With the key information summary from the boss node, workers are able to reduce the hallucination and focus on how to actually complete the work assigned to them. For example, the exploiter agent branch is supposed to use the given PoC to verify if the system can be exploited as reported. Previously, workers sometimes misunderstood the task and tried to create their own PoC instead of using the provided one.
2. **Branch Pruning**: As we can see that some workers have already finished the user's anticipated work submitted to the boss node. More specically, the builder agent can build the vulnerable code base successfully, exploiter is able to reproduce the crash with the provided PoC, and fixer can generate the patch (from the provided candidate fixes) to verify that the vulnerability is indeed fixed. However, the tree also contains redundant branches more specifically to research/ documentation work to resolve the underlying root cause of the vulnerablity. In theory, they are important to provide additional context to other workers to understand the vulnerability better. However, in practice, they are not necessary to complete the task successfully, and normally it takes too much time to wait for their answer. Therefore, we can consider pruning those branches in future designs to save computation resources.
7. **Next Steps**:
  1. Incorporate other Non-GPT models.
  2. Branch Pruning.
  3. More diverse case studies.
  4. Remove PoC, candidate fixes from the boss node to test the system's capability to discover them by itself.
