from __future__ import annotations

from dotenv import load_dotenv
from fastmcp import FastMCP

from agents.supervisor import run_job_pipeline
from db.database import AsyncSessionLocal

load_dotenv()

mcp = FastMCP("scouter")


@mcp.tool()
async def analyse_job(url: str, user_id: str) -> dict:
    async with AsyncSessionLocal() as session:
        return await run_job_pipeline(url=url, user_id=user_id, db=session)
