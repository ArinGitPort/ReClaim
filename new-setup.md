# ReClaim: Project Setup & Commands Guide

This document contains the complete tech stack, setup instructions, and terminal commands required to run the AI-Monitored Campus Item Recovery System on any new machine.

## System Dependencies Summary
* **Frontend (Root):** React 18, Vite, TypeScript, Tailwind CSS v4, shadcn/ui, react-router-dom, axios
* **Backend (`/backend`):** Node.js, Express.js, TypeScript, Prisma (PostgreSQL), cors, dotenv, multer
* **AI Service (`/ai-service`):** Python 3.10+, FastAPI, Uvicorn, Ultralytics (YOLOv8), opencv-python, requests

---

## Complete Setup Commands (Run step-by-step)

Ensure the new PC has Node.js, Python (3.10+), Git, and PostgreSQL installed before running these commands.

```bash
# ==========================================
# STEP 1: CLONE & SETUP FRONTEND
# ==========================================
# Clone the repo and enter the root folder
git clone <your-github-repo-url>
cd ReClaim

# Install the React, Vite, and Tailwind dependencies
npm install

# ==========================================
# STEP 2: SETUP BACKEND & DATABASE
# ==========================================
# Move into the backend directory
cd backend

# Install the Node.js and Express dependencies
npm install

# Generate the Prisma client (Required so the backend knows your database schema)
npx prisma generate

# Create the uploads folder for storing the AI snapshots (ignored by Git)
mkdir uploads

# Return to the root folder
cd ..

# ==========================================
# STEP 3: SETUP AI SERVICE (YOLOv11)
# ==========================================
# Move into the AI directory
cd ai-service

# Create a clean Python virtual environment
python -m venv venv

# Activate the virtual environment (Windows)
.\venv\Scripts\activate

# Install the ML, Vision, and Web server packages
pip install fastapi uvicorn ultralytics opencv-python requests

# Return to the root folder
cd ..

# Make sure you are in the root ReClaim folder
npm run dev

# Make sure you are in the ReClaim/backend folder
cd backend
npm run dev

# Make sure you are in the ReClaim/ai-service folder
cd ai-service
# Activate the virtual environment first
.\venv\Scripts\activate
# Start the FastAPI server
uvicorn main:app --reload

# Prisma ORM migration
npm run prisma:migrate -- --name init
npm run prisma:generate