from __future__ import annotations

import json

from langchain.agents import AgentExecutor, create_react_agent
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_google_genai import ChatGoogleGenerativeAI


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


async def run_outreach_drafter(jd_summary: dict, company_brief: dict, fit_result: dict) -> dict:
    llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0)
    tools: list = []

    system_prompt = (
        "You are the Outreach Drafter. Draft a personalized cold email based on the inputs. "
        "Return ONLY valid JSON with keys: subject (string), body (4-paragraph string). "
        "Tone: direct, not sycophantic."
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            ("user", "JD Summary: {jd}\nCompany Brief: {brief}\nFit Result: {fit}"),
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

    result = await executor.ainvoke({"jd": jd_summary, "brief": company_brief, "fit": fit_result})
    trace = _build_trace(result.get("intermediate_steps", []))
    output = result.get("output", "")

    try:
        data = json.loads(output)
        return {"data": data, "trace": trace}
    except json.JSONDecodeError:
        return {
            "error": "Outreach Drafter returned invalid JSON",
            "raw_output": output,
            "trace": trace,
        }
