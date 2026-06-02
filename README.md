# A11yPlay - AI-Powered WCAG Learning Platform

A11yPlay is a full-stack accessibility learning platform that helps users learn WCAG concepts through structured criteria pages, interactive examples, progress tracking, and an AI assistant.

## Why this project matters

Accessibility is often difficult for new developers to learn because WCAG rules are detailed and spread across many criteria. A11yPlay turns those rules into a guided learning experience, with an assistant that can answer accessibility questions using a WCAG knowledge base.

## Key features

- AI-powered WCAG assistant using FastAPI, Groq, chat memory, and intent detection
- Structured WCAG knowledge base for accessibility-focused answers
- Interactive React + TypeScript frontend for learning criteria and examples
- User authentication, protected routes, password reset flow, and Google sign-in support
- Progress tracking APIs for personalized learning state
- Audit API and live-fact service integrations for richer assistant responses
- Deployment-ready setup for Netlify frontend and Render backend

## Tech stack

- Frontend: React, TypeScript, Vite, React Router, Tailwind CSS, lucide-react
- Backend: FastAPI, SQLAlchemy, Pydantic, SQLite/PostgreSQL-ready configuration
- AI: Groq LLM integration with WCAG knowledge retrieval and intent routing
- Deployment: Netlify frontend, Render backend

## Project structure

```text
wcag-learning-platform/
  frontend/   React + Vite app
  backend/    FastAPI backend API
```

## Run locally

Start the backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Start the frontend in a second terminal:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Open:

```text
http://localhost:3000
```

Backend API docs:

```text
http://localhost:8000/docs
```

## Resume description

Built an AI-powered accessibility learning platform using React, TypeScript, FastAPI, and Groq LLM. The system includes a WCAG-focused chatbot with intent detection, structured knowledge retrieval, chat memory, user authentication, progress tracking, and deployment-ready frontend/backend configuration.
