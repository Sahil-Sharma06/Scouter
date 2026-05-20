# Scouter

Scouter is a multi-agent job intelligence platform that turns a job URL into a structured JD summary, company research brief, fit score, and outreach email.

## Backend setup

- Create a virtual environment and install backend dependencies from backend/requirements.txt.
- Provide the environment variables in .env (see .env.example).
- Run the API with uvicorn:

```
uvicorn backend.main:app --reload
```

## Frontend setup

- Install frontend dependencies from frontend/package.json.
- Start the Vite dev server:

```
npm run dev
```
