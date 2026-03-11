# Project Overview
**Title:** AI-Monitored Campus Item Recovery & Tracking System
**Description:** A local, web-based platform for campus lost and found. It uses a microservices architecture to process local stationary camera streams (YOLOv8), log abandoned items to a local PostgreSQL database, and allow students to claim items via a React frontend. The system relies on "blind verification," where AI-captured snapshots are kept completely hidden from the public and used strictly by admins to verify claims.

## 1. Tech Stack Requirements
**Frontend (Client Portal & Admin Dashboard):**
* Framework: React + Vite
* Language: TypeScript (Strict mode enabled)
* Styling: Tailwind CSS
* UI Components: shadcn/ui
* State Management: React Context or Zustand (keep it simple)
* Data Fetching: Axios or standard Fetch API

**Backend (API & Web Server):**
* Framework: Node.js + Express.js
* Language: TypeScript
* ORM: Prisma
* Database: PostgreSQL (Local)
* Image Handling: Multer (saving files to a local encrypted directory)

**AI Engine (Computer Vision Service):**
* Language: Python (3.10 or 3.11)
* Framework: FastAPI (for receiving/sending webhooks to Node.js backend)
* ML Library: Ultralytics YOLOv8 (running locally via CUDA/GPU)
* Image Processing: OpenCV

## 2. Recommended Directory Structure
Use a monorepo structure to keep everything together for local development.

/project-root
  /frontend          # Vite + React + TypeScript + Tailwind + shadcn
  /backend           # Node.js + Express API + Prisma ORM
    /uploads         # Local folder for encrypted AI snapshots
  /ai-service        # Python + FastAPI + YOLOv8 scripts
  /docs              # System architecture, DFDs, and database schemas
  instruction.md     # This file

## 3. Development Best Practices & Rules

### General Rules for the AI Agent
* **Think before coding:** Always outline the logic and file changes before writing the code.
* **Typing:** Use strict TypeScript typing for everything. Avoid `any`. Share types between the frontend and backend where possible.

### Frontend (React) Best Practices
* Use functional components and React Hooks.
* Build highly modular UI components. Place shadcn components in `src/components/ui` and custom project components in `src/components/features`.
* Ensure the Student Gallery does NOT fetch or expose AI snapshots. The gallery only consumes basic text fields.
* Implement a split-screen layout for the Admin Dashboard (Claim text on the left, hidden AI snapshot on the right).

### Backend (Node.js) Best Practices
* Follow a modular architecture: routes -> controllers -> services. 
* Separate business logic (services) from request handling (controllers).
* All dates/timestamps must be saved in UTC and converted to local time on the frontend.
* Secure the `/uploads` directory so it cannot be accessed via a public URL; it must be requested through an authenticated admin endpoint.

### Database (PostgreSQL & Prisma) Best Practices
* Use UUIDs for all primary keys.
* Utilize the `JSONB` data type for storing raw YOLOv8 detection metadata.
* Ensure foreign keys correctly link `claims` to `found_items`, and `found_items` to `ai_evidence_logs`.

### AI Service (Python) Best Practices
* Ensure the Python service handles the "timer" logic for abandoned items to prevent spamming the database.
* When an item is flagged as abandoned, the Python script must save the cropped image locally and send a `POST` request to the Node.js backend to log the event in PostgreSQL.
* Write efficient OpenCV frame-reading logic to avoid bottlenecking the GPU.