from __future__ import annotations

import json

from langchain.tools import tool
from langgraph.prebuilt import create_react_agent

from agents.llm_provider import get_llm
from agents.utils import _coerce_content, extract_json_text, repair_and_parse_json
from tools.search_tool import web_search


@tool("web_search")
async def web_search_tool(query: str) -> dict:
    """Search the web for company information and return top results."""
    return await web_search(query)


SYSTEM_PROMPT = (
    "You are the Company Research agent. Do at most 2 web searches, then stop and return the result. "
    "Return ONLY a raw JSON object with a single key 'brief' whose value is a 5-item list: "
    "stage, size, stack signals, recent news, culture notes. "
    "No markdown fences, no explanation, no other text before or after the JSON."
)


async def run_company_research(company_name: str) -> dict:
    llm = get_llm()
    tools = [web_search_tool]

    agent = create_react_agent(llm, tools, prompt=SYSTEM_PROMPT)
    try:
        result = await agent.ainvoke(
            {"messages": [("user", f"Company: {company_name}")]},
            config={"recursion_limit": 8},
        )
    except Exception as exc:
        return {"error": f"Company Research failed: {exc}", "trace": []}

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
        return {
            "error": "Company Research returned invalid JSON",
            "raw_output": output,
            "trace": trace,
        }
