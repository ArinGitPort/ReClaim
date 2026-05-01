# ReClaim AI Service Setup Guide

The ReClaim AI Service is a headless background daemon (`daemon.py`) that utilizes YOLOv8 to automatically detect abandoned lost items (backpacks, cell phones, laptops, etc.) across multiple cameras, and streams the live video directly to the Admin Portal.

## Prerequisites

Ensure you have Python 3.8+ installed on your system.

## Step-by-Step Startup Guide

### 1. Open a New Terminal
Since your Node.js backend and React frontend are likely already running in their respective terminals, you will need to open a **new** terminal specifically for the Python AI service.

### 2. Navigate to the AI Service Directory
From the root of the ReClaim project workspace, change your directory to the `ai-service` folder:
```bash
cd ai-service
```
*(Path: `d:\VSCODE Projects\ReClaim\ai-service`)*

### 3. Install Dependencies
Before running the daemon for the first time (or if dependencies are updated), install the required Python packages. This will install Ultralytics/YOLOv8, OpenCV, Flask, and Flask-CORS:
```bash
pip install -r requirements.txt
```

### 4. Start the AI Daemon
Run the background daemon script. Keep this terminal open and running.
```bash
python daemon.py
```
*Note: The first time you run this, it will automatically download the YOLOv8 AI weights file (`yolov8m.pt`), which is about 50MB.*

---

## How to Test the Live AI Monitor & Detections

1. **Add a Camera:** In the ReClaim Admin Portal, go to **Camera Settings** and add a new camera using your local webcam (Camera 0).
2. **Toggle AI On:** Ensure the "AI DETECTION" switch is turned **ON** for that camera.
3. **View Live Stream:** Navigate to the **Live AI Monitor** page. You will instantly see your live camera feed streaming directly from the Python daemon. The badge in the top left should say `AI_ACTIVE`.
4. **Test Detections:** Place a lost item (e.g., a backpack, cell phone, bottle, or laptop) in front of the camera. Step out of the frame and don't touch the item for **10 seconds**.
5. **Check Snapshots:** The AI will automatically lock onto the item, take a cropped snapshot of it, and upload it to the backend. You will see it instantly appear in the **Admin Snapshot Gallery**!

---

## Troubleshooting

- **Black Screen / "INITIALIZING CAMERA..."**: If your camera feed is stuck on this placeholder, it means your browser or another application is currently locking the webcam hardware. Ensure no other apps (like Zoom or the Add Camera Modal) are using the camera, then press `CTRL+C` in the terminal and restart `python daemon.py`.
- **False Detections**: The AI is currently using the `yolov8m.pt` model trained on the COCO dataset. It is highly accurate, but can occasionally misidentify objects of similar shape. A custom trained YOLO model (`best.pt`) is recommended for production environments.