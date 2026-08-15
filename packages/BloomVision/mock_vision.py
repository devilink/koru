import time
import json
try:
    import socketio
except ImportError:
    print("Please install python-socketio: pip install python-socketio[client]")
    exit(1)

# Initialize standard Socket.IO client
sio = socketio.Client()

def motion_loop():
    while True:
        sio.sleep(10)
        print("[BloomVision] Simulating motion detected...")
        sio.emit('VISION_MOTION_DETECTED', {'source': 'camera_1'})

@sio.event
def connect():
    print("[BloomVision] Connected to BloomOS")
    # Start the loop as a background task to prevent blocking the event loop
    sio.start_background_task(motion_loop)

@sio.event
def connect_error(data):
    print("[BloomVision] Connection failed!")

@sio.event
def disconnect():
    print("[BloomVision] Disconnected from BloomOS")

if __name__ == '__main__':
    print("[BloomVision] Starting mock vision service...")
    try:
        sio.connect('http://localhost:4000')
        sio.wait()
    except Exception as e:
        print(f"Error: {e}")
