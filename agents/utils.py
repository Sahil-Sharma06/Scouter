from __future__ import annotations

import json
from typing import Any


def _coerce_content(content: Any) -> str:
    """Normalize LangChain message content to a plain string.

    Newer LangChain versions return content as a list of content blocks for
    multimodal messages; older versions return a plain string.
    """
    if isinstance(content, list):
        return " ".join(
            block.get("text", "") if isinstance(block, dict) else str(block)
            for block in content
        )
    return str(content or "")


def extract_json_text(text: str) -> str:
    """Strip markdown fences and extract the outermost JSON object or array."""
    cleaned = (text or "").strip()

    if "```" in cleaned:
        parts = cleaned.split("```")
        for part in parts:
            candidate = part.strip()
            if candidate.lower().startswith("json"):
                candidate = candidate[4:].strip()
            if ("{" in candidate and "}" in candidate) or (
                "[" in candidate and "]" in candidate
            ):
                cleaned = candidate
                break

    # Prefer object; fall back to array
    obj_start = cleaned.find("{")
    obj_end = cleaned.rfind("}")
    arr_start = cleaned.find("[")
    arr_end = cleaned.rfind("]")

    if obj_start != -1 and obj_end > obj_start:
        cleaned = cleaned[obj_start : obj_end + 1]
    elif arr_start != -1 and arr_end > arr_start:
        cleaned = cleaned[arr_start : arr_end + 1]

    return cleaned


async def repair_and_parse_json(raw: str, llm: Any) -> dict:
    """Ask the LLM to re-emit just the JSON when the first parse fails."""
    messages = [
        (
            "system",
            "Extract the JSON from the text below and return ONLY the raw JSON object. "
            "No markdown fences, no explanation, no other text.",
        ),
        ("user", raw or "(empty)"),
    ]
    repair = await llm.ainvoke(messages)
    repaired = _coerce_content(repair.content)
    return json.loads(extract_json_text(repaired))
