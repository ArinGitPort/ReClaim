import json
import math
import os
import hashlib
import threading
import time
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor

import cv2
import numpy as np
import requests
import torch
from dotenv import load_dotenv
from flask import Flask, Response, jsonify, request
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
PERSON_LEFT_GRACE_SECONDS = int(os.getenv("PERSON_LEFT_GRACE_SECONDS", "3"))
DUPLICATE_SUPPRESSION_SECONDS = int(os.getenv("DUPLICATE_SUPPRESSION_SECONDS", "300"))
PERSON_NEAR_DISTANCE_RATIO = float(os.getenv("PERSON_NEAR_DISTANCE_RATIO", "0.28"))
REQUIRE_PERSON_CONTEXT = os.getenv("REQUIRE_PERSON_CONTEXT", "true").lower() not in {"0", "false", "no"}

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
RECENT_SNAPSHOTS = []
RESTART_REQUESTS = set()
upload_executor = ThreadPoolExecutor(max_workers=10)
MODEL_LOCK = threading.Lock()
MODEL_CACHE = None
MODEL_DEVICE = None
AI_HEALTH = {
    "last_error": None,
    "last_error_at": None,
    "error_count": 0,
    "last_success_at": None,
}

def normalize_source_key(source_url):
    return str(source_url).strip()


def parse_capture_source(source_url):
    source = str(source_url).strip()
    try:
        return int(source)
    except ValueError:
        return source


def make_placeholder_frame(message, detail=""):
    placeholder = np.zeros((480, 640, 3), dtype=np.uint8)
    cv2.putText(
        placeholder,
        message,
        (90, 220),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (255, 255, 255),
        2,
        cv2.LINE_AA,
    )
    if detail:
        cv2.putText(
            placeholder,
            detail,
            (90, 260),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.55,
            (180, 180, 180),
            1,
            cv2.LINE_AA,
        )
    _, buffer = cv2.imencode(".jpg", placeholder)
    return buffer.tobytes()


def resolve_yolo_device():
    if YOLO_DEVICE.lower() != "auto":
        return YOLO_DEVICE

    if torch.cuda.is_available():
        return "cuda:0"

    return "cpu"


def describe_inference_device(device):
    if device != "cpu" and torch.cuda.is_available():
        gpu_index = int(str(device).split(":")[-1]) if str(device).split(":")[-1].isdigit() else 0
        return f"cuda:{gpu_index} ({torch.cuda.get_device_name(gpu_index)})"

    return "cpu"


def get_yolo_model():
    global MODEL_CACHE, MODEL_DEVICE
    with MODEL_LOCK:
        if MODEL_CACHE is not None:
            return MODEL_CACHE, MODEL_DEVICE

        device = resolve_yolo_device()
        print(f"Loading YOLO model: {YOLO_MODEL}")
        print(f"Inference device: {describe_inference_device(device)}")
        model = YOLO(YOLO_MODEL)
        if device != "cpu":
            model.to(device)

        MODEL_CACHE = model
        MODEL_DEVICE = device
        return MODEL_CACHE, MODEL_DEVICE


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


def encode_frame(frame):
    ret_jpg, buffer = cv2.imencode(".jpg", frame)
    return buffer.tobytes() if ret_jpg else None


def publish_frame(camera_id, frame):
    frame_bytes = encode_frame(frame)
    if not frame_bytes:
        return False

    LATEST_FRAMES[camera_id] = frame_bytes
    state = active_trackers.get(camera_id)
    if state is not None:
        state["last_frame_at"] = time.time()
        state["last_error"] = None
    return True


def save_full_frame_snapshot(result_frame, box, category_name, confidence, camera, camera_id, obj_id, reasoning_meta):
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
    snapshot_hash = hash_file(snapshot_path)

    try:
        with open(snapshot_path, "rb") as snapshot_file:
            meta = {
                "category": category_name,
                "confidence": confidence,
                "location": camera["location"],
                "model": YOLO_MODEL,
                "snapshotType": "full-frame-annotated",
                "boundingBox": bounded_box,
                **reasoning_meta,
            }
            return requests.post(
                f"{BACKEND_API_URL}/snapshots",
                headers={"x-service-token": BACKEND_SERVICE_TOKEN},
                data={
                    "sourceCameraId": camera["name"],
                    "snapshotHash": snapshot_hash,
                    "detectionMeta": json.dumps(meta),
                },
                files={"snapshot": ("snapshot.jpg", snapshot_file, "image/jpeg")},
                timeout=10,
            )
    finally:
        if os.path.exists(snapshot_path):
            os.remove(snapshot_path)


def hash_file(path):
    digest = hashlib.sha256()
    with open(path, "rb") as file:
        for chunk in iter(lambda: file.read(8192), b""):
            digest.update(chunk)
    return digest.hexdigest()


def box_center(box):
    x1, y1, x2, y2 = box
    return ((x1 + x2) / 2, (y1 + y2) / 2)


def box_area(box):
    x1, y1, x2, y2 = box
    return max(0, x2 - x1) * max(0, y2 - y1)


def box_iou(a, b):
    ax1, ay1, ax2, ay2 = a
    bx1, by1, bx2, by2 = b
    ix1, iy1 = max(ax1, bx1), max(ay1, by1)
    ix2, iy2 = min(ax2, bx2), min(ay2, by2)
    intersection = box_area((ix1, iy1, ix2, iy2))
    union = box_area(a) + box_area(b) - intersection
    return intersection / union if union > 0 else 0


def is_person_near_item(item_box, person_boxes, frame_shape):
    if not person_boxes:
        return False

    frame_height, frame_width = frame_shape[:2]
    diagonal = math.hypot(frame_width, frame_height)
    item_cx, item_cy = box_center(item_box)
    item_width = max(1, item_box[2] - item_box[0])
    item_height = max(1, item_box[3] - item_box[1])
    expanded_item = (
        item_box[0] - item_width * 0.75,
        item_box[1] - item_height * 0.75,
        item_box[2] + item_width * 0.75,
        item_box[3] + item_height * 0.75,
    )

    for person_box in person_boxes:
        person_cx, person_cy = box_center(person_box)
        distance = math.hypot(item_cx - person_cx, item_cy - person_cy)
        if distance <= diagonal * PERSON_NEAR_DISTANCE_RATIO:
            return True
        if box_iou(expanded_item, person_box) > 0:
            return True

    return False


def make_duplicate_key(camera_id, category_name, box, frame_shape):
    frame_height, frame_width = frame_shape[:2]
    cx, cy = box_center(box)
    bucket_x = int((cx / frame_width) * 10)
    bucket_y = int((cy / frame_height) * 10)
    return f"{camera_id}:{category_name}:{bucket_x}:{bucket_y}"

def is_duplicate_snapshot(camera_id, category_name, box, duplicate_key):
    now = time.time()
    RECENT_SNAPSHOTS[:] = [
        snapshot for snapshot in RECENT_SNAPSHOTS
        if now - snapshot["created_at"] < DUPLICATE_SUPPRESSION_SECONDS
    ]

    for snapshot in RECENT_SNAPSHOTS:
        if snapshot["duplicate_key"] == duplicate_key:
            return True
        if (
            snapshot["camera_id"] == camera_id
            and snapshot["category_name"] == category_name
            and box_iou(snapshot["box"], box) >= 0.45
        ):
            return True

    return False

def remember_snapshot(camera_id, category_name, box, duplicate_key):
    RECENT_SNAPSHOTS.append({
        "camera_id": camera_id,
        "category_name": category_name,
        "box": box,
        "duplicate_key": duplicate_key,
        "created_at": time.time(),
    })

def _async_upload(annotated_frame, item_box, category_name, conf, camera, camera_id, obj_id, reasoning_meta, duplicate_key, state):
    try:
        response = save_full_frame_snapshot(
            annotated_frame,
            item_box,
            category_name,
            conf,
            camera,
            camera_id,
            obj_id,
            reasoning_meta,
        )
        if response.status_code == 201:
            print(f"[CAM: {camera['name']}] Snapshot uploaded")
            remember_snapshot(camera_id, category_name, item_box, duplicate_key)
        else:
            print(f"[CAM: {camera['name']}] Snapshot rejected: {response.status_code}")
            state["reported"] = False
    except Exception as exc:
        print(f"[CAM: {camera['name']}] Upload error: {exc}")
        state["reported"] = False

def track_camera(camera_id, stop_event):
    camera = ACTIVE_CAMERAS.get(camera_id)
    if not camera:
        return

    source = parse_capture_source(camera["sourceUrl"])

    print(f"[CAM: {camera['name']}] Starting raw video thread on source: {source}")
    LATEST_FRAMES[camera_id] = make_placeholder_frame("OPENING CAMERA...", f"Source {source}")
    ping_camera(camera_id, False, "CONNECTING", None, "Opening camera source...")

    cap = open_video_capture(source)
    if not cap.isOpened():
        print(f"[CAM: {camera['name']}] Unable to open camera source: {source}")
        LATEST_FRAMES[camera_id] = make_placeholder_frame("CAMERA UNAVAILABLE", f"Source {source} could not be opened")
        ping_camera(camera_id, False, "ERROR", None, f"Source {source} could not be opened")
        return

    first_frame_at = None
    for _ in range(60):
        if stop_event.is_set():
            cap.release()
            return
        ret, frame = cap.read()
        if ret:
            first_frame_at = time.time()
            publish_frame(camera_id, frame)
            ping_camera(camera_id, True, "ONLINE", first_frame_at, None)
            break
        time.sleep(0.1)

    if first_frame_at is None:
        LATEST_FRAMES[camera_id] = make_placeholder_frame("WAITING FOR FRAME", f"Source {source} opened but has not produced video")
        ping_camera(camera_id, False, "CONNECTING", None, "Camera source opened; waiting for first frame")

    track_history = defaultdict(
        lambda: {
            "first_seen": time.time(),
            "last_pos": None,
            "stationary_start": time.time(),
            "person_was_nearby": False,
            "person_last_seen_at": None,
            "person_left_at": None,
            "reported": False,
        }
    )

    frame_count = 0
    while not stop_event.is_set():
        ret, frame = cap.read()
        if not ret:
            ping_camera(camera_id, False, "ERROR", None, "Camera stream dropped. Attempting to reconnect...")
            LATEST_FRAMES[camera_id] = make_placeholder_frame("RECONNECTING CAMERA...", "Stream dropped")
            cap.release()
            time.sleep(2)
            cap = open_video_capture(source)
            if not cap.isOpened():
                time.sleep(3)
            continue

        camera = ACTIVE_CAMERAS.get(camera_id)
        if not camera:
            break

        frame_count += 1
        frame_skip = int(camera.get("aiFrameSkip") or 6)

        if not camera.get("aiEnabled"):
            publish_frame(camera_id, frame)
            time.sleep(0.03)
            continue

        # Always read frames to keep the camera buffer clear, but only publish processed frames
        # while AI is enabled. Publishing raw frames between annotated frames makes boxes flicker.
        if frame_count % frame_skip != 0:
            time.sleep(0.01)
            continue

        annotated_frame = frame

        try:
            model, device = get_yolo_model()
            conf_threshold = float(camera.get("aiConfThreshold") or 0.35)
            results = model.track(
                frame,
                persist=True,
                tracker="bytetrack.yaml",
                classes=[0, *LOST_ITEM_CLASSES.keys()],
                conf=conf_threshold,
                device=device,
                half=False,
                verbose=False,
            )
            AI_HEALTH["last_success_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            AI_HEALTH["last_error"] = None
            AI_HEALTH["last_error_at"] = None
        except Exception as exc:
            AI_HEALTH["last_error"] = str(exc)
            AI_HEALTH["last_error_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            AI_HEALTH["error_count"] += 1
            print(f"[CAM: {camera['name']}] AI inference unavailable, keeping raw stream alive: {exc}")
            ping_camera(camera_id, True, "ONLINE", time.time(), f"AI unavailable; raw stream is still online: {exc}")
            publish_frame(camera_id, frame)
            time.sleep(0.1)
            continue

        if len(results) > 0:
            result = results[0]
            annotated_frame = result.plot()

            boxes = result.boxes
            if boxes is not None and boxes.id is not None:
                current_time = time.time()
                person_boxes = []

                for i in range(len(boxes)):
                    cls_id = int(boxes.cls[i].item())
                    if cls_id == 0:
                        person_boxes.append(tuple(boxes.xyxy[i].tolist()))

                for i in range(len(boxes)):
                    cls_id = int(boxes.cls[i].item())
                    if cls_id not in LOST_ITEM_CLASSES:
                        continue

                    obj_id = int(boxes.id[i].item())
                    conf = float(boxes.conf[i].item())
                    x1, y1, x2, y2 = boxes.xyxy[i].tolist()
                    item_box = (x1, y1, x2, y2)

                    cx = (x1 + x2) / 2
                    cy = (y1 + y2) / 2

                    state = track_history[obj_id]
                    person_nearby = is_person_near_item(item_box, person_boxes, frame.shape)
                    if person_nearby:
                        state["person_was_nearby"] = True
                        state["person_last_seen_at"] = current_time
                        state["person_left_at"] = None
                    elif state["person_was_nearby"] and state["person_left_at"] is None:
                        state["person_left_at"] = current_time

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
                    if REQUIRE_PERSON_CONTEXT and not state["person_was_nearby"]:
                        continue
                    if person_nearby:
                        continue
                    if state["person_left_at"] and current_time - state["person_left_at"] < PERSON_LEFT_GRACE_SECONDS:
                        continue

                    category_name = LOST_ITEM_CLASSES[cls_id]
                    duplicate_key = make_duplicate_key(camera_id, category_name, item_box, frame.shape)
                    if is_duplicate_snapshot(camera_id, category_name, item_box, duplicate_key):
                        state["reported"] = True
                        continue

                    print(f"[CAM: {camera['name']}] Detected abandoned {category_name} (ID: {obj_id})")
                    reason_parts = [f"Stationary for {int(stationary_duration)}s"]
                    if state["person_was_nearby"]:
                        reason_parts.append("Person moved away")
                    reason_parts.append("No interaction detected")
                    reasoning_meta = {
                        "stationaryDuration": round(stationary_duration, 1),
                        "personWasNearby": state["person_was_nearby"],
                        "personLeftAt": (
                            time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(state["person_left_at"]))
                            if state["person_left_at"]
                            else None
                        ),
                        "reason": " / ".join(reason_parts),
                        "duplicateKey": duplicate_key,
                    }

                    state["reported"] = True
                    upload_executor.submit(
                        _async_upload,
                        annotated_frame.copy(),
                        (x1, y1, x2, y2),
                        category_name,
                        conf,
                        camera.copy(),
                        camera_id,
                        obj_id,
                        reasoning_meta,
                        duplicate_key,
                        state
                    )

        publish_frame(camera_id, annotated_frame)

        time.sleep(0.03)

    cap.release()
    print(f"[CAM: {camera['name']}] Thread exited.")


def fetch_cameras():
    try:
        headers = {"x-service-token": BACKEND_SERVICE_TOKEN} if BACKEND_SERVICE_TOKEN else {}
        res = requests.get(f"{BACKEND_API_URL}/cameras", headers=headers, timeout=10)
        if res.status_code == 200:
            return res.json().get("cameras", [])
        print(f"Failed to fetch cameras: backend returned HTTP {res.status_code}")
    except Exception as exc:
        print(f"Failed to fetch cameras: {exc}")
    return []


def ping_camera(camera_id, is_online=True, stream_status=None, last_frame_at=None, last_error=None):
    payload = {"isOnline": is_online}
    if stream_status:
        payload["streamStatus"] = stream_status
    if last_frame_at:
        payload["lastFrameAtUtc"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(last_frame_at))
    payload["lastError"] = last_error

    try:
        requests.patch(
            f"{BACKEND_API_URL}/cameras/{camera_id}/ping",
            headers={"x-service-token": BACKEND_SERVICE_TOKEN},
            json=payload,
            timeout=5,
        )
    except Exception:
        pass


def generate_frames(camera_id):
    placeholder_bytes = make_placeholder_frame("INITIALIZING CAMERA...")

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


@app.route("/preview-source")
def preview_source():
    source_url = request.args.get("source", "")
    if not source_url:
        return jsonify({"error": "source is required"}), 400

    source_key = normalize_source_key(source_url)
    for camera_id, camera in ACTIVE_CAMERAS.items():
        if normalize_source_key(camera.get("sourceUrl")) == source_key and camera_id in active_trackers:
            return Response(generate_frames(camera_id), mimetype="multipart/x-mixed-replace; boundary=frame")

    return Response(generate_preview_frames(source_url), mimetype="multipart/x-mixed-replace; boundary=frame")


def generate_preview_frames(source_url):
    source = parse_capture_source(source_url)
    cap = open_video_capture(source)
    if not cap.isOpened():
        placeholder = make_placeholder_frame("PREVIEW UNAVAILABLE", f"Source {source_url} could not be opened")
        while True:
            yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + placeholder + b"\r\n"
            time.sleep(0.5)

    try:
        while True:
            ret, frame = cap.read()
            frame_bytes = encode_frame(frame) if ret else None
            if frame_bytes:
                yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n"
            else:
                placeholder = make_placeholder_frame("WAITING FOR PREVIEW", f"Source {source_url}")
                yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + placeholder + b"\r\n"
            time.sleep(0.1)
    finally:
        cap.release()


@app.route("/status")
def status():
    device = resolve_yolo_device()
    return jsonify({
        "status": "running",
        "active_cameras": list(active_trackers.keys()),
        "model": YOLO_MODEL,
        "device": describe_inference_device(device),
        "cudaAvailable": torch.cuda.is_available(),
        "ai": AI_HEALTH,
    })


@app.route("/camera-sources")
def camera_sources():
    token = request.headers.get("x-service-token", "")
    if BACKEND_SERVICE_TOKEN and token != BACKEND_SERVICE_TOKEN:
        return jsonify({"error": "unauthorized"}), 401

    max_index = int(request.args.get("max", "6"))
    sources = []
    for index in range(max(1, min(max_index, 10))):
        source_url = str(index)
        active_camera = next(
            (
                camera
                for camera_id, camera in ACTIVE_CAMERAS.items()
                if camera_id in active_trackers and normalize_source_key(camera.get("sourceUrl")) == source_url
            ),
            None,
        )
        if active_camera:
            sources.append({
                "sourceUrl": source_url,
                "label": f"Local camera {index}",
                "available": True,
                "active": True,
                "width": None,
                "height": None,
            })
            continue

        cap = cv2.VideoCapture(index, cv2.CAP_DSHOW if os.name == "nt" else cv2.CAP_ANY)
        opened = cap.isOpened()
        has_frame = False
        width = None
        height = None
        if opened:
            for _ in range(6):
                ret, frame = cap.read()
                if ret:
                    has_frame = True
                    height, width = frame.shape[:2]
                    break
                time.sleep(0.05)
        cap.release()
        sources.append({
            "sourceUrl": source_url,
            "label": f"Local camera {index}",
            "available": bool(opened and has_frame),
            "active": False,
            "width": width,
            "height": height,
        })

    return jsonify({"sources": sources})


@app.route("/shutdown", methods=["POST"])
def shutdown():
    token = request.headers.get("x-service-token", "")
    if BACKEND_SERVICE_TOKEN and token != BACKEND_SERVICE_TOKEN:
        return jsonify({"error": "unauthorized"}), 401

    def stop_process():
        time.sleep(0.25)
        os._exit(0)

    threading.Thread(target=stop_process, daemon=True).start()
    return jsonify({"status": "stopping"})


@app.route("/cameras/<camera_id>/restart", methods=["POST"])
def restart_camera(camera_id):
    token = request.headers.get("x-service-token", "")
    if BACKEND_SERVICE_TOKEN and token != BACKEND_SERVICE_TOKEN:
        return jsonify({"error": "unauthorized"}), 401

    RESTART_REQUESTS.add(camera_id)
    tracker = active_trackers.get(camera_id)
    if tracker:
        tracker["stop_event"].set()

    return jsonify({"status": "restart_requested", "cameraId": camera_id})


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
        active_ids = {cam["id"] for cam in cameras if cam.get("streamEnabled", True)}

        for cam in cameras:
            cam_id = cam["id"]
            if not cam.get("streamEnabled", True):
                tracker = active_trackers.get(cam_id)
                if tracker:
                    print(f"Pausing stream for disabled camera {cam['name']} ({cam_id})...")
                    tracker["stop_event"].set()
                    tracker["thread"].join(timeout=2)
                    del active_trackers[cam_id]
                LATEST_FRAMES[cam_id] = make_placeholder_frame("CAMERA PAUSED", "Stream disabled by staff")
                ACTIVE_CAMERAS[cam_id] = cam
                ping_camera(cam_id, False, "OFFLINE", None, "Camera stream is paused by staff")
                continue

            previous_camera = ACTIVE_CAMERAS.get(cam_id)
            if (
                cam_id in active_trackers
                and previous_camera
                and normalize_source_key(previous_camera.get("sourceUrl")) != normalize_source_key(cam.get("sourceUrl"))
            ):
                print(f"Restarting stream for updated camera source {cam['name']} ({cam_id})...")
                tracker = active_trackers[cam_id]
                tracker["stop_event"].set()
                tracker["thread"].join(timeout=2)
                del active_trackers[cam_id]
                LATEST_FRAMES.pop(cam_id, None)
            ACTIVE_CAMERAS[cam["id"]] = cam

        for cam_id in list(active_trackers.keys()):
            tracker = active_trackers[cam_id]
            if cam_id in RESTART_REQUESTS:
                print(f"Restarting stream for camera {cam_id} by request...")
                tracker["stop_event"].set()
                tracker["thread"].join(timeout=2)
                del active_trackers[cam_id]
                LATEST_FRAMES.pop(cam_id, None)
                RESTART_REQUESTS.discard(cam_id)
                continue

            if cam_id not in active_ids or not tracker["thread"].is_alive():
                print(f"Stopping stream for inactive camera {cam_id}...")
                tracker["stop_event"].set()
                tracker["thread"].join(timeout=2)
                del active_trackers[cam_id]
                if cam_id not in active_ids:
                    LATEST_FRAMES.pop(cam_id, None)
                    ACTIVE_CAMERAS.pop(cam_id, None)

        for cam in cameras:
            cam_id = cam["id"]
            if not cam.get("streamEnabled", True):
                continue

            if cam_id not in active_trackers:
                source_key = normalize_source_key(cam["sourceUrl"])
                source_in_use = any(
                    normalize_source_key(ACTIVE_CAMERAS.get(active_id, {}).get("sourceUrl")) == source_key
                    for active_id in active_trackers.keys()
                )
                if source_in_use:
                    print(f"Skipping camera {cam['name']} because source {source_key} is already in use")
                    LATEST_FRAMES[cam_id] = make_placeholder_frame("SOURCE IN USE", f"Camera source {source_key} is already active")
                    ping_camera(cam_id, False, "SOURCE_IN_USE", None, f"Camera source {source_key} is already active")
                    continue

                print(f"Starting stream for camera {cam['name']} ({cam_id})...")
                stop_event = threading.Event()
                thread = threading.Thread(target=track_camera, args=(cam_id, stop_event), daemon=True)
                active_trackers[cam_id] = {"stop_event": stop_event, "thread": thread, "last_frame_at": None, "last_error": None}
                thread.start()

        if time.time() - last_ping_time > 30:
            for cam_id, tracker in active_trackers.items():
                last_frame_at = tracker.get("last_frame_at")
                has_frame = last_frame_at is not None and time.time() - last_frame_at < 45
                ping_camera(
                    cam_id,
                    has_frame,
                    "ONLINE" if has_frame else "CONNECTING",
                    last_frame_at,
                    None if has_frame else "Waiting for first frame",
                )
            last_ping_time = time.time()

        time.sleep(10)


if __name__ == "__main__":
    main()
