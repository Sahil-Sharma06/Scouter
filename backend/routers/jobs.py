from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, HttpUrl
from sqlalchemy.ext.asyncio import AsyncSession

from agents.supervisor import run_job_pipeline
from db.database import get_db
from db.models import User
from routers.auth import get_current_user

router = APIRouter(prefix="/jobs", tags=["jobs"])


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
    result = await run_job_pipeline(str(payload.url), str(current_user.id), db)
    if "error" in result:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=result["error"])

    return JobAnalyseResponse(job_run_id=result["job_run_id"], result=result["data"])
