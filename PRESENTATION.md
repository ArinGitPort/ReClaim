# ReClaim Platform: System Updates & Feature Presentation

## 1. Previous System Updates

### AI Surveillance Daemon Optimization
**Update:** Decoupled the raw video streaming component from the AI inference engine.
**Documentation:** Previously, the video stream and AI processing were tightly coupled, causing performance bottlenecks. By separating them, the system now allows for independent live monitoring and AI toggling. The YOLOv8-Medium model was also configured with specific class filtering (backpacks, laptops, bottles, etc.) to improve detection accuracy and a refined confidence threshold was established to minimize false positives.

### Reusable UI Components & Admin Handover UI
**Update:** Standardization of the confirmation workflow across administrative actions.
**Documentation:** Extracted duplicate modal code into standalone `StatusModal` and `StatusContent` components. This ensures a consistent design language across the application. The report tracking on the user side (`UserMyReportsPage`) was also refactored to prioritize actionable statuses (e.g., "Match Found", "Active Search") over closed items, improving user experience.

### Admin Dashboard Analytics Backend
**Update:** Transformed the Admin Dashboard from a static placeholder into a data-driven overview.
**Documentation:** Implemented a backend analytics API to track key performance metrics such as active inventory count, pending claims, and camera network health. These data feeds are now integrated into the frontend dashboard utilizing a high-density, professional UI that provides administrators with actionable insights at a glance.

### Form Sanitization & Header State Resolutions
**Update:** Enhanced security on authentication forms and resolved session persistence bugs.
**Documentation:** Added sanitization logic to Login and Register forms to prevent trailing spaces from being counted as valid input in email/password fields. Additionally, resolved a critical issue where header navigation and admin functionalities persisted after a user logged out by ensuring strict session invalidation and React state clearing across the main navigation and sidebar.

---

## 2. Latest System Update

### Real-Time Live AI Monitor & Dismissed Snapshots Archive
**Update:** Replaced mock data with real-time API polling on the Live Monitor and introduced a robust "Soft-Delete" snapshot archiving system.

**Detailed Explanation & Documentation:**
1. **Live AI Monitor Integration:** The `AdminLiveMonitorPage` was completely refactored. The "Recent Detections" side panel now actively polls the `GET /snapshots` endpoint every 15 seconds instead of relying on hardcoded mock arrays. It displays real detection times, color-coded confidence badges (e.g., Green for ≥90%), and predicted categories. Each detection acts as a direct link to the snapshot gallery for immediate review.
2. **Dismissed Snapshots Archive:** Rather than permanently deleting false alarms, the system now employs a "soft-delete" mechanism. The `AIEvidenceLog` database schema was updated with a `dismissedAt` timestamp. A brand new page (`AdminDismissedSnapshotsPage`) was created to serve as a recovery queue.
3. **Audit Trail Accountability:** To maintain strict administrative accountability, the `AuditAction` enum in the database was expanded to include `SNAPSHOT_DISMISSED` and `SNAPSHOT_RESTORED`. Any time an administrator dismisses a false alarm or restores one from the archive, the action is permanently recorded in the system's Audit Trail with the actor's details and timestamp.

---

## 3. Screenshots and Documentation

*(Note: Please insert your high-resolution system screenshots in the placeholders below before presenting.)*

### A. Live AI Monitor Interface
![Live AI Monitor Interface](./screenshots/live-monitor-realtime.png)

**Discussion & Explanation:**
This screenshot demonstrates the newly upgraded Live AI Monitor. On the left, you can see the multi-camera grid streaming live MJPEG feeds directly from campus security cameras. On the right is the new **Real-Time Detections Feed**. As the YOLOv8 AI daemon registers items in the frame, they populate this list automatically every 15 seconds. The color-coded badges (green, blue, amber) instantly communicate the AI's confidence level, allowing administrators to prioritize which snapshots to review first.

### B. Dismissed Snapshots Archive
![Dismissed Snapshots Archive](./screenshots/dismissed-snapshots-archive.png)

**Discussion & Explanation:**
This screenshot highlights the new Dismissed Snapshots page. When an administrator encounters a false alarm in the primary Snapshot Gallery (e.g., a jacket mistaken for a backpack), they dismiss it. Instead of vanishing, it appears here. This interface mimics the high-density layout of our standard data tables, allowing admins to search, filter by category, and review the exact metadata of the dismissed item. Most importantly, it features a "Restore" action, preventing permanent data loss from accidental clicks.

### C. Enhanced Audit Trail
![Audit Trail Logging](./screenshots/audit-trail-updates.png)

**Discussion & Explanation:**
This screenshot shows the updated Audit Trail interface. You can see the new `SNAPSHOT_DISMISSED` and `SNAPSHOT_RESTORED` actions successfully logging. The system records exactly which administrator performed the action and the unique reference code of the snapshot. This guarantees that all interactions with AI-generated evidence are tracked, ensuring compliance and accountability within the administrative portal.

### D. Dynamic Header Navigation
![Dynamic Header Fix](./screenshots/dynamic-header.png)

**Discussion & Explanation:**
This visual focuses on the top navigation bar. Previously, navigating to new administrative routes like the Snapshot Gallery or Live Monitor would incorrectly display a generic "Admin Portal" title. As shown in the screenshot, the header routing logic has been fixed and strictly ordered. The application now dynamically and accurately reads the URL path to display the precise module name (e.g., "AI Snapshot Gallery" or "Live Monitor"), significantly improving contextual awareness for the user.
