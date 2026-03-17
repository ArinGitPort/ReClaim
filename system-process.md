Phase 1: The Student Initiation (User Side)
This phase is all about discovery and structured data capture.

Discovery: The student logs into ReClaim (auto-capturing their session data, so no need to type their name or Student ID). They browse the "Found Items" gallery and spot their lost item (e.g., a MacBook Pro).

Initiation: The student clicks the "Claim This Item" button on the item card.

The Verification Form: A modal or dedicated page opens. Because the system knows this is an "Electronics" category item, it renders the dynamic Verification Details form.

Data Entry: The student fills out the hidden identifiers (e.g., "Serial Number is FVFG... and the lock screen is a picture of a cat").

Submission: The student clicks "Submit Claim Request."

User UI Update: The student is redirected to their "My Claims" page. The item shows a status badge of Pending Verification.

Phase 2: The System Handoff (Database Layer)
The moment the student hits submit, the system does the heavy lifting in the background to prevent chaos.

Locking the Item: The item in the public "Found Items" gallery changes its status from Available to Claim Pending. This visually signals to other students that someone is currently claiming it, preventing 50 people from trying to claim the same MacBook.

Routing: The system packages the student's verification data, attaches their User ID, and pushes it to the Admin's Claims Verification queue.

Phase 3: The Admin Adjudication (Admin Side)
This is where the "Triage" UI we just designed comes into play.

Notification: The Admin dashboard receives a real-time ping. The "Claims Verification" sidebar tab shows a notification dot (e.g., "1 New Claim").

The Triage List: The Admin clicks into the Claims Verification page. On the left-hand navigation list, they see a new card for the MacBook Pro, tagged with the student's name and a New badge.

The Workspace Comparison: The Admin clicks the card. The right side of the screen populates:

Left Panel: Loads the Official Inventory Data (the serial number the Admin typed in when they found it).

Right Panel: Loads the Student Submission.

Blind Verification: The Admin clicks "Reveal Input" on the student's submitted serial number to see if it matches the official record.

Phase 4: The Decision Matrix (Admin Action)
Based on the comparison, the Admin has three paths:

Path A: Inquiry (Need More Info)

The Admin clicks "Inquiry Request." A text box opens to type a message: "Please describe the stickers on the bottom case." The claim status changes to Action Required on the student's dashboard.

Path B: Denial (Mismatched Info)

The Admin clicks "Deny Claim" and selects a reason (e.g., "Serial Number does not match"). The claim is closed, and the item goes back to Available in the public gallery.

Path C: Approval (Direct Match)

The Admin clicks "Approve Claim."

Phase 5: The Physical Handover (Closing the Loop)
Once approved, the digital process transitions into the physical world.

The Authorization: The system generates a "Pickup Token" (a short alphanumeric code or QR code) and sends it to the student's dashboard and email. The item status changes to Ready for Pickup.

The Office Visit: The student walks into the Admin office and presents their Student ID and the Pickup Token.

The Final Scan: The Admin types the token into the dashboard or clicks "Process Handover" on the item.

The Audit Archive: The system permanently logs the transaction: "MacBook Pro returned to Juan Dela Cruz on March 17, 2026, authorized by Admin Maria."

Resolution: The item is removed from the active system and archived.