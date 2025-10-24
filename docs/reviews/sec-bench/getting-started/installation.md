---
sidebar_position: 1
---

# Installation Guide

## Overview

This guide covers the installation process for Sec-Bench.

## Prerequisites

Before installing Sec-Bench, ensure you have the following:

### 1. Docker
- **Docker Desktop** is required (Docker daemon must be running).
- Download from [Docker's official website](https://www.docker.com/products/docker-desktop/).

### 2. Conda
- Install [Miniconda](https://www.anaconda.com/docs/getting-started/miniconda/install) or Anaconda.
- Required for managing Python virtual environments.

### 3. Python
- Python version **≥ 3.12** is required.
- Will be installed via Conda in the setup process.

## Installation Steps

### Step 1: Clone the Repository

Clone the Sec-Bench repository:

```bash
git clone --recurse-submodules https://github.com/SEC-bench/SEC-bench.git
cd SEC-bench
```

### Step 2: Set Environment Variables

Set environment variables for easier configuration of API usages:
```bash
# Required API tokens
# Define Your GitHub Token at https://github.com/settings/tokens
export GITHUB_TOKEN=<your_github_token>
export GITLAB_TOKEN=<your_gitlab_token>
export OPENAI_API_KEY=<your_openai_api_key>
export ANTHROPIC_API_KEY=<your_anthropic_api_key>

# Hugging Face configuration
export HF_TOKEN_PATH=$HOME/.cache/hf_hub_token
export HF_HOME=<path/to/huggingface>
```

### Step 3: Create Virtual Environment

Create and activate a Conda virtual environment with Python 3.12:

```bash
# Create & Activate environment
conda create -n secb python=3.12
conda activate secbb

# Verify pip is from the virtual environment
which pip  # Should show path within conda env
```

### Step 4: Install Dependencies

Install CyberGym with all required dependencies:

```bash
# Install in development mode with all extras
pip install -r requirements.txt
```