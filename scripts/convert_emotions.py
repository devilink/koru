import os
import subprocess

WIDTH = 128
HEIGHT = 64
THRESHOLD = 128

INPUT_DIR = "packages/BloomFace/public/Emotions"
OUTPUT_FILE = "firmware/ESP32/esp32_sensor_node/bloom_emotions_bitmaps.h"

emotions = ["blink", "love", "cry", "sleep", "uncomfortable"]

header_content = """// Auto-generated BloomEmotion Bitmaps for ESP32
#include <Arduino.h>

"""

arrays_content = ""
pointers_content = ""

for emotion in emotions:
    mp4_path = os.path.join(INPUT_DIR, f"{emotion}.mp4")
    if not os.path.exists(mp4_path):
        print(f"Skipping {emotion}, file not found: {mp4_path}")
        continue

    # Use FFmpeg to extract raw grayscale frames scaled to 128x64
    cmd = [
        "ffmpeg", "-i", mp4_path,
        "-vf", f"scale={WIDTH}:{HEIGHT},format=gray",
        "-f", "rawvideo",
        "-pix_fmt", "gray",
        "-"
    ]
    
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    raw_video, _ = process.communicate()
    
    frame_size = WIDTH * HEIGHT
    num_frames = len(raw_video) // frame_size
    
    print(f"Emotion '{emotion}': extracted {num_frames} frames.")
    
    if num_frames == 0:
        continue
        
    pointers_content += f"const unsigned char* epd_bitmap_{emotion}[{num_frames}] PROGMEM = {{\n"
    
    for f in range(num_frames):
        frame_data = raw_video[f * frame_size : (f + 1) * frame_size]
        
        # Pack 8 pixels into 1 byte horizontally
        packed_bytes = []
        for i in range(0, frame_size, 8):
            byte = 0
            for bit in range(8):
                if frame_data[i + bit] > THRESHOLD:
                    byte |= (1 << bit)
            packed_bytes.append(byte)
            
        # Format as C array string
        array_name = f"epd_bitmap_{emotion}_{f:02d}"
        arrays_content += f"const unsigned char {array_name}[] PROGMEM = {{\n\t"
        
        hex_strings = [f"0x{b:02x}" for b in packed_bytes]
        
        for i in range(0, len(hex_strings), 16):
            arrays_content += ", ".join(hex_strings[i:i+16]) + ",\n\t"
            
        arrays_content = arrays_content.rstrip(",\n\t") + "\n};\n"
        
        pointers_content += f"\t{array_name},\n"
        
    pointers_content = pointers_content.rstrip(",\n") + "\n};\n\n"
    pointers_content += f"const int {emotion}_frame_count = {num_frames};\n\n"

with open(OUTPUT_FILE, "w") as f:
    f.write(header_content + arrays_content + pointers_content)

print(f"Saved to {OUTPUT_FILE}")
