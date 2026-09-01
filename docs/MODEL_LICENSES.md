# Model Licenses & Sources

This project uses several local AI models. They are never downloaded automatically during startup to ensure explicit user consent and network control.

## 1. Qwen3 4B (Quantized)
*   **Purpose**: Local conversational chat model.
*   **Source**: Download via Ollama (`ollama run qwen2.5:3b` - Note: Qwen3 is not yet available, falling back to latest Qwen/Qwen2.5 3B or 7B depending on release).
*   **License**: Check Qwen official repository (typically Apache 2.0 or Tongyi Qianwen LICENSE).

## 2. BAAI/bge-small-en-v1.5
*   **Purpose**: Local embeddings for RAG and face verification (placeholder).
*   **Source**: Hugging Face / Qdrant compatible source.
*   **License**: MIT License.

## 3. whisper.cpp (base.en)
*   **Purpose**: Local Speech-to-Text.
*   **Source**: Download from whisper.cpp releases.
*   **License**: MIT License.

## 4. OpenVINO / MediaPipe Models
*   **Purpose**: Person detection, face landmarking.
*   **Source**: OpenVINO Model Zoo / Google MediaPipe.
*   **License**: Apache 2.0.

> [!WARNING]
> Do not commit these models to version control. Place any manually downloaded model weights into the `models/` directory, which is excluded by `.gitignore`.
