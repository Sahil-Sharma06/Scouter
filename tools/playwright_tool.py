from __future__ import annotations

from playwright.async_api import TimeoutError as PlaywrightTimeoutError
from playwright.async_api import async_playwright


async def playwright_fetch(url: str) -> dict:
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=20000)
                await page.wait_for_timeout(1000)
                html = await page.content()
                text = await page.inner_text("body")
            finally:
                await browser.close()

        return {"url": url, "html": html, "text": text}
    except PlaywrightTimeoutError:
        return {"url": url, "error": "Timeout while fetching page"}
    except Exception as exc:
        return {"url": url, "error": f"Failed to fetch page: {exc}"}
