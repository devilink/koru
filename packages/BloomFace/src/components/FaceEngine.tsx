"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import FaceRenderer from "./FaceRenderer";

export default function FaceEngine() {
  const [emotion, setEmotion] = useState("BLINK");

  useEffect(() => {
    // Connect to BloomOS server (assumes BloomOS runs on port 4000 of the same device hosting the web app)
    const socketUrl = typeof window !== 'undefined' 
      ? `http://${window.location.hostname}:4000` 
      : "http://localhost:4000";
      
    const socket = io(socketUrl);

    socket.on("connect", () => {
      console.log("[BloomFace_Web] Connected to BloomOS");
    });

    socket.on("FACE_STATE", (data: any) => {
      console.log("[BloomFace_Web] Received FACE_STATE:", data);
      
      if (data && data.animation) {
        setEmotion(data.animation);
      } else if (data && data.emotion) {
        // Fallback mapping for older triggers
        const mappedEmotion = data.emotion === 'idle' ? 'BLINK' : 
                   data.emotion === 'happy' ? 'LOVE' : 
                   data.emotion === 'sad' ? 'CRY' : 
                   data.emotion === 'dizzy' ? 'SLEEP' : 
                   data.emotion === 'surprised' ? 'UNCOMFORTABLE' : data.emotion;
                   
        setEmotion(mappedEmotion);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-black overflow-hidden relative">
      
      {/* New Modular SVG Face Renderer */}
      <FaceRenderer emotion={emotion} />
      
      {/* Debug Info */}
      <div className="absolute bottom-4 right-4 text-cyan-700/50 text-xs font-mono z-10 bg-black/50 p-2 rounded pointer-events-none">
        Current Input: {emotion.toUpperCase()}
      </div>
    </div>
  );
}
