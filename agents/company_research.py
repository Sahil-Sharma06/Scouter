from __future__ import annotations

import json

from langchain.agents import AgentExecutor, create_react_agent
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI

from tools.search_tool import web_search


@tool("web_search")
async def web_search_tool(query: str) -> dict:
    return await web_search(query)


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


async def run_company_research(company_name: str) -> dict:
    llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0)
    tools = [web_search_tool]

    system_prompt = (
        "You are the Company Research agent. Search for company funding, tech stack, and news. "
        "Return ONLY valid JSON with a single key 'brief' that is a 5-line list: stage, size, "
        "stack signals, recent news, culture notes."
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            ("user", "Company: {input}"),
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

    result = await executor.ainvoke({"input": company_name})
    trace = _build_trace(result.get("intermediate_steps", []))
    output = result.get("output", "")

    try:
        data = json.loads(output)
        return {"data": data, "trace": trace}
    except json.JSONDecodeError:
        return {
            "error": "Company Research returned invalid JSON",
            "raw_output": output,
            "trace": trace,
        }
