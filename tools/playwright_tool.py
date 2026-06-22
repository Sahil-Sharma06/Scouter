from __future__ import annotations

import asyncio

from playwright.async_api import Browser, Playwright, async_playwright

_pw: Playwright | None = None
_browser: Browser | None = None
_lock: asyncio.Lock | None = None


def _get_lock() -> asyncio.Lock:
    global _lock
    if _lock is None:
        _lock = asyncio.Lock()
    return _lock


async def _get_browser() -> Browser:
    global _pw, _browser
    async with _get_lock():
        if _browser is not None and _browser.is_connected():
            return _browser
        if _pw is not None:
            try:
                await _pw.stop()
            except Exception:
                pass
        _pw = await async_playwright().start()
        _browser = await _pw.chromium.launch(headless=True)
    return _browser


async def playwright_fetch(url: str) -> dict:
    try:
        browser = await _get_browser()
        context = await browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            locale="en-US",
        )
        page = await context.new_page()
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=20000)
            # Give JS-heavy pages time to settle; networkidle can hang on chatty pages
            try:
                await page.wait_for_load_state("networkidle", timeout=5000)
            except Exception:
                pass
            html = await page.content()
            try:
                text = await page.inner_text("body")
            except Exception:
                text = ""
        finally:
            await context.close()

        return {"url": url, "html": html[:12000], "text": text[:8000]}
    except Exception as exc:
        return {"url": url, "error": f"Failed to fetch page: {exc}"}
