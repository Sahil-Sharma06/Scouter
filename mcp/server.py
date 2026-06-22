from __future__ import annotations

import os

from dotenv import load_dotenv
from fastmcp import FastMCP

from agents.supervisor import run_job_pipeline
from backend.db.database import AsyncSessionLocal

load_dotenv()

mcp = FastMCP("scouter")

_MCP_SECRET = os.getenv("MCP_SECRET", "")


@mcp.tool()
async def analyse_job(url: str, user_id: str, secret: str) -> dict:
    """Run the full job analysis pipeline for a given URL and user."""
    if not _MCP_SECRET or secret != _MCP_SECRET:
        return {"error": "Unauthorized"}
    async with AsyncSessionLocal() as session:
        return await run_job_pipeline(job_url=url, user_id=user_id, db=session)
