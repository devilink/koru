const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Central State
let currentState = {
  emotion: 'idle'
};

io.on('connection', (socket) => {
  console.log(`[BloomOS] New connection: ${socket.id}`);
  
  // Send current state to newly connected client
  socket.emit('FACE_STATE', currentState);

  // Listen for Vision triggers
  socket.on('VISION_MOTION_DETECTED', (data) => {
    console.log('[BloomOS] Vision Motion Detected:', data);
    updateState('surprised', 3000);
  });

  // Listen for Voice triggers
  socket.on('VOICE_COMMAND', (data) => {
    console.log('[BloomOS] Voice Command Received:', data);
    if (data.intent === 'greeting') {
      updateState('happy', 4000);
    }
  });

  // Listen for ESP32 triggers (e.g. tilted or shaken)
  socket.on('ESP32_TILT', (data) => {
    console.log('[BloomOS] ESP32 Tilt Detected:', data);
    updateState('dizzy', 5000);
  });

  socket.on('disconnect', () => {
    console.log(`[BloomOS] Disconnected: ${socket.id}`);
  });
});

function updateState(emotion, duration) {
  currentState.emotion = emotion;
  io.emit('FACE_STATE', currentState);
  console.log(`[BloomOS] State updated -> ${emotion}`);

  if (duration) {
    setTimeout(() => {
      // Revert to idle after duration
      currentState.emotion = 'idle';
      io.emit('FACE_STATE', currentState);
      console.log(`[BloomOS] State reverted -> idle`);
    }, duration);
  }
}

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`[BloomOS] Server listening on port ${PORT}`);
});
