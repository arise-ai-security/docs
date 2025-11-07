---
sidebar_position: 1
---

# Installation Guide

## Overview

This guide covers the installation process for SEC-Verifier

## Prerequisites

Before you play around with the SEC-Verifier, ensure you have the following:

### 1. Docker
- **Docker Desktop** is required (Docker daemon must be running).
- Download from [Docker's official website](https://www.docker.com/products/docker-desktop/).

## Installation Steps

### Step 1: Clone the Repository

Clone the Forked, Verified, and Improved [SEC-Verifier repository](https://github.com/arise-ai-security/SecVerifier):

```bash
git clone --recurse-submodules https://github.com/arise-ai-security/SecVerifier
cd SecVerifier
```

### Step 2: Start Up Docker Daemon

- Before you proceed, please clear up some disk on your computer or server. At least 50GB of free disk space is required. 
- Go to the resources/Advanced/Resource Allocation in the docker settings, and increase the allowed disk usage limit to at least 60GB.
- Go to the resources/Network in the docker settings, and enable host networking.
- Start your Docker Desktop. 

### Step 3: Setup Docker Images and Containers

Run the following command.

```bash
# Make the required Docker Images/ Containers.
make docker-dev
```

If you see the following error message, restart your docker desktop.
```bash
Build and run in Docker ...
Cannot connect to the Docker daemon at unix:///Users/songli/.docker/run/docker.sock. Is the docker daemon running?
make: *** [docker-dev] Error 1
```

After the previous command succeeds, you should be automatically redirected into a shell in the docker similar to the following. 
```bash
Build and run in Docker ...
root@e483a7005c8b:/app#
```

### Step 4: Configurations
Restart the docker after the docker daemon is launched by the command:
```bash
make docker-dev
```

IN THE DOCKER SHELL, run the following command:
```bash
# Please make sure you are here
# root@e483a7005c8b:/app#
make build
```

AGAIN IN THE DOCKER SHELL, after the `make build` is successful, run the following command:
```bash
make setup-config
```
You will be prompted to enter the default working directory, LLM model choices, and API keys. Fill out the 
Open AI API key and use default work directory and GPT-4o model for now.