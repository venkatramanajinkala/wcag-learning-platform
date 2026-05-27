# Commands to run this project manually

Open PowerShell or Command Prompt, then run these commands.

## Current folder structure

```text
wcag-learning-platform/
  frontend/   React + Vite app
  backend/    FastAPI backend API
```

## 1. Go to the frontend folder

```powershell
cd C:\Users\venkatramana.jinkala\Downloads\wcag-learning-platform\frontend
```

## 2. Install packages

Use `npm.cmd` on this computer because PowerShell is blocking `npm.ps1`.

```powershell
npm.cmd install
```

## 3. Check TypeScript

```powershell
npm.cmd run lint
```

## 4. Start the development server

```powershell
npm.cmd run dev
```

After it starts, open this in your browser:

```text
http://localhost:3000/
```

## Important notes

- The React app is now inside the `frontend` folder.
- Run frontend commands from `wcag-learning-platform\frontend`.
- The frontend already has `package.json`, so you do not need to run `npm init -y`.
- The frontend already has `tsconfig.json`, so you do not need to create it again.
- This project uses Vite, so the start command is `npm.cmd run dev`, not `npm start`.
- Keep the terminal window open while using the app. If you close it, the local website stops.
- For Netlify manual deploy, upload `frontend\dist` after running `npm.cmd run build`.

## 5. Run the backend locally

Open a second terminal:

```powershell
cd C:\Users\venkatramana.jinkala\Downloads\wcag-learning-platform\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend API docs:

```text
http://localhost:8000/docs
```

To connect frontend to backend locally, create `frontend\.env`:

```text
VITE_API_URL=http://localhost:8000
```

Then restart the frontend dev server.

## Deployment settings

Netlify frontend from GitHub:

```text
Base directory: frontend
Build command: npm run build
Publish directory: dist
Environment variable: VITE_API_URL=https://your-render-api.onrender.com
```

Render backend:

```text
Root directory: backend
Build command: pip install -r requirements.txt
Start command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
Environment variables:
  SECRET_KEY=your-long-secret
  DATABASE_URL=your-render-postgres-url
  BACKEND_CORS_ORIGINS=https://your-netlify-site.netlify.app
  ENVIRONMENT=production
```

## If you specifically need to install packages one by one

Usually `npm.cmd install` is enough. But these are the package commands:

```powershell
npm.cmd install react react-dom react-router-dom
npm.cmd install --save-dev typescript @types/react @types/react-dom
```
