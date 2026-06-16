# A11yPlay Backend

FastAPI backend for the A11yPlay WCAG learning platform.

## Features

- User registration, login, JWT auth, and current-user API
- Google ID token verification for Google sign-in
- Password reset flow with SMTP or Resend-compatible configuration
- Progress tracking for authenticated users
- HTML accessibility audit endpoint
- WCAG-aware chat endpoint with optional live-search support
- SQLite for local development and PostgreSQL-ready production configuration

## Local Setup

Create `backend\.env` from the example:

```powershell
copy .env.example .env
```

Set at least:

```text
SECRET_KEY=replace-with-a-long-random-secret
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

Install and run:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs:

```text
http://localhost:8000/docs
```

## Checks

```powershell
.\.venv\Scripts\python.exe -m compileall app
```

## Google Sign-In

Set `GOOGLE_CLIENT_ID` in `backend\.env`. It must match `VITE_GOOGLE_CLIENT_ID` in the frontend.

If Google login reports `Token used too early`, sync the computer clock and retry.

## Render Deployment

```text
Root directory: backend
Build command: pip install -r requirements.txt
Start command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Required environment variables:

```text
ENVIRONMENT=production
SECRET_KEY=replace-with-a-long-random-secret
DATABASE_URL=your-postgres-connection-string
BACKEND_CORS_ORIGINS=https://your-vercel-app.vercel.app
BACKEND_CORS_ORIGIN_REGEX=https://.*\.vercel\.app
FRONTEND_URL=https://your-vercel-app.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

Optional environment variables:

```text
GROQ_API_KEY=your-groq-api-key
GOOGLE_SEARCH_API_KEY=your-google-custom-search-api-key
GOOGLE_SEARCH_CX=your-google-custom-search-engine-id
RESEND_API_KEY=your-resend-api-key
SMTP_HOST=your-smtp-host
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
```
