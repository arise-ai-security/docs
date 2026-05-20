---
sidebar_label: Week 4 Results
---

# Experiment Results and Analysis - 2026-05-17

## Scope

Compare A1, A2, and B1. C1 failed before producing reportable rows.

## Setup

| Cell | N enrolled | Mode | Worker | Key contrast |
|---|---:|---|---|---|
| A1 | 122 | flat | Claude Code CLI, Sonnet 4.5 | `Task` tool allowed |
| A2 | 113 | flat | Claude Code CLI, Sonnet 4.5 | `Task` tool blocked |
| B1 | 123 | hierarchical | Claude Code CLI, Sonnet 4.5 | Boss -> Manager -> Worker |
| C1 | 0 analyzed | hierarchical | OpenHands + Qwen | failed before analysis |

## Headline Results

| Metric | A1 | A2 | B1 |
|---|---:|---:|---:|
| Terminal runs | 121 | 112 | 123 |
| Successful terminal runs | 95 | 92 | 81 |
| Manifest terminal success rate | 78.5% | 82.1% | 65.9% |
| Total observed cost | $182.63 | $155.52 | $796.04 |
| Cost per manifest success | $1.92 | $1.69 | $9.83 |
| Median duration | 891.2s | 828.1s | 4,211.5s |
| Total tokens | 336M | 283M | 890M |
| Avg tool calls per run | 91.9 | 82.8 | 234.3 |

## Success Rate

Do not treat the earlier A1/A2/B1 success-rate numbers as true end-to-end patch success. They mix orchestration completion, self-reported validation, and parser availability.

### Former criteria

| Cell | Former scoring source | Success definition | Problem |
|---|---|---|---|
| A1/A2 exploiter | `exploit_validation_results.txt` | agent runs the PoC, compares the observed sanitizer/crash behavior to the bug report, and writes `VERDICT: PASS` if it believes they match | self-reported judgment can be wrong |
| A1/A2 fixer | `patch_validation_results.txt` | agent writes `/testcase/model_patch.diff`, applies/rebuilds, re-runs the PoC, and writes `VERDICT: PASS` if the sanitizer failure appears gone | fix logs sometimes contradict the PASS verdict |
| B1 exploiter | intended same criterion as A cells | internally the same exploit-validation idea | prompt bug: no canonical self-reported exploiter file, so reported exploiter success is unavailable |
| B1 fixer | `patch_validation_results.txt` | same patch/apply/rebuild/reproduce criterion as A cells | format and behavior differ enough that A-cell parser columns are not directly comparable |

### Current interpretation

| Metric | A1 | A2 | B1 | Use as |
|---|---:|---:|---:|---|
| Manifest success | 95/121 | 92/112 | 81/123 | orchestration completion only |
| Exploit self-reported PASS | 82 | 85 | n/a | legacy A-cell signal |
| Fix self-reported PASS | 100 | 90 | not comparable | legacy A-cell signal |
| Strict A-cell integrity success | 63/115 | 61/106 | n/a | best current A-cell estimate after dropping pure infra and H-1..H-4 issues |

A1/A2 show severe false-positive hallucination. The clearest pattern is fix validation: `patch_validation_results.txt` reports `VERDICT: PASS`, but the corresponding `fix_run_*.log` files still contain real sanitizer errors. The A12 integrity audit found this strict contradiction in 5 A1 runs and 7 A2 runs; the broader union of integrity issues affects about one third of A-cell successful runs.

B1 should not be judged by the same `0` real-pipeline columns. The exploiter prompt bug removes the canonical self-reported exploit file, and manual inspection suggests B1 may suffer less from false-positive PASS hallucination while exposing false negatives instead: runs with useful or successful-looking evidence can be marked failed or remain uncounted because the expected artifact/format is missing. B1 needs a separate manual audit or a B1-specific parser before quoting a real success rate.

## Pairwise Analysis

A1 vs A2 has 111 matched `(task, replicate)` pairs. A1 does more work, but the manifest/self-reported outcomes do not improve.

| Metric | N | Mean A1 | Mean A2 | Mean delta | p |
|---|---:|---:|---:|---:|---:|
| Manifest success rate | 111 | 79.3% | 82.0% | -2.7% | 0.6776 |
| Total cost | 101 | $1.62 | $1.34 | $0.28 | 0.0495 |
| Duration (s) | 111 | 938.6 | 883.8 | 54.8 | 0.0132 |
| Tokens | 101 | 2.96M | 2.50M | 0.46M | 0.0495 |
| Total tool calls | 111 | 94.3 | 83.2 | 11.1 | 0.0138 |
| Task-family calls | 111 | 9.8 | 1.8 | 8.0 | &lt;0.0001 |
| Recon calls | 111 | 55.3 | 51.7 | 3.5 | 0.0619 |
| Security-tool calls | 111 | 2.7 | 2.1 | 0.7 | 0.4767 |

| Outcome | N | A1-only | A2-only | Both | Neither | Delta | Exact p |
|---|---:|---:|---:|---:|---:|---:|---:|
| Builder real success | 111 | 4 | 7 | 92 | 8 | -2.7% | 0.5488 |
| Exploiter real success | 111 | 18 | 22 | 36 | 35 | -3.6% | 0.6358 |
| Fixer real success | 111 | 10 | 10 | 78 | 13 | 0.0% | 1.0000 |
| Full real pipeline | 111 | 19 | 21 | 27 | 44 | -1.8% | 0.8746 |

Takeaway: A1 differs from A2 in tool usage, not verified outcome quality. The `Task` allowance increased task-family calls, total calls, cost, and duration without a statistically meaningful manifest/self-reported pass-rate gain.

### Tool Use Analysis

B1 spends far more tool effort than either flat baseline.

| Cell | N | Total tools | Cheat | Recon | Security | Subagent | Task-family | Shell | File read | File write | File edit | Search |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| A1 | 122 | 91.9 | 3.5 | 53.7 | 2.6 | 0.02 | 10.0 | 59.2 | 9.4 | 6.2 | 2.3 | 4.9 |
| A2 | 113 | 82.8 | 3.6 | 51.6 | 2.0 | 0.00 | 1.8 | 57.2 | 9.8 | 6.9 | 2.5 | 4.5 |
| B1 | 123 | 234.3 | 3.6 | 176.7 | 29.0 | 0.00 | 0.0 | 160.2 | 37.6 | 15.1 | 7.1 | 5.7 |

B1 uses about 2.5x the tool calls, 3.3x the recon calls, and 11x the security-tool calls per run compared with A1/A2.

| B1 role | Nodes total | Tool calls total | Mean per node | Mean per run |
|---|---:|---:|---:|---:|
| Boss | 123 | 0 | 0.00 | 0.00 |
| Manager | 464 | 3,852 | 8.30 | 31.32 |
| Worker | 1,194 | 24,967 | 20.91 | 202.98 |

BOSS tool calls are zero by metric definition: decomposition is emitted as structured output, not `ThoughtCaptured(output_type='tool_use')`.

### Cheat Analysis

Cheat calls are shell commands that inspect git history or history-bearing refs. Rates are similar across cells; composition differs.

| Pattern | A1 calls | A1 avg | A1 runs | A2 calls | A2 avg | A2 runs | B1 calls | B1 avg | B1 runs |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Any cheat call | 428 | 3.508 | 106 | 411 | 3.637 | 104 | 444 | 3.610 | 105 |
| `git log` | 376 | 3.082 | 106 | 365 | 3.230 | 104 | 334 | 2.715 | 103 |
| `git show` | 37 | 0.303 | 18 | 32 | 0.283 | 14 | 13 | 0.106 | 8 |
| `git reflog` | 0 | 0.000 | 0 | 0 | 0.000 | 0 | 0 | 0.000 | 0 |
| `git diff <history/ref>` | 15 | 0.123 | 13 | 14 | 0.124 | 12 | 97 | 0.789 | 80 |

A1/A2 lean on `git log`; B1 more often diffs a specific historical ref.

### Bash Use Analysis

Bash-classified calls partitioned by first-match-wins regex priority:

| Cell | Bash recon | Bash exploit | Bash security scan | Bash build | Bash test/fuzz exec | Bash git | Bash other |
|---|---:|---:|---:|---:|---:|---:|---:|
| A1 | 4,808 | 0 | 316 | 521 | 4 | 1,200 | 5,414 |
| A2 | 4,200 | 0 | 240 | 433 | 9 | 1,201 | 4,778 |
| B1 | 16,401 | 0 | 2,554 | 778 | 0 | 1,602 | 17,249 |

B1's large increase is mostly recon and security scanning. `Bash exploit = 0` is expected: no `sqlmap`, `metasploit`, or `pwntools` invocation appeared in any cell.

### Failure Analysis

Operational causes are excluded from phase attribution.

| Excluded operational cause | A1 | A2 | B1 |
|---|---:|---:|---:|
| Login/authentication | 7 | 7 | 0 |
| Credit/quota | 1 | 0 | 13 |

| Terminal status | A1 | A2 | B1 |
|---|---:|---:|---:|
| completed | 95 | 92 | 81 |
| in_progress | 1 | 1 | 0 |
| timed_out | 17 | 9 | 24 |
| failed | 9 | 11 | 18 |

| Non-success classification | A1 | A2 | B1 |
|---|---:|---:|---:|
| inactivity_timeout | 17 | 9 | 0 |
| provider_failure | 1 | 4 | 6 |
| work_error | 8 | 7 | 33 |

| Failure phase, excluding login/credit | A1 | A2 | B1 |
|---|---:|---:|---:|
| builder | 8 | 1 | 15 |
| exploiter | 4 | 4 | 11 |
| fixer | 1 | 3 | 0 |
| reporter | 0 | 0 | 0 |
| provider/api | 1 | 4 | 0 |
| post-evidence orchestration | 4 | 1 | 0 |

B1 produces more `work_error` than A1/A2 and zero `inactivity_timeout`; its tighter per-step budget appears to surface failures as work errors before the inactivity watchdog fires. Do not compare B1 exploiter counts to A1/A2 until the exploiter-prompt artifact fix lands.



## Caveats

- B1 full real-pipeline success is `0` by metric artifact: `exploit_validation_results.txt` was not produced in the required canonical format.
- B1 patch semantic rows are not comparable to A1/A2 until the prompt/report format is fixed or a reliable parser is added.
- C1 has no reports or result rows; root cause is uninvestigated.
- This note uses the generated A12 and B1 reports for counts where the old long weekly draft was internally inconsistent.

## Next Actions

1. Patch the exploiter worker prompt to require canonical `exploit_validation_results.txt`.
2. Re-run or re-score B1 after the artifact contract is fixed.
3. Triage C1 before treating Qwen/OpenHands as an experimental result.

## Sources

- `docs/weekly/week4-2026-05-17.md`
- `experiments/a12-batch-autogen/reports/a12_claude_code_cli_report.md`
- `experiments/b1-batch-autogen/reports/b1_analysis_report.md`
