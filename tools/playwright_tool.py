from __future__ import annotations

import re

import httpx

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}


def _html_to_text(html: str) -> str:
    html = re.sub(r"<(script|style)[^>]*>.*?</(script|style)>", "", html, flags=re.DOTALL | re.IGNORECASE)
    html = re.sub(r"</(p|div|li|h[1-6]|tr|br)[^>]*>", "\n", html, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", "", html)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


async def playwright_fetch(url: str) -> dict:
    try:
        async with httpx.AsyncClient(
            timeout=15.0, follow_redirects=True, headers=_HEADERS
        ) as client:
            response = await client.get(url)
            response.raise_for_status()
            html = response.text
        text = _html_to_text(html)
        return {"url": url, "html": html[:12000], "text": text[:8000]}
    except httpx.TimeoutException:
        return {"url": url, "error": "Timeout while fetching page"}
    except Exception as exc:
        return {"url": url, "error": f"Failed to fetch page: {exc}"}
