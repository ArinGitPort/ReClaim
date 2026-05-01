import os
import time
import math
import cv2
import requests
import threading
from collections import defaultdict
from dotenv import load_dotenv
from ultralytics import YOLO
from flask import Flask, Response, jsonify
from flask_cors import CORS
import numpy as np

load_dotenv()

app = Flask(__name__)
CORS(app)

LATEST_FRAMES = {}

BACKEND_API_URL = os.getenv("BACKEND_API_BASE", "http://localhost:4000/api")
BACKEND_SERVICE_TOKEN = os.getenv("BACKEND_SERVICE_TOKEN", "super-secret-service-token")
STATIONARY_TIME_THRESHOLD = int(os.getenv("STATIONARY_TIME_THRESHOLD", "10"))
STATIONARY_DIST_THRESHOLD = int(os.getenv("STATIONARY_DIST_THRESHOLD", "50"))

LOST_ITEM_CLASSES = {
    24: "backpack",
    25: "umbrella",
    26: "handbag",
    27: "tie",
    32: "sports ball",
    39: "bottle",
    63: "laptop",
    64: "mouse",
    66: "keyboard",
    67: "cell phone",
    73: "book"
}

# Global dictionary to track active threads
active_trackers = {}

# Global dictionary to track latest camera configs from backend
ACTIVE_CAMERAS = {}

def track_camera(camera_id, stop_event):
    camera = ACTIVE_CAMERAS.get(camera_id)
    if not camera:
        return
        
    source = camera["sourceUrl"]
    try:
        source = int(source)
    except ValueError:
        pass
        
    print(f"[CAM: {camera['name']}] Starting raw video thread on source: {source}")
    # Upgraded to yolov8m.pt (Medium) for much better accuracy, running beautifully on RTX 3070 Ti!
    model = YOLO("yolov8m.pt")
    
    cap = cv2.VideoCapture(source)
    track_history = defaultdict(lambda: {"first_seen": time.time(), "last_pos": None, "stationary_start": time.time(), "reported": False})
    
    while not stop_event.is_set():
        ret, frame = cap.read()
        if not ret:
            # Sleep briefly and try again if camera drops
            time.sleep(1)
            continue
            
        camera = ACTIVE_CAMERAS.get(camera_id)
        if not camera:
            break
            
        annotated_frame = frame
        
        # Only run AI if enabled
        if camera.get("aiEnabled"):
            # Adjusted conf to 0.35: A sweet spot to catch the Hydroflask without catching the mouse
            results = model.track(frame, persist=True, classes=list(LOST_ITEM_CLASSES.keys()), conf=0.35, verbose=False)
            
            if len(results) > 0:
                result = results[0]
                annotated_frame = result.plot()
                
                boxes = result.boxes
                if boxes is not None and boxes.id is not None:
                    current_time = time.time()
                    
                    for i in range(len(boxes)):
                        cls_id = int(boxes.cls[i].item())
                        if cls_id not in LOST_ITEM_CLASSES:
                            continue
                            
                        obj_id = int(boxes.id[i].item())
                        conf = float(boxes.conf[i].item())
                        x1, y1, x2, y2 = boxes.xyxy[i].tolist()
                        
                        cx = (x1 + x2) / 2
                        cy = (y1 + y2) / 2
                        
                        state = track_history[obj_id]
                        
                        if state["last_pos"] is None:
                            state["last_pos"] = (cx, cy)
                            continue
                        
                        last_cx, last_cy = state["last_pos"]
                        dist = math.hypot(cx - last_cx, cy - last_cy)
                        
                        if dist > STATIONARY_DIST_THRESHOLD:
                            state["stationary_start"] = current_time
                            state["last_pos"] = (cx, cy)
                        else:
                            stationary_duration = current_time - state["stationary_start"]
                            
                            if stationary_duration >= STATIONARY_TIME_THRESHOLD and not state["reported"]:
                                category_name = LOST_ITEM_CLASSES[cls_id]
                                print(f"[CAM: {camera['name']}] Detected abandoned {category_name} (ID: {obj_id})")
                                
                                img = result.orig_img
                                crop = img[int(y1):int(y2), int(x1):int(x2)]
                                
                                if crop.size > 0:
                                    snapshot_path = f"temp_snapshot_{camera_id}_{obj_id}.jpg"
                                    cv2.imwrite(snapshot_path, crop)
                                    
                                    try:
                                        with open(snapshot_path, "rb") as f:
                                            import json
                                            meta = {
                                                "category": category_name,
                                                "confidence": conf,
                                                "location": camera["location"]
                                            }
                                            res = requests.post(
                                                f"{BACKEND_API_URL}/snapshots",
                                                headers={"x-service-token": BACKEND_SERVICE_TOKEN},
                                                data={
                                                    "sourceCameraId": camera["name"],
                                                    "detectionMeta": json.dumps(meta)
                                                },
                                                files={"snapshot": ("snapshot.jpg", f, "image/jpeg")},
                                                timeout=10
                                            )
                                            if res.status_code == 201:
                                                print(f"[CAM: {camera['name']}] ✅ Snapshot uploaded!")
                                                state["reported"] = True
                                    except Exception as e:
                                        print(f"[CAM: {camera['name']}] ❌ Upload error: {e}")
                                    finally:
                                        if os.path.exists(snapshot_path):
                                            os.remove(snapshot_path)

        ret_jpg, buffer = cv2.imencode('.jpg', annotated_frame)
        if ret_jpg:
            LATEST_FRAMES[camera_id] = buffer.tobytes()
            
        time.sleep(0.03) # Cap at ~30 FPS
        
    cap.release()
    print(f"[CAM: {camera['name']}] Thread exited.")

def fetch_cameras():
    try:
        res = requests.get(f"{BACKEND_API_URL}/cameras", timeout=10)
        if res.status_code == 200:
            return res.json().get("cameras", [])
    except Exception as e:
        print(f"Failed to fetch cameras: {e}")
    return []

def ping_camera(camera_id):
    try:
        requests.patch(
            f"{BACKEND_API_URL}/cameras/{camera_id}/ping",
            headers={"x-service-token": BACKEND_SERVICE_TOKEN},
            timeout=5
        )
    except:
        pass

def generate_frames(camera_id):
    import numpy as np
    placeholder = np.zeros((480, 640, 3), dtype=np.uint8)
    cv2.putText(placeholder, "INITIALIZING CAMERA...", (150, 240), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
    ret, placeholder_buffer = cv2.imencode('.jpg', placeholder)
    placeholder_bytes = placeholder_buffer.tobytes()

    while True:
        frame_bytes = LATEST_FRAMES.get(camera_id)
        if frame_bytes:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        else:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + placeholder_bytes + b'\r\n')
        time.sleep(0.1)

@app.route('/stream/<camera_id>')
def video_feed(camera_id):
    return Response(generate_frames(camera_id),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/status')
def status():
    return jsonify({"status": "running", "active_cameras": list(active_trackers.keys())})

def main():
    print("🚀 ReClaim AI Headless Daemon Started")
    print(f"Polling backend at {BACKEND_API_URL} every 10 seconds...")
    
    threading.Thread(target=app.run, kwargs={"host": "0.0.0.0", "port": 5000, "debug": False, "use_reloader": False}, daemon=True).start()
    print("🎥 Flask MJPEG Streaming Server started on port 5000")

    last_ping_time = time.time()
    
    while True:
        cameras = fetch_cameras()
        
        active_ids = {cam["id"] for cam in cameras}
        
        # Update latest camera config globally
        for cam in cameras:
            ACTIVE_CAMERAS[cam["id"]] = cam
        
        # Stop threads for cameras that were deleted from the database
        for cam_id in list(active_trackers.keys()):
            if cam_id not in active_ids:
                print(f"🛑 Stopping stream for deleted camera {cam_id}...")
                active_trackers[cam_id]["stop_event"].set()
                active_trackers[cam_id]["thread"].join(timeout=2)
                del active_trackers[cam_id]
                if cam_id in LATEST_FRAMES:
                    del LATEST_FRAMES[cam_id]
                if cam_id in ACTIVE_CAMERAS:
                    del ACTIVE_CAMERAS[cam_id]
                
        # Start threads for ALL cameras (whether AI is enabled or not)
        for cam in cameras:
            cam_id = cam["id"]
            if cam_id not in active_trackers:
                print(f"🟢 Starting stream for camera {cam['name']} ({cam_id})...")
                stop_event = threading.Event()
                t = threading.Thread(target=track_camera, args=(cam_id, stop_event), daemon=True)
                t.start()
                active_trackers[cam_id] = {"stop_event": stop_event, "thread": t}
                
        # Ping active cameras every 30 seconds
        if time.time() - last_ping_time > 30:
            for cam_id in active_trackers.keys():
                ping_camera(cam_id)
            last_ping_time = time.time()
            
        time.sleep(10)

if __name__ == "__main__":
    main()
