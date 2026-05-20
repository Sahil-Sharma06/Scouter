from __future__ import annotations

import asyncio

import chromadb
from langchain_google_genai import GoogleGenerativeAIEmbeddings


async def retrieve_resume_chunks(query: str, top_k: int = 5, user_id: str | None = None) -> dict:
    try:
        def _query() -> list[dict]:
            client = chromadb.PersistentClient(path="./chroma_db")
            collection = client.get_or_create_collection(name="resume_chunks")
            embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
            query_embedding = embeddings.embed_query(query)
            where = {"user_id": user_id} if user_id else None
            results = collection.query(
                query_embeddings=[query_embedding], n_results=top_k, where=where
            )
            docs = results.get("documents", [[]])[0]
            metas = results.get("metadatas", [[]])[0]
            return [
                {"text": doc, "metadata": meta}
                for doc, meta in zip(docs, metas)
            ]

        chunks = await asyncio.to_thread(_query)
        return {"chunks": chunks}
    except Exception as exc:
        return {"error": f"Chroma retrieval failed: {exc}"}
