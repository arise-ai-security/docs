---
sidebar_position: 2
title: Detailed Setup Guide
sidebar_label: Detailed Setup
---

# Local Machine Setup - Detailed Guide

This guide provides detailed configuration and operation instructions for running CyberGym locally using the
nearKim/cybergym fork. Ensure you've completed the [installation](../installation.md) first.

## Working Directory

All commands in this guide assume you are in the CyberGym root directory (where you cloned forked cybergym repository):

```bash
cd ~/path/to/cybergym  # Replace with your actual path
pwd  # Should show your cybergym directory
```

## Configuration

### Step 1: Create Environment Configuration

Copy the example configuration file to create your `.env`:

```bash
cp .env.example .env
```

The `.env.example` file contains all necessary configuration. Modify the `.env` file only if you need custom paths or
settings.

### Step 2: Understanding Environment Variables

The helper scripts automatically load the `.env` file, but you can manually set environment variables if needed.

**Manual environment setup for Bash/Zsh:**

```bash
# Source the .env file
export $(grep -v '^#' .env | xargs)

# Or set individual variables
export SERVER_IP=0.0.0.0
export SERVER_PORT=8666
export LOG_DIR=./logs
export DB_PATH=./poc.db
export OSS_FUZZ_PATH=./oss-fuzz-data
export CYBERGYM_DATA_DIR=./cybergym_data/data
export OUT_DIR=./cybergym_tmp
export ARTIFACT_DIR=./logs/artifacts
export SAMPLE_TASK_ID=arvo:10400,arvo:10401,arvo:10402
export CYBERGYM_API_KEY=cybergym-030a0cd7-5908-4862-8ab9-91f2bfc7b56d
```

**Manual environment setup for Fish:**

```fish
# Source variables from .env
for line in (grep -v '^#' .env)
    set -x (echo $line | cut -d= -f1) (echo $line | cut -d= -f2-)
end

# Or set individual variables
set -x SERVER_IP 0.0.0.0
set -x SERVER_PORT 8666
set -x LOG_DIR ./logs
set -x DB_PATH ./poc.db
set -x OSS_FUZZ_PATH ./oss-fuzz-data
set -x CYBERGYM_DATA_DIR ./cybergym_data/data
set -x OUT_DIR ./cybergym_tmp
set -x ARTIFACT_DIR ./logs/artifacts
set -x SAMPLE_TASK_ID "arvo:10400,arvo:10401,arvo:10402"
set -x CYBERGYM_API_KEY "cybergym-030a0cd7-5908-4862-8ab9-91f2bfc7b56d"
```

## Docker Setup

### Important: Docker Runtime Configuration

When using Colima or Podman, the `DOCKER_HOST` environment variable might point to the wrong runtime, causing connection
issues.

#### Step 1: Unset DOCKER_HOST

**For Bash/Zsh:**

```bash
unset DOCKER_HOST
```

**For Fish:**

```fish
set -e DOCKER_HOST
```

#### Step 2: Verify Docker Context

Check if the `desktop-linux` namespace exists (or `rootless` if running on Rootless Linux):

```bash
docker context ls
```

You should see output similar to:

```
NAME                TYPE                DESCRIPTION                               DOCKER ENDPOINT
default             moby                Current DOCKER_HOST based configuration  unix:///var/run/docker.sock
desktop-linux   *   moby                Docker Desktop                           unix:///Users/[username]/.docker/run/docker.sock
```

#### Step 3: Use Docker Desktop Context

Set the Docker context to `desktop-linux`:

```bash
docker context use desktop-linux
```

Verify the context is active (look for the asterisk):

```bash
docker context ls
```

#### Step 4: Test Docker

Verify Docker is working correctly:

```bash
docker ps
docker run hello-world
```

## Starting the Server

### Step 1: Launch the Server

Open a terminal and run:

```bash
python helpers/start_server.py
```

### Step 2: Verify Server Startup

You should see output similar to:

```
Environment loaded from: /Users/garfield/PycharmProjects/cybergym-nearkim/.env
  SERVER_IP = 0.0.0.0
  SERVER_PORT = 8666
  POC_SAVE_DIR = ./server_poc
  LOG_DIR = ./logs
  DB_PATH = ./poc.db
  OSS_FUZZ_PATH = ./oss-fuzz-data
  CYBERGYM_DATA_DIR = ./cybergym_data/data
  CYBERGYM_SERVER_DATA_DIR = ./oss-fuzz-data
  OUT_DIR = ./cybergym_tmp
  ARTIFACT_DIR = ./logs/artifacts
  SAMPLE_TASK_ID = arvo:10400,arvo:10401,arvo:10402
  CYBERGYM_API_KEY = cybergym-030a0cd7-5908-4862-8ab9-91f2bfc7b56d
Starting server: python -m cybergym.server --host 0.0.0.0 --port 8666 --log_dir ./logs --db_path ./poc.db --cybergym_oss_fuzz_path ./oss-fuzz-data
Server environment loaded from: /Users/garfield/PycharmProjects/cybergym-nearkim/.env
  [... environment variables repeated ...]
[INFO] Starting CyberGym Server initialization...
[INFO] Environment loaded from: /Users/garfield/PycharmProjects/cybergym-nearkim/.env
[INFO] Configuration loaded successfully
[INFO] Server: 0.0.0.0:8666, DB: poc.db, Logs: logs
[INFO] Configuration updated with CLI arguments
[INFO] Directories created at logs
[INFO] Artifact logger initialized at logs/artifacts
[INFO] Starting server on 0.0.0.0:8666
INFO:     Started server process [31019]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Step 3: Override Configuration (Optional)

To override `.env` settings, specify arguments manually:

```bash
python helpers/start_server.py --host 0.0.0.0 --port 8666 --log_dir ./logs
```

The server will:

- Create necessary directories automatically
- Initialize the SQLite database for PoC records
- Start artifact logging in `./artifacts/poc_records/`
- Listen for PoC submissions on the specified port

Keep this terminal open while the server is running.

## Test Task Generation and Submission

Open a new terminal for the following operations.

### 1. Generate and Submit Tasks

Run the test script to generate tasks and submit sample PoCs:

```bash
# Test with default tasks from .env
python helpers/test.py

# Test with specific tasks (multiple formats supported)
python helpers/test.py arvo:10400 arvo:3848
python helpers/test.py task_ids=arvo:10400,arvo:3848,arvo:1065
```

This script will:

1. Generate task files for each specified task ID
2. Create a sample PoC for each task
3. Submit the PoC to the server
4. Report success/failure for each task

You should see the output similar to:

```
Environment loaded from: /Users/garfield/PycharmProjects/cybergym-nearkim/.env
  SERVER_IP = 0.0.0.0
  SERVER_PORT = 8666
  POC_SAVE_DIR = ./server_poc
  LOG_DIR = ./logs
  DB_PATH = ./poc.db
  OSS_FUZZ_PATH = ./oss-fuzz-data
  CYBERGYM_DATA_DIR = ./cybergym_data/data
  CYBERGYM_SERVER_DATA_DIR = ./oss-fuzz-data
  OUT_DIR = ./cybergym_tmp
  ARTIFACT_DIR = ./logs/artifacts
  SAMPLE_TASK_ID = arvo:10400,arvo:10401,arvo:10402
  CYBERGYM_API_KEY = cybergym-030a0cd7-5908-4862-8ab9-91f2bfc7b56d
Using task IDs from env: arvo:10400, arvo:10401, arvo:10402
Generating task: arvo:10400
Creating PoC: cybergym_tmp/poc_arvo_10400
Submitting PoC: cybergym_tmp/submit.sh
{"task_id":"arvo:10400","exit_code":0,"output":"INFO: Seed: 3089707502\nINFO: Loaded 1 modules   (74411 inline 8-bit counters): 74411 [0x1353f08, 0x13661b3), \nINFO: Loaded 1 PC tables (74411 PCs): 74411 [0x13661b8,0x1488c68), \n/out/coder_MNG_fuzzer: Running 1 inputs 1 time(s) each.\nRunning: /tmp/poc\nExecuted /tmp/poc in 15 ms\n***\n*** NOTE: fuzzing was not performed, you have only\n***       executed the target code on a fixed set of inputs.\n***\n","poc_id":"0b7b98e85c22480bade001cec714d3a6"}Generating task: arvo:10401
Creating PoC: cybergym_tmp/poc_arvo_10401
Submitting PoC: cybergym_tmp/submit.sh
...
```

### 2. Verify Submitted PoCs

After submissions, verify the PoCs using:

```bash
# Auto-detect agent IDs from artifacts (no arguments needed)
python helpers/verify.py

# Verify specific agent
python helpers/verify.py agent_id=8113f33401d34ee3ae48cf823b757ac7

# Additional filters
python helpers/verify.py --task_id arvo:3848 --poc_hash 714f093fe3c9...
```

The verify script will:

- Automatically read agent IDs from `$ARTIFACT_DIR/poc_records/poc_records.jsonl`
- If multiple agents are found, verify all of them automatically
- Show verification status for each PoC
- Return appropriate exit codes for CI/CD integration

You should see the output similar to:

```
Environment loaded from: /Users/garfield/PycharmProjects/cybergym-nearkim/.env
  SERVER_IP = 0.0.0.0
  SERVER_PORT = 8666
  POC_SAVE_DIR = ./server_poc
  LOG_DIR = ./logs
  DB_PATH = ./poc.db
  OSS_FUZZ_PATH = ./oss-fuzz-data
  CYBERGYM_DATA_DIR = ./cybergym_data/data
  CYBERGYM_SERVER_DATA_DIR = ./oss-fuzz-data
  OUT_DIR = ./cybergym_tmp
  ARTIFACT_DIR = ./logs/artifacts
  SAMPLE_TASK_ID = arvo:10400,arvo:10401,arvo:10402
  CYBERGYM_API_KEY = cybergym-030a0cd7-5908-4862-8ab9-91f2bfc7b56d
Multiple agents found: 1a9a2fcf4b634e06892586af5b95c8f0, ...
Verifying all 8 agents...

 Verifying agent: 1a9a2fcf4b634e06892586af5b95c8f0
{'agent_id': '1a9a2fcf4b634e06892586af5b95c8f0', 'task_id': 'arvo:10402', 'poc_id': '370eb...

 Verifying agent: 588961df042a418d88abb04bd55720e8
{'agent_id': '588961df042a418d88abb04bd55720e8', 'task_id': 'arvo:10400', 'poc_id': '0b6cf2...
```

## Complete Workflow Example

```bash
# Terminal 1: Start the server
cd ~/path/to/cybergym
python helpers/start_server.py

# Terminal 2: Run tests (in another terminal)
cd ~/path/to/cybergym
python helpers/test.py

# Verify all submitted PoCs
python helpers/verify.py
```

## Troubleshooting

### Docker Issues

**Docker context errors:**

```bash
# Reset to default and reconfigure
docker context use default
docker context rm desktop-linux
# Restart Docker Desktop
docker context use desktop-linux
```

### Server Issues

**Port already in use:**

```bash
# Find process using port 8666
lsof -i :8666
# Kill the process if needed
kill -9 <PID>
```

**Server won't start:**

- Check if all required directories are accessible
- Verify `.env` file is properly formatted
- Ensure Docker is running: `docker ps`
- Check Python environment is activated: `conda activate cybergym`

## Known Issues

### API Errors

WIP - Debugging issues with the following API errors:

1. **Intermittent 500 errors on `/submit-vul` API calls**

## Best Practices

1. **Use `.env` files** for consistent configuration across development environments
2. **Let the server create directories** automatically instead of manual creation
3. **Check artifacts directory** for debugging PoC submission issues
4. **Use helpers scripts** for common operations instead of manual commands
