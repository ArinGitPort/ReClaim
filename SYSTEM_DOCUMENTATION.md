# ReClaim SaaS Technical Specification

## 1. Executive Summary
ReClaim is a comprehensive Lost and Found management SaaS utilizing computer vision to automate item detection and logging. The primary technology stack consists of a React (Vite) frontend, a Node.js/Express backend, a PostgreSQL database managed via Prisma ORM, and an independent Python YOLO11 daemon for real-time security camera inference. 

The goal of this document is to serve as the definitive "Source of Truth" for developers and system architects, detailing the "If/Then" logic, data flow, and constraints of the system.

---

## 2. System Architecture
The system operates on a decoupled client-server architecture with a secondary microservice daemon for AI workloads:

- **Frontend (Client):** A React SPA that handles UI state and routing. It communicates with the backend exclusively via HTTPS RESTful API calls, sending and receiving JSON payloads. Authentication is managed via JWT tokens stored in HTTP-only cookies or local storage.
- **Backend (API Gateway & Core Logic):** A Node.js/Express server that validates incoming requests (via Zod), executes business logic, and interacts with the database. It serves static media assets (e.g., uploaded proof images, AI snapshots) via localized routes.
- **Database (Persistence):** A PostgreSQL relational database. The Prisma ORM manages schema migrations, connection pooling, and query execution.
- **AI Service Daemon:** A standalone Python process that consumes RTSP/MJPEG camera streams, performs object detection inference via YOLO11, and POSTs structured JSON metadata alongside full-frame annotated image payloads to the backend API using a pre-shared service key.

---

## 3. Functional Specifications: User Portal

### Public Landing & Authentication Flow
- **Input:** Unauthenticated traffic. Credentials (Email/Password), Registration payload (Name, StudentID, Email, Password), or Password Reset requests.
- **Processing:** 
  - Validates password complexity and sanitizes inputs (e.g., stripping trailing whitespace). 
  - Hashes passwords using bcrypt. Compares hashes on login. 
  - Handles secure password recovery flows (e.g., generating temporary reset tokens).
- **Output:** Returns a JWT session token (stored in HTTP-only cookies/local storage) and User metadata. Initializes the global Auth Context.

### Campus Office (Dashboard / Landing)
- **Input:** Static data and user session context.
- **Processing:** Evaluates current operational hours and system status.
- **Output:** Renders interactive maps, contact information, and quick-action navigation for the user based on their authentication state.

### Found Items Gallery
- **Input:** `GET /api/items/public` (Filtered to active public inventory).
- **Processing:** Fetches active inventory. Applies client-side sorting and category-based filtering.
- **Output:** Visual grid representation of found items that users can initiate claims against.

### Report Lost Item Flow
- **Input:** Form data containing item description, last known location, date lost, and category.
- **Processing:** 
  - Validates payload structure.
  - Associates the `LostReport` with the authenticated UserID.
  - Automatically queries active inventory to flag potential matches (Status updates to `MATCH_FOUND` or remains `ACTIVE_SEARCH`).
- **Output:** Creates a `LostReport` record and renders it in the "My Reports" module.

### Claims Management (My Claims)
- **Input:** `GET /api/user/claims` and form payloads for new claims (including proof of ownership descriptions or image uploads).
- **Processing:** 
  - Links a new claim to a specific `FoundItem` ID and the `UserID`.
  - Automatically locks the target item's status to `CLAIM_PENDING` for 48 hours if it is the first active claim, preventing parallel claims while the reservation is alive.
  - Expired or cancelled claims start a 24-hour same-user cooldown before the same item can be claimed again.
- **Output:** Creates a `Claim` record with `PENDING_VERIFICATION` status and a reservation expiry. Renders the user's historical and active claims.

### Ready to Claim / Pickup
- **Input:** The active `Claim` ID.
- **Processing:** 
  - Verifies the claim status is `APPROVED`.
  - If approved, generates and fetches a secure, randomized 6-character alphanumeric pickup token assigned to that claim.
- **Output:** Renders the secure token and physical pickup instructions for the user.

### User Notifications
- **Input:** `GET /api/notifications` or WebSocket events.
- **Processing:** Polls or receives system-generated events (e.g., "Your claim was approved", "A match was found for your report"). Marks events as read when clicked.
- **Output:** Populates the notification dropdown and updates unread badge counts.

### User Settings & Profile
- **Input:** User profile update payloads (Name, Avatar, Notification preferences).
- **Processing:** Validates and sanitizes input. Updates the `User` table.
- **Output:** Persists profile changes and updates the frontend Auth Context globally.

---

## 4. Functional Specifications: Admin Portal

### Executive Dashboard & Analytics
- **Input:** `GET /api/admin/analytics`.
- **Processing:** Aggregates database metrics across all major tables (e.g., total active inventory, pending claims, resolved reports, camera statuses).
- **Output:** Renders top-level KPIs and chart visualizations to provide a high-level operational overview.

### Live AI Monitor
- **Input:** `GET /api/cameras` (for definitions) and MJPEG stream URIs. `GET /api/snapshots` for recent detection polling.
- **Processing:** Connects directly to camera stream endpoints and overlays AI detection metadata. Parses confidence intervals (e.g., >90% High Confidence).
- **Output:** Live video feeds with a real-time ledger of detection alerts.

### Snapshot Gallery & Archive
- **Input:** `GET /api/snapshots` (Unprocessed logs).
- **Processing:** 
  - Administrators evaluate AI confidence and image clarity.
  - **Action 1 (Log Item):** Converts the `AIEvidenceLog` into a physical `FoundItem` (Status `AVAILABLE`).
  - **Action 2 (Dismiss):** Sets the `dismissedAt` timestamp, migrating the record to the Dismissed Snapshots Archive (`GET /api/snapshots/dismissed`).
- **Output:** Moves records through the pipeline and triggers audit logs.

### Inventory Management & Expired Inventory
- **Input:** CRUD payloads for `FoundItem`.
- **Processing:** Enforces state machine rules: `AVAILABLE` -> `CLAIM_PENDING` -> `RETURNED` or `ARCHIVED`. Calculates time-in-system from the configured found-item retention policy to determine expired inventory requiring archive/disposal action.
- **Output:** Updates database records.

### Missing Items Verification (Reports)
- **Input:** `GET /api/admin/reports`.
- **Processing:** Aggregates user-submitted lost reports. Admins can manually cross-reference these against current inventory to link them (updates status to `MATCH_FOUND`).
- **Output:** Links `LostReport` foreign keys to `FoundItem` primary keys.

### Claims Verification
- **Input:** `GET /api/admin/claims`. Administrator approval/denial payloads.
- **Processing:** 
  - Evaluates user-submitted proof.
  - **If Approved:** Generates a pickup token, locks the item status as `CLAIM_PENDING`, and updates claim status to `APPROVED`.
  - **If Denied:** Reverts item status back to `AVAILABLE`, rejects the claim, and triggers a user notification.
- **Output:** State mutation on `Claim` and `FoundItem` tables.

### Handover Log
- **Input:** Match payload consisting of a Pickup Token and User Verification.
- **Processing:** 
  - Validates the token against the `APPROVED` claim.
  - Ensures the user presenting the token matches the original claimant.
- **Output:** Creates a `HandoverLog` record and updates the item status to `RETURNED`. Admins can restore a handover if it was recorded incorrectly, which releases the item and cancels the previous approved claim.

### Operations Queue
- **Input:** `GET /api/dashboard/operations`.
- **Processing:** Aggregates next-action worklists across pending claims, inquiry-required claims, approved pickups, active reports, pending AI snapshots, and expired inventory. Applies urgency flags from reservation expiry, pickup token expiry, stale report age, stale snapshot age, and retention policy.
- **Output:** Renders admin dashboard queue cards with counts, urgency indicators, and deep links to the relevant admin workflow.

### Audit Trail
- **Input:** `GET /api/audit/logs`.
- **Processing:** Fetches the immutable ledger of administrative actions. Resolves Foreign Keys to human-readable strings based on the target type (e.g., resolving `FoundItem.id` to `FoundItem.code`).
- **Output:** Displays chronological, read-only audit records containing the actor, action type, target reference, and JSON payload diffs (Before/After states).

### System & Camera Settings
- **Input:** Configuration payloads.
- **Processing:** Persists global settings through `/api/settings`, including institution details, staff permission toggles, campus zones, alert templates, and retention policy. Camera settings remain managed through `/api/cameras`.
- **Output:** Settings changes are audit logged. Staff permission toggles immediately affect staff access to inventory, claim, and report actions.

### User Directory Management
- **Input:** `GET /api/admin/users` and role mutation payloads.
- **Processing:** Enables administrators to view all registered users and modify their access levels.
- **Output:** Updates the `role` enum (`STUDENT`, `STAFF`, `ADMIN`) on the `User` table, immediately affecting their JWT permissions.

---

## 5. API & Data Schema

### Core Endpoints
- **User Routes:**
  - `GET /api/items/public` - Fetches active public inventory.
  - `POST /api/reports` - Submits a lost item report.
  - `POST /api/claims` - Submits a new claim (Requires User JWT).
- **Admin Routes:**
  - `GET /api/dashboard/operations` - Fetches operational queues and urgency counts.
  - `PATCH /api/claims/:id/decision` - Approves, denies, or requests inquiry for a claim.
  - `POST /api/handover` - Starts physical handover.
  - `POST /api/handover/confirm` - Completes physical handover.
  - `GET /api/settings` / `PATCH /api/settings` - Reads and updates persisted system settings.
- **Service Routes:**
  - `POST /api/snapshots` - Uploads AI detection log (Requires Service API Key).
  - `GET /api/audit/logs` - Retrieves paginated audit trail (Requires Admin JWT).

### Core Database Entities (Prisma)
- **User:** 
  - PK: `id` (UUID). 
  - Fields: `email`, `role` (ENUM: `STUDENT`, `STAFF`, `ADMIN`), `passwordHash`.
- **FoundItem:** 
  - PK: `id` (UUID). 
  - Fields: `code` (Unique), `status` (ENUM: `AVAILABLE`, `CLAIM_PENDING`, `RETURNED`, `ARCHIVED`). 
  - FKs: `createdById` -> `User(id)`.
- **LostReport:** 
  - PK: `id` (UUID). 
  - Fields: `description`, `status`. 
  - FKs: `userId` -> `User(id)`, `matchedItemId` (Nullable) -> `FoundItem(id)`.
- **Claim:** 
  - PK: `id` (UUID). 
  - Fields: `submittedProof`, `status`, `reservationExpiresAt`, `pickupToken`, `pickupTokenExpires`. 
  - FKs: `userId` -> `User(id)`, `itemId` -> `FoundItem(id)`.
- **AIEvidenceLog:** 
  - PK: `id` (UUID). 
  - Fields: `snapshotPath`, `detectionMeta` (JSON), `dismissedAt` (Datetime). 
  - FKs: `foundItemId` (Nullable) -> `FoundItem(id)`.
- **HandoverLog:** 
  - PK: `id` (UUID). 
  - Fields: `notes`. 
  - FKs: `claimId` -> `Claim(id)`, `itemId` -> `FoundItem(id)`, `processedById` -> `User(id)`.
- **AuditLog:** 
  - PK: `id` (UUID). 
  - Fields: `action` (ENUM), `payload` (JSON). 
  - FKs: `actorUserId` -> `User(id)`.
- **SystemSetting:**
  - PK: `key`.
  - Fields: `value` (JSON), `updatedById`, `updatedAt`.

---

## 6. Environment & Setup

### Environment Variables (.env)
**Backend:**
- `DATABASE_URL`: Connection string for PostgreSQL.
- `JWT_SECRET`: Cryptographic key for signing user sessions.
- `PORT`: Execution port (default 4000).
- `SERVICE_TOKEN`: Pre-shared key for AI daemon authentication. Legacy aliases `SERVICE_API_KEY` and `BACKEND_SERVICE_TOKEN` are also accepted by the backend.
- `AI_ACTOR_USER_ID`: Optional user ID used when AI ingestion creates found-item records.

**Frontend:**
- `VITE_API_BASE_URL`: Fully qualified URI pointing to the backend API Gateway, for example `http://localhost:4000/api`. Legacy alias `VITE_API_URL` is also accepted.

**AI Service:**
- `BACKEND_API_BASE`: Backend API base URL, for example `http://localhost:4000/api`.
- `BACKEND_SERVICE_TOKEN`: Service token sent to protected AI/backend endpoints. Legacy aliases `SERVICE_TOKEN` and `SERVICE_API_KEY` are also accepted.
- `YOLO_MODEL`: Optional Ultralytics model name/path for the AI daemon. Defaults to `yolo11m.pt`.
- `YOLO_DEVICE`: Optional inference device. Defaults to `auto`, which uses CUDA GPU when PyTorch detects it and falls back to CPU.

### Initialization Commands
1. **Database & Backend:**
   ```bash
   cd backend
   npm install
   npx prisma db push
   npx prisma generate
   npm run dev
   ```
2. **Frontend Client:**
   ```bash
   npm install
   npm run dev
   ```
3. **AI Service Daemon:**
   ```bash
   cd ai-service
   pip install -r requirements.txt
   python daemon.py
   ```

---

## 7. Error Handling & Edge Cases

### Standard Response Protocol
The API adheres to standard HTTP status codes:
- **400 Bad Request:** Triggered by Zod schema validation failures (e.g., missing required fields, malformed JSON).
- **401 Unauthorized:** Missing or invalid JWT session token.
- **403 Forbidden:** Valid JWT, but the user lacks the necessary `role` (e.g., Student attempting to access Admin endpoints).
- **404 Not Found:** The requested resource ID does not exist in the database.
- **500 Internal Server Error:** Unhandled exceptions caught by the global error middleware.

### Edge Cases & Known Limitations
- **Concurrency in Claims:** The first active claim reserves the `FoundItem` immediately by setting it to `CLAIM_PENDING`. New claims are rejected while the active reservation or approved pickup is valid. Stale reservations are expired lazily on relevant claim API calls.
- **AI Feed Disconnects:** If a camera stream goes offline, the frontend Live Monitor gracefully degrades to an `OFFLINE` state placeholder rather than crashing the UI loop or throwing consecutive errors.
- **Orphaned Image Assets:** Soft-deleting records or dismissing snapshots does not purge the binary `.webp` or `.png` files from the disk automatically. A cron job or manual purge routine is required for long-term storage maintenance to prevent disk bloat.
- **Soft Deletion Constraints:** Snapshots and items rely heavily on nullable relationships (e.g., `dismissedAt`, `archivedAt`) rather than hard deletion to preserve structural integrity for the `AuditLog` foreign keys. Hard deleting a user or item will cascade and corrupt the immutable audit trail.
