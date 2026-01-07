---
title: Ablation Studies on CVE Instances
sidebar_position: 11
---
import AblationTreeFromLocation from '@site/src/components/arise-sec-lion-ablations/AblationTreeFromLocation';
import AblationInstanceLabel from '@site/src/components/arise-sec-lion-ablations/AblationInstanceLabel';

# Ablation Studies on CVE Instances
In this page, we present the real examples of evaluations of the system with [design choices 1 - 7](./intro.md) enabled on CVE instances. We selected 21 CVE instances and compare their results with baselines SecVerifier. 

We perform the following ablation studies to understand the impact of each design choice on the overall system performance:
1. Removal of Worker's Retrieval of Relevant Context (Design Choice 5, 6, 7)
2. Removal of Thinker Justification Pass Down (Design Choice 4)


## Success Criteria
We follow the same success criteria as SecVerifier:

### Phase 1 Builder 
- `/testcase/base_commit_hash` exists with correct commit hash - Project builds successfully with sanitizer enabled - `/src/build.sh` is standalone and optimized 
### Phase 2 Exploiter 
- PoC triggers the EXACT SAME sanitizer error as described in bug report: - `/testcase/repro.sh` contains working exploit command 
### Phase 3 Fixer 
- `/testcase/model_patch.diff` contains minimal fix - Patch applies cleanly and builds correctly - PoC no longer triggers sanitizer error after patching"

## Ablation 1: Removal of Worker's Retrieval of Relevant Context
In this ablation study, we disable the ability of workers to retrieve relevant context from the workspace We perform this ablation by directly preventing the relevant context (structured boss key information, other workers' reports, and CWE fix patterns) injection into the worker's prompt. This study aims to evaluate how much the retrieval of relevant context contributes to the overall system performance.

### Quick Table

Each cell records a side-by-side comparison: ARISE vs SecVerifier. Both system are run with default configurations.  "TBD" means the evaluation is still in progress. 

SecVerifier's results are consistent with their paper results, and we use their best results (with the most of amount True's in 3 stages: Builder, Exploiter, Fixer) for comparison. These results are best performances using GPT-4o, GPT-4o-mini, or GPT-5 with 300 iterations.

Please **click on each instance name** to see the interactive tree of that evaluation.

| Instance (CVE) | Builder (ARISE vs SecVerifier) | Exploiter (ARISE vs SecVerifier) | Fixer (ARISE vs SecVerifier) |
| --- | --- | --- | --- |
| [cjson.cve-2016-10749](?instance=cjson.cve-2016-10749#interactive-tree) | True / True | True / False | True / False |
| [exiv2.cve-2017-11339](?instance=exiv2.cve-2017-11339#interactive-tree) | True / True | False / False | True / False |
| [exiv2.cve-2017-17669](?instance=exiv2.cve-2017-17669#interactive-tree) | True / True | True / False | True / False |
| [faad2.cve-2021-32273](?instance=faad2.cve-2021-32273#interactive-tree) | True / True | False / True | True / False |
| [faad2.cve-2021-32276](?instance=faad2.cve-2021-32276#interactive-tree) | True / True | False / False | True / False |
| [flac.cve-2020-22219](?instance=flac.cve-2020-22219#interactive-tree) | True / False | True / False | True / False |
| [gpac.cve-2023-0770](?instance=gpac.cve-2023-0770#interactive-tree) | False / True | True / True | True / False |
| [gpac.cve-2023-2838](?instance=gpac.cve-2023-2838#interactive-tree) | True / True | True / False | False / False |
| [imagemagick.cve-2017-11754](?instance=imagemagick.cve-2017-11754#interactive-tree) | True / True | True / True | True / False |
| [imagemagick.cve-2017-12641](?instance=imagemagick.cve-2017-12641#interactive-tree) | True / True | True / True | True / False |
| [libarchive.cve-2016-10209](?instance=libarchive.cve-2016-10209#interactive-tree) | True / True | False / False | True / False |
| [libarchive.cve-2017-14501](?instance=libarchive.cve-2017-14501#interactive-tree) | True / True | True / False | True / False |
| [libiec61850.cve-2018-19122](?instance=libiec61850.cve-2018-19122#interactive-tree) | True / True | True / False | True / False |
| [libjpeg-turbo.cve-2020-17541](?instance=libjpeg-turbo.cve-2020-17541#interactive-tree) | True / True | False / False | False / False |
| [libsass.cve-2018-20822](?instance=libsass.cve-2018-20822#interactive-tree) | True / True | True / True | True / False |
| [libtorrent.cve-2016-7164](?instance=libtorrent.cve-2016-7164#interactive-tree) | True / False | True / False | True / False |
| [mruby.cve-2022-0240](?instance=mruby.cve-2022-0240#interactive-tree) | True / True | True / True | True / False |
| [mruby.cve-2022-1071](?instance=mruby.cve-2022-1071#interactive-tree) | True / True | True / False | True / False |
| [njs.cve-2022-28049](?instance=njs.cve-2022-28049#interactive-tree) | True / False | True / False | True / False |
| [njs.cve-2022-32414](?instance=njs.cve-2022-32414#interactive-tree) | TBD / True | TBD / False | TBD / False |
| [openjpeg.cve-2017-14164](?instance=openjpeg.cve-2017-14164#interactive-tree) | TBD / True | TBD / True | TBD / False |

Our system clearly outperforms SecVerifier in all 3 stages. 
| Builder Success Rate (ARISE vs SecVerifier) | Exploiter Success Rate (ARISE vs SecVerifier) | Fixer Success Rate (ARISE vs SecVerifier) |
| --- | --- | --- |
| 90.48% (19/21) vs 85.71% (18/21) | 80.95% (17/21) vs 33.33% (7/21) | 80.95% (17/21) vs 0% (0/21) |

Output folders and artifacts for all evaluation instances can be found at [here](TODO) ---UPDATE OUTPUT FOLDER LINK---. Currently, only Columbia University members have access to the folder. Please contact the authors for access if you are from other institutions.

<a id="interactive-tree"></a>

### Interactive Tree
The following shows the visualization of a specific evaluation instances. You can interact with the tree to explore the design choices made during the evaluation process. You can **click on the nodes to expand or collapse them** to check their context and work. 

Some helper agents failed, but they do not affect the final results in our system. You can click on the nodes to see more details.

The following is showing the Interactive Tree for <AblationInstanceLabel defaultInstance="cjson.cve-2016-10749" />:
<AblationTreeFromLocation defaultInstance="cjson.cve-2016-10749" />