from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from agents.company_research import run_company_research
from agents.fit_scorer import run_fit_scorer
from agents.jd_fetcher import run_jd_fetcher
from agents.outreach_drafter import run_outreach_drafter
from db.models import JobRun
from tools.resume_tool import reset_current_user, set_current_user


def _merge_trace(existing: list[dict], new_items: list[dict], agent_name: str) -> list[dict]:
    offset = len(existing)
    for idx, item in enumerate(new_items, start=1):
        existing.append(
            {
                "step": offset + idx,
                "thought": f"[{agent_name}] {item.get('thought', '')}",
                "action": item.get("action"),
                "observation": item.get("observation"),
            }
        )
    return existing


async def run_job_pipeline(job_url: str, user_id: str, db: AsyncSession) -> dict:
    trace: list[dict] = []
    token = set_current_user(user_id)

    try:
        jd_result = await run_jd_fetcher(job_url)
        if "error" in jd_result:
            return {"error": jd_result["error"], "details": jd_result.get("raw_output")}
        trace = _merge_trace(trace, jd_result.get("trace", []), "jd_fetcher")

        jd_data = jd_result["data"]
        company_name = jd_data.get("company_name", "")

        company_result = await run_company_research(company_name)
        if "error" in company_result:
            return {"error": company_result["error"], "details": company_result.get("raw_output")}
        trace = _merge_trace(trace, company_result.get("trace", []), "company_research")

        required_skills = jd_data.get("required_skills", [])
        fit_result = await run_fit_scorer(required_skills)
        if "error" in fit_result:
            return {"error": fit_result["error"], "details": fit_result.get("raw_output")}
        trace = _merge_trace(trace, fit_result.get("trace", []), "fit_scorer")

        outreach_result = await run_outreach_drafter(
            jd_summary=jd_data,
            company_brief=company_result["data"],
            fit_result=fit_result["data"],
        )
        if "error" in outreach_result:
            return {"error": outreach_result["error"], "details": outreach_result.get("raw_output")}
        trace = _merge_trace(trace, outreach_result.get("trace", []), "outreach_drafter")

        job_run = JobRun(
            user_id=user_id,
            job_url=job_url,
            jd_data=jd_data,
            company_brief=company_result["data"],
            fit_result=fit_result["data"],
            outreach_email=outreach_result["data"],
            agent_trace=trace,
        )
        db.add(job_run)
        await db.commit()
        await db.refresh(job_run)

        full_result: dict[str, Any] = {
            "jd_data": jd_data,
            "company_brief": company_result["data"],
            "fit_result": fit_result["data"],
            "outreach_email": outreach_result["data"],
        }

        return {"job_run_id": str(job_run.id), "data": full_result}
    finally:
        reset_current_user(token)
