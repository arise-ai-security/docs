---
sidebar_position: 1
---

# Installation Guide

## Overview

This guide covers the installation process for CyberGym using an improved fork that addresses environment compatibility issues found in the original repository.

### Why Use the Fork?

The original CyberGym repository ([sunblaze-ucb/cybergym](https://github.com/sunblaze-ucb/cybergym)) can encounter issues with:
- Server failures in certain local environments
- Script execution failures depending on terminal configuration
- Environment-specific compatibility problems

To address these issues, we maintain an enhanced fork at [nearKim/cybergym](https://github.com/nearKim/cybergym.git) that includes:
- Helper scripts for server management in the `helpers/` directory
- Improved task generation and validation logic
- Better cross-environment compatibility

## Prerequisites

Before installing CyberGym, ensure you have the following:

### 1. Docker
- **Docker Desktop** is required (Docker daemon must be running).
- Download from [Docker's official website](https://www.docker.com/products/docker-desktop/).
- **Note**: `colima` users should refer to the [Troubleshooting](#troubleshooting) section for additional configuration.

### 2. Conda
- Install [Miniconda](https://www.anaconda.com/docs/getting-started/miniconda/install) or Anaconda.
- Required for managing Python virtual environments.

### 3. Python
- Python version **≥ 3.12** is required.
- Will be installed via Conda in the setup process.

### 4. 7z
- **[7z](https://www.7-zip.org/download.html)** is required for downloading and unzipping the OSS-Fuzz dataset.

## Installation Steps

### Step 1: Clone the Repository

Clone the enhanced CyberGym fork and switch to the `develop` branch:

```bash
git clone https://github.com/nearKim/cybergym.git
cd cybergym
git checkout develop
```

### Step 2: Set Environment Variables

Set the CyberGym root directory as an environment variable for easier configuration:

**Bash/Zsh:**
```bash
export CYBERGYM_ROOT=$(pwd)
```

**Fish:**
```sh
set -x CYBERGYM_ROOT (pwd)
```

### Step 3: Create Virtual Environment

Create and activate a Conda virtual environment with Python 3.12:

```bash
# Create & Activate environment
conda create -n cybergym python=3.12
conda activate cybergym

# Verify pip is from the virtual environment
which pip  # Should show path within conda env
```

### Step 4: Install Dependencies

Install CyberGym with all required dependencies:

```bash
# Install in development mode with all extras
pip install -e '.[dev,server,custom]'
```

This installs:
- Core CyberGym package in editable mode
- Development tools and dependencies
- Server components for running experiments
- Custom extensions and utilities

### Step 5: Docker Setup

#### Docker Desktop Installation

1. Install Docker Desktop from [Docker's official website](https://www.docker.com/products/docker-desktop/)
2. Start Docker Desktop and ensure it's running
3. Verify Docker installation:

```bash
# Check Docker is running
docker info

# Test Docker with hello-world
docker run hello-world
```

#### Docker Context Configuration

[//]: # TODO: Add `colima` setup()

For Docker Desktop users:
```bash
# Set Docker Desktop context
docker context use desktop-linux

# Verify context
docker context ls
```

### Step 6: Download Server Data

Download the required OSS-Fuzz dataset for CyberGym experiments:

```bash
python scripts/server_data/download_subset.py
wget https://huggingface.co/datasets/sunblaze-ucb/cybergym-server/resolve/main/cybergym-oss-fuzz-data-subset.7z
7z x cybergym-oss-fuzz-data-subset.7z
```

#### Option 3: Using Python Script
```bash
# Alternative download script
python scripts/server_data/download_subset.py
```

### Step 7: Verify Installation

Run verification checks to ensure everything is properly installed:

```bash
# Check Python version
python --version  # Should be ≥3.12

# Check CyberGym installation
python -c "import cybergym; print(cybergym.__version__)"

# Check Docker
docker --version
docker ps  # Should not show permission errors

# Verify data download
ls -la $CYBERGYM_ROOT/oss-fuzz-data/  # Should contain dataset files
```

## Next Steps

After a successful installation:
1. Continue to [Local Machine Setup](./quick-start/local_machine) for configuration and running your first experiment.
2. Review [Theory Overview](/theory/overview) for understanding the framework.
3. Check [Experiments](/experiments) for detailed experiment procedure and the design of CyberGym.