from __future__ import annotations

import os
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

load_dotenv()

app = FastAPI(title="ReClaim AI Service", version="0.1.0")

BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:4000/api/items/ai-ingest")
BACKEND_SERVICE_TOKEN = os.getenv("BACKEND_SERVICE_TOKEN", "")
MIN_CONSISTENT_SECONDS = int(os.getenv("AI_MIN_CONSISTENT_SECONDS", "10"))


class DetectionPayload(BaseModel):
    camera_id: str = Field(min_length=2)
    title: str = Field(min_length=2)
    category: str = Field(min_length=2)
    color: str = Field(min_length=2)
    found_location: str = Field(min_length=2)
    snapshot_path: str = Field(min_length=2)
    snapshot_hash: str | None = None
    confidence: float = Field(ge=0, le=1)
    metadata: dict[str, Any] = Field(default_factory=dict)


@dataclass
class TimerState:
    first_seen: float
    last_seen: float


class AbandonedItemGuard:
    """Simple in-memory guard to prevent duplicate item spam events."""

    def __init__(self) -> None:
        self._states: dict[str, TimerState] = {}

    def should_emit(self, key: str) -> bool:
        now = time.time()
        state = self._states.get(key)

        if state is None:
            self._states[key] = TimerState(first_seen=now, last_seen=now)
            return False

        state.last_seen = now
        return (now - state.first_seen) >= MIN_CONSISTENT_SECONDS


guard = AbandonedItemGuard()


@app.get("/health")
def health() -> dict[str, bool]:
    return {"ok": True}


@app.post("/webhooks/abandoned-item")
async def abandoned_item_webhook(payload: DetectionPayload, x_service_token: str | None = Header(default=None)) -> dict[str, str]:
    if not BACKEND_SERVICE_TOKEN or x_service_token != BACKEND_SERVICE_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid service token")

    dedupe_key = f"{payload.camera_id}:{payload.title}:{payload.snapshot_hash or payload.snapshot_path}"
    if not guard.should_emit(dedupe_key):
        return {"status": "ignored", "reason": "awaiting consistency window"}

    now_utc = datetime.now(timezone.utc).isoformat()
    body = {
        "title": payload.title,
        "category": payload.category,
        "color": payload.color,
        "foundLocation": payload.found_location,
        "foundAtUtc": now_utc,
        "publicDescription": f"AI-detected item from camera {payload.camera_id}",
        "privateDiscoveryNote": "Auto-ingested by AI webhook",
        "privateData": {
            "confidence": payload.confidence,
            "metadata": payload.metadata,
        },
        "evidence": {
            "sourceCameraId": payload.camera_id,
            "snapshotPath": payload.snapshot_path,
            "snapshotHash": payload.snapshot_hash,
            "detectionMeta": payload.metadata,
            "detectedAtUtc": now_utc,
        },
    }

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(
            BACKEND_API_URL,
            json=body,
            headers={"x-service-token": BACKEND_SERVICE_TOKEN},
        )

    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"Backend rejected event: {response.text}")

    return {"status": "accepted"}
