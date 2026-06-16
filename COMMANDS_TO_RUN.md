# Commands to run this project manually

Open PowerShell or Command Prompt, then run these commands.

## Current folder structure

```text
wcag-learning-platform/
  frontend/   React + Vite app
  backend/    FastAPI backend API
```

## Quick start: run backend and frontend

You need two terminal windows.

## Terminal 1: Start the backend

```powershell
cd C:\Users\venkatramana.jinkala\Downloads\wcag-learning-platform\backend
```

First-time setup only:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

Normal backend start command:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend API docs:

```text
http://localhost:8000/docs
```

## Terminal 2: Start the frontend

```powershell
cd C:\Users\venkatramana.jinkala\Downloads\wcag-learning-platform\frontend
```

First-time setup only:

Use `npm.cmd` on this computer because PowerShell is blocking `npm.ps1`.

```powershell
npm.cmd install
```

Make sure `frontend\.env` has:

```text
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

Normal frontend start command:

```powershell
npm.cmd run dev
```

Open this in your browser:

```text
http://localhost:3000/login
```

## Check commands

Frontend TypeScript check:

```powershell
npm.cmd run lint
```

Frontend production build:

```powershell
npm.cmd run build
```

Backend Python compile check:

```powershell
cd C:\Users\venkatramana.jinkala\Downloads\wcag-learning-platform\backend
.\.venv\Scripts\python.exe -m compileall app
```

## Important notes

- The React app is now inside the `frontend` folder.
- Run frontend commands from `wcag-learning-platform\frontend`.
- The frontend already has `package.json`, so you do not need to run `npm init -y`.
- The frontend already has `tsconfig.json`, so you do not need to create it again.
- This project uses Vite, so the start command is `npm.cmd run dev`, not `npm start`.
- Keep both backend and frontend terminal windows open while using the app.
- If Google login says `Token used too early`, sync Windows time: Settings -> Time & language -> Date & time -> Sync now.
- For local Google login, Google Cloud OAuth must allow these JavaScript origins:

```text
http://localhost:3000
http://127.0.0.1:3000
```

## Deployment settings

Vercel frontend from GitHub:

```text
Base directory: frontend
Build command: npm run build
Output directory: dist
Environment variables:
  VITE_API_URL=https://your-render-api.onrender.com
  VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

Render backend:

```text
Root directory: backend
Build command: pip install -r requirements.txt
Start command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
Environment variables:
  SECRET_KEY=your-long-secret
  DATABASE_URL=your-render-postgres-url
  BACKEND_CORS_ORIGINS=https://your-vercel-site.vercel.app
  BACKEND_CORS_ORIGIN_REGEX=https://.*\.vercel\.app
  FRONTEND_URL=https://your-vercel-site.vercel.app
  GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
  ENVIRONMENT=production
```

## If you specifically need to install packages one by one

Usually `npm.cmd install` is enough. But these are the package commands:

```powershell
npm.cmd install react react-dom react-router-dom
npm.cmd install --save-dev typescript @types/react @types/react-dom
```
