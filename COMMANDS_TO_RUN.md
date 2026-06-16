# Commands to Run the Project

Use these commands when running the project manually in PowerShell.

## First-Time Setup

From the project root:

```powershell
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

Edit `backend\.env` and set at least:

```text
SECRET_KEY=replace-with-a-long-random-secret
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

Edit `frontend\.env` and set:

```text
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## Terminal 1: Backend

First-time dependency setup:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Start the backend:

```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs:

```text
http://localhost:8000/docs
```

## Terminal 2: Frontend

First-time dependency setup:

```powershell
cd frontend
npm.cmd install
```

Start the frontend:

```powershell
cd frontend
npm.cmd run dev
```

Open:

```text
http://localhost:3000/login
```

## Check Commands

Frontend type check:

```powershell
cd frontend
npm.cmd run lint
```

Frontend production build:

```powershell
cd frontend
npm.cmd run build
```

Backend compile check:

```powershell
cd backend
.\.venv\Scripts\python.exe -m compileall app
```

## Google Sign-In Checklist

Google Cloud OAuth Authorized JavaScript origins for local development:

```text
http://localhost:3000
http://127.0.0.1:3000
```

Use the same client ID in:

```text
backend\.env   GOOGLE_CLIENT_ID
frontend\.env  VITE_GOOGLE_CLIENT_ID
```

If login reports `Token used too early`, sync the computer clock and retry.

## Production Deployment Summary

Vercel frontend:

```text
Root directory: frontend
Build command: npm run build
Output directory: dist
Environment variables:
  VITE_API_URL=https://your-backend.example.com
  VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

Render backend:

```text
Root directory: backend
Build command: pip install -r requirements.txt
Start command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
Environment variables:
  ENVIRONMENT=production
  SECRET_KEY=replace-with-a-long-random-secret
  DATABASE_URL=your-postgres-connection-string
  BACKEND_CORS_ORIGINS=https://your-vercel-app.vercel.app
  BACKEND_CORS_ORIGIN_REGEX=https://.*\.vercel\.app
  FRONTEND_URL=https://your-vercel-app.vercel.app
  GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```
