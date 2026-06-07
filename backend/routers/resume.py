from __future__ import annotations

import io

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.database import get_db
from backend.db.models import Resume, User
from rag.ingest import ingest_resume_text
from backend.routers.auth import get_current_user

router = APIRouter(prefix="/resume", tags=["resume"])

_ALLOWED_TYPES = {
    "application/pdf",
    "text/plain",
    # browsers sometimes send these for .txt
    "text/plain; charset=utf-8",
    "application/octet-stream",
}


class ResumeUploadResponse(BaseModel):
    resume_id: str


def _extract_text_from_pdf(data: bytes) -> str:
    from pypdf import PdfReader
    reader = PdfReader(io.BytesIO(data))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


async def _ingest(db: AsyncSession, user: User, text: str) -> ResumeUploadResponse:
    if not text.strip():
        raise HTTPException(status_code=400, detail="No text could be extracted from the file.")

    resume = Resume(user_id=user.id, text=text)
    db.add(resume)
    await db.commit()
    await db.refresh(resume)

    result = await ingest_resume_text(
        user_id=str(user.id), resume_id=str(resume.id), text=text
    )
    if "error" in result:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=result["error"])

    return ResumeUploadResponse(resume_id=str(resume.id))


@router.post("/upload", response_model=ResumeUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume_file(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ResumeUploadResponse:
    filename = (file.filename or "").lower()
    is_pdf = filename.endswith(".pdf") or "pdf" in (file.content_type or "")
    is_txt = filename.endswith(".txt") or "text" in (file.content_type or "")

    if not is_pdf and not is_txt:
        raise HTTPException(status_code=400, detail="Only PDF and TXT files are supported.")

    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File exceeds 5 MB limit.")

    if is_pdf:
        try:
            text = _extract_text_from_pdf(contents)
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Could not parse PDF: {exc}")
    else:
        text = contents.decode("utf-8", errors="replace")

    return await _ingest(db, current_user, text)
