import cv2
import asyncio
import threading
import queue
from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from packages.agent.graph import CompanionAgent
from packages.simulators.hardware import SimulatedHardware
from packages.perception.expressions import ExpressionExtractor

import torch
# Monkey-patch torch.load to fix PyTorch 2.6 weights_only=True breaking hsemotion
_original_load = torch.load
torch.load = lambda *args, **kwargs: _original_load(*args, **{**kwargs, 'weights_only': False})

app = FastAPI(title="Companion Bot API")
app.mount("/emotions", StaticFiles(directory="data/emotions"), name="emotions")

agent = CompanionAgent()
hardware = SimulatedHardware()
emotion_extractor = ExpressionExtractor()
current_emotion = "happy"
current_visual_context = []
current_frame_b64 = ""
chat_queue = queue.Queue()

def camera_loop():
    global current_emotion, current_frame_b64, current_visual_context
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    try:
        from ultralytics import YOLO
        yolo_model = YOLO("yolo11n.pt")
        print("YOLO11 loaded successfully!")
    except ImportError:
        print("Error: ultralytics not installed. Falling back to empty vision.")
        yolo_model = None

    import os
    import urllib.request
    cascade_path = "haarcascade_frontalface_default.xml"
    if not os.path.exists(cascade_path):
        url = "https://raw.githubusercontent.com/opencv/opencv/master/data/haarcascades/haarcascade_frontalface_default.xml"
        urllib.request.urlretrieve(url, cascade_path)
    face_cascade = cv2.CascadeClassifier(cascade_path)

    while True:
        ret, frame = cap.read()
        if not ret: continue
        
        detected_objects = []

        if yolo_model:
            results = yolo_model(frame, verbose=False)
            for result in results:
                for box in result.boxes:
                    cls_id = int(box.cls[0])
                    conf = float(box.conf[0])
                    class_name = yolo_model.names[cls_id]
                    
                    if conf > 0.5:
                        detected_objects.append(class_name)
                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)
                        cv2.putText(frame, class_name, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)
                        
        # Extract emotion using Haar Cascade for proper face cropping
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        if len(faces) > 0:
            x, y, w, h = faces[0]
            face_img = frame[y:y+h, x:x+w]
            em = emotion_extractor.get_stable_emotion(face_img)
            if em: current_emotion = em
            
            # Draw face box in green
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            cv2.putText(frame, current_emotion, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
        
        # Deduplicate and update context safely
        current_visual_context = list(set(detected_objects))
            
        import base64
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 50])
        current_frame_b64 = base64.b64encode(buffer).decode('utf-8')

threading.Thread(target=camera_loop, daemon=True).start()

def microphone_loop():
    import time
    global current_visual_context
    try:
        import speech_recognition as sr
        import pyttsx3
    except ImportError:
        print("Please install SpeechRecognition and pyttsx3")
        return
        
    try:
        tts_engine = pyttsx3.init()
        tts_engine.setProperty('rate', 150)
    except Exception as e:
        print(f"Failed to init TTS: {e}")
        tts_engine = None
        
    recognizer = sr.Recognizer()
    
    while True:
        try:
            with sr.Microphone() as source:
                recognizer.adjust_for_ambient_noise(source, duration=0.5)
                audio = recognizer.listen(source, timeout=1, phrase_time_limit=10)
                
            text = recognizer.recognize_google(audio)
            if text:
                print(f"Heard: {text}")
                chat_queue.put({"sender": "You", "text": text})
                
                # Pass visual context to agent
                response = agent.chat(text, visual_context=current_visual_context)
                chat_queue.put({"sender": "Bot", "text": response})
                
                if tts_engine:
                    tts_engine.say(response)
                    tts_engine.runAndWait()
                    
        except sr.WaitTimeoutError:
            pass
        except sr.UnknownValueError:
            pass
        except Exception as e:
            time.sleep(2)

threading.Thread(target=microphone_loop, daemon=True).start()

class ChatRequest(BaseModel):
    message: str

@app.get("/")
def read_root():
    with open("apps/api/index.html", "r") as f:
        return HTMLResponse(content=f.read())

@app.post("/api/chat")
def chat_endpoint(req: ChatRequest):
    return {"response": agent.chat(req.message, visual_context=current_visual_context)}

@app.get("/api/telemetry")
def telemetry_endpoint():
    return hardware.get_telemetry().dict()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await websocket.send_json({
                "type": "emotion", 
                "data": current_emotion,
                "frame": current_frame_b64
            })
            
            while not chat_queue.empty():
                msg = chat_queue.get_nowait()
                await websocket.send_json({
                    "type": "chat",
                    "data": msg
                })
                
            await asyncio.sleep(0.2)
    except Exception as e:
        print(f"WebSocket closed: {e}")
