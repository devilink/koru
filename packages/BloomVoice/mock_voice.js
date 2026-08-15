const { io } = require("socket.io-client");

const socket = io("http://localhost:4000");

socket.on("connect", () => {
  console.log("[BloomVoice] Connected to BloomOS");
  
  // Simulate a voice command event every 15 seconds
  setInterval(() => {
    console.log("[BloomVoice] Simulating voice command 'greeting'...");
    socket.emit("VOICE_COMMAND", { intent: "greeting", text: "Hello Bloom" });
  }, 15000);
});

socket.on("connect_error", (err) => {
  console.log(`[BloomVoice] Connection error: ${err.message}`);
});

socket.on("disconnect", () => {
  console.log("[BloomVoice] Disconnected from BloomOS");
});

console.log("[BloomVoice] Starting mock voice service... Please run 'npm init -y && npm install socket.io-client' if you haven't.");
