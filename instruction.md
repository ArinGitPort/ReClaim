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

---

## 2. Recommended Directory Structure (Monorepo)
Use a monorepo structure to keep everything together for local development.

/project-root
  /frontend             # Vite + React + TS + Tailwind
    /src
      /components
        /atoms          # Basic UI elements (Buttons, Inputs, Icons)
        /molecules      # Simple groupings (Search bars, Form fields)
        /organisms      # Complex UI sections (Item cards, Sidebars)
        /templates      # Page layouts without data
      /pages            # Data-fetching components and routing
      /hooks            # Custom React hooks
      /lib              # shadcn/ui utility functions
  /backend              # Node.js + Express API + Prisma ORM
    /src
      /controllers      # Request handlers
      /services         # Core business logic
      /routes           # API endpoint definitions
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
Follow this specific color taxonomy for the Tailwind CSS configuration to maintain a professional, high-contrast UI suitable for a database-heavy dashboard.

### Base & Structure (The Canvas)
* **App Background:** `#FFFFFF` (Pure White) - Main screen and sidebar.
* **Card/Surface Background:** `#FFFFFF` (Pure White) - Found item cards and form containers.
* **Borders & Dividers:** `#E5E7EB` (Light Gray) - 1px sidebar separator, card outlines, table borders.
* **Subtle Background (Hover):** `#F9FAFB` (Off-White) - Table rows on hover state.

### Typography (The Text)
* **Primary Text:** `#334155` (Dark Slate) - Main headings, user inputs, primary descriptions.
* **Secondary Text:** `#64748B` (Medium Gray) - Timestamps, location tags, table headers, inactive links.

### Interactive Elements (The Actions)
* **Primary Brand/Action:** `#2563EB` (Deep Blue) - Main buttons ("Submit Claim", "Approve"), active sidebar icons, text links.
* **Active State Background:** `#EFF6FF` (Faint Blue) - Background highlight for the currently selected sidebar menu item.

### System Status (The Indicators)
* **Success (Verified/Returned):** `#10B981` (Emerald Green) - Approved claim badges, successful verification messages.
* **Pending (Reviewing/Searching):** `#F59E0B` (Amber) - Items waiting for admin review, "Possible Match" AI flags.
* **Error/Archived (Denied/Purged):** `#E11D48` (Rose Red) - Denied claims, expired items, "Stop AI Camera" action.