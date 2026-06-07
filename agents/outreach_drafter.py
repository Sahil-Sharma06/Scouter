from __future__ import annotations

import json

from agents.llm_provider import get_llm
from agents.utils import _coerce_content, extract_json_text, repair_and_parse_json


SYSTEM_PROMPT = (
    "You are the Outreach Drafter. Draft a personalised cold email based on the inputs. "
    "Return ONLY a raw JSON object with keys: subject (string), body (4-paragraph string). "
    "Tone: direct, not sycophantic. "
    "No markdown fences, no explanation, no other text before or after the JSON."
)


async def run_outreach_drafter(jd_summary: dict, company_brief: dict, fit_result: dict) -> dict:
    llm = get_llm()
    user_msg = f"JD Summary: {jd_summary}\nCompany Brief: {company_brief}\nFit Result: {fit_result}"
    messages = [
        ("system", SYSTEM_PROMPT),
        ("user", user_msg),
    ]
    try:
        result = await llm.ainvoke(messages)
    except Exception as exc:
        return {"error": f"Outreach Drafter failed: {exc}", "trace": []}

    output = _coerce_content(result.content) if result else ""
    trace: list[dict] = []

    try:
        data = json.loads(extract_json_text(output))
        return {"data": data, "trace": trace}
    except json.JSONDecodeError:
        pass

    try:
        data = await repair_and_parse_json(output, llm)
        return {"data": data, "trace": trace}
    except (json.JSONDecodeError, Exception):
        return {
            "error": "Outreach Drafter returned invalid JSON",
            "raw_output": output,
            "trace": trace,
        }
