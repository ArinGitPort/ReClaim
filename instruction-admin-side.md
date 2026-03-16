# instructions.md - Feature: Administrative Dashboard (The Command Center)

## 1. Core Logic & Business Rules
* **The Gatekeeper Role:** The Admin acts as the manual bridge between "Lost Reports" and "Found Inventory." No automated public postings occur without Admin validation.
* **Audit Trail:** Every status change (Approve, Deny, Mark as Returned) must be logged with the Admin's ID and a timestamp for accountability.
* **Privacy Guard:** Sensitive proof fields (e.g., Private Proof Notes) must be masked by default in the UI. Admins must explicitly click an "Eye" icon to reveal sensitive verification data.
* **Dual-Queue System:** The dashboard must manage two separate workflows:
    1. **Reports Queue:** Managing incoming reports of items students have lost.
    2. **Claims Queue:** Managing requests from students claiming ownership of an item in the public gallery.

---

## 2. Page Architecture & Structural Components

### A. Found Item Inventory Management
* **Inventory Table:** A high-density data table displaying all found items.
    * **Essential Columns:** Item ID, Thumbnail, Category, Date Found, Location, and Status (Available, Claimed, Pending, Archived).
    * **Quick Actions:** Button to "Edit Details" or "Link to Lost Report."
* **Fast-Entry Form:** A minimized form for logging items physically handed into the office. Must include an image upload and a "Storage Location" field (e.g., "Shelf A-1", "Safe").

### B. The Claims Approval Workspace (Security Focus)
* **Side-by-Side Comparison:** When reviewing a claim, the UI must display:
    * **Left Side:** The physical item details (Admin-logged).
    * **Right Side:** The student’s submitted proof (The Confidential Verification Details).
* **Decision Actions:**
    * **Approve:** Moves item to "Ready for Pickup" and triggers a student notification.
    * **Inquiry:** Opens a communication thread to ask the student for more specific proof.
    * **Deny:** Requires a mandatory "Reason for Denial" text field to be sent to the student.

### C. Manual Match-Linking Logic
* **Matching Interface:** When viewing a "Lost Report," provide a "Search Inventory" button.
* **Functionality:** This opens a filtered view of the "Found Inventory" matching the report's category and color. Clicking "Link" creates a formal connection between the missing report and the found item record.

---

## 3. UI & Functional Requirements
* **Data Density:** Use a "Compact" table view. The Admin side should prioritize seeing more rows of data at once over large imagery or white space.
* **Navigation:** The Admin sidebar must contain links for:
    * **Dashboard (Overview)**
    * **Inventory (Manage Items)**
    * **Reports (Review Lost Reports)**
    * **Claims (Verify Ownership)**
    * **Logs (Historical Archive)**
* **Real-time Indicators:** Use high-contrast status badges:
    * `bg-orange-100 text-orange-700` for **Pending Review**.
    * `bg-green-100 text-green-700` for **Approved / Resolved**.
    * `bg-slate-100 text-slate-700` for **Archived**.