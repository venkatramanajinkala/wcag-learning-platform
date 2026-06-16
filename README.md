# A11yPlay

A11yPlay is a full-stack WCAG learning platform for practicing accessibility concepts through guided criteria pages, interactive examples, progress tracking, authentication, and an AI-assisted accessibility chat experience.

## Features

- Public landing, features, and about pages
- Email/password authentication, Google sign-in, password reset, and protected app routes
- WCAG criteria learning pages with side-by-side inaccessible and compliant examples
- Interactive playgrounds for testing accessibility fixes
- Progress tracking for authenticated users
- AI chat assistant backed by WCAG knowledge, Groq, and optional live Google Custom Search
- Accessibility audit API for scanning submitted HTML snippets
- Vercel-ready frontend and Render-ready backend configuration

## Tech Stack

- Frontend: React, TypeScript, Vite, React Router, Tailwind CSS, lucide-react
- Backend: FastAPI, SQLAlchemy, Pydantic Settings, SQLite for local development, PostgreSQL-ready for production
- Auth: JWT access tokens, bcrypt password hashing, Google Identity Services
- AI and search: Groq API, optional Google Custom Search JSON API
- Deployment: Vercel frontend, Render backend

## Project Structure

```text
wcag-learning-platform/
  frontend/   React + Vite web app
  backend/    FastAPI backend API
```

## Local Setup

Create local env files from the examples:

```powershell
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

Update `frontend\.env`:

```text
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

Update `backend\.env`:

```text
SECRET_KEY=replace-with-a-long-random-secret
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

Start the backend in terminal 1:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Start the frontend in terminal 2:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Open the app:

```text
http://localhost:3000/login
```

Backend API docs:

```text
http://localhost:8000/docs
```

## Google Sign-In

Use the same Google OAuth client ID in both `backend\.env` and `frontend\.env`.

For local development, add these Authorized JavaScript origins in Google Cloud Console:

```text
http://localhost:3000
http://127.0.0.1:3000
```

For production, add your deployed frontend origin:

```text
https://your-vercel-app.vercel.app
```

If Google login fails with `Token used too early`, sync the computer clock and retry.

## Verification

Run frontend type checks:

```powershell
cd frontend
npm.cmd run lint
```

Build the frontend:

```powershell
cd frontend
npm.cmd run build
```

Compile backend Python files:

```powershell
cd backend
.\.venv\Scripts\python.exe -m compileall app
```

## Deployment

### Frontend on Vercel

```text
Root directory: frontend
Build command: npm run build
Output directory: dist
```

Required Vercel environment variables:

```text
VITE_API_URL=https://your-backend.example.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

The frontend includes `frontend/vercel.json` so browser-history routes like `/login` and `/app` work without `#` in the URL.

### Backend on Render

```text
Root directory: backend
Build command: pip install -r requirements.txt
Start command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Required Render environment variables:

```text
ENVIRONMENT=production
SECRET_KEY=replace-with-a-long-random-secret
DATABASE_URL=your-postgres-connection-string
BACKEND_CORS_ORIGINS=https://your-vercel-app.vercel.app
BACKEND_CORS_ORIGIN_REGEX=https://.*\.vercel\.app
FRONTEND_URL=https://your-vercel-app.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

Optional backend environment variables:

```text
GROQ_API_KEY=your-groq-api-key
GOOGLE_SEARCH_API_KEY=your-google-custom-search-api-key
GOOGLE_SEARCH_CX=your-google-custom-search-engine-id
RESEND_API_KEY=your-resend-api-key
SMTP_HOST=your-smtp-host
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
```

## Notes

- Do not commit real `.env` files. Only `.env.example` files belong in version control.
- Use a strong `SECRET_KEY` in production.
- Keep frontend and backend Google client IDs identical.
