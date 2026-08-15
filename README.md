# Bloom Modular Robot Architecture

Welcome to the Bloom physical robot companion project, inspired by "Dasai Mochi".
This workspace implements a hardware-agnostic microservices architecture relying on WebSockets for real-time state communication.

## Architecture Overview

The system is decoupled into the following components:

- **BloomOS (The Brain)**: A central Node.js/Express WebSocket server that manages the robot's state and broadcasts universal emotion/animation commands to all connected displays.
- **BloomFace_Web**: A high-resolution web client built with Next.js, Tailwind, and GSAP. Runs on smartphones or HDMI LCDs via Chromium kiosk mode.
- **BloomFace_OLED**: Placeholder for raw hardware display scripts (Python `luma.oled` / C++).
- **BloomVision**: Python script simulating OpenCV facial/motion tracking input.
- **BloomVoice**: Node.js script simulating Speech-to-Text inputs.
- **ESP32_NervousSystem**: Arduino sketches for IMU (accelerometer/gyro) hardware sensors.

## WebSocket Protocol

The system communicates via Socket.io/WebSocket using a standardized payload structure.

**Event**: `FACE_STATE`
**Payload**:
```json
{
  "emotion": "happy", // e.g., idle, happy, sad, dizzy, surprised
  "duration": 3000   // milliseconds before returning to idle (optional)
}
```

## Running the System

1. Start the central brain:
   ```bash
   cd BloomOS
   npm install
   npm start
   ```
2. Start the web display:
   ```bash
   cd BloomFace_Web
   npm install
   npm run dev
   ```
3. Run the mock hardware inputs (e.g., Vision) to see real-time updates!
