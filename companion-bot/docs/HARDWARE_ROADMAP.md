# Hardware Integration Roadmap

This document outlines the transition from the desktop prototype to a physical robot with ESP32 integration.

## Current State (Simulated)

All physical interactions are simulated in software:
*   Camera feeds are faked or use the built-in webcam.
*   Soil moisture is a simulated value with a fake calibration model.
*   Motors and touch sensors are entirely mocked.

## Future Hardware Constraints

1.  **Hardware Safety Controller**: The physical robot will feature a dedicated microcontroller responsible for safety limits (speed limits, collision detection, overcurrent). The PC cannot override these.
2.  **Emergency Stop**: Hardware must support a physical emergency stop that cuts motor power independent of software.
3.  **MQTT Transport**: Communication between the PC and ESP32 will occur over MQTT using the topics defined in `packages/hardware_contracts`.
4.  **No Direct LLM Control**: The LLM will output high-level intents (e.g., `seek_user`). The `agent` package must validate these before issuing `RobotCommand` messages to the MQTT broker.
