from __future__ import annotations

import asyncio
import os

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, HttpUrl
from sqlalchemy.ext.asyncio import AsyncSession

from agents.supervisor import run_job_pipeline
from backend.db.database import get_db
from backend.db.models import User
from backend.routers.auth import get_current_user

router = APIRouter(prefix="/jobs", tags=["jobs"])

PIPELINE_TIMEOUT_SECONDS = int(os.getenv("PIPELINE_TIMEOUT_SECONDS", "180"))


class JobAnalyseRequest(BaseModel):
    url: HttpUrl


class JobAnalyseResponse(BaseModel):
    job_run_id: str
    result: dict


@router.post("/analyse", response_model=JobAnalyseResponse)
async def analyse_job(
    payload: JobAnalyseRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> JobAnalyseResponse:
    try:
        result = await asyncio.wait_for(
            run_job_pipeline(str(payload.url), str(current_user.id), db),
            timeout=PIPELINE_TIMEOUT_SECONDS,
        )
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=f"Pipeline did not complete within {PIPELINE_TIMEOUT_SECONDS}s. Try a simpler job URL.",
        )

    if "error" in result:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=result["error"])

    return JobAnalyseResponse(job_run_id=result["job_run_id"], result=result["data"])
