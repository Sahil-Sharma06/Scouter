from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_db
from db.models import Resume, User
from rag.ingest import ingest_resume_text
from routers.auth import get_current_user

router = APIRouter(prefix="/resume", tags=["resume"])


class ResumeUploadRequest(BaseModel):
    text: str


class ResumeUploadResponse(BaseModel):
    resume_id: str


@router.post("", response_model=ResumeUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    payload: ResumeUploadRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ResumeUploadResponse:
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Resume text is required")

    resume = Resume(user_id=current_user.id, text=payload.text)
    db.add(resume)
    await db.commit()
    await db.refresh(resume)

    ingest_result = await ingest_resume_text(
        user_id=str(current_user.id), resume_id=str(resume.id), text=payload.text
    )
    if "error" in ingest_result:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=ingest_result["error"])

    return ResumeUploadResponse(resume_id=str(resume.id))
