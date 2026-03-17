# ReClaim System Process Architecture

## Workflow A: The Found Item Lifecycle
*This workflow initiates when a physical item is discovered on campus and handed over to the administration.*

### Phase 1: Physical Handover & System Logging
1. **Drop-off Protocol:** A student finds an item, consults the "Turn In an Item" drop-off guide in the User UI, and surrenders the item to the Campus Admin Office.
2. **Admin Data Entry:** The Admin navigates to `Inventory Management` and clicks `[Log New Item]`.
3. **Data Segregation:** * The Admin inputs **General Information** (Category, Color) which becomes public in the user gallery.
    * The Admin inputs **Sensitive Discovery Notes** and **Admin Private Data** (e.g., Serial Number, specific damage), which are encrypted and kept strictly internal.
4. **State Initialization:** The item is saved to the database with the status `Available`.

### Phase 2: User Discovery & Claim Initiation
1. **Gallery Browsing:** The owner logs into ReClaim, navigates to `Browse Found Items`, and uses the filters (Category, Location, Date) to locate their item.
2. **Claim Trigger:** The user identifies the item (marked with a 'Secure Match Required' badge) and clicks `[Claim This Item]`.
3. **Blind Verification Form:** The system prompts the user to provide specific 'Proof Identifiers' (e.g., Claimed Serial, Distinguishing Marks, Student Private Note).
4. **Submission:** The user submits the claim. The item's global status updates to `Claim Pending` (locking it from other users), and the claim appears in the user's `My Claims` tab as `Pending Verification`.

### Phase 3: Admin Adjudication (Claims Verification)
1. **Queue Triage:** The Admin opens the `Claims Verification` dashboard. The new claim populates in the left-hand triage list, flagged with a timestamp and priority level.
2. **Workspace Comparison:** The Admin selects the claim to populate the split-screen workspace:
    * **System Record (Left):** Displays the Admin's hidden logged data (e.g., FVFG0M1Q6L4).
    * **Student Submission (Right):** Displays the user's submitted proof.
3. **Verification Match:** The system highlights identical data entries with a green `Direct Match` indicator to reduce administrative cognitive load.
4. **Decision Action:** * **Approve:** If data matches, Admin clicks `[Approve Claim]`.
    * **Deny:** If data is entirely incorrect, Admin clicks `[Deny]`.
    * **Inquiry:** Admin sends a message requesting more specific proof.

### Phase 4: Resolution & Physical Return
1. **Authorization:** Upon approval, the system generates a secure Pickup Token and notifies the user.
2. **Handover:** The user presents their ID and token at the Admin Office.
3. **Audit Closure:** The Admin processes the handover. The transaction is permanently recorded in the `Handover Log` and `Audit Archive`. The item is removed from the active system.

---

## Workflow B: The Missing Item Lifecycle
*This workflow initiates when a user loses an item that has not yet been turned in to the administration.*

### Phase 1: Proactive Reporting
1. **Report Initiation:** The user navigates to `Report a Lost Item`.
2. **Structured Submission:** The user fills out the three-part form: Item Identity (Category, Color, Location), Time Window, and Proof & Verification (Hidden distinguishing marks, reference photos).
3. **State Initialization:** The report is submitted, appearing in the user's `My Lost Reports` tab as `Under Review`.

### Phase 2: Admin Watchlist Triage
1. **Queue Management:** The Admin navigates to the `Missing Items` dashboard. The report appears in the triage list.
2. **Validation:** The Admin reviews the 'Privacy Guarded Data' provided by the student.
3. **Status Update:** The Admin changes the status to `Active Search`, confirming to the student that the office is actively monitoring for this item.

### Phase 3: Inventory Matching
1. **System Cross-Reference:** When viewing the Report Workspace, the Admin clicks `[Match Inventory]`.
2. **Matching Engine:** The system queries the `Found Inventory` database for items matching the exact Category, Color, and Date parameters of the report.
3. **Link Establishment:** If a physical match is found in the office, the Admin links the Lost Report to the Found Item.
4. **Workflow Convergence:** The system notifies the user that a potential match has been found, prompting them to formally claim it, thereby merging into **Phase 3 of Workflow A**.