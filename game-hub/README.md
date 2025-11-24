# GameHub Platform

A simple game hosting platform built with Next.js and FastAPI.

## Project Structure

- `frontend/`: Next.js application (React)
- `backend/`: FastAPI application (Python)

## How to Run

### 1. Start the Backend (API)

Open a terminal and run:

```powershell
cd backend
./venv/Scripts/Activate.ps1
uvicorn main:app --reload
```

The API will start at `http://localhost:8000`.

### 2. Start the Frontend (Web App)

Open a **new** terminal and run:

```powershell
cd frontend
npm run dev
```

The web app will start at `http://localhost:3000`.

## Features

- **Game Library**: Browse available games.
- **Play Instantly**: Click "Play Now" to launch games directly in the browser.
- **VS Code Stealth Game**: Includes the "Stealth Runner" game you created!
