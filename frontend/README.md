# A11yPlay Frontend

React + TypeScript frontend for the A11yPlay WCAG learning platform.

## Features

- Public landing, features, and about pages
- Login, signup, forgot-password, reset-password, and Google sign-in screens
- Protected learning dashboard and WCAG criterion pages
- Interactive accessibility examples and progress-aware learning UI
- Chat widget connected to the FastAPI backend
- Browser-history routing for clean production URLs

## Local Setup

Create `frontend\.env` from the example:

```powershell
copy .env.example .env
```

Set:

```text
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

Install and run:

```powershell
npm.cmd install
npm.cmd run dev
```

Open:

```text
http://localhost:3000/login
```

## Checks

```powershell
npm.cmd run lint
npm.cmd run build
```

## Vercel Deployment

```text
Root directory: frontend
Build command: npm run build
Output directory: dist
```

Environment variables:

```text
VITE_API_URL=https://your-backend.example.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

`vercel.json` rewrites all routes to `index.html`, so direct visits to `/login`, `/signup`, and `/app` work correctly.
