from __future__ import annotations

import json

from langchain.tools import tool
from langgraph.prebuilt import create_react_agent

from agents.llm_provider import get_llm
from agents.utils import _coerce_content, extract_json_text, repair_and_parse_json
from tools.resume_tool import retrieve_resume_chunks_tool


@tool("retrieve_resume_chunks")
async def retrieve_resume_chunks(query: str, top_k: int = 5) -> dict:
    """Retrieve relevant resume chunks for the given query."""
    return await retrieve_resume_chunks_tool(query=query, top_k=top_k)


SYSTEM_PROMPT = (
    "You are the Fit Scorer agent. Use the retrieve_resume_chunks tool with the required skills. "
    "Return ONLY a raw JSON object with keys: fit_score (0-100 int), matched_skills (list), "
    "gap_analysis (string). "
    "No markdown fences, no explanation, no other text before or after the JSON."
)


async def run_fit_scorer(required_skills: list[str]) -> dict:
    llm = get_llm()
    tools = [retrieve_resume_chunks]

    agent = create_react_agent(llm, tools, prompt=SYSTEM_PROMPT)
    query = ", ".join(required_skills) if required_skills else ""
    try:
        result = await agent.ainvoke(
            {"messages": [("user", f"Required skills: {query}")]},
            config={"recursion_limit": 6},
        )
    except Exception as exc:
        return {"error": f"Fit Scorer failed: {exc}", "trace": []}

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
        return {"error": "Fit Scorer returned invalid JSON", "raw_output": output, "trace": trace}
