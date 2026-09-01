# Privacy Policy

**Privacy is the core feature, not an afterthought.**

## Data Retention & Storage

1.  **No Cloud**: No data leaves the local PC. APIs and databases must bind to `127.0.0.1`.
2.  **Explicit Consent**: Household members must explicitly opt-in to face enrollment.
3.  **Encrypted Embeddings**: Face embeddings are encrypted at rest using Fernet symmetric encryption.
4.  **Raw Image Deletion**: Raw enrollment photos are deleted immediately after embeddings are generated, unless explicitly preserved by the user for retraining.
5.  **No Continuous Recording**: Camera feeds are processed in memory and dropped. Event thumbnails are disabled by default.
6.  **Transparent Memory**: The LLM's RAG memory can be viewed, exported, and deleted via the dashboard. It will never automatically infer and save personal sensitive data without user prompting.

## Inference Constraints

*   The system never labels a person as "suspicious," "dangerous," or an "intruder." It only registers "Unknown person."
*   Video feeds are never used to infer criminal intent, race, age, gender, or health conditions.
*   Emotion cues are treated as *uncertain* signals. The companion reacts gently (e.g., "You seem quiet") rather than stating absolute certainty.
