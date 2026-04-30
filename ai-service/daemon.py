import os
import time
import math
import cv2
import requests
import threading
from collections import defaultdict
from dotenv import load_dotenv
from ultralytics import YOLO

load_dotenv()

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
    63: "laptop",
    67: "cell phone",
    73: "book"
}

# Global dictionary to track active threads
# { camera_id: {"stop_event": threading.Event(), "thread": threading.Thread} }
active_trackers = {}

def track_camera(camera, stop_event):
    camera_id = camera["id"]
    source = camera["sourceUrl"]
    
    # Try parsing as int for local webcam
    try:
        source = int(source)
    except ValueError:
        pass
        
    print(f"[CAM: {camera['name']}] Starting tracking thread on source: {source}")
    model = YOLO("yolov8n.pt")
    
    # Track history: obj_id -> state dict
    track_history = defaultdict(lambda: {"first_seen": time.time(), "last_pos": None, "stationary_start": time.time(), "reported": False})
    
    # We use stream=True so we can break out of the generator if stop_event is set
    try:
        results = model.track(source=source, show=False, stream=True, persist=True)
        
        for result in results:
            if stop_event.is_set():
                print(f"[CAM: {camera['name']}] Stopping tracking thread.")
                break
                
            boxes = result.boxes
            if boxes is None or boxes.id is None:
                continue
                
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
    except Exception as e:
        print(f"[CAM: {camera['name']}] Video stream error: {e}")
        
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

def main():
    print("🚀 ReClaim AI Headless Daemon Started")
    print(f"Polling backend at {BACKEND_API_URL} every 10 seconds...")
    
    last_ping_time = time.time()
    
    while True:
        cameras = fetch_cameras()
        
        # Determine which cameras should be active
        active_ids = {cam["id"] for cam in cameras if cam["aiEnabled"]}
        
        # Stop threads for cameras that are no longer active
        for cam_id in list(active_trackers.keys()):
            if cam_id not in active_ids:
                print(f"🛑 Stopping AI for camera {cam_id}...")
                active_trackers[cam_id]["stop_event"].set()
                active_trackers[cam_id]["thread"].join(timeout=2)
                del active_trackers[cam_id]
                
        # Start threads for newly active cameras
        for cam in cameras:
            cam_id = cam["id"]
            if cam["aiEnabled"] and cam_id not in active_trackers:
                print(f"🟢 Starting AI for camera {cam['name']} ({cam_id})...")
                stop_event = threading.Event()
                t = threading.Thread(target=track_camera, args=(cam, stop_event), daemon=True)
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
