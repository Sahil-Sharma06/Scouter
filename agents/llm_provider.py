from __future__ import annotations

import os

from dotenv import load_dotenv

load_dotenv()


def get_llm():
    """Return a LangChain chat model based on available environment config.

    Priority:
    1. OpenAI-compatible endpoint (OpenRouter, etc.) if OPENAI_API_KEY + OPENAI_API_BASE are set.
    2. Groq if GROQ_API_KEY is set.
    3. Google Gemini as fallback.
    """
    openai_api_key = os.getenv("OPENAI_API_KEY", "")
    openai_api_base = os.getenv("OPENAI_API_BASE", "")
    model_name = os.getenv("LLM_MODEL_NAME", "")

    if openai_api_key and openai_api_base:
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            model=model_name or "google/gemini-2.0-flash-exp:free",
            openai_api_key=openai_api_key,
            openai_api_base=openai_api_base,
            temperature=0,
            max_retries=3,
        )

    groq_api_key = os.getenv("GROQ_API_KEY", "")
    if groq_api_key:
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            model=model_name or "llama-3.1-8b-instant",
            openai_api_key=groq_api_key,
            openai_api_base="https://api.groq.com/openai/v1",
            temperature=0,
            max_retries=3,
        )

    from langchain_google_genai import ChatGoogleGenerativeAI

    return ChatGoogleGenerativeAI(model=model_name or "gemini-2.0-flash", temperature=0, max_retries=3)
