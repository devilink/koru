# companion-bot

Privacy-first local companion robot platform prototype.

## Overview

This project is a desktop software prototype for a companion robot platform. It runs completely locally without external cloud dependencies. It features vision-based safety detection, LLM-based interactions, memory (RAG), and simulated hardware interfaces that will eventually map to physical ESP32 devices.

## Features

- **Local-first AI**: Runs Qwen3 4B via Ollama and `bge-small-en-v1.5` for local embeddings.
- **Privacy-first Safety**: Deterministic unknown person detection based on local facial recognition. Does not record video or send data externally.
- **Companion Engine**: Mochi-style animated frontend using SVG/Canvas, interacting through a LangGraph agent.
- **Hardware Abstraction**: Simulated sensors (soil moisture, touch, ultrasonic) and strict physical command validation, preparing for future hardware.

## Quick Start (Windows 11)

1.  **Requirements**:
    *   Python 3.11+
    *   Docker Desktop (for Qdrant)
    *   Ollama (installed natively)

2.  **Environment Setup**:
    ```bash
    copy .env.example .env
    # Generate a new encryption key and update .env ENCRYPTION_KEY
    python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
    ```

3.  **Install Dependencies**:
    ```bash
    pip install -e .[dev]
    ```

4.  **Start Services**:
    ```bash
    docker-compose up -d
    # Run API
    uvicorn apps.api.main:app --reload
    ```
