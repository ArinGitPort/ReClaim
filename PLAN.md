# AI Detection Robustness v1

## Summary
Improve the AI service into a more reliable “second eye” by making abandoned-item detection stateful, conservative around multiple people, and easier to test. This pass stays mostly inside the Python camera daemon, keeps YOLO11m, avoids database/schema changes, and uses existing `detectionMeta` JSON for richer explanations.

## Key Changes
- Refactor daemon tracking into explicit event states: `observing`, `attended`, `possibly_left`, `abandoned_candidate`, and `reported`.
- Replace fragile YOLO track-ID-only history with spatial matching:
  - Match current detections to existing item tracks using class + bounding-box IoU/center distance.
  - Keep item history even if YOLO changes the object ID.
  - Expire stale tracks after a short timeout.
- Use conservative multi-person logic:
  - Treat an item as attended while any person remains near it.
  - Start the abandonment timer only after all nearby people leave.
  - Reset/pause the timer if any person returns near the item.
- Improve abandonment criteria:
  - Require stationary item duration.
  - Require previous person proximity by default.
  - Require person-left grace period.
  - Suppress low-confidence or tiny detections that are likely noise.
- Strengthen duplicate suppression:
  - Deduplicate by camera, class, location bucket, IoU, and time window.
  - Mark a track as reported after upload or duplicate rejection to prevent spam.
- Add richer snapshot metadata through existing `detectionMeta`:
  - `eventState`
  - `stationaryDuration`
  - `personWasNearby`
  - `nearbyPersonCount`
  - `personLeftAt`
  - `firstSeenAt`
  - `lastMovementAt`
  - `boundingBox`
  - `duplicateKey`
  - `reason`
  - `model`
  - `confidence`
- Add a local AI test runner:
  - Accept a video file path and run the same detection/event logic frame-by-frame.
  - Print emitted events and reasons without uploading snapshots unless explicitly enabled.
  - Use this for repeatable tests instead of relying only on live webcam behavior.
- Light frontend adjustment:
  - Extend snapshot reason labels to show new metadata like nearby person count, first seen, and conservative waiting reason when present.
  - Keep staff actions manual: review, dismiss, or log as found.

## Public Interfaces
- No database migration required.
- No route shape changes required.
- `AIEvidenceLog.detectionMeta` gains optional fields only; existing snapshots remain compatible.
- New daemon/test command convention:
  - `python ai-service/daemon.py` remains the live service.
  - Add a separate test mode/script for replaying local videos without starting the Flask stream server.

## Test Plan
- AI service scenarios:
  - Person places item and leaves; item remains still; one snapshot is created.
  - Person places item and returns before threshold; no snapshot.
  - Item moves or is carried away; no snapshot.
  - Multiple people remain near item; no snapshot until all leave.
  - People walk past an existing unattended object; no immediate snapshot unless prior owner context exists.
  - YOLO track ID changes but object stays in same place; stationary timer continues.
  - Same item is not uploaded repeatedly within duplicate cooldown.
  - Camera low FPS still produces stable timing behavior.
- Frontend/backend verification:
  - Snapshot upload still succeeds.
  - Snapshot Gallery still renders older snapshots with missing metadata.
  - New “why flagged” metadata appears when available.
- Commands:
  - `python ai-service/<test-runner>.py --video <sample-video>`
  - `npx tsc -p tsconfig.app.json --noEmit`
  - `npm run lint`

## Assumptions
- Use the conservative crowded-scene policy: the AI should avoid flagging while any person is still near the item.
- Keep YOLO11m as the detector.
- Do not reintroduce camera zones.
- Do not add schema changes unless implementation discovers an existing typed constraint that blocks storing metadata.
- Staff remain the final decision maker; AI only suggests and explains.
