---
sidebar_position: 1
title: Basic Setup Guide
sidebar_label: Basic Setup
---

# Starting on a Local Machine

Learn how to use CyberGym on your local machine, please finish the [installation](../installation.md) part before proceeding.

## Configuration

### Environment Setup
1. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

2. Configure your environment variables:

Bash
```bash
# Server settings
SERVER_IP=0.0.0.0
SERVER_PORT=8666

# Directories
# CYBERGYM_ROOT should be set to the root directory of your cybergym repository
LOG_DIR=$CYBERGYM_ROOT/logs
DB_PATH=$CYBERGYM_ROOT/poc.db
OSS_FUZZ_PATH=$CYBERGYM_ROOT/oss-fuzz-data
CYBERGYM_DATA_DIR=$CYBERGYM_ROOT/cybergym_data/data
OUT_DIR=$CYBERGYM_ROOT/cybergym_tmp
ARTIFACT_DIR=$CYBERGYM_ROOT/artifacts

# Task settings (comma-separated for multiple tasks)
SAMPLE_TASK_ID=arvo:10400,arvo:10401,arvo:10402

# API key
CYBERGYM_API_KEY=cybergym-030a0cd7-5908-4862-8ab9-91f2bfc7b56d
```

Fish
```sh
# Server settings
set SERVER_IP 0.0.0.0
set SERVER_PORT 8666

# Directories
set LOG_DIR $CYBERGYM_ROOT/logs
set DB_PATH $CYBERGYM_ROOT/poc.db
set OSS_FUZZ_PATH $CYBERGYM_ROOT/oss-fuzz-data
set CYBERGYM_DATA_DIR $CYBERGYM_ROOT/cybergym_data/data
set OUT_DIR $CYBERGYM_ROOT/cybergym_tmp
set ARTIFACT_DIR $CYBERGYM_ROOT/artifacts

# Task settings (comma-separated for multiple tasks)
set SAMPLE_TASK_ID arvo:10400,arvo:10401,arvo:10402

# API key
set CYBERGYM_API_KEY cybergym-030a0cd7-5908-4862-8ab9-91f2bfc7b56d
```


## Evaluation of CyberGym
### Start Docker
1. Open up the Docker Desktop application and ensure that it is running.
2. We need two seperate terminals for the server and the client. Open up two terminal windows.
3. Activate your MiniCondas.
4. On both terminals, please use the following command to use the proper docker context:
```shell
docker context use desktop-linux
```
4. If the previous step fails, please ensure that you unset the global path of `DOCKER_HOST` and run the previous step again.

To unset on bash:
```bash
unset DOCKER_HOST
```
To unset on fish:
```bash
set -e DOCKER_HOST
```
5. Verify that the docker context is set to `desktop-linux`:
```bash
docker context ls
```
You should see an asterisk next to `desktop-linux`.

## Quick Start with Dev Tools

The `helpers` directory contains convenience scripts that simplify common operations.

### 1. Start the Server

Using the convenience script:
```bash
# Using environment variables from .env
python helpers/start_server.py

# Or with command-line arguments (overrides .env)
python helpers/start_server.py --host 0.0.0.0 --port 8666 --log_dir ./logs
```

The server will:
- Create necessary directories automatically
- Initialize the SQLite database for PoC records
- Start artifact logging in `./artifacts/poc_records/`
- Listen for PoC submissions on the specified port

### 2. Test Task Generation and Submission

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

### 3. Verify Submitted PoCs

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
- Automatically read agent IDs from `./artifacts/poc_records/poc_records.jsonl`
- If multiple agents are found, verify all of them automatically
- Show verification status for each PoC
- Return appropriate exit codes for CI/CD integration

## Complete Workflow Example

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env with your settings

# 2. Start the server (in one terminal)
python helpers/start_server.py

# 3. Run tests (in another terminal)
python helpers/test.py arvo:10400,arvo:3848

# 4. Verify all submitted PoCs
python helpers/verify.py

# Output will show:
# → Auto-detected: agent_abc123
# → Verifying agent: agent_abc123
# ✓ All agents verified successfully
```

## Best Practices

1. **Use `.env` files** for consistent configuration across development environments
2. **Let the server create directories** automatically instead of manual creation
3. **Check artifacts directory** for debugging PoC submission issues
4. **Use helpers scripts** for common operations instead of manual commands

## Troubleshooting

### Server won't start
- Check if port is already in use
- Ensure all required directories are accessible
- Verify `.env` file is properly formatted
- Ensure Docker is running

### Verification fails
- Ensure `CYBERGYM_API_KEY` is set correctly (currently only one key is supported)
- Check that server is running and accessible
- Verify artifacts directory contains PoC records

### Task generation fails
- Confirm `CYBERGYM_DATA_DIR` points to valid data directory
- Check server connectivity
- Ensure task IDs are valid