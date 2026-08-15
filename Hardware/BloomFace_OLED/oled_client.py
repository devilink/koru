import time
try:
    import socketio
except ImportError:
    print("Please install python-socketio: pip install python-socketio[client]")
    exit(1)

# TODO: Import your hardware display libraries here
# e.g., from luma.core.interface.serial import i2c
# e.g., from luma.oled.device import ssd1306
# e.g., from PIL import Image, ImageDraw

sio = socketio.Client()

def draw_face(emotion):
    print(f"[BloomFace_OLED] Hardware drawing emotion: {emotion}")
    # TODO: Implement actual hardware drawing logic
    # if emotion == 'happy':
    #     draw.rectangle(..., fill="white")
    #     device.display(image)

@sio.event
def connect():
    print("[BloomFace_OLED] Connected to BloomOS")

@sio.on('FACE_STATE')
def on_face_state(data):
    emotion = data.get('emotion', 'idle')
    draw_face(emotion)

@sio.event
def disconnect():
    print("[BloomFace_OLED] Disconnected from BloomOS")

if __name__ == '__main__':
    print("[BloomFace_OLED] Starting hardware display client...")
    # TODO: Initialize your I2C/SPI device here
    # serial = i2c(port=1, address=0x3C)
    # device = ssd1306(serial)
    
    try:
        sio.connect('http://localhost:4000')
        sio.wait()
    except Exception as e:
        print(f"Error: {e}")
