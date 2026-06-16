# A11yPlay Frontend

React + TypeScript frontend for the A11yPlay WCAG learning platform.

## Features

- Public landing, features, and about pages
- Authentication screens for login, signup, password reset, and Google sign-in
- Protected learning routes for WCAG criteria
- Interactive examples and progress-aware learning UI
- Chat widget connected to the FastAPI AI assistant

## Local setup

```powershell
cd C:\Users\venkatramana.jinkala\Downloads\wcag-learning-platform\frontend
npm.cmd install
npm.cmd run lint
npm.cmd run dev
```

The app runs at:

```text
http://localhost:3000
```

Create `frontend\.env` when connecting to the backend locally:

```text
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

Open the login page at:

```text
http://localhost:3000/login
```
