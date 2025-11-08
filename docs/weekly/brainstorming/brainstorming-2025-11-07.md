# SecVerifier Enhancement Brainstorm

Research ideas and potential improvements for the SecVerifier multi-agent vulnerability reproduction system.

---

## Possible Enhancements

### 1. Advanced Model Adaptation (GPT-5, Claude Code)

#### Core Problem
BuilderAgent shows unexpected failures even with advanced models (GPT-5, Claude Code). The primary failure pattern:
- **Error**: `cmake: command not found`
- **Frequency**: Majority of BuilderAgent failures
- **Impact**: Cascading failure to ExploiterAgent and FixerAgent

#### Research Questions
1. **Why does BuilderAgent fail to detect missing dependencies?**
   - Is this a prompt design issue?
   - Is this a reasoning capability issue?
   - Is this a tool usage issue?

2. **What can we learn from error patterns?**
   - Are failures clustered by project type?
   - Are failures clustered by build system (cmake vs autotools)?
   - Do newer models have different failure modes?

#### Action Items
- [ ] Analyze BuilderAgent failure logs across different models
- [ ] Compare failure rates: GPT-4o vs GPT-5 vs Claude Code
- [ ] Categorize errors: missing tools, build script issues, source code issues
- [ ] Identify patterns in successful vs failed instances
- [ ] Examine instruction following: Does the agent skip dependency checks?

#### Hypothesis to Test
**H1**: The `cmake: command not found` error indicates the LLM fails to:
1. Parse build scripts to detect `cmake` requirement
2. Execute proactive dependency checking
3. Install missing tools before running build

**H2**: Advanced models might have different instruction-following patterns:
- GPT-4o: Conservative, may skip proactive actions
- GPT-5: More reasoning, but may over-think simple tasks
- Claude Code: Tool-native, but may assume tools are available

#### Potential Solutions
1. **Enhanced Instructions**: Add explicit dependency detection steps
   ```
   Before running build:
   1. Read build.sh and detect required tools (cmake, autoconf, etc.)
   2. Check if tools exist: `command -v cmake`
   3. Install missing tools: `apt-get install -y cmake`
   ```

2. **Multi-Stage BuilderAgent**: Split into sub-agents
   - **DependencyDetectorAgent**: Analyze scripts, detect requirements
   - **EnvironmentSetupAgent**: Install packages, configure environment
   - **CompilerAgent**: Actually run build and fix errors

3. **Tool Availability Check**: Pre-flight verification
   - Before delegating to BuilderAgent, check common tools
   - Provide tool availability as context in prompt

#### Success Metrics
- Increase BuilderAgent success rate by X%
- Reduce `cmake: command not found` errors by Y%
- Improve downstream agent success (ExploiterAgent, FixerAgent)

---

### 2. Prompt Engineering & Tuning

#### Core Problem
Current prompts may be overfitted to:
- Specific dataset (SEC-bench/Seed)
- Specific model (GPT-4o)
- Specific vulnerability types

This overfitting may prevent generalization to:
- Different models (GPT-5, Claude Code)
- Different datasets (newer CVEs)
- Different project types

#### Research Questions
1. **Are prompts overfitted?**
   - Do prompts contain assumptions specific to old data?
   - Do prompts assume GPT-4o's behavior patterns?
   - Are instructions too specific or too general?

2. **What makes a good prompt?**
   - Explicit step-by-step vs high-level goals?
   - Examples vs abstract instructions?
   - Error recovery strategies?

#### Action Items
- [ ] Baseline: Current prompts on GPT-4o (reference performance)
- [ ] Experiment 1: Simplified prompts (remove specifics)
- [ ] Experiment 2: Enhanced prompts (add dependency checks)
- [ ] Experiment 3: Model-specific prompts (GPT-5 vs Claude Code)
- [ ] Experiment 4: Few-shot examples in prompts
- [ ] Experiment 5: Self-reflection prompts (agent critiques own actions)

#### Prompt Variations to Test

**Variation 1: Explicit Dependency Management**
```
Step 0 (NEW): Dependency Detection
- Read build.sh and detect all required tools
- For each tool: check existence with `command -v <tool>`
- Install missing tools with `apt-get install -y <tool>`
- Document installations in /testcase/packages.txt
```

**Variation 2: Error Prevention vs Error Recovery**
- Current: React to errors after they occur
- Proposed: Prevent errors proactively

**Variation 3: Reasoning Prompts**
```
Before each action, think:
- What am I trying to accomplish?
- What tools/packages are required?
- What could go wrong?
- How can I verify success?
```

#### Hypothesis to Test
**H1**: Overfitted prompts cause performance degradation
- **Test**: If new prompts don't improve performance → Prompts not the issue
- **Implication**: Architecture changes needed (split agents, new tools)

**H2**: Different models need different prompting styles
- **Test**: Model-specific prompts vs universal prompts
- **Metric**: Per-model performance gain

#### Success Criteria
- Maintain or improve success rate on SEC-bench/Seed
- Generalize to new datasets without prompt changes
- Consistent performance across different models

#### Connection to Enhancement #1
If prompt tuning doesn't solve `cmake: command not found`:
→ Signal that BuilderAgent is too broad
→ Need architectural changes (split into sub-agents)

---

### 3. Dataset Recency & Generalization

#### Core Problem (Opportunity)
Current dataset (SEC-bench/Seed):
- Temporal distribution: Unknown (likely older CVEs)
- May not represent recent vulnerability patterns
- May not cover modern build systems/languages

Adding recent CVEs can reveal:
- Model generalization capabilities
- Prompt robustness over time
- New vulnerability patterns

**Important Implementation Note:**
When adding newer datasets, we need to unify their interface:
- Which files they have (standardized structure)
- Should we use docker-compose? (consistent containerization)
- Unified build system expectations
- Common environment setup patterns

#### Research Questions
1. **Does data recency affect performance?**
   - Newer CVEs: Harder or easier to reproduce?
   - Build system evolution: More complex over time?
   - Language/framework changes: Impact on agents?

2. **Are prompts temporally biased?**
   - If recent data degrades performance → Prompts overfitted to old data
   - If recent data maintains performance → Prompts generalize well

#### Action Items
- [ ] Collect recent CVEs (2023-2025) from NVD/GitHub
- [ ] Apply SEC-bench preprocessing (mechanical filtering)
- [ ] Create temporal dataset splits:
   - **Old**: Pre-2020 CVEs
   - **Medium**: 2020-2022 CVEs
   - **Recent**: 2023-2025 CVEs
- [ ] Run experiments across temporal splits
- [ ] Analyze performance degradation over time

#### Dataset Augmentation Strategy

**Phase 1: Data Collection**
```
Sources:
- NVD (National Vulnerability Database)
- GitHub Security Advisories
- OSS-Fuzz bug reports
- Project-specific security repositories
```

**Phase 2: Filtering (SEC-bench criteria)**
```
Criteria (from paper):
1. Has exploitable PoC available
2. Repository is accessible
3. Build instructions exist
4. Vulnerability is reproducible
```

**Phase 3: Temporal Stratification**
```
Split by year:
- Training set: 70% (stratified by year)
- Validation set: 15% (stratified by year)
- Test set: 15% (recent CVEs only)
```

#### Hypothesis to Test
**H1**: Recent CVEs are harder due to build complexity
- **Test**: Compare success rates across temporal splits
- **Expected**: Recent < Medium < Old

**H2**: Prompts are overfitted to old data
- **Test**: If recent data degrades performance significantly
- **Implication**: Need temporally-robust prompts

**H3**: Newer models handle recent data better
- **Test**: GPT-5/Claude Code vs GPT-4o on recent CVEs
- **Expected**: Advanced models show better recency generalization

#### Success Metrics
- **Robustness**: Consistent performance across time periods
- **Generalization**: Success rate on unseen recent CVEs
- **Trend Analysis**: Identify which factors cause temporal degradation

#### K-Fold Strategy for Temporal Validation
```
Instead of single train/test split:
1. Create 5 folds stratified by year
2. Train on 4 folds, test on 1 fold
3. Measure variance across folds
4. Low variance → Temporally robust
   High variance → Temporal overfitting
```

---

## Publication Strategy

### 1. Numeric Justification & Differentiation

#### Core Question
**How do we justify our improvements?**

#### Quantitative Metrics

**Baseline (SEC-bench paper)**
- BuilderAgent success rate: X%
- ExploiterAgent success rate: Y%
- FixerAgent success rate: Z%
- End-to-end success rate: W%

**Our Improvements**
| Enhancement | Metric | Improvement |
|-------------|--------|-------------|
| Advanced Models | BuilderAgent success | +ΔX% |
| Prompt Tuning | Overall success | +ΔW% |
| Multi-Stage Agents | BuilderAgent success | +ΔX% |
| Temporal Robustness | Variance across time | -ΔV% |

#### Qualitative Contributions
1. **Model Adaptability**: First to evaluate GPT-5/Claude Code on security tasks
2. **Temporal Analysis**: First to study vulnerability reproduction over time
3. **Architectural Innovations**: Multi-stage agent decomposition
4. **Prompt Engineering**: Model-specific vs universal prompting

#### Differentiation from SEC-bench
| Aspect | SEC-bench | Our Work |
|--------|-----------|----------|
| **Models** | GPT-4o (primary) | GPT-4o, GPT-5, Claude Code |
| **Dataset** | Fixed (Seed) | Seed + Recent CVEs |
| **Prompts** | Single set | Model-specific + Tuned |
| **Architecture** | 3 agents | 3+ agents (sub-agents) |
| **Analysis** | Performance metrics | + Temporal analysis + Error categorization |
| **Focus** | Benchmark creation | Benchmark improvement + Generalization |

### 2. Data Recency Impact Analysis

#### Research Contributions
1. **Temporal Performance Analysis**
   - How does model performance change with CVE recency?
   - Which vulnerability types are temporally stable?
   - What build system evolution impacts reproducibility?

2. **Dataset Augmentation Methodology**
   - How to collect and filter recent CVEs?
   - How to ensure quality comparable to SEC-bench?
   - How to validate new instances?

3. **Generalization Study**
   - Do models trained on old data generalize to new data?
   - Do prompts need temporal adaptation?
   - What makes a vulnerability "timeless" vs "time-sensitive"?

#### Proof Strategy
**Experiment Design**:
```
1. Baseline: Replicate SEC-bench results on Seed dataset
2. Temporal Test: Run same setup on Recent CVEs
3. Analysis:
   - If performance drops → Identify causes
   - If performance maintains → Study what enables robustness
   - If performance improves → Investigate why
```

**Hypotheses**:
- H1: Performance degrades with recency (build complexity)
- H2: Certain vulnerability types are temporally robust
- H3: Advanced models (GPT-5, Claude Code) handle recency better

**Metrics**:
- Success rate by year
- Success rate by vulnerability type
- Success rate by build system
- Error type distribution over time

---

## Productionization Requirements

### 1. Pluggable Model Architecture

#### Requirements
Users should be able to easily swap LLM backends without code changes.

#### Current Status
✅ **Implemented**: Configuration-based model selection
```bash
# GPT-4o
poetry run python multi-agent.py --llm-config llm.eval_gpt_4o ...

# Claude Code
poetry run python multi-agent.py --llm-config llm.claude_agent ...

# GPT-5 (when available)
poetry run python multi-agent.py --llm-config llm.eval_gpt_5 ...
```

#### Configuration Interface
```toml
# config.toml
[llm.my_model]
model = "model-name"
custom_llm_provider = "provider"  # "openai", "anthropic", "claude_code"
native_tool_calling = true
api_key = "${API_KEY}"
```

#### Remaining Work
- [ ] Standardize model-specific configurations
- [ ] Auto-detect optimal settings per model
- [ ] Need more user-friendly interface for dynamically configurable program
- [ ] Provide model comparison dashboard
- [ ] Document model-specific quirks and best practices

### 2. End-to-End Pipeline

#### Pipeline Stages

**Stage 1: Data Ingestion**
```
Input Sources:
├── NVD API (nvd.nist.gov)
├── GitHub Security Advisories API
├── OSS-Fuzz Reports
└── Manual submissions
    ↓
Output: Raw CVE metadata + links
```

**Stage 2: Mechanical Filtering**
```
Filters (from SEC-bench paper):
├── Has PoC code available?
├── Repository accessible?
├── Build instructions exist?
├── Language supported?
└── License compatible?
    ↓
Output: Filtered CVE candidates
```

**Stage 3: Agentic Verification**
```
Verification Agents:
├── BuilderAgent: Can we build the vulnerable version?
├── ExploiterAgent: Can we trigger the vulnerability?
└── FixerAgent: Can we generate a patch?
    ↓
Output: Verified reproducible vulnerabilities
```

**Stage 4: Quality Assurance**
```
Verification of Verifiers:
├── Cross-model validation (GPT-4o vs GPT-5 vs Claude Code)
├── Human review of borderline cases
├── False positive detection
└── Reproducibility checks (multiple runs)
    ↓
Output: High-quality benchmark instances
```

**Stage 5: Benchmark Publication**
```
Outputs:
├── Dataset (instances + metadata)
├── Evaluation scripts
├── Baseline results
└── Documentation
```

#### Verification of Verification (Song's Idea)

**Problem**: How do we know our agents correctly verified vulnerabilities?

**Solutions**:

1. **Cross-Model Consensus**
   ```
   Run same instance with:
   - GPT-4o
   - GPT-5
   - Claude Code

   If all agree → High confidence
   If disagree → Manual review
   ```

2. **Ground Truth Validation**
   ```
   Compare against:
   - Known PoC code (does our exploit match?)
   - Official patches (does our fix match?)
   - CVE reports (are symptoms consistent?)
   ```

3. **Reproducibility Check**
   ```
   Run same instance multiple times:
   - Same model, different seeds
   - Different models, same seed

   Measure consistency:
   - Success rate variance
   - Exploit similarity
   - Patch similarity
   ```

4. **Expert Review**
   ```
   For borderline cases:
   - Security researcher reviews agent outputs
   - Validates exploit effectiveness
   - Confirms patch correctness
   ```

5. **Metamorphic Testing**
   ```
   Transform instance (same vulnerability, different context):
   - Different repository structure
   - Different build system
   - Different language version

   If agent still succeeds → Robust verification
   ```

#### Implementation Plan

**Phase 1: Basic Pipeline**
- [ ] Implement data scraping scripts
- [ ] Apply SEC-bench mechanical filters
- [ ] Run existing agentic verification
- [ ] Manual review for initial dataset

**Phase 2: Automated QA**
- [ ] Implement cross-model consensus
- [ ] Add reproducibility checks
- [ ] Create validation dashboard

**Phase 3: Continuous Integration**
- [ ] Automate weekly CVE ingestion
- [ ] Automatic filtering and verification
- [ ] Alert on high-value vulnerabilities
- [ ] Publish monthly dataset updates

**Phase 4: Community Validation**
- [ ] Open-source verification results
- [ ] Crowdsource expert reviews
- [ ] Incorporate feedback into pipeline

---

## Research Roadmap

### Phase 1: Diagnosis (Weeks 1-2)
- [ ] Analyze `cmake: command not found` error pattern
- [ ] Compare GPT-4o vs GPT-5 vs Claude Code failure modes
- [ ] Categorize all BuilderAgent failures
- [ ] Identify root causes

### Phase 2: Prompt Engineering (Weeks 3-4)
- [ ] Design prompt variations
- [ ] Run ablation studies
- [ ] Measure per-model performance
- [ ] Identify optimal prompts

### Phase 3: Architecture (Weeks 5-6)
- [ ] Design multi-stage BuilderAgent
- [ ] Implement DependencyDetector sub-agent
- [ ] Test architectural changes
- [ ] Compare with baseline

### Phase 4: Dataset Augmentation (Weeks 7-8)
- [ ] Collect recent CVEs
- [ ] Apply filtering pipeline
- [ ] Create temporal dataset splits
- [ ] Run experiments on new data

### Phase 5: Analysis & Writing (Weeks 9-10)
- [ ] Aggregate results
- [ ] Statistical analysis
- [ ] Write paper draft
- [ ] Prepare visualizations

### Phase 6: Productionization (Weeks 11-12)
- [ ] Implement end-to-end pipeline
- [ ] Add cross-model validation
- [ ] Create user documentation
- [ ] Deploy and monitor

---

## Success Criteria (WIP)

### Numeric Targets
1. **BuilderAgent**: Increase success rate by ≥10%
2. **Overall**: Increase end-to-end success by ≥5%
3. **Robustness**: Reduce temporal variance by ≥20%
4. **Generalization**: Maintain ≥90% of baseline on new data

### Qualitative Goals
1. ✅ Identify root causes of common failures
2. ✅ Develop model-agnostic prompting strategies
3. ✅ Create temporally-robust evaluation methodology
4. ✅ Build production-ready pipeline
5. ✅ Publish reproducible research

### Publication Criteria
1. Novel insights on model adaptation for security tasks
2. Temporal generalization analysis
3. Architectural improvements over baseline
4. Open-source implementation and dataset
5. Acceptance at top-tier security/SE conference

---

## Open Questions

1. **Model Scaling**: Do larger models always perform better on security tasks?
2. **Prompt Transferability**: Can prompts transfer across models without tuning?
3. **Task Decomposition**: What is the optimal granularity for sub-agents?
4. **Temporal Drift**: How fast do models become outdated for security tasks?
5. **Verification Confidence**: How do we quantify confidence in agentic verification?
6. **Human-in-the-Loop**: Where is human oversight most valuable?
7. **Cost-Effectiveness**: What is the cost/benefit of advanced models?
8. **Dataset Bias**: How do we ensure diverse and representative vulnerability coverage?

