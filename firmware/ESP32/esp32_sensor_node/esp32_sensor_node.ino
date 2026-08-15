#include <WiFi.h>
#include <WebServer.h>
#include <WebSocketsClient.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>
#include "bloom_emotions_bitmaps.h"

WebServer webServer(80);
WebSocketsServer wsServer(81);

const char* html_page PROGMEM = R"HTML(
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
<title>BloomFace Remote Display</title>
<style>
  body { background: #000; color: #fff; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
  canvas { width: 100%; max-width: 512px; image-rendering: pixelated; border: 2px solid #333; border-radius: 10px; box-shadow: 0 0 20px rgba(255,255,255,0.2); }
</style>
</head>
<body>
<canvas id="oled" width="128" height="64"></canvas>
<script>
  const canvas = document.getElementById('oled');
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(128, 64);
  const ws = new WebSocket(`ws://${location.hostname}:81/`);
  ws.binaryType = 'arraybuffer';
  
  ws.onmessage = function(event) {
    const bytes = new Uint8Array(event.data);
    if(bytes.length !== 1024) return;
    
    let dataIdx = 0;
    for(let i = 0; i < 1024; i++) {
      let b = bytes[i];
      for(let bit = 0; bit < 8; bit++) {
        let pixelOn = (b & (1 << bit)) !== 0;
        let c = pixelOn ? 255 : 0;
        imgData.data[dataIdx++] = c;
        imgData.data[dataIdx++] = c;
        imgData.data[dataIdx++] = c;
        imgData.data[dataIdx++] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  };
</script>
</body>
</html>
)HTML";

int current_frame = 0;
String current_animation = "BLINK";
unsigned long lastOledTime = 0;
const int OLED_FRAME_INTERVAL = 33; // ~30 fps

const char* ssid = "iPhone";
const char* password = "password";
const char* websocket_server = "192.168.1.100"; // Replace with your BloomOS IP
const uint16_t websocket_port = 4000;

WebSocketsClient webSocket;

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("[ESP32] Disconnected from BloomOS");
      break;
    case WStype_CONNECTED:
      Serial.println("[ESP32] Connected to BloomOS WebSocket");
      break;
    case WStype_TEXT: {
      String msg = (char*)payload;
      
      // Parse BloomOS FACE_STATE
      if (msg.startsWith("42[\"FACE_STATE\"")) {
        int jsonStart = msg.indexOf('{');
        int jsonEnd = msg.lastIndexOf('}');
        if (jsonStart != -1 && jsonEnd != -1) {
          String jsonString = msg.substring(jsonStart, jsonEnd + 1);
          StaticJsonDocument<256> doc;
          DeserializationError error = deserializeJson(doc, jsonString);
          
          if (!error) {
            String newAnim = doc["animation"] | doc["emotion"] | "BLINK";
            
            // Map fallback states
            if (newAnim == "idle") newAnim = "BLINK";
            else if (newAnim == "happy") newAnim = "LOVE";
            else if (newAnim == "sad") newAnim = "CRY";
            else if (newAnim == "dizzy") newAnim = "SLEEP";
            else if (newAnim == "surprised") newAnim = "UNCOMFORTABLE";
            
            if (newAnim != current_animation) {
              current_animation = newAnim;
              current_frame = 0; // Reset animation when switching
              Serial.printf("[ESP32] Switching to animation: %s\n", current_animation.c_str());
            }
          }
        }
      }
      break;
    }
    default:
      break;
  }
}

void setup() {
  Serial.begin(115200);
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("[ESP32] Connecting to WiFi...");
  }
  Serial.println("[ESP32] Connected to WiFi");
  Serial.print("Local IP: ");
  Serial.println(WiFi.localIP());

  // Connect to the WebSocket server
  webSocket.begin(websocket_server, websocket_port, "/socket.io/?EIO=4&transport=websocket");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
  
  // Setup HTTP Server for Phone Display
  webServer.on("/", []() {
    webServer.send(200, "text/html", html_page);
  });
  webServer.begin();
  
  // Setup WebSocket Server for streaming OLED frames
  wsServer.begin();
}

void loop() {
  webSocket.loop();
  webServer.handleClient();
  wsServer.loop();
  
  // Non-blocking OLED animation update
  if (millis() - lastOledTime >= OLED_FRAME_INTERVAL) {
    lastOledTime = millis();
    
    const unsigned char* frame_data = nullptr;
    int max_frames = 1;
    
    if (current_animation == "BLINK") {
      max_frames = blink_frame_count;
      frame_data = epd_bitmap_blink[current_frame];
    } else if (current_animation == "LOVE") {
      max_frames = love_frame_count;
      frame_data = epd_bitmap_love[current_frame];
    } else if (current_animation == "CRY") {
      max_frames = cry_frame_count;
      frame_data = epd_bitmap_cry[current_frame];
    } else if (current_animation == "SLEEP") {
      max_frames = sleep_frame_count;
      frame_data = epd_bitmap_sleep[current_frame];
    } else if (current_animation == "UNCOMFORTABLE") {
      max_frames = uncomfortable_frame_count;
      frame_data = epd_bitmap_uncomfortable[current_frame];
    } else {
      // Fallback
      max_frames = blink_frame_count;
      frame_data = epd_bitmap_blink[current_frame];
    }

    if (frame_data != nullptr) {
      wsServer.broadcastBIN(frame_data, 1024);
    }

    current_frame++;
    if (current_frame >= max_frames) { 
      current_frame = 0; 
    }
  }
  
  // Simulate a tilt every 20 seconds
  static unsigned long lastTiltTime = 0;
  if (millis() - lastTiltTime > 20000) {
    lastTiltTime = millis();
    Serial.println("[ESP32] Simulating tilt detected...");
    String msg = "42[\"ESP32_TILT\",{\"axis\":\"x\",\"degrees\": 45}]";
    webSocket.sendTXT(msg);
  }
}
