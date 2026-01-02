---
title: Evaluations on CVE Instances
sidebar_position: 9
---
import EvalTreeFromLocation from '@site/src/components/arise-sec-lion-evals/EvalTreeFromLocation';
import EvalInstanceLabel from '@site/src/components/arise-sec-lion-evals/EvalInstanceLabel';

# Evaluations on CVE Instances
In this page, we present the real examples of evaluations on CVE instances. We selected 20 CVE instances and compare their results with baselines SecVerifier.

## Quick Table

Each cell records a side-by-side comparison: ARISE vs SecVerifier. Both system are run with default configurations.  "TBD" means the evaluation is still in progress. 

SecVerifier's results are consistent with their paper results, and we use their best results (with the most of amount True's in 3 stages: Builder, Exploiter, Fixer) for comparison. These results are best performances using GPT-4o, GPT-4o-mini, or GPT-5 with 300 iterations.

Please click on each instance name to see the interactive tree of that evaluation.

| Instance (CVE) | Builder (ARISE vs SecVerifier) | Exploiter (ARISE vs SecVerifier) | Fixer (ARISE vs SecVerifier) |
| --- | --- | --- | --- |
| [cjson.cve-2016-10749](?instance=cjson.cve-2016-10749#interactive-tree) | TBD / True | TBD / False | TBD / False |
| [exiv2.cve-2017-11339](?instance=exiv2.cve-2017-11339#interactive-tree) | TBD / True | TBD / False | TBD / False |
| [exiv2.cve-2017-17669](?instance=exiv2.cve-2017-17669#interactive-tree) | TBD / True | TBD / False | TBD / False |
| [faad2.cve-2021-32273](?instance=faad2.cve-2021-32273#interactive-tree) | TBD / TBD | TBD / TBD | TBD / TBD |
| [faad2.cve-2021-32276](?instance=faad2.cve-2021-32276#interactive-tree) | TBD / TBD | TBD / TBD | TBD / TBD |
| [flac.cve-2020-22219](?instance=flac.cve-2020-22219#interactive-tree) | TBD / TBD | TBD / TBD | TBD / TBD |
| [gpac.cve-2023-0770](?instance=gpac.cve-2023-0770#interactive-tree) | True / True | True / True | True / False |
| [gpac.cve-2023-2838](?instance=gpac.cve-2023-2838#interactive-tree) | TBD / TBD | TBD / TBD | TBD / TBD |
| [imagemagick.cve-2017-11754](?instance=imagemagick.cve-2017-11754#interactive-tree) | TBD / TBD | TBD / TBD | TBD / TBD |
| [imagemagick.cve-2017-12641](?instance=imagemagick.cve-2017-12641#interactive-tree) | TBD / TBD | TBD / TBD | TBD / TBD |
| [libarchive.cve-2016-10209](?instance=libarchive.cve-2016-10209#interactive-tree) | TBD / TBD | TBD / TBD | TBD / TBD |
| [libarchive.cve-2017-14501](?instance=libarchive.cve-2017-14501#interactive-tree) | TBD / TBD | TBD / TBD | TBD / TBD |
| [libiec61850.cve-2018-19122](?instance=libiec61850.cve-2018-19122#interactive-tree) | TBD / TBD | TBD / TBD | TBD / TBD |
| [libjpeg-turbo.cve-2020-17541](?instance=libjpeg-turbo.cve-2020-17541#interactive-tree) | TBD / TBD | TBD / TBD | TBD / TBD |
| [libsass.cve-2018-20822](?instance=libsass.cve-2018-20822#interactive-tree) | TBD / TBD | TBD / TBD | TBD / TBD |
| [libtorrent.cve-2016-7164](?instance=libtorrent.cve-2016-7164#interactive-tree) | TBD / TBD | TBD / TBD | TBD / TBD |
| [mruby.cve-2022-0240](?instance=mruby.cve-2022-0240#interactive-tree) | TBD / TBD | TBD / TBD | TBD / TBD |
| [mruby.cve-2022-1071](?instance=mruby.cve-2022-1071#interactive-tree) | TBD / TBD | TBD / TBD | TBD / TBD |
| [njs.cve-2022-28049](?instance=njs.cve-2022-28049#interactive-tree) | TBD / TBD | TBD / TBD | TBD / TBD |
| [njs.cve-2022-32414](?instance=njs.cve-2022-32414#interactive-tree) | TBD / TBD | TBD / TBD | TBD / TBD |
| [openjpeg.cve-2017-14164](?instance=openjpeg.cve-2017-14164#interactive-tree) | TBD / TBD | TBD / TBD | TBD / TBD |

<a id="interactive-tree"></a>

## Interactive Tree
The following shows the visualization of a specific evaluation instances. You can interact with the tree to explore the design choices made during the evaluation process. You can click on the nodes to expand or collapse them. 

The Following is Showing the Interactive Tree for <EvalInstanceLabel defaultInstance="gpac.cve-2023-0770" />:
<EvalTreeFromLocation defaultInstance="gpac.cve-2023-0770" />