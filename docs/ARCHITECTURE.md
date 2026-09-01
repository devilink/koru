# Architecture Overview

## Core Principles

1.  **Local Only**: All data, inferences, and states stay on the host PC. `localhost` binding by default.
2.  **Deterministic Safety**: Security alerts and hardware limits are deterministic. The LLM never makes absolute security or hardware command decisions.
3.  **Simulation First**: The platform relies on a `simulators` package to mock physical hardware until explicit integration testing proves hardware readiness.

## Component Breakdown

*   **`apps/api`**: FastAPI server handling REST endpoints and WebSockets for local frontend communication.
*   **`apps/dashboard`**: React/Vite/TypeScript frontend rendering the Mochi-style face and configuration dashboards.
*   **`packages/perception`**: OpenVINO/CPU-based pipeline for real-time person detection, tracking, and face verification.
*   **`packages/safety`**: Pure deterministic logic evaluating perception events against configured rules to emit alerts. No LLMs.
*   **`packages/agent`**: LangGraph-based workflow orchestrating Qwen3 via Ollama for conversational interaction.
*   **`packages/rag`**: Qdrant-backed ingestion and retrieval system using `bge-small-en-v1.5`.
*   **`packages/companion`**: State machine mapping external stimuli (emotion cues, agent responses, plant moisture) to display states (e.g., curious, sleepy, plant-thirsty).
*   **`packages/hardware_contracts`**: Pydantic models for MQTT telemetry and commands.
*   **`packages/simulators`**: Fake hardware event generators (camera, soil, touch).
