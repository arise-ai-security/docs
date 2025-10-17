---
sidebar_position: 2
title: PoC Generation Guide
sidebar_label: PoC Generation
---

# PoC Generation by LLM

This guide provides detailed instructions to generate CyberGym PoCs. Ensure you've completed the [installation](../installation.md) and [basic setup](./local_machine.md) first. 

## Configurations
### Step 1: Download [GitHub Repository](https://github.com/sunblaze-ucb/cybergym-agent-examples.git)
```bash
git clone https://github.com/sunblaze-ucb/cybergym-agent-examples.git
```

### Step 2: Setup the Environment Variables and API Keys

Set up on Bash:
```bash
export OPENAI_API_KEY=sk-...
# CYBERGYM_ROOT should be set to the root directory of your cybergym repository
CYBERGYM_DATA_DIR=$CYBERGYM_ROOT/oss-fuzz-data
OUT_DIR=$CYBERGYM_ROOT/cybergym_tmp
MODEL=gpt-4.1-2025-04-14
SERVER_IP=0.0.0.0
SERVER_PORT=8666
# TASK_ID can be arvo:10400, arvo:10401, ...
TASK_ID=...
```

Set up on Fish:
```sh
export OPENAI_API_KEY="sk-..."
# CYBERGYM_ROOT should be set to the root directory of your cybergym repository
set CYBERGYM_DATA_DIR $CYBERGYM_ROOT/oss-fuzz-data
set OUT_DIR $CYBERGYM_ROOT/cybergym_tmp
# Available models can be found at https://github.com/andyzorigin/cybench/blob/main/agent/dataclasses/agent_spec.py
set MODEL gpt-4.1-2025-04-14
set SERVER_IP 0.0.0.0
set SERVER_PORT 8666
# TASK_ID can be arvo:10400, arvo:10401, ...
set TASK_ID ...
```

## Use Desired PoC Generation Engine

### cybench Engine
The following uses the `cybench` as an example.

#### Step 1: Fill out API Keys
Run the following commands inside the `cybench-repo` directory:
```bash
# Change directory to the folder where the `.env.example` is located
cd cybergym-agent-examples/cybench/cybench-repo
# Do the next step AFTER you fill out the `.env.example`
cp .env.example .env
```

#### Step 2: Run the One-time Docker Build Command
If you have not run the following command before, run the following commands inside the `cybench` directory.
If you have run it before, skip this step.
```bash
# make sure you are at the cybench directory
cd ..
docker build -t cybergym/cybench:latest .
```

#### Step 3: Run the PoC Generation Script
Run the following commands inside the `cybench` directory:
```bash
# make sure you are at the cybench directory
python3 run.py \
    --image 'cybergym/cybench:latest' \
    --model $MODEL \
    --log_dir $OUT_DIR/logs \
    --tmp_dir $OUT_DIR/tmp \
    --data_dir $CYBERGYM_DATA_DIR \
    --task_id $TASK_ID \
    --server "http://$SERVER_IP:$SERVER_PORT" \
    --timeout 1200 \
    --max_iter 100 \
    --difficulty level1
```

### Enigma Engine
The following uses the `enigma` as an example.

#### Step 1: Fill out API Keys

#### Step 2: Run the One-time Docker Build Command
Run the following commands inside the `enigma` directory.
```bash
# make sure you are at the enigma directory
docker pull sweagent/enigma:latest
pip install -r requirements.txt
pip uninstall sweagent
# please use the following specific version of sweagent
pip install sweagent==2.0.13
```