# ReClaim: Campus Item Recovery & Tracking System

ReClaim is a modern, web-based lost-and-found platform designed specifically for the National University (NU) Philippines campus environment. It bridges the gap between students who have lost personal belongings and the campus administration tasked with finding them.

Built with a focus on UI/UX, security, and structured verification, ReClaim moves away from cluttered social media posts and into a centralized, professional recovery ecosystem.

---

## Key Features

### For Students
* **Browse Found Items:** A clean, filtered gallery of items turned in to the Admin office.
* **Secure Reporting:** Private submission of "Lost Item Reports" directly to the school administration.
* **Claim Management:** Track the status of your claims from "Pending" to "Approved" and "Ready for Pickup."
* **Confidential Verification:** Dedicated fields for sensitive proof (e.g., lock screen details) visible only to authorized staff.

### For Administrators
* **Submission Management:** Review and approve student reports and claims in a centralized queue.
* **Inventory Control:** Log found items with high-quality descriptions and locations.
* **Manual Matching:** Dedicated tools for administrators to link lost reports to found inventory based on verified proof.

---

## Design Philosophy
As a UI/UX-focused project, ReClaim follows a "Unified Shell" design system:
* **Branded Framing:** A solid, high-contrast header and sidebar provide a consistent visual anchor.
* **Clean Elevation:** Utilizing shadcn/ui components on a soft gray canvas to ensure white item cards pop and information hierarchy is clear.
* **Frictionless UX:** Auto-identifying students via their institutional login to remove redundant data entry and ensure session security.

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **UI Components:** shadcn/ui, Lucide React Icons
- **State & Forms:** React Hook Form, Zod Validation
- **Backend:** Node.js
- **Database & ORM:** PostgreSQL, Prisma ORM
- **Routing:** React Router v6

---

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/reclaim-nu.git](https://github.com/your-username/reclaim-nu.git)