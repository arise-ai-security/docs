---
sidebar_position: 2
sidebar_label: Architecture
---

# CyberGym Architecture Documentation

## Overview

CyberGym is a cybersecurity evaluation framework designed to assess AI agents' capabilities in finding and exploiting real-world vulnerabilities. The system provides a secure, Docker-based environment for testing vulnerability proofs-of-concept (PoCs) against both vulnerable and fixed versions of software.

## System Architecture

### High-Level Architecture

```mermaid
 graph TB
      subgraph "User/Agent Layer"
          User["User/Developer"]
          Agent["AI Agent"]
      end

      subgraph "Task Generation & Submission"
          GenTask["cybergym.task.gen_task"]
          TaskPackage["Task Package<br/>(README, repo-vul.tar.gz, submit.sh)"]
      end

      subgraph "CyberGym Server"
          API["/submit-vul endpoint"]
          Validator["PoC Validator"]
          PrivateAPI["Private APIs<br/>(query-poc, verify-agent-pocs)"]
      end

      subgraph "Execution Environment"
          DockerExec["Docker Container Execution"]
          DockerImages[("Docker Hub Images")]
      end

      subgraph "Data Sources & Storage"
          HF["HuggingFace Dataset"]
          CyberGymData["cybergym_data"]
          OSSFuzz["oss-fuzz-data"]
          SQLite[("poc.db")]
          Artifacts["Artifact Logs"]
      end

      subgraph "Verification"
          VerifyScript["verify_agent_result.py"]
      end

      User --> GenTask
      Agent --> GenTask
      GenTask --> CyberGymData
      GenTask --> OSSFuzz
      GenTask --> TaskPackage

      TaskPackage -->|submit.sh| API
      API --> Validator
      Validator --> DockerExec
      DockerExec --> DockerImages

      Validator --> SQLite
      Validator --> Artifacts

      VerifyScript --> PrivateAPI
      PrivateAPI --> SQLite
      PrivateAPI --> DockerExec

      HF --> CyberGymData

      style Agent fill:#f9f
      style API fill:#bbf
      style DockerExec fill:#bfb

```

### Core Workflow Diagram

```mermaid
sequenceDiagram
    participant User
    participant GenTask as cybergym.task.gen_task
    participant Server as cybergym.server
    participant Docker
    participant DB as SQLite
    participant Verify as verify_agent_result.py
    
    Note over User: Step 1: Generate Task
    User->>GenTask: python -m cybergym.task.gen_task<br/>--task-id TASK_ID<br/>--out-dir OUT_DIR<br/>--data-dir CYBERGYM_DATA_DIR<br/>--server http://SERVER:PORT
    GenTask->>GenTask: Load task from cybergym_data
    GenTask->>GenTask: Create task package
    GenTask-->>User: Generate files:<br/>- description.txt<br/>- README.md<br/>- repo-vul.tar.gz<br/>- submit.sh
    
    Note over User: Step 2: Create and Submit PoC
    User->>User: Create PoC file<br/>echo -en "\x00\x01\x02\x03" > poc
    User->>Server: bash submit.sh poc<br/>(calls POST /submit-vul)
    Server->>Server: Validate submission
    Server->>Docker: Execute PoC in container
    Docker->>Docker: Run against vulnerable binary
    Docker->>Docker: Run against fixed binary
    Docker-->>Server: Return exit codes
    Server->>DB: Store PoC record
    Server-->>User: Return:<br/>{"poc_id": "...", "exit_code": 0}
    
    Note over User: Step 3: Verify Results
    User->>Verify: python scripts/verify_agent_result.py<br/>--server http://SERVER:PORT<br/>--pocdb_path poc.db<br/>--agent_id AGENT_ID
    Verify->>Server: POST /verify-agent-pocs<br/>X-API-Key: CYBERGYM_API_KEY
    Server->>DB: Query agent's PoCs
    Server->>Docker: Re-execute all PoCs
    Docker-->>Server: Verification results
    Server-->>Verify: Return verification status
    Verify-->>User: Display results
```

### Installation and Setup Flow

```mermaid
graph LR
    subgraph "Initial Setup"
        Install["pip install with dev,server"]
        GitLFS["git lfs install"]
        CloneData["git clone HuggingFace dataset"]
    end
    
    subgraph "Download Data"
        FullData["download.py script"]
        SubsetData["download_subset.py script"]
        WgetData["wget oss-fuzz-data-subset.7z"]
        Extract["7z extract archives"]
    end
    
    subgraph "Example Agents"
        Submodule["git submodule update"]
        AgentExamples["Load example agents"]
    end
    
    Install --> GitLFS
    GitLFS --> CloneData
    CloneData --> FullData
    CloneData --> SubsetData
    SubsetData --> WgetData
    WgetData --> Extract
    
    Install --> Submodule
    Submodule --> AgentExamples
```

## Core Components

### 1. Server Component (`src/cybergym/server/`)

```mermaid
graph LR
    subgraph "Server Module"
        Main[__main__.py]
        Config[config.py]
        Env[env_utils.py]
        
        subgraph "API Layer"
            Routes[FastAPI Routes]
            Auth[API Key Auth]
        end
        
        subgraph "Business Logic"
            Utils[server_utils.py]
            Types[types.py]
        end
        
        subgraph "Data Access"
            PoCDB[pocdb.py]
            Models[models.py]
        end
        
        subgraph "Custom Components"
            Exc[exceptions.py]
            Log[logging.py]
            Events[events.py]
        end
    end
    
    Main --> Routes
    Routes --> Auth
    Routes --> Utils
    Utils --> PoCDB
    Config --> Env
    Utils --> Exc
    PoCDB --> Models
```

**Key Files:**
- `__main__.py`: FastAPI application entry point with endpoint definitions
- `config.py`: Pydantic-based configuration management
- `server_utils.py`: Core business logic for PoC submission and validation
- `pocdb.py`: SQLAlchemy database operations
- `exceptions.py`: Custom exception hierarchy for structured error handling

### 2. Task System (`src/cybergym/task/`)

```mermaid
graph TD
    subgraph "Task Generation"
        GenTask[gen_task.py]
        TaskTypes[types.py]
        DataLoader[data_loader.py]
        
        GenTask --> TaskTypes
        GenTask --> DataLoader
        
        DataLoader --> CyberGymData[CyberGym Dataset]
        DataLoader --> OSSFuzz[OSS-Fuzz Data]
    end
    
    subgraph "Task Output (Artifacts)"
        Description[description.txt]
        README[README.md]
        VulCode[repo-vul.tar.gz]
        Submit[submit.sh]
    end
    
    GenTask --> Description
    GenTask --> README
    GenTask --> VulCode
    GenTask --> Submit
```

### 3. Helper Scripts Layer (`helpers/`)

```mermaid
graph LR
    subgraph "Helper Scripts"
        EnvLoader[env_loader.py]
        StartServer[start_server.py]
        Test[test.py]
        Verify[verify.py]
        Cleanup[cleanup.py]
    end
    
    subgraph "Core Functions"
        FindRoot[find_repo_root]
        LoadEnv[load_env]
        EnsureEnv[ensure_env_loaded]
    end
    
    EnvLoader --> FindRoot
    EnvLoader --> LoadEnv
    EnvLoader --> EnsureEnv
    
    StartServer --> EnsureEnv
    Test --> EnsureEnv
    Verify --> EnsureEnv
```

## Data Flow

### 1. PoC Submission Flow

```mermaid
stateDiagram-v2
    [*] --> Receive: POST /submit-vul
    Receive --> Validate: Parse metadata
    Validate --> CheckAuth: Validate API key
    CheckAuth --> PrepareDocker: Authentication OK
    PrepareDocker --> ExecutePoC: Pull Docker image
    ExecutePoC --> ProcessResult: Run in container
    ProcessResult --> StoreDB: Parse output
    StoreDB --> LogArtifact: Save to SQLite
    LogArtifact --> Response: Write to artifacts/
    Response --> [*]: Return poc_id
    
    Validate --> Error: Invalid format
    CheckAuth --> Error: Auth failed
    PrepareDocker --> Error: Docker error
    ExecutePoC --> Error: Execution failed
    Error --> [*]: Return error
```

### 2. Database Schema

```mermaid
erDiagram
    PoCRecord {
        string poc_id PK
        string agent_id
        string task_id
        string poc_hash
        int poc_length
        int vul_exit_code
        int fix_exit_code
        datetime created_at
        datetime updated_at
    }
    
    Agent {
        string agent_id PK
        string name
        datetime created_at
    }
    
    Task {
        string task_id PK
        string type
        string difficulty
        json metadata
    }
    
    Agent ||--o{ PoCRecord : submits
    Task ||--o{ PoCRecord : targets
```

## API Endpoints

### Public Endpoints

- **POST /submit-vul**: Receives a PoC file from an agent, executes it in a Docker container against both vulnerable and fixed versions of the target software, stores the results in the database, and returns the execution outcome.

### Private Endpoints (Requires API Key)

- **POST /submit-fix**: Tests a proposed fix by running the PoC against the patched version to verify the vulnerability has been resolved.

- **POST /query-poc**: Retrieves all PoC submission records from the database for a specific agent and/or task, used for tracking submission history and results.

- **POST /verify-agent-pocs**: Re-executes all PoCs previously submitted by an agent to verify they still trigger the vulnerabilities, ensuring reproducibility of results.

## Security Architecture

### Docker Isolation

```mermaid
graph TD
    subgraph "Host System"
        Server["CyberGym Server"]
        TempFile["Temporary PoC file"]
    end
    
    subgraph "Docker Container"
        Runner["OSS-Fuzz Runner"]
        Fuzzer["Target Fuzzer"]
        VulBinary["Vulnerable Binary"]
        FixBinary["Fixed Binary"]
    end
    
    Server --> TempFile
    TempFile --> Runner
    Runner --> Fuzzer
    Fuzzer --> VulBinary
    Fuzzer --> FixBinary
    VulBinary --> Result1["Exit Code"]
    FixBinary --> Result2["Exit Code"]
    Result1 --> Server
    Result2 --> Server
```

## Error Handling Architecture

```mermaid
graph TD
    BaseExc["CyberGymException"]
    
    BaseExc --> ValidationExc["ValidationException"]
    BaseExc --> AuthExc["AuthenticationException"]
    BaseExc --> NotFoundExc["RecordNotFoundException"]
    BaseExc --> DBExc["DatabaseException"]
    BaseExc --> DockerExc["DockerException"]
    BaseExc --> TaskExc["TaskExecutionException"]
    
    ValidationExc --> HTTP400["HTTP 400"]
    AuthExc --> HTTP401["HTTP 401"]
    NotFoundExc --> HTTP404["HTTP 404"]
    DBExc --> HTTP500["HTTP 500"]
    DockerExc --> HTTP500
    TaskExc --> HTTP500
```