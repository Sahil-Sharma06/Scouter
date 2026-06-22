from __future__ import annotations

import asyncio
import os
import sys
from contextlib import asynccontextmanager

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.db.database import engine
from backend.db.models import Base
from backend.routers import auth, jobs, resume
from tools.playwright_tool import _get_browser

load_dotenv()

_default_origins = "http://localhost:5173,http://127.0.0.1:5173"
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", _default_origins).split(",") if o.strip()]


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Pre-warm Playwright so the first job request doesn't pay the cold-start cost
    try:
        await _get_browser()
    except Exception:
        pass
    yield


app = FastAPI(title="Scouter API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(resume.router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
