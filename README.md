# ReClaim: Item Recovery & Tracking System

ReClaim is a web-based lost-and-found management platform designed to streamline the process of reporting, tracking, and returning lost items within a managed environment. It replaces disorganized reporting methods with a centralized, secure, and structured recovery ecosystem.

The system is built to facilitate clear communication between users who have lost items and administrators who manage the inventory of found property.

---

## Key Features

### User Features
* **Found Items Gallery:** A filtered, searchable interface for users to browse items that have been turned in.
* **Private Lost Reports:** A structured form for users to submit missing item details directly to the administration.
* **Status Tracking:** Real-time tracking of reports and claims from submission to final resolution.
* **Secure Verification:** Targeted data fields for confidential proof of ownership visible only to authorized personnel.

### Administrator Features
* **Submission Management:** A centralized dashboard to review, approve, or deny incoming reports and claims.
* **Inventory Management:** Tools to log found items with detailed metadata, including location and category.
* **Manual Verification Logic:** System-assisted tools for linking lost reports to existing inventory based on verified matching criteria.

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
   git clone [https://github.com/your-username/reclaim.git](https://github.com/your-username/reclaim.git)

---

src/
├── components/     # Reusable UI components (Navigation, Layout, UI primitives)
├── features/       # Feature-based logic (Gallery, Reporting, Admin Dashboard)
├── lib/            # Shared utilities (Prisma client, helper functions)
├── styles/         # Global styles and Tailwind configuration
└── App.tsx         # Root component and routing configuration