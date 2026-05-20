from __future__ import annotations

import json

from langchain.agents import AgentExecutor, create_react_agent
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI

from tools.resume_tool import retrieve_resume_chunks_tool


@tool("retrieve_resume_chunks")
async def retrieve_resume_chunks(query: str, top_k: int = 5) -> dict:
    return await retrieve_resume_chunks_tool(query=query, top_k=top_k)


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


async def run_fit_scorer(required_skills: list[str]) -> dict:
    llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0)
    tools = [retrieve_resume_chunks]

    system_prompt = (
        "You are the Fit Scorer agent. Use the resume chunk tool with the required skills. "
        "Return ONLY valid JSON with keys: fit_score (0-100 int), matched_skills (list), "
        "gap_analysis (string)."
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            ("user", "Required skills: {input}"),
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

    query = ", ".join(required_skills) if required_skills else ""
    result = await executor.ainvoke({"input": query})
    trace = _build_trace(result.get("intermediate_steps", []))
    output = result.get("output", "")

    try:
        data = json.loads(output)
        return {"data": data, "trace": trace}
    except json.JSONDecodeError:
        return {"error": "Fit Scorer returned invalid JSON", "raw_output": output, "trace": trace}
