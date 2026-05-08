# ReClaim SaaS Technical Specification

## 1. Executive Summary
ReClaim is a comprehensive Lost and Found management SaaS utilizing computer vision to automate item detection and logging. The primary technology stack consists of a React (Vite) frontend, a Node.js/Express backend, a PostgreSQL database managed via Prisma ORM, and an independent Python YOLOv8 daemon for real-time security camera inference. 

The goal of this document is to serve as the definitive "Source of Truth" for developers and system architects, detailing the "If/Then" logic, data flow, and constraints of the system.

---

## 2. System Architecture
The system operates on a decoupled client-server architecture with a secondary microservice daemon for AI workloads:

- **Frontend (Client):** A React SPA that handles UI state and routing. It communicates with the backend exclusively via HTTPS RESTful API calls, sending and receiving JSON payloads. Authentication is managed via JWT tokens stored in HTTP-only cookies or local storage.
- **Backend (API Gateway & Core Logic):** A Node.js/Express server that validates incoming requests (via Zod), executes business logic, and interacts with the database. It serves static media assets (e.g., uploaded proof images, AI snapshots) via localized routes.
- **Database (Persistence):** A PostgreSQL relational database. The Prisma ORM manages schema migrations, connection pooling, and query execution.
- **AI Service Daemon:** A standalone Python process that consumes RTSP/MJPEG camera streams, performs object detection inference via YOLOv8, and POSTs structured JSON metadata alongside WebP image payloads to the backend API using a pre-shared service key.

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
- **Input:** `GET /api/items` (Filtered specifically by status `AVAILABLE`).
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
  - Automatically locks the target item's status to `CLAIM_PENDING` if it is the first active claim, preventing parallel processing.
- **Output:** Creates a `Claim` record with `PENDING` status. Renders the user's historical and active claims.

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
- **Processing:** Enforces state machine rules: `AVAILABLE` -> `CLAIM_PENDING` -> `HANDED_OVER` or `ARCHIVED`. Calculates time-in-system to determine "Expired" status (items held past policy duration).
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
- **Output:** Creates a `HandoverLog` record and permanently updates the item status to `HANDED_OVER`. This action is immutable.

### Audit Trail
- **Input:** `GET /api/audit/logs`.
- **Processing:** Fetches the immutable ledger of administrative actions. Resolves Foreign Keys to human-readable strings based on the target type (e.g., resolving `FoundItem.id` to `FoundItem.code`).
- **Output:** Displays chronological, read-only audit records containing the actor, action type, target reference, and JSON payload diffs (Before/After states).

### System & Camera Settings
- **Input:** Configuration payloads.
- **Processing:** Updates global platform configuration variables or camera endpoint definitions (RTSP URLs, AI toggles, Active Status).
- **Output:** Re-initializes connections in the AI Daemon based on updated DB values.

### User Directory Management
- **Input:** `GET /api/admin/users` and role mutation payloads.
- **Processing:** Enables administrators to view all registered users and modify their access levels.
- **Output:** Updates the `role` enum (`STUDENT`, `STAFF`, `ADMIN`) on the `User` table, immediately affecting their JWT permissions.

---

## 5. API & Data Schema

### Core Endpoints
- **User Routes:**
  - `GET /api/items` - Fetches active inventory.
  - `POST /api/reports` - Submits a lost item report.
  - `POST /api/claims` - Submits a new claim (Requires User JWT).
- **Admin Routes:**
  - `PUT /api/admin/claims/:id` - Approves/Denies claim.
  - `POST /api/admin/handover` - Completes physical handover.
- **Service Routes:**
  - `POST /api/snapshots` - Uploads AI detection log (Requires Service API Key).
  - `GET /api/audit/logs` - Retrieves paginated audit trail (Requires Admin JWT).

### Core Database Entities (Prisma)
- **User:** 
  - PK: `id` (UUID). 
  - Fields: `email`, `role` (ENUM: `STUDENT`, `STAFF`, `ADMIN`), `passwordHash`.
- **FoundItem:** 
  - PK: `id` (UUID). 
  - Fields: `code` (Unique), `status` (ENUM: `AVAILABLE`, `CLAIM_PENDING`, `HANDED_OVER`, `ARCHIVED`). 
  - FKs: `createdById` -> `User(id)`.
- **LostReport:** 
  - PK: `id` (UUID). 
  - Fields: `description`, `status`. 
  - FKs: `userId` -> `User(id)`, `matchedItemId` (Nullable) -> `FoundItem(id)`.
- **Claim:** 
  - PK: `id` (UUID). 
  - Fields: `proofDescription`, `status`, `pickupToken`. 
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

---

## 6. Environment & Setup

### Environment Variables (.env)
**Backend:**
- `DATABASE_URL`: Connection string for PostgreSQL.
- `JWT_SECRET`: Cryptographic key for signing user sessions.
- `PORT`: Execution port (default 4000).
- `SERVICE_API_KEY`: Pre-shared key for the AI daemon authentication.

**Frontend:**
- `VITE_API_URL`: Fully qualified URI pointing to the backend API Gateway.

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
- **Concurrency in Claims:** Multiple users may submit claims for the exact same `FoundItem`. The system processes these; however, the moment an administrator approves *one* claim, the item is locked (`CLAIM_PENDING`). Subsequent approvals for competing claims will fail validation until the item is reverted.
- **AI Feed Disconnects:** If a camera stream goes offline, the frontend Live Monitor gracefully degrades to an `OFFLINE` state placeholder rather than crashing the UI loop or throwing consecutive errors.
- **Orphaned Image Assets:** Soft-deleting records or dismissing snapshots does not purge the binary `.webp` or `.png` files from the disk automatically. A cron job or manual purge routine is required for long-term storage maintenance to prevent disk bloat.
- **Soft Deletion Constraints:** Snapshots and items rely heavily on nullable relationships (e.g., `dismissedAt`, `archivedAt`) rather than hard deletion to preserve structural integrity for the `AuditLog` foreign keys. Hard deleting a user or item will cascade and corrupt the immutable audit trail.
