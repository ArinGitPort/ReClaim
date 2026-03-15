Feature: Report a Missing Item

## 1. Core Logic & Business Rules
* **Authentication Dependency:** This feature must be protected by an Auth Guard. Only logged-in students or staff can submit a report.
* **Auto-Identification:** Do not include input fields for Student ID, Name, or Email. These must be pulled automatically from the user's active session/context to reduce friction.
* **Data Visibility:** Reports are **private**. They are visible only to the submitting student and the Admin. They must never appear in the public "Found Items" gallery to maintain security.
* **Workflow State:**
    * `Status: Submitted` – Initial state upon form completion.
    * `Status: Under Review` – Assigned when an Admin begins looking at the report.
    * `Status: Active Search` – Assigned when the Admin validates the report and cross-references it with current inventory.
    * `Status: Resolved` – Assigned once the item is found and returned, or the student cancels the report.

---

## 2. Form Architecture (Component Structure)
The form is divided into three logical sections to ensure high-quality data for the verification process.

### Section 1: Categorization & Matching Data
* **Category (Required):** Dropdown menu (Electronics, Bags, Wallets/IDs, Clothing, Keys, Others).
* **Primary Color (Required):** Dropdown menu or selection grid.
* **Brand/Model (Optional):** Text input (e.g., "Sony," "Nike").
* **Campus Location (Required):** Searchable dropdown of specific buildings or campus zones.
* **Date/Time (Required):** Date picker for the day lost and a "Time Window" selector (Morning, Afternoon, Evening, Night).

### Section 2: Conditional Verification Data
* *This section renders fields dynamically based on the Category selected.*
    * **Electronics:** Field for "Device Name/Bluetooth Name."
    * **Wallets/IDs:** Field for "Full Name printed on the document."
    * **Bags:** Field for "Specific Contents inside."

### Section 3: Proof & Verification (Admin-Only Access)
* **Photo Reference (Optional):** File upload zone for the user to provide a reference image (stock photo or personal photo of the item). Limit: 2 files, 5MB each.
* **Distinguishing Marks:** Text area for unique identifiers (scratches, stickers, specific charms).
* **Private Note:** A dedicated field for information only the Admin should see to verify ownership (e.g., "The lock screen password is my birthday").

---

## 3. UX & Functional Requirements
* **Submission Response:** Upon successful submission, redirect the user to a "Report Confirmation" page displaying their current status and a reference number.
* **Form Validation:** Use strict validation (e.g., Zod) to ensure:
    * "Date Lost" cannot be in the future.
    * Required fields are not empty.
    * File uploads are limited to images (PNG/JPG).
* **Terminology:** Use clear, service-oriented language focused on the manual review process. Avoid technical terms like "AI" or "Matchmaking" in the student-facing UI.
* **Manual Approval:** All student reports must be manually reviewed by an Admin before the status moves to "Active Search."

