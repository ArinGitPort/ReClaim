# Project Overview
**Title:** ReClaim: AI-Monitored Campus Item Recovery & Tracking System
**Description:** A local, web-based platform for campus lost and found. It uses a microservices architecture to process local stationary camera streams (YOLOv8), log abandoned items to a local PostgreSQL database, and allow students to claim items via a React frontend. The system relies on "blind verification," where AI-captured snapshots are kept completely hidden from the public and used strictly by admins to verify claims.

## 1. Tech Stack Requirements

**Frontend (Client Portal & Admin Dashboard):**
* **Framework:** React + Vite
* **Language:** TypeScript (Strict mode enabled)
* **Styling:** Tailwind CSS
* **UI Components:** shadcn/ui
* **State Management:** React Context or Zustand (keep it simple)
* **Data Fetching:** Axios or standard Fetch API

**Backend (API & Web Server):**
* **Framework:** Node.js + Express.js
* **Language:** TypeScript
* **ORM:** Prisma
* **Database:** PostgreSQL (Local)
* **Image Handling:** Multer (saving files to a local encrypted directory)

**AI Engine (Computer Vision Service):**
* **Language:** Python (3.10 or 3.11)
* **Framework:** FastAPI (for receiving/sending webhooks to Node.js backend)
* **ML Library:** Ultralytics YOLOv8 (running locally via CUDA/GPU)
* **Image Processing:** OpenCV


**Extra Libraries**
* Please make sure you add the additional libraries needed for the project for documentation purposes and for easier installation.

---

## 2. Recommended Directory Structure 
* Use as this as a guide, it doesn't have to be exact

/project-root
  /frontend             # Vite + React + TS + Tailwind
    /src
      /components
        /ui             # Generic, "dumb" UI elements (shadcn buttons, inputs, dialogs)
      /features         # Domain-driven modules (Organized by what the app ACTUALLY does)
        /auth           # Login forms, authentication context, protected routes
        /gallery        # Public item cards, search bar, grid layouts
        /claims         # Dynamic proof of ownership forms, status trackers
        /admin          # Verification queue, AI log viewer, camera toggle
      /pages            # Top-level route components that stitch features together
      /hooks            # Global custom React hooks
      /lib              # Utility functions (e.g., shadcn's `cn` function, API client)
      /types            # Shared TypeScript interfaces (e.g., Item, Claim, User)
  /backend              # Node.js + Express API + Prisma ORM
    /src
      /controllers      # Request handlers (receives HTTP requests, sends responses)
      /services         # Core business logic (database queries, rule enforcement)
      /routes           # API endpoint definitions
      /middlewares      # Security (auth verification, error handling)
    /uploads            # Local folder for encrypted AI snapshots
  /ai-service           # Python + FastAPI + YOLOv8 scripts
  /docs                 # System architecture, DFDs, and database schemas
  instructions.md       # This file

---

## 3. Development Best Practices & Rules

### General Rules for the AI Agent
* **Think before coding:** Always outline the logic and file changes before writing the code.
* **Typing:** Use strict TypeScript typing for everything. Avoid `any`. Share types between the frontend and backend where possible.
* **File Size Limit:** No single file should ever exceed 600 lines of code. Refactor into smaller child components or helper functions if approaching this limit.
* **Mobile Responsiveness:** Ensure all UI designs are mobile-responsive from the start.

### Frontend (React) Best Practices
* **No Emojis:** Do not use emojis in the UI or codebase.
* **Atomic Design Pattern:** Strictly follow the Atomic Design methodology (Atoms -> Molecules -> Organisms -> Templates -> Pages).
* **Component Modularity:** Place shadcn components in `src/components/ui` (treated as Atoms/Molecules) and custom project components in their respective Atomic folders.
* **Design Consistency:** UI must be clean, modern, and user-friendly (ShadCN style). Ensure frontend design is consistent across all pages, from search bars to filter dropdowns.
* **Admin Layout:** Implement a split-screen layout for the Admin Dashboard Verification Queue (Claim text on the left, hidden AI snapshot on the right).
* **React Standards:** Use functional components and React Hooks exclusively.

### Backend (Node.js) Best Practices
* **Modular Architecture:** Separate business logic (`services`) from request handling (`controllers`).
* **Timezones:** All dates/timestamps must be saved in UTC in the database, and converted to local time (e.g., Asia/Manila, UTC+8) on the frontend.
* **Security:** Secure the `/uploads` directory so it cannot be accessed via a public URL; it must be requested and served strictly through an authenticated admin endpoint.

### Database (PostgreSQL & Prisma) Best Practices
* **Primary Keys:** Use UUIDs for all primary keys.
* **AI Data:** Utilize the `JSONB` data type for storing raw YOLOv8 detection metadata.
* **Relations:** Ensure foreign keys correctly link `claims` to `found_items`, and `found_items` to `ai_evidence_logs`.

### AI Service (Python) Best Practices
* **Spam Prevention:** Ensure the Python service handles the "timer" state machine logic for abandoned items to prevent spamming the database with false positives.
* **Trigger Workflow:** When an item is flagged as abandoned, the Python script must save the cropped image locally and send a `POST` request to the Node.js backend to log the event in PostgreSQL.
* **Hardware Efficiency:** Write efficient OpenCV frame-reading logic to avoid bottlenecking the GPU. Ensure the camera stream is properly released when the kill switch is triggered.

---

## 4. Design System & Color Palette
Follow this specific color taxonomy for the Tailwind CSS configuration to maintain a professional, high-contrast UI suitable for a database-heavy dashboard. (This doesn't have to be exact, but it should be close.)
