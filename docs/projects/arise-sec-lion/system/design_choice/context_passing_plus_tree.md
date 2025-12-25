---
title: Context Passing Plus Agentic System Design
sidebar_position: 6
---

import CVE from '@site/src/components/cve_context_sharing';

# Design Choice 5: Co-working: Richer Context Passing Between Worker Agents

## Context Passing Plus Agentic System 
This system is building on top of the [context passing](./context_passing_tree.md) agentic system by adding completed work report sharing.

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
echo (PWD) && tree -L 1
~/arise-sec-lion/output/1b4f0017-100b-4556-a21d-74f67a09f7a8
.
|-- analysis_notes.md
|-- Dockerfile
|-- final_report.md
|-- gpac
|-- openssl
|-- poc.c
|-- raw_sources.md
`-- tag_list.txt

3 directories, 6 files
```

### Analysis
1. **Higher Success Rate With Better Context for Workers**: This design achieved the most optimal tree structure among all design choices so far. The workers were able to inherit rich context from their peer workers to learn from their completed work. This significantly improved their understanding of the task requirements, reduced redundant efforts, and avoided repeating work, leading to a more efficient task completion process.
2. **Supervisor Justifications**: The supervisor node provided clear justifications for both the subtask assignment and the budget allocation to the worker node. This transparency in decision-making helped ensure that the worker node understood the importance and scope of its task, leading to more focused and effective work.
3 **Resemble to SecVerifier Work**: With the same prompt used in SecVerifier, this design choice produced a similar vulnerability analysis report as SecVerifier, including builder, exploiter, and fixers. To tackle the same work we require around 20 agents, but SecVerifer activated more than 100 agents. However, our work still requires sound verifications to showcase our systemic capabilities oof demonstrating its effectiveness in handling real-world cybersecurity tasks.
4. **Lack of Model Fallback**: when a model is not available, we do not have a safeguard mechanism to switch to another model.
5. **Data Curation**: Currently, we simply generate a json to represent a row from dataset [CVE Instances](https://huggingface.co/datasets/SongTonyLi/CVE_Instances). We mimic the SecVerifier's instruction to allow our system to create builder, exploiter, and fixer.
6. **Model Impact**: Our system automatically selected GPT-3o over GPT-4o for most of the agents, and this greatly improved the success rate. However, we need to further analyze the impact of different models on the overall performance with more controlled variables.
7. **Key Information Pass Down Issue**: Our user prompt is exclusively passed to the boss node, and it contains rich information about specific script, commit, report, etc. to look at. However, the current pass-down, worker reporting, or cross-worker knowledge sharing are not sufficient to capture those information. This is should be mitigiated if we require the boss agent to publish not just summaries but the key information to the dashboard for all supervisors and workers to reference.