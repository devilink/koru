#include <Arduino.h>
#include <WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>
#include "secrets.h"

// WebSockets Server on port 81
WebSocketsServer webSocket = WebSocketsServer(81);

void handleWebSocketMessage(uint8_t num, uint8_t * payload, size_t length) {
  // Parse incoming JSON message
  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, payload, length);

  if (error) {
    Serial.print("[ESP32] JSON Parse Error: ");
    Serial.println(error.c_str());
    return;
  }

  const char* msgType = doc["type"];
  if (!msgType) {
    Serial.println("[ESP32] Invalid message: missing 'type'");
    return;
  }

  if (strcmp(msgType, "PING") == 0) {
    Serial.println("[ESP32] PING received");
    long timestamp = doc["timestamp"] | 0;
    
    // Respond with PONG
    StaticJsonDocument<128> outDoc;
    outDoc["type"] = "PONG";
    outDoc["timestamp"] = timestamp;
    
    String outStr;
    serializeJson(outDoc, outStr);
    webSocket.sendTXT(num, outStr);
    Serial.println("[ESP32] PONG sent");
    
  } else if (strcmp(msgType, "COMMAND") == 0) {
    const char* command = doc["command"];
    Serial.printf("[ESP32] COMMAND received: %s\n", command ? command : "null");
    
    // Respond with COMMAND_ACK
    StaticJsonDocument<128> outDoc;
    outDoc["type"] = "COMMAND_ACK";
    outDoc["command"] = command;
    
    String outStr;
    serializeJson(outDoc, outStr);
    webSocket.sendTXT(num, outStr);
    Serial.println("[ESP32] COMMAND_ACK sent");
    
  } else {
    Serial.printf("[ESP32] Unknown message type: %s\n", msgType);
  }
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.printf("[ESP32] Phone [%u] disconnected\n", num);
      break;
      
    case WStype_CONNECTED: {
      IPAddress ip = webSocket.remoteIP(num);
      Serial.printf("[ESP32] Phone [%u] connected from %d.%d.%d.%d\n", num, ip[0], ip[1], ip[2], ip[3]);
      
      // Send DEVICE_INFO upon connection
      StaticJsonDocument<256> outDoc;
      outDoc["type"] = "DEVICE_INFO";
      outDoc["device"] = "ESP32_KORU_BODY";
      outDoc["firmware"] = "0.1.0";
      
      String outStr;
      serializeJson(outDoc, outStr);
      webSocket.sendTXT(num, outStr);
      Serial.println("[ESP32] Sent DEVICE_INFO");
      break;
    }
    
    case WStype_TEXT:
      handleWebSocketMessage(num, payload, length);
      break;
      
    case WStype_BIN:
    case WStype_ERROR:
    case WStype_FRAGMENT_TEXT_START:
    case WStype_FRAGMENT_BIN_START:
    case WStype_FRAGMENT:
    case WStype_FRAGMENT_FIN:
    default:
      break;
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n[ESP32] Booting...");

  // Connect to Wi-Fi
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("[ESP32] WiFi connecting...");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\n[ESP32] WiFi connected");
  Serial.print("[ESP32] IP address: ");
  Serial.println(WiFi.localIP());

  // Start WebSocket Server
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  Serial.println("[ESP32] WebSocket server started on port 81");
}

void loop() {
  webSocket.loop();
  
  // To avoid watchdog resets, yield occasionally if doing heavy processing
  yield();
}
