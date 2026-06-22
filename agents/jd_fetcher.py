from __future__ import annotations

import json

from langchain.tools import tool
from langgraph.prebuilt import create_react_agent

from agents.llm_provider import get_llm
from agents.utils import _coerce_content, extract_json_text, repair_and_parse_json
from tools.playwright_tool import playwright_fetch


@tool("playwright_fetch")
async def playwright_fetch_tool(url: str) -> dict:
    """Fetch a job page and return raw HTML/text content."""
    return await playwright_fetch(url)


SYSTEM_PROMPT = (
    "You are the JD Fetcher agent. Use the playwright_fetch tool to fetch the job page. "
    "Extract: role_title, company_name, required_skills (list), responsibilities (list), "
    "location, compensation. "
    "Your FINAL message MUST be ONLY a raw JSON object — no markdown fences, no explanation, "
    "no other text before or after the JSON."
)


async def run_jd_fetcher(job_url: str) -> dict:
    llm = get_llm()
    tools = [playwright_fetch_tool]

    agent = create_react_agent(llm, tools, prompt=SYSTEM_PROMPT)
    try:
        result = await agent.ainvoke(
            {"messages": [("user", f"Job URL: {job_url}")]},
            config={"recursion_limit": 6},
        )
    except Exception as exc:
        return {"error": f"JD Fetcher failed: {exc}", "trace": []}

    messages = result.get("messages", [])
    output = _coerce_content(messages[-1].content) if messages else ""

    trace: list[dict] = []
    for msg in messages:
        if hasattr(msg, "tool_calls") and msg.tool_calls:
            for tc in msg.tool_calls:
                trace.append({"step": len(trace) + 1, "thought": "", "action": tc.get("name", ""), "observation": ""})
        if msg.type == "tool":
            if trace:
                trace[-1]["observation"] = _coerce_content(msg.content)[:500]

    try:
        data = json.loads(extract_json_text(output))
        return {"data": data, "trace": trace}
    except json.JSONDecodeError:
        pass

    try:
        data = await repair_and_parse_json(output, llm)
        return {"data": data, "trace": trace}
    except (json.JSONDecodeError, Exception):
        return {"error": "JD Fetcher returned invalid JSON", "raw_output": output, "trace": trace}
