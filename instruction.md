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
* Follow Atomic Design Pattern.
* Make sure the design are mobile responsive.


### Frontend (React) Best Practices
* Do not use emojis.
* Make sure the User Interface are clean, modern, and user-friendly like ShadCN.
* Make sure the front-end design are all consistent from search bar to filter designs on all pages.
* Use functional components and React Hooks.
* Build highly modular UI components. Place shadcn components in `src/components/ui` and custom project components in `src/components/features`.
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

1. Base & Structure (The Canvas)
These colors form the skeleton of your application, including the sidebar, main dashboard, and item cards.

App Background: #FFFFFF (Pure White) - Use for the main screen and sidebar.

Card/Surface Background: #FFFFFF (Pure White) - Use for the found item cards and form containers.

Borders & Dividers: #E5E7EB (Light Gray) - Use for the 1px sidebar separator, card outlines, and table borders.

Subtle Background (Hover): #F9FAFB (Off-White) - Use for table rows when a user hovers over them.

2. Typography (The Text)
Avoid pure black to reduce eye strain for admins looking at logs all day.

Primary Text: #334155 (Dark Slate) - Use for all main headings, user inputs, and primary descriptions.

Secondary Text: #64748B (Medium Gray) - Use for timestamps, location tags, table headers, and inactive sidebar links.

3. Interactive Elements (The Actions)
This is the only color that should draw the user's eye, signaling where to click.

Primary Brand/Action: #2563EB (Deep Blue) - Use for your main buttons ("Submit Claim", "Approve"), active sidebar icons, and text links.

Active State Background: #EFF6FF (Faint Blue) - Use as the background highlight for the currently selected sidebar menu item.

4. System Status (The Indicators)
Since this is a tracking system, you need universally understood colors for the state of an item or claim.

Success (Verified/Returned): #10B981 (Emerald Green) - Use for approved claim badges or successful verification messages.

Pending (Reviewing/Searching): #F59E0B (Amber) - Use for items waiting for admin review or "Possible Match" AI flags.

Error/Archived (Denied/Purged): #E11D48 (Rose Red) - Use for denied claims, expired items, or the "Stop AI Camera" button.