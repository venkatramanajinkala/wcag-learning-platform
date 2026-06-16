# A11yPlay Backend

FastAPI backend for the WCAG learning platform.

## Local setup

```powershell
cd C:\Users\venkatramana.jinkala\Downloads\wcag-learning-platform\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs:

```text
http://localhost:8000/docs
```

For Google login, set this in `backend\.env`:

```text
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

If Google login says `Token used too early`, sync Windows time:

```text
Settings -> Time & language -> Date & time -> Sync now
```

## Render deployment

Use these settings if deploying manually:

```text
Root directory: backend
Build command: pip install -r requirements.txt
Start command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Environment variables:

```text
SECRET_KEY=long-random-secret
DATABASE_URL=Render PostgreSQL internal connection string
BACKEND_CORS_ORIGINS=https://your-netlify-site.netlify.app
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
ENVIRONMENT=production
```
