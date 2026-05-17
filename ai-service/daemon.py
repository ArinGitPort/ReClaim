import json
import math
import os
import threading
import time
from collections import defaultdict

import cv2
import numpy as np
import requests
import torch
from dotenv import load_dotenv
from flask import Flask, Response, jsonify
from flask_cors import CORS
from ultralytics import YOLO

load_dotenv()

app = Flask(__name__)
CORS(app)

LATEST_FRAMES = {}

BACKEND_API_URL = os.getenv("BACKEND_API_BASE") or os.getenv("VITE_API_BASE_URL") or "http://localhost:4000/api"
BACKEND_SERVICE_TOKEN = (
    os.getenv("BACKEND_SERVICE_TOKEN")
    or os.getenv("SERVICE_TOKEN")
    or os.getenv("SERVICE_API_KEY")
    or "super-secret-service-token"
)
YOLO_MODEL = os.getenv("YOLO_MODEL", "yolo11m.pt")
YOLO_DEVICE = os.getenv("YOLO_DEVICE", "auto")
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
    73: "book",
}

active_trackers = {}
ACTIVE_CAMERAS = {}


def resolve_yolo_device():
    if YOLO_DEVICE.lower() != "auto":
        return YOLO_DEVICE

    if torch.cuda.is_available():
        return "0"

    return "cpu"


def describe_inference_device(device):
    if device != "cpu" and torch.cuda.is_available():
        gpu_index = int(device) if str(device).isdigit() else 0
        return f"cuda:{gpu_index} ({torch.cuda.get_device_name(gpu_index)})"

    return "cpu"


def open_video_capture(source):
    if isinstance(source, int) and os.name == "nt":
        cap = cv2.VideoCapture(source, cv2.CAP_DSHOW)
        if cap.isOpened():
            return cap
        cap.release()

    cap = cv2.VideoCapture(source)
    if cap.isOpened():
        return cap

    cap.release()
    return cap


def save_full_frame_snapshot(result_frame, box, category_name, confidence, camera, camera_id, obj_id):
    frame_height, frame_width = result_frame.shape[:2]
    bounded_box = {
        "x1": max(0, int(box[0])),
        "y1": max(0, int(box[1])),
        "x2": min(frame_width - 1, int(box[2])),
        "y2": min(frame_height - 1, int(box[3])),
    }

    snapshot_frame = result_frame.copy()
    label = f"{category_name} {confidence:.0%}"

    cv2.rectangle(
        snapshot_frame,
        (bounded_box["x1"], bounded_box["y1"]),
        (bounded_box["x2"], bounded_box["y2"]),
        (0, 255, 255),
        4,
    )
    cv2.putText(
        snapshot_frame,
        label,
        (bounded_box["x1"], max(24, bounded_box["y1"] - 10)),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 255, 255),
        2,
        cv2.LINE_AA,
    )

    snapshot_path = f"temp_snapshot_{camera_id}_{obj_id}.jpg"
    cv2.imwrite(snapshot_path, snapshot_frame)

    try:
        with open(snapshot_path, "rb") as snapshot_file:
            meta = {
                "category": category_name,
                "confidence": confidence,
                "location": camera["location"],
                "model": YOLO_MODEL,
                "snapshotType": "full-frame-annotated",
                "boundingBox": bounded_box,
            }
            return requests.post(
                f"{BACKEND_API_URL}/snapshots",
                headers={"x-service-token": BACKEND_SERVICE_TOKEN},
                data={
                    "sourceCameraId": camera["name"],
                    "detectionMeta": json.dumps(meta),
                },
                files={"snapshot": ("snapshot.jpg", snapshot_file, "image/jpeg")},
                timeout=10,
            )
    finally:
        if os.path.exists(snapshot_path):
            os.remove(snapshot_path)


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
    print(f"[CAM: {camera['name']}] Loading YOLO model: {YOLO_MODEL}")
    device = resolve_yolo_device()
    print(f"[CAM: {camera['name']}] Inference device: {describe_inference_device(device)}")
    model = YOLO(YOLO_MODEL)

    cap = open_video_capture(source)
    if not cap.isOpened():
        print(f"[CAM: {camera['name']}] Unable to open camera source: {source}")

    track_history = defaultdict(
        lambda: {
            "first_seen": time.time(),
            "last_pos": None,
            "stationary_start": time.time(),
            "reported": False,
        }
    )

    while not stop_event.is_set():
        ret, frame = cap.read()
        if not ret:
            time.sleep(1)
            continue

        camera = ACTIVE_CAMERAS.get(camera_id)
        if not camera:
            break

        annotated_frame = frame

        if camera.get("aiEnabled"):
            results = model.track(
                frame,
                persist=True,
                classes=list(LOST_ITEM_CLASSES.keys()),
                conf=0.35,
                device=device,
                half=device != "cpu",
                verbose=False,
            )

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
                            continue

                        stationary_duration = current_time - state["stationary_start"]
                        if stationary_duration < STATIONARY_TIME_THRESHOLD or state["reported"]:
                            continue

                        category_name = LOST_ITEM_CLASSES[cls_id]
                        print(f"[CAM: {camera['name']}] Detected abandoned {category_name} (ID: {obj_id})")

                        try:
                            response = save_full_frame_snapshot(
                                annotated_frame,
                                (x1, y1, x2, y2),
                                category_name,
                                conf,
                                camera,
                                camera_id,
                                obj_id,
                            )
                            if response.status_code == 201:
                                print(f"[CAM: {camera['name']}] Snapshot uploaded")
                                state["reported"] = True
                            else:
                                print(f"[CAM: {camera['name']}] Snapshot rejected: {response.status_code}")
                        except Exception as exc:
                            print(f"[CAM: {camera['name']}] Upload error: {exc}")

        ret_jpg, buffer = cv2.imencode(".jpg", annotated_frame)
        if ret_jpg:
            LATEST_FRAMES[camera_id] = buffer.tobytes()

        time.sleep(0.03)

    cap.release()
    print(f"[CAM: {camera['name']}] Thread exited.")


def fetch_cameras():
    try:
        res = requests.get(f"{BACKEND_API_URL}/cameras", timeout=10)
        if res.status_code == 200:
            return res.json().get("cameras", [])
    except Exception as exc:
        print(f"Failed to fetch cameras: {exc}")
    return []


def ping_camera(camera_id):
    try:
        requests.patch(
            f"{BACKEND_API_URL}/cameras/{camera_id}/ping",
            headers={"x-service-token": BACKEND_SERVICE_TOKEN},
            timeout=5,
        )
    except Exception:
        pass


def generate_frames(camera_id):
    placeholder = np.zeros((480, 640, 3), dtype=np.uint8)
    cv2.putText(
        placeholder,
        "INITIALIZING CAMERA...",
        (150, 240),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (255, 255, 255),
        2,
    )
    _, placeholder_buffer = cv2.imencode(".jpg", placeholder)
    placeholder_bytes = placeholder_buffer.tobytes()

    while True:
        frame_bytes = LATEST_FRAMES.get(camera_id)
        if frame_bytes:
            yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n"
        else:
            yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + placeholder_bytes + b"\r\n"
        time.sleep(0.1)


@app.route("/stream/<camera_id>")
def video_feed(camera_id):
    return Response(generate_frames(camera_id), mimetype="multipart/x-mixed-replace; boundary=frame")


@app.route("/status")
def status():
    device = resolve_yolo_device()
    return jsonify({
        "status": "running",
        "active_cameras": list(active_trackers.keys()),
        "model": YOLO_MODEL,
        "device": describe_inference_device(device),
        "cudaAvailable": torch.cuda.is_available(),
    })


def main():
    print("ReClaim AI Headless Daemon Started")
    print(f"Using YOLO model: {YOLO_MODEL}")
    print(f"YOLO device mode: {YOLO_DEVICE}")
    print(f"Resolved inference device: {describe_inference_device(resolve_yolo_device())}")
    print(f"Polling backend at {BACKEND_API_URL} every 10 seconds...")

    threading.Thread(
        target=app.run,
        kwargs={"host": "0.0.0.0", "port": 5000, "debug": False, "use_reloader": False},
        daemon=True,
    ).start()
    print("Flask MJPEG Streaming Server started on port 5000")

    last_ping_time = time.time()

    while True:
        cameras = fetch_cameras()
        active_ids = {cam["id"] for cam in cameras}

        for cam in cameras:
            ACTIVE_CAMERAS[cam["id"]] = cam

        for cam_id in list(active_trackers.keys()):
            if cam_id not in active_ids:
                print(f"Stopping stream for deleted camera {cam_id}...")
                active_trackers[cam_id]["stop_event"].set()
                active_trackers[cam_id]["thread"].join(timeout=2)
                del active_trackers[cam_id]
                LATEST_FRAMES.pop(cam_id, None)
                ACTIVE_CAMERAS.pop(cam_id, None)

        for cam in cameras:
            cam_id = cam["id"]
            if cam_id not in active_trackers:
                print(f"Starting stream for camera {cam['name']} ({cam_id})...")
                stop_event = threading.Event()
                thread = threading.Thread(target=track_camera, args=(cam_id, stop_event), daemon=True)
                thread.start()
                active_trackers[cam_id] = {"stop_event": stop_event, "thread": thread}

        if time.time() - last_ping_time > 30:
            for cam_id in active_trackers.keys():
                ping_camera(cam_id)
            last_ping_time = time.time()

        time.sleep(10)


if __name__ == "__main__":
    main()
