from __future__ import annotations

from contextvars import ContextVar, Token

from rag.retriever import retrieve_resume_chunks

_current_user_id: ContextVar[str | None] = ContextVar("current_user_id", default=None)


def set_current_user(user_id: str) -> Token:
    return _current_user_id.set(user_id)


def reset_current_user(token: Token) -> None:
    _current_user_id.reset(token)


async def retrieve_resume_chunks_tool(query: str, top_k: int = 5) -> dict:
    user_id = _current_user_id.get()
    return await retrieve_resume_chunks(query=query, top_k=top_k, user_id=user_id)
