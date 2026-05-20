from __future__ import annotations

import json

from langchain.agents import AgentExecutor, create_react_agent
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI

from tools.playwright_tool import playwright_fetch


@tool("playwright_fetch")
async def playwright_fetch_tool(url: str) -> dict:
    return await playwright_fetch(url)


def _build_trace(intermediate_steps: list) -> list[dict]:
    trace: list[dict] = []
    for idx, (action, observation) in enumerate(intermediate_steps, start=1):
        trace.append(
            {
                "step": idx,
                "thought": action.log,
                "action": action.tool,
                "observation": str(observation),
            }
        )
    return trace


async def run_jd_fetcher(job_url: str) -> dict:
    llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0)
    tools = [playwright_fetch_tool]

    system_prompt = (
        "You are the JD Fetcher agent. Use the tool to fetch the job page, then "
        "extract role_title, company_name, required_skills (list), responsibilities (list), "
        "location, compensation. Return ONLY valid JSON with these keys."
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            ("user", "Job URL: {input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ]
    )

    agent = create_react_agent(llm, tools, prompt)
    executor = AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=False,
        return_intermediate_steps=True,
        handle_parsing_errors=True,
    )

    result = await executor.ainvoke({"input": job_url})
    trace = _build_trace(result.get("intermediate_steps", []))
    output = result.get("output", "")

    try:
        data = json.loads(output)
        return {"data": data, "trace": trace}
    except json.JSONDecodeError:
        return {"error": "JD Fetcher returned invalid JSON", "raw_output": output, "trace": trace}
