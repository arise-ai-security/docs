---
sidebar_position: 1
---

# Overview

Sec-Bench is a framework to automatically collect and verify real-world CVE instances with reproducible PoC artifacts and validated security patches, creating a benchmark to evaluate LLM agents on authentic security tasks.

## Novel Contribution
### Existing Benchmarks
The majority of current benchmarks are not able to automatically produce verifiable high-quality proof-of-concept (PoC) inputs for in-the-wild vulnerabilities.


### Sec-Bench

1. High-Quality vulnerabilities with verified PoCs and precise triggering conditions;
2. Automatic construction requiring minimal manual intervention, facilitating seamless extension with
new vulnerabilities;
3. Seed instances and corresponding PoC artifacts from public [Google OSV databases](https://osv.dev/) and [National Vulnerability Database](https://nvd.nist.gov/) with bug reports.