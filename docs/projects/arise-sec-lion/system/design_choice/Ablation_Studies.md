---
title: Ablation Studies on CVE Instances
sidebar_position: 11
---
import Ablation1TreeFromLocation from '@site/src/components/arise-sec-lion-ablation-1/AblationTreeFromLocation';
import Ablation1InstanceLabel from '@site/src/components/arise-sec-lion-ablation-1/AblationInstanceLabel';
import Ablation2TreeFromLocation from '@site/src/components/arise-sec-lion-ablation-2/AblationTreeFromLocation';
import Ablation2InstanceLabel from '@site/src/components/arise-sec-lion-ablation-2/AblationInstanceLabel';

# Ablation Studies on CVE Instances
In this page, we present the real examples on ablation studies of the system with [design choices 1 - 7](./intro.md) enabled on CVE instances. We selected 21 CVE instances and compare their results with baselines SecVerifier. 

## Overview of Ablation Studies
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
| [cjson.cve-2016-10749](?instance=cjson.cve-2016-10749#interactive-tree-ablation-1) | True / True | True / False | True / False |
| [exiv2.cve-2017-11339](?instance=exiv2.cve-2017-11339#interactive-tree-ablation-1) | True / True | False / False | True / False |
| [exiv2.cve-2017-17669](?instance=exiv2.cve-2017-17669#interactive-tree-ablation-1) | True / True | True / False | True / False |
| [faad2.cve-2021-32273](?instance=faad2.cve-2021-32273#interactive-tree-ablation-1) | True / True | False / True | True / False |
| [faad2.cve-2021-32276](?instance=faad2.cve-2021-32276#interactive-tree-ablation-1) | True / True | False / False | True / False |
| [flac.cve-2020-22219](?instance=flac.cve-2020-22219#interactive-tree-ablation-1) | True / False | True / False | True / False |
| [gpac.cve-2023-0770](?instance=gpac.cve-2023-0770#interactive-tree-ablation-1) | False / True | True / True | True / False |
| [gpac.cve-2023-2838](?instance=gpac.cve-2023-2838#interactive-tree-ablation-1) | True / True | True / False | False / False |
| [imagemagick.cve-2017-11754](?instance=imagemagick.cve-2017-11754#interactive-tree-ablation-1) | True / True | True / True | True / False |
| [imagemagick.cve-2017-12641](?instance=imagemagick.cve-2017-12641#interactive-tree-ablation-1) | True / True | True / True | True / False |
| [libarchive.cve-2016-10209](?instance=libarchive.cve-2016-10209#interactive-tree-ablation-1) | True / True | False / False | True / False |
| [libarchive.cve-2017-14501](?instance=libarchive.cve-2017-14501#interactive-tree-ablation-1) | True / True | True / False | True / False |
| [libiec61850.cve-2018-19122](?instance=libiec61850.cve-2018-19122#interactive-tree-ablation-1) | True / True | True / False | True / False |
| [libjpeg-turbo.cve-2020-17541](?instance=libjpeg-turbo.cve-2020-17541#interactive-tree-ablation-1) | True / True | False / False | False / False |
| [libsass.cve-2018-20822](?instance=libsass.cve-2018-20822#interactive-tree-ablation-1) | True / True | True / True | True / False |
| [libtorrent.cve-2016-7164](?instance=libtorrent.cve-2016-7164#interactive-tree-ablation-1) | True / False | True / False | True / False |
| [mruby.cve-2022-0240](?instance=mruby.cve-2022-0240#interactive-tree-ablation-1) | True / True | True / True | True / False |
| [mruby.cve-2022-1071](?instance=mruby.cve-2022-1071#interactive-tree-ablation-1) | True / True | True / False | True / False |
| [njs.cve-2022-28049](?instance=njs.cve-2022-28049#interactive-tree-ablation-1) | True / False | True / False | True / False |
| [njs.cve-2022-32414](?instance=njs.cve-2022-32414#interactive-tree-ablation-1) | True / True | False / False | True / False |
| [openjpeg.cve-2017-14164](?instance=openjpeg.cve-2017-14164#interactive-tree-ablation-1) | True / True | True / True | True / False |

Our system clearly outperforms SecVerifier in all 3 stages. 
| Builder Success Rate (ARISE vs SecVerifier) | Exploiter Success Rate (ARISE vs SecVerifier) | Fixer Success Rate (ARISE vs SecVerifier) |
| --- | --- | --- |
| 95.24% (20/21) vs 85.71% (18/21) |  71.43% (15/21) vs 33.33% (7/21) |  90.48% (19/21) vs 0% (0/21) |

### Runtime and Cost

| Instance (CVE) | Runtime (mins) | Cost |
| --- | ---: | ---: |
faad2.cve-2021-32273 | 50.23 mins | $0.56
faad2.cve-2021-32276 | 58.46 mins | $4.24
flac.cve-2020-22219 | 36.46 mins | $3.48
gpac.cve-2023-0770 | --------- | $4.77
gpac.cve-2023-2838 | 58.51 mins | $3.29
imagemagick.cve-2017-11754 | 33.00 mins | $1.67
libjpeg-turbo.cve-2020-17541 | 53.18 mins | $4.53
libsass.cve-2018-20822 | 57.52 mins | $3.39
libtorrent.cve-2016-7164 | 35.90 mins | $2.53
mruby.cve-2022-0240 | 29.71 mins | $1.99
mruby.cve-2022-1071 | 42.40 mins | $3.01
njs.cve-2022-28049 | 32.96 mins | $2.34
njs.cve-2022-32414 | 46.66 mins | $4.01
openjpeg.cve-2017-14164 | 40.37 mins | $2.43

The average end-to-end cost per instance is $3.02
The average end-to-end runtime per instance is 44.93 mins.
Output folders and artifacts for all evaluation instances can be found at [here](https://drive.google.com/file/d/13v883IEj6Ywq3tuGnGyilO3iDWQc9TQR/view?usp=sharing). Currently, only Columbia University members have access to the folder. Please contact the authors for access if you are from other institutions.


### Analysis
The results indicate that the removal of workers' retrieval of relevant context does not significantly impact the success rates compared to the full system, because workers main directions are still under supervisor's guidance. Builder success rate remains relatively stable. Exploiter success rate experiences a slight decrease, while Fixer success rate actually improves. This suggests that relevant context remains as auxiliary information rather than essential for success.

However, there is a noticeable increase (13.11% cost increase) in runtime and cost for several instances, suggesting that while the system can still function without this design choice, it does so less efficiently. This highlights the importance of context retrieval in optimizing performance and resource utilization.
<a id="interactive-tree-ablation-1"></a>

### Interactive Tree
The following shows the visualization of a specific evaluation instances. You can interact with the tree to explore the design choices made during the evaluation process. You can **click on the nodes to expand or collapse them** to check their context and work. 

Some helper agents failed, but they do not affect the final results in our system. You can click on the nodes to see more details.

The following is showing the Interactive Tree for <Ablation1InstanceLabel defaultInstance="cjson.cve-2016-10749" />:
<Ablation1TreeFromLocation defaultInstance="cjson.cve-2016-10749" />


## Ablation 2: Removal of Thinker Justification Pass Down
In this ablation study, we disable the Thinker Justification Pass Down mechanism (Design Choice 4). In this configuration, workers do not receive the Thinker's justifications for their assigned tasks. This study aims to evaluate how much the Thinker's justifications contribute to the overall system performance.

### Quick Table

Each cell records a side-by-side comparison: ARISE vs SecVerifier. Both system are run with default configurations.  "TBD" means the evaluation is still in progress. 

SecVerifier's results are consistent with their paper results, and we use their best results (with the most of amount True's in 3 stages: Builder, Exploiter, Fixer) for comparison. These results are best performances using GPT-4o, GPT-4o-mini, or GPT-5 with 300 iterations.

Please **click on each instance name** to see the interactive tree of that evaluation.

| Instance (CVE) | Builder (ARISE vs SecVerifier) | Exploiter (ARISE vs SecVerifier) | Fixer (ARISE vs SecVerifier) |
| --- | --- | --- | --- |
| [cjson.cve-2016-10749](?instance=cjson.cve-2016-10749#interactive-tree-ablation-2) | True / True | True / False | True / False |
| [exiv2.cve-2017-11339](?instance=exiv2.cve-2017-11339#interactive-tree-ablation-2) | False / True | True / False | True / False |
| [exiv2.cve-2017-17669](?instance=exiv2.cve-2017-17669#interactive-tree-ablation-2) | True / True | False / False | False / False |
| [faad2.cve-2021-32273](?instance=faad2.cve-2021-32273#interactive-tree-ablation-2) | False / True | True / True | True / False |
| [faad2.cve-2021-32276](?instance=faad2.cve-2021-32276#interactive-tree-ablation-2) | True / True | True / False | True / False |
| [flac.cve-2020-22219](?instance=flac.cve-2020-22219#interactive-tree-ablation-2) | TBD / False | TBD / False | TBD / False |
| [gpac.cve-2023-0770](?instance=gpac.cve-2023-0770#interactive-tree-ablation-2) | TBD / True | TBD / True | TBD / False |
| [gpac.cve-2023-2838](?instance=gpac.cve-2023-2838#interactive-tree-ablation-2) | TBD / True | TBD / False | TBD / False |
| [imagemagick.cve-2017-11754](?instance=imagemagick.cve-2017-11754#interactive-tree-ablation-2) | TBD / True | TBD / True | TBD / False |
| [imagemagick.cve-2017-12641](?instance=imagemagick.cve-2017-12641#interactive-tree-ablation-2) | TBD / True | TBD / True | TBD / False |
| [libarchive.cve-2016-10209](?instance=libarchive.cve-2016-10209#interactive-tree-ablation-2) | TBD / True | TBD / False | TBD / False |
| [libarchive.cve-2017-14501](?instance=libarchive.cve-2017-14501#interactive-tree-ablation-2) | TBD / True | TBD / False | TBD / False |
| [libiec61850.cve-2018-19122](?instance=libiec61850.cve-2018-19122#interactive-tree-ablation-2) | TBD / True | TBD / False | TBD / False |
| [libjpeg-turbo.cve-2020-17541](?instance=libjpeg-turbo.cve-2020-17541#interactive-tree-ablation-2) | TBD / True | TBD / False | TBD / False |
| [libsass.cve-2018-20822](?instance=libsass.cve-2018-20822#interactive-tree-ablation-2) | TBD / True | TBD / True | TBD / False |
| [libtorrent.cve-2016-7164](?instance=libtorrent.cve-2016-7164#interactive-tree-ablation-2) | TBD / False | TBD / False | TBD / False |
| [mruby.cve-2022-0240](?instance=mruby.cve-2022-0240#interactive-tree-ablation-2) | TBD / True | TBD / True | TBD / False |
| [mruby.cve-2022-1071](?instance=mruby.cve-2022-1071#interactive-tree-ablation-2) | TBD / True | TBD / False | TBD / False |
| [njs.cve-2022-28049](?instance=njs.cve-2022-28049#interactive-tree-ablation-2) | TBD / False | TBD / False | TBD / False |
| [njs.cve-2022-32414](?instance=njs.cve-2022-32414#interactive-tree-ablation-2) | TBD / True | TBD / False | TBD / False |
| [openjpeg.cve-2017-14164](?instance=openjpeg.cve-2017-14164#interactive-tree-ablation-2) | TBD / True | TBD / True | TBD / False |

<a id="interactive-tree-ablation-2"></a>

### Interactive Tree
The following shows the visualization of a specific evaluation instances. You can interact with the tree to explore the design choices made during the evaluation process. You can **click on the nodes to expand or collapse them** to check their context and work.

The following is showing the Interactive Tree for <Ablation2InstanceLabel defaultInstance="cjson.cve-2016-10749" />:
<Ablation2TreeFromLocation defaultInstance="cjson.cve-2016-10749" />