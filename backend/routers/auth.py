from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Any

from dotenv import load_dotenv
from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.database import get_db
from backend.db.models import User

load_dotenv()

router = APIRouter(prefix="/auth", tags=["auth"])

JWT_SECRET = os.getenv("JWT_SECRET", "")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_DAYS = 7
# Set COOKIE_SECURE=true in production (requires HTTPS)
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"

if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET is not set")

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=256)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=256)


class UserResponse(BaseModel):
    user_id: str
    email: str


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_DAYS * 86400,
        secure=COOKIE_SECURE,
    )


async def get_user_by_email(session: AsyncSession, email: str) -> User | None:
    result = await session.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_id(session: AsyncSession, user_id: str) -> User | None:
    result = await session.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_current_user(
    access_token: str | None = Cookie(default=None),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not access_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload: dict[str, Any] = jwt.decode(access_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    payload: RegisterRequest, response: Response, db: AsyncSession = Depends(get_db)
) -> UserResponse:
    existing = await get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(email=payload.email, hashed_password=hash_password(payload.password))
    db.add(user)
    await db.commit()
    await db.refresh(user)

    _set_auth_cookie(response, create_access_token(str(user.id)))
    return UserResponse(user_id=str(user.id), email=user.email)


@router.post("/login", response_model=UserResponse)
async def login(
    payload: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)
) -> UserResponse:
    user = await get_user_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    _set_auth_cookie(response, create_access_token(str(user.id)))
    return UserResponse(user_id=str(user.id), email=user.email)


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse(user_id=str(current_user.id), email=current_user.email)


@router.post("/logout")
async def logout(response: Response) -> dict:
    response.delete_cookie("access_token", samesite="lax", secure=COOKIE_SECURE)
    return {"ok": True}
