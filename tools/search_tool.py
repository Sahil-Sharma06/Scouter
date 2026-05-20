from __future__ import annotations

import os

from dotenv import load_dotenv
import httpx

load_dotenv()

SERPER_API_KEY = os.getenv("SERPER_API_KEY", "")
SERPER_ENDPOINT = "https://google.serper.dev/search"


async def web_search(query: str) -> dict:
    if not SERPER_API_KEY:
        return {"error": "SERPER_API_KEY is not set"}

    headers = {"X-API-KEY": SERPER_API_KEY, "Content-Type": "application/json"}
    payload = {"q": query}

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(SERPER_ENDPOINT, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()

        results = []
        for item in data.get("organic", [])[:5]:
            results.append(
                {
                    "title": item.get("title"),
                    "link": item.get("link"),
                    "snippet": item.get("snippet"),
                }
            )

        return {"query": query, "results": results}
    except Exception as exc:
        return {"error": f"Serper request failed: {exc}", "query": query}
